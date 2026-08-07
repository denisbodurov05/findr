# Build the Spring Boot API jar and run it on a JRE image.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY apps/api/pom.xml pom.xml
RUN mvn -B -q dependency:go-offline
COPY apps/api/src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/findr-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
