// ============================================================
//  LOGICA DE AUTENTICACION CON MSAL 2.0
// ============================================================

// Instancia unica de MSAL, creada con la config de authConfig.js
const msalInstance = new msal.PublicClientApplication(msalConfig);

// Cuenta del usuario que inicio sesion
let cuentaActiva = null;

// Elementos del DOM
const vistaLogin     = document.getElementById('vistaLogin');
const vistaSesion    = document.getElementById('vistaSesion');
const btnLogin       = document.getElementById('btnLogin');
const btnLogout      = document.getElementById('btnLogout');
const btnLlamarApi   = document.getElementById('btnLlamarApi');
const usuarioNombre  = document.getElementById('usuarioNombre');
const usuarioEmail   = document.getElementById('usuarioEmail');
const resultado      = document.getElementById('resultado');
const subtitulo      = document.getElementById('subtitulo');


// ------------------------------------------------------------
//  INICIALIZACION
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {

    // Si el usuario ya inicio sesion antes, MSAL lo recuerda
    const cuentas = msalInstance.getAllAccounts();
    if (cuentas.length > 0) {
        cuentaActiva = cuentas[0];
        mostrarVistaSesion();
    }

    btnLogin.addEventListener('click', iniciarSesion);
    btnLogout.addEventListener('click', cerrarSesion);
    btnLlamarApi.addEventListener('click', llamarApi);
});


// ------------------------------------------------------------
//  LOGIN — abre un popup contra Entra ID
// ------------------------------------------------------------
async function iniciarSesion() {
    try {
        const respuesta = await msalInstance.loginPopup(loginRequest);
        cuentaActiva = respuesta.account;

        mostrarVistaSesion();
        mostrarAlerta('Sesion iniciada', 'success');

    } catch (error) {
        mostrarAlerta('No se pudo iniciar sesion: ' + error.message, 'error');
    }
}


// ------------------------------------------------------------
//  LOGOUT — cierra la sesion en Entra ID y limpia la cache
// ------------------------------------------------------------
async function cerrarSesion() {
    try {
        await msalInstance.logoutPopup();
        cuentaActiva = null;
        mostrarVistaLogin();

    } catch (error) {
        mostrarAlerta('Error al cerrar sesion: ' + error.message, 'error');
    }
}


// ------------------------------------------------------------
//  OBTENER TOKEN — patron central de MSAL
//
//  1. acquireTokenSilent: usa el token en cache o lo renueva
//     en segundo plano, sin molestar al usuario.
//  2. acquireTokenPopup: solo si lo anterior falla (token
//     expirado, falta de consentimiento).
// ------------------------------------------------------------
async function obtenerToken() {

    const peticion = { ...apiRequest, account: cuentaActiva };

    try {
        const resultado = await msalInstance.acquireTokenSilent(peticion);
        return resultado.accessToken;

    } catch (error) {
        const resultado = await msalInstance.acquireTokenPopup(peticion);
        return resultado.accessToken;
    }
}


// ------------------------------------------------------------
//  LLAMAR AL BACKEND enviando el JWT
// ------------------------------------------------------------
async function llamarApi() {

    try {
        const token = await obtenerToken();

        const respuesta = await fetch(API_URL, {
            method: 'GET',
            headers: {
                // Formato exacto que espera Spring Security
                'Authorization': 'Bearer ' + token
            }
        });

        // Interpretar el codigo de estado devuelto por el backend
        if (respuesta.status === 401) {
            mostrarAlerta('401 — Token ausente, invalido o expirado', 'error');
            return;
        }
        if (respuesta.status === 403) {
            mostrarAlerta('403 — Token valido pero sin permisos', 'error');
            return;
        }
        if (!respuesta.ok) {
            mostrarAlerta('Error ' + respuesta.status, 'error');
            return;
        }

        const datos = await respuesta.json();

        resultado.textContent = JSON.stringify(datos, null, 2);
        console.log(datos.token)
        resultado.classList.remove('oculto');
        mostrarAlerta('200 — Respuesta recibida del backend', 'success');

    } catch (error) {
        // Tipicamente un problema de CORS o el backend apagado
        mostrarAlerta('No se pudo conectar al backend: ' + error.message, 'error');
    }
}


// ------------------------------------------------------------
//  CAMBIO DE VISTAS
// ------------------------------------------------------------
function mostrarVistaSesion() {
    // "name" y "username" vienen del ID token que emitio Entra ID
    usuarioNombre.textContent = cuentaActiva.name;
    usuarioEmail.textContent  = cuentaActiva.username;

    subtitulo.textContent = 'Sesion activa';
    vistaLogin.classList.add('oculto');
    vistaSesion.classList.remove('oculto');
}

function mostrarVistaLogin() {
    subtitulo.textContent = 'Accede con tu cuenta institucional';
    vistaSesion.classList.add('oculto');
    vistaLogin.classList.remove('oculto');

    resultado.classList.add('oculto');
    resultado.textContent = '';
}


// ------------------------------------------------------------
//  ALERTAS (se conserva del codigo original)
// ------------------------------------------------------------
function mostrarAlerta(mensaje, tipo = 'info') {

    const alerta = document.createElement('div');
    alerta.className = 'alerta alerta-' + tipo;
    alerta.textContent = mensaje;

    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.classList.add('alerta-saliendo');
        setTimeout(() => alerta.remove(), 300);
    }, 3000);
}
