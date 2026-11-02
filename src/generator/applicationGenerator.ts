/**
 * Generator for the Spring Boot main application class and configuration files.
 */

import { ProjectConfig } from './types';

export function getApplicationClassName(projectName: string): string {
  // Turn "order-service" or "food_delivery" into "OrderServiceApplication"
  const cleaned = projectName
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const baseName = cleaned.length > 0 ? cleaned : 'Backend';
  return baseName.endsWith('Application') ? baseName : `${baseName}Application`;
}

export function generateMainApplicationClass(config: ProjectConfig): string {
  const { packageName, projectName } = config;
  const className = getApplicationClassName(projectName);

  return `package ${packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${className} {

    public static void main(String[] args) {
        SpringApplication.run(${className}.class, args);
    }
}
`;
}

export function generateApplicationProperties(config: ProjectConfig): string {
  const { projectName, database, options } = config;
  const port = options?.serverPort || 8080;
  const dbName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  let dbConfig = '';

  switch (database) {
    case 'postgresql':
      dbConfig = `# PostgreSQL Datasource Configuration
# Credentials and host use environment variables with fallback development defaults
spring.datasource.url=\${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/${dbName}}
spring.datasource.username=\${SPRING_DATASOURCE_USERNAME:postgres}
spring.datasource.password=\${SPRING_DATASOURCE_PASSWORD:postgres}
spring.datasource.driver-class-name=org.postgresql.Driver

# Schema Management: 'update' is intended for development only.
# In production, set SPRING_JPA_HIBERNATE_DDL_AUTO=validate and use a database migration tool (e.g. Flyway or Liquibase).
spring.jpa.hibernate.ddl-auto=\${SPRING_JPA_HIBERNATE_DDL_AUTO:update}
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true`;
      break;

    case 'mysql':
      dbConfig = `# MySQL Datasource Configuration
# Credentials and host use environment variables with fallback development defaults
spring.datasource.url=\${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/${dbName}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true}
spring.datasource.username=\${SPRING_DATASOURCE_USERNAME:root}
spring.datasource.password=\${SPRING_DATASOURCE_PASSWORD:root}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Schema Management: 'update' is intended for development only.
# In production, set SPRING_JPA_HIBERNATE_DDL_AUTO=validate and use a database migration tool (e.g. Flyway or Liquibase).
spring.jpa.hibernate.ddl-auto=\${SPRING_JPA_HIBERNATE_DDL_AUTO:update}
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true`;
      break;

    case 'h2':
      dbConfig = `# H2 In-Memory Database Configuration (development and testing)
spring.datasource.url=\${SPRING_DATASOURCE_URL:jdbc:h2:mem:${dbName};DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE}
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=\${SPRING_DATASOURCE_USERNAME:sa}
spring.datasource.password=\${SPRING_DATASOURCE_PASSWORD:}

# H2 Console (available at /h2-console)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Schema Management
spring.jpa.hibernate.ddl-auto=\${SPRING_JPA_HIBERNATE_DDL_AUTO:update}
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true`;
      break;
  }

  const securityEnabled = Boolean(config.security?.enabled || config.options?.security?.enabled);
  const jwtEnvVar = config.security?.jwtSecretEnvVar?.trim() || config.options?.security?.jwtSecretEnvVar?.trim() || 'JWT_SECRET';
  const jwtExp = config.security?.tokenExpirationMinutes ?? config.options?.security?.tokenExpirationMinutes ?? 60;

  const securityProperties = securityEnabled
    ? `
# ===================================================================
# Security & JWT Configuration (Spring Security 6)
# ===================================================================
# JWT Signing Secret (must be a 256-bit+ secure random secret in production).
# In production, supply via the ${jwtEnvVar} environment variable.
# Example key generation command: openssl rand -base64 32
# Never commit real signing secrets into source code or version control.
security.jwt.secret=\${${jwtEnvVar}:}
security.jwt.expiration-minutes=\${JWT_EXPIRATION_MINUTES:${jwtExp}}
`
    : '';

  const enableSwagger = options?.enableSwagger ?? true;
  const swaggerProperties = enableSwagger
    ? `
# SpringDoc OpenAPI 3.0 & Swagger UI
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operations-sorter=method
springdoc.swagger-ui.tags-sorter=alpha
`
    : '';

  return `# ===================================================================
# Spring Boot Application Configuration
# ===================================================================
spring.application.name=${projectName}
server.port=\${SERVER_PORT:${port}}

${dbConfig}

# Jackson JSON Configuration
spring.jackson.serialization.write-dates-as-timestamps=false

# Open-In-View (disabled for production safety to prevent N+1 query surprises outside transactions)
spring.jpa.open-in-view=false${swaggerProperties}${securityProperties}
`;
}
