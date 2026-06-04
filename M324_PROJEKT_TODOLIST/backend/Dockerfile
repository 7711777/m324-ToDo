# --- Build stage: Spring Boot mit Maven bauen ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Nur pom.xml zuerst -> Docker-Layer-Caching für Dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Quellcode kopieren und WAR bauen (Tests laufen bereits in der Pipeline)
COPY src ./src
RUN mvn package -B -DskipTests

# --- Run stage: WAR mit schlankem JRE ausführen ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.war app.war
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.war"]
