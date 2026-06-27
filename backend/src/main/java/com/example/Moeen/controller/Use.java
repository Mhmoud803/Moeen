package com.example.Moeen.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Use {

    @GetMapping("/hello")
    public String hello() {
        return "Hello Worlkjnkjnnkjjkkjd";
    }

}
