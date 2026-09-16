package com.example.backendazure.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DemoController {

    @GetMapping("/publico/test")
    private ResponseEntity<String> getPublic(){
        return ResponseEntity.ok("Acceso a API Publica");
    }

        @GetMapping("/privado/test")
        private ResponseEntity<Map<String,Object>> getPrivate(@AuthenticationPrincipal Jwt jwt){
            Map <String,Object> tkn = Map.of(
                    "nombre",  jwt.getClaimAsString("name"),
                    "usuario", jwt.getClaimAsString("preferred_username"),
                    "scopes",  jwt.getClaimAsString("scp"),
                        "token", jwt.getTokenValue()
            );
        return ResponseEntity.ok(tkn);
    }

    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/admin/test")
    private ResponseEntity<String> getAdmin(@AuthenticationPrincipal Jwt jwt){
        return ResponseEntity.ok("Acceso a API Admin");
    }

}
