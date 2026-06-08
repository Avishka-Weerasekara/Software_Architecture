package com.traffic.controller;

import com.traffic.dto.AuthRequest;
import com.traffic.dto.AuthResponse;
import com.traffic.dto.RegisterRequest;
import com.traffic.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // In stateless JWT authentication, logout is typically handled on the client side 
        // by deleting the token from localStorage/sessionStorage.
        // For enhanced security, we could implement a token blacklist here.
        return ResponseEntity.ok("Logged out successfully");
    }
}
