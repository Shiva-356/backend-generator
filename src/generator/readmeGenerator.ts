/**
 * Generator for project documentation and developer configuration files.
 */

import { ProjectConfig } from './types';
import { toPluralKebabCase } from './controllerGenerator';
import { resolveSecurityConfig } from './validation';

export function generateReadme(config: ProjectConfig): string {
  const { projectName, artifactId, description, javaVersion, springBootVersion, database, entities, options } = config;
  const port = options?.serverPort || 8080;
  const sec = resolveSecurityConfig(config);
  const dbName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const endpointList = entities.map(e => {
    const plural = toPluralKebabCase(e.name);
    return `### ${e.name} API
- \`POST   /api/${plural}\` - Create a new ${e.name}
- \`GET    /api/${plural}\` - List all ${e.name} records
- \`GET    /api/${plural}/{id}\` - Get ${e.name} by ID
- \`PUT    /api/${plural}/{id}\` - Update ${e.name} by ID
- \`DELETE /api/${plural}/{id}\` - Delete ${e.name} by ID`;
  }).join('\n\n');

  const relationshipsSection = entities.some(e => e.relationships && e.relationships.length > 0)
    ? `## Entity Relationships

${entities.filter(e => e.relationships && e.relationships.length > 0).map(e => {
  return `### ${e.name}
${e.relationships!.map(r => `- **${r.name}** (\`${r.type}\`) -> \`${r.targetEntity}\`${r.mappedBy ? ` (mappedBy: \`${r.mappedBy}\`)` : ' (owning side)'}`).join('\n')}`;
}).join('\n\n')}

`
    : '';

  const securityTechStack = sec.enabled
    ? `- **Security:** Spring Security 6 & JJWT 0.12.x (Stateless Bearer JWT Authentication)`
    : '';

  const securityEnvTableRows = sec.enabled
    ? `| \`${sec.jwtSecretEnvVar}\` | 256-bit+ HMAC-SHA256 signing secret key | *(Must be supplied at runtime)* |\n| \`JWT_EXPIRATION_MINUTES\` | JWT validity duration in minutes | \`${sec.tokenExpirationMinutes}\` |`
    : '';

  const securitySection = sec.enabled
    ? `## Authentication & Security

This service uses **Spring Security 6** with stateless **JSON Web Tokens (JWT)** signed via HMAC-SHA256.

### Authentication Endpoints (Public)
- \`POST /api/auth/register\` - Register a new account (\`username\`, \`email\`, \`password\`)
- \`POST /api/auth/login\` - Authenticate user credentials and receive a signed JWT bearer token

### Authentication Examples

#### 1. Register a New Account
\`\`\`bash
curl -s -X POST http://localhost:${port}/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "developer",
    "email": "developer@example.com",
    "password": "Password123!"
  }'
\`\`\`

**Sample 200 OK Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "username": "developer",
  "email": "developer@example.com",
  "role": "ROLE_USER"
}
\`\`\`

#### 2. Log In
\`\`\`bash
curl -s -X POST http://localhost:${port}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "developer",
    "password": "Password123!"
  }'
\`\`\`

### Accessing Protected API Endpoints
All business endpoints under \`/api/**\` require an \`Authorization\` header containing the bearer token:
\`\`\`bash
curl -s -X GET http://localhost:${port}/api/${entities[0] ? toPluralKebabCase(entities[0].name) : 'items'} \\
  -H "Authorization: Bearer <your-jwt-token>"
\`\`\`

Unauthenticated requests will receive \`401 Unauthorized\`.

### Secret Key Configuration
Before starting the application, you must provide a secure 256-bit (32+ byte) signing secret:

\`\`\`bash
# Generate a cryptographically strong 256-bit secret key
export ${sec.jwtSecretEnvVar}=$(openssl rand -base64 32)
export JWT_EXPIRATION_MINUTES=${sec.tokenExpirationMinutes}

mvn spring-boot:run
\`\`\`

> **Security Notice:** Never commit real JWT signing keys to version control. The application will fail to start if \`${sec.jwtSecretEnvVar}\` is omitted or shorter than 256 bits.

`
    : '';

  const databaseSetupSection = database === 'postgresql'
    ? `### PostgreSQL Database Setup
You can run a local PostgreSQL container using Docker:
\`\`\`bash
docker run --name ${dbName}-postgres \\
  -e POSTGRES_DB=${dbName} \\
  -e POSTGRES_USER=postgres \\
  -e POSTGRES_PASSWORD=postgres \\
  -p 5432:5432 -d postgres:16-alpine
\`\`\`
`
    : database === 'mysql'
    ? `### MySQL Database Setup
You can run a local MySQL container using Docker:
\`\`\`bash
docker run --name ${dbName}-mysql \\
  -e MYSQL_DATABASE=${dbName} \\
  -e MYSQL_ROOT_PASSWORD=root \\
  -p 3306:3306 -d mysql:8.0
\`\`\`
`
    : `### H2 Database Console
The in-memory database console is available at:
\`http://localhost:${port}/h2-console\`
- JDBC URL: \`jdbc:h2:mem:${dbName}\`
- Username: \`sa\`
- Password: *(leave blank)*
`;

  return `# ${projectName}

${description || 'Spring Boot 3.x REST API service generated with Backend Generator.'}

## Tech Stack
- **Framework:** Spring Boot ${springBootVersion}
- **Language:** Java ${javaVersion}
- **Build Tool:** Maven 3.x
- **Data Access:** Spring Data JPA / Hibernate
- **Database:** ${database.toUpperCase()}
- **Validation:** Bean Validation (Jakarta Validation)
${securityTechStack}

## Project Structure
\`\`\`
src/
├── main/
│   ├── java/${config.packageName.replace(/\./g, '/')}/
│   │   ├── Application.java
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── exception/
│   │   ├── mapper/
│   │   ├── repository/
│   │   ├── service/
${sec.enabled ? `│   │   └── security/\n│   │       ├── config/\n│   │       ├── controller/\n│   │       ├── dto/\n│   │       ├── entity/\n│   │       ├── filter/\n│   │       ├── repository/\n│   │       └── service/\n` : ''}│   └── resources/
│       ├── application.properties
│       └── schema.sql
└── test/
pom.xml
\`\`\`

## Getting Started

### Prerequisites
- JDK ${javaVersion} or higher installed
- Maven 3.8+ installed (or use Maven wrapper)
${database !== 'h2' ? `- Running ${database.toUpperCase()} instance (or configure via environment variables)` : ''}

${databaseSetupSection}

### Configuration & Environment Variables
The application uses safe environment variable placeholders with sensible local development defaults in \`application.properties\`:

| Variable | Description | Development Default |
| :--- | :--- | :--- |
| \`SERVER_PORT\` | HTTP port for the web service | \`${port}\` |
| \`SPRING_DATASOURCE_URL\` | JDBC database connection URL | (Database specific local URL) |
| \`SPRING_DATASOURCE_USERNAME\` | Database user | \`${database === 'postgresql' ? 'postgres' : database === 'mysql' ? 'root' : 'sa'}\` |
| \`SPRING_DATASOURCE_PASSWORD\` | Database password | (Development default) |
| \`SPRING_JPA_HIBERNATE_DDL_AUTO\` | Schema management strategy | \`update\` (Dev) / \`validate\` (Prod) |
${securityEnvTableRows}

> **Production Safety Note:**  
> The default \`ddl-auto=update\` is provided exclusively for rapid local development. In production environments, set \`SPRING_JPA_HIBERNATE_DDL_AUTO=validate\` and apply database changes through versioned migrations (e.g., Flyway or Liquibase).

### Running the Application

\`\`\`bash
# Build and run with Maven
mvn clean spring-boot:run

# Or run with custom environment variables
SPRING_DATASOURCE_URL="jdbc:${database}://db-server:5432/${dbName}" \\
SPRING_DATASOURCE_USERNAME="myuser" \\
SPRING_DATASOURCE_PASSWORD="mypassword" \\
${sec.enabled ? `${sec.jwtSecretEnvVar}="$(openssl rand -base64 32)" \\\n` : ''}mvn spring-boot:run
\`\`\`

The server will start at:
\`http://localhost:${port}\`

## Building and Testing

\`\`\`bash
# Run unit and integration tests
mvn test

# Build executable fat JAR
mvn clean package

# Run packaged JAR
java -jar target/${artifactId}-0.0.1-SNAPSHOT.jar
\`\`\`

## Interactive API Documentation & Testing

### Swagger UI (OpenAPI 3)
Interactive Swagger documentation is available out of the box when running the server:
- **Swagger UI:** [http://localhost:${port}/swagger-ui.html](http://localhost:${port}/swagger-ui.html)
- **OpenAPI 3 Spec (JSON):** [http://localhost:${port}/v3/api-docs](http://localhost:${port}/v3/api-docs)

### Postman Collection
A pre-configured Postman Collection file (\`postman_collection.json\`) is included at the root of this project:
1. Open Postman -> Click **Import** -> Select \`postman_collection.json\`.
2. The collection includes pre-built CRUD requests, workflow actions, mock JSON payloads, and pagination params (\`?page=0&size=10&sort=id,desc\`).
3. For secured projects, send the **Login** request; the test script automatically populates the collection's \`{{bearerToken}}\` variable.

## Third-Party Integrations & Environment Variables
See \`.env.example\` in the project root for all required environment keys:
- **Payment Gateway:** \`PaymentGateway\` interface with \`StripePaymentService\` (\`STRIPE_API_KEY\`)
- **Notification Services:** \`NotificationService\` interface with \`SendGridNotificationService\` (\`SENDGRID_API_KEY\`) & \`TwilioNotificationService\` (\`TWILIO_ACCOUNT_SID\`, \`TWILIO_AUTH_TOKEN\`)
- **Object Storage:** \`StorageService\` interface with \`S3StorageService\` (\`AWS_S3_BUCKET\`, \`AWS_REGION\`)

${config.startup?.industry === 'FINTECH' ? `> **Regulatory & Compliance Disclaimer:**
> This codebase provides a production-grade software architecture foundation for fintech and digital banking integrations. It does NOT constitute real banking settlement, regulatory clearing, or a certified banking license. Do not claim PCI-DSS or SOC 2 compliance without independent third-party audits and compliant hardware infrastructure.\n` : ''}
${securitySection}
${relationshipsSection}
## REST API Endpoints

${endpointList}

## Error Handling
The application features global exception handling with structured JSON envelopes:
- \`404 Not Found\` -> \`ResourceNotFoundException\`
- \`409 Conflict\` -> \`DuplicateResourceException\`
- \`422 Unprocessable Entity\` -> \`BusinessRuleException\`
- \`400 Bad Request\` -> \`InsufficientStockException\`, \`InsufficientFundsException\`, \`MethodArgumentNotValidException\`
- \`403 Forbidden\` -> \`UnauthorizedAccessException\`, \`TenantIsolationException\`
- \`500 Internal Server Error\` -> Unhandled exceptions

\`\`\`json
{
  "timestamp": "2026-03-30T12:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found with id: 42",
  "path": "/api/..."
}
\`\`\`
`;
}

export function generateGitignore(): string {
  return `target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-userId

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbproject/load-factor.properties

### VS Code ###
.vscode/

### Operating System ###
.DS_Store
Thumbs.db
`;
}
