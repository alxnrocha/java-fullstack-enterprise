package com.alxnrocha.logisync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LogiSyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(LogiSyncApplication.class, args);
    }
}
