// ============================================================
//  CONFIGURACION DE MSAL 2.0 — Microsoft Entra ID
//
//  Estos valores NO son secretos. Un SPA usa el flujo
//  Authorization Code + PKCE, que no requiere client secret.
//  Por eso pueden viajar al navegador sin riesgo.
// ============================================================
    
const msalConfig = {
    auth: {
        // Client ID de la app "demo-spa-frontend" (la del SPA)
        clientId: "b7d30770-6063-4e84-9a7e-4a16930008a1",

        // Single tenant: la autoridad apunta a tu directorio
        authority: "https://login.microsoftonline.com/f3774aaa-430e-4736-a55c-3651f8257bfe",

        // Debe coincidir EXACTO con el Redirect URI registrado en Azure
        redirectUri: "http://localhost:5500"
    },
    cache: {
        // sessionStorage: la sesion se pierde al cerrar la pestana.
        // Mas seguro que localStorage para este ejercicio.
        cacheLocation: "sessionStorage"
    }
};

// Permisos solicitados AL INICIAR SESION (identidad del usuario)
const loginRequest = {
    scopes: ["openid", "profile"]
};

// Permiso solicitado PARA LLAMAR AL BACKEND.
// OJO: aqui va el Client ID de la app del API, no la del SPA.
// Este scope aparecera en el claim "scp" del token.
const apiRequest = {
    scopes: ["api://216311f5-c638-4ab5-8832-baae89eea5b5/access_as_user"]
};

// Endpoint del backend.
// Al integrar AWS API Gateway solo se cambia esta linea.
const API_URL = "http://localhost:8080/api/privado/test";
