FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src src
RUN mvn -q -DskipTests package \
    && cp "$(find target -maxdepth 1 -name '*.jar' ! -name '*.original' | head -n 1)" /app.jar

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]

