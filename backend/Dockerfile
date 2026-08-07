# syntax=docker/dockerfile:1

FROM maven:3.9.11-eclipse-temurin-21-alpine AS build

WORKDIR /workspace

# Cache dependencies separately from application source.
COPY pom.xml ./
RUN mvn -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package && cp target/Moeen-0.0.1-SNAPSHOT.jar /workspace/app.jar

FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S moeen && adduser -S moeen -G moeen

WORKDIR /app
COPY --from=build --chown=moeen:moeen /workspace/app.jar ./app.jar

USER moeen
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
