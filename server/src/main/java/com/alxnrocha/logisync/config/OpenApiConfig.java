package com.alxnrocha.logisync.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI logiSyncOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LogiSync Enterprise — Intelligent Supply Chain & ERP API")
                        .description("High-Performance Event-Driven Supply Chain Platform with Java 21, Spring Boot 3.3, RabbitMQ AMQP, and Transactional Outbox Pattern.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Alexandre Rocha")
                                .url("https://github.com/alxnrocha/java-fullstack-enterprise")
                                .email("alxnrocha@users.noreply.github.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server"),
                        new Server().url("https://alxnrocha.github.io/java-fullstack-enterprise").description("Production Demo Preview")
                ));
    }
}
