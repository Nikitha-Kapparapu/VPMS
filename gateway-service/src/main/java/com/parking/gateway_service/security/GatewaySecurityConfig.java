package com.parking.gateway_service.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
public class GatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        // Disable CSRF for a stateless API gateway
        http.csrf(csrf -> csrf.disable())
            .authorizeExchange(exchanges ->
                exchanges.anyExchange().permitAll()
            );
        return http.build();
    }
}