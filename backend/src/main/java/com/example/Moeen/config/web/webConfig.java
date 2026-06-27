package com.example.Moeen.config.web;

import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ApiVersionConfigurer;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

public class webConfig implements WebMvcConfigurer {

    @Override
    public void configureApiVersioning(ApiVersionConfigurer configurer) {

        WebMvcConfigurer.super.configureApiVersioning(configurer);

        configurer
                .useMediaTypeParameter(MediaType.parseMediaType("application/vnd.moeen+json"), "v")
                .addSupportedVersions("1.0", "2.0")
                .setDefaultVersion("1.0");
    }

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        WebMvcConfigurer.super.configurePathMatch(configurer);

        configurer.addPathPrefix("api/{apiVersion}", handler -> true);

    }

}
