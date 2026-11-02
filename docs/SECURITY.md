# Security Architecture & Safe Configuration Guide

This document outlines the security architecture of the **Backend Generator** itself, the security implementation of the **generated Spring Boot applications**, and recommendations for production hardening.

---

## Table of Contents

- [1. Generator Host Security](#1-generator-host-security)
- [2. Generated Application Security Architecture](#2-generated-application-security-architecture)
- [3. JSON Web Token (JWT) Implementation](#3-json-web-token-jwt-implementation)
- [4. Password Hashing & Storage](#4-password-hashing--storage)
- [5. Secret Management & Environment Variables](#5-secret-management--environment-variables)
- [6. CSRF & CORS Security Model](#6-csrf--cors-security-model)
- [7. Production Hardening Checklist](#7-production-hardening-checklist)

---

## 1. Generator Host Security

The generator tool is built with a defense-in-depth posture to protect developer data and preventing code injection or path traversal vulnerabilities:

### Client-Side In-Memory Execution
- All configuration parsing, source synthesis, and ZIP packaging occur **entirely in the client's memory** (browser or local Node.js process).
- No entity definitions, database credentials, or generated files are sent to remote servers or stored in third-party telemetry.

### ZIP-Slip & Path Traversal Prevention
When packaging generated project files into ZIP archives (`src/generator/zipPackaging.ts`):
- All path separators are normalized to POSIX forward slashes (`/`).
- Trailing and leading slashes are stripped.
- Path traversal sequences (`../`, `..\\`, `./`) are strictly stripped or rejected.
- All file paths are scoped beneath a single, sanitized root folder prefix (e.g., `my-service/src/...`).
- Zero files are read from the host filesystem (preventing leakage of `.env`, `.git`, or `node_modules`).

---

## 2. Generated Application Security Architecture

When the **Spring Security & JWT** option is enabled, the generator produces a complete, production-grade security subsystem using **Spring Security 6** and **JJWT 0.12.5**:

```
                       ┌───────────────────────────────┐
                       │       Incoming HTTP Request    │
                       └───────────────┬───────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SecurityFilterChain (SecurityConfig)                  │
│                                                                             │
│  1. Disable CSRF (Stateless Bearer Tokens)                                  │
│  2. Configure SessionCreationPolicy.STATELESS                               │
│  3. CORS Configuration (Custom or Default Allowed Origins)                  │
│  4. Public Permitted Endpoints:                                             │
│     - POST /api/auth/register                                               │
│     - POST /api/auth/login                                                  │
│     - GET  /h2-console/** (Only if H2 Database is configured)                │
│     - /error                                                                │
│  5. Protected Endpoints:                                                    │
│     - All business endpoints (/api/**) require authentication                │
│                                                                             │
│  6. JwtAuthenticationFilter:                                                │
│     - Extracts 'Authorization: Bearer <token>'                              │
│     - Validates cryptographic signature via HMAC-SHA256                     │
│     - Loads UserDetails from database via UserDetailsServiceImpl            │
│     - Populates SecurityContextHolder with UsernamePasswordAuthenticationToken│
│                                                                             │
│  7. Exception Handlers:                                                     │
│     - JwtAuthenticationEntryPoint: Returns 401 Unauthorized                 │
│     - JwtAccessDeniedHandler: Returns 403 Forbidden                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │ Authenticated Principal
                                       ▼
                       ┌───────────────────────────────┐
                       │     REST Business Controllers │
                       └───────────────────────────────┘
```

---

## 3. JSON Web Token (JWT) Implementation

The generated `JwtService` (`security/service/JwtService.java`) uses the modern, fluent JJWT 0.12.5 API:

### Cryptographic Algorithm & Key Requirements
- **Algorithm:** HMAC-SHA256 (`HS256`).
- **Key Strength:** Requires a cryptographically strong secret key of **at least 256 bits (32 bytes)**.
- **Key Derivation & Fail-Fast Validation:**
  ```java
  @PostConstruct
  public void validateKeyOnStartup() {
      getSigningKey();
  }

  private SecretKey getSigningKey() {
      if (this.cachedSigningKey != null) return this.cachedSigningKey;
      if (this.secretKeyString == null || this.secretKeyString.isBlank()) {
          throw new IllegalStateException("CRITICAL SECURITY CONFIGURATION ERROR: JWT signing key is not configured.");
      }
      byte[] keyBytes = this.secretKeyString.getBytes(StandardCharsets.UTF_8);
      if (keyBytes.length < 32) {
          throw new IllegalStateException("CRITICAL SECURITY CONFIGURATION ERROR: JWT signing key must be at least 256 bits (32 bytes).");
      }
      this.cachedSigningKey = Keys.hmacShaKeyFor(keyBytes);
      return this.cachedSigningKey;
  }
  ```
- **Validation:** Missing or insufficiently strong keys fail immediately at application startup via `@PostConstruct`, preventing insecure deployments.

### Claims & Token Lifecycle
- **Subject (`sub`):** Contains the unique user identifier / username.
- **Issued At (`iat`):** UTC timestamp when token was created.
- **Expiration (`exp`):** Calculated as `issuedAt + (tokenExpirationMinutes * 60 * 1000)`.
- **Role Claim (`role`):** User authority string (e.g., `ROLE_USER`).

---

## 4. Password Hashing & Storage

User credentials are treated with industry-standard cryptographic protection:

- **Hashing Algorithm:** **BCrypt** with work factor **12** (`new BCryptPasswordEncoder(12)`).
- **Salt Generation:** Handled automatically per-user by BCrypt to prevent rainbow table attacks.
- **Entity Storage:** The `AppUser` entity stores the hash in a dedicated column `password_hash VARCHAR(255) NOT NULL`. Plaintext passwords are never persisted.
- **DTO Decoupling:**
  - `RegisterRequest` accepts `password` for hashing during account creation.
  - `AuthRequest` accepts `password` for verification during login.
  - `AuthResponse` returns only `token`, `type`, `username`, `email`, and `role`. The `password_hash` is never exposed across the REST interface.

---

## 5. Secret Management & Environment Variables

Generated code strictly avoids hardcoded secrets.

### `application.properties` Placeholders
All sensitive values in `src/main/resources/application.properties` use Spring externalized configuration placeholders with clear separation:

```properties
# JWT Authentication Configuration
security.jwt.secret=${JWT_SECRET:}
security.jwt.expiration-minutes=${JWT_EXPIRATION_MINUTES:1440}

# Database Connection Placeholders
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/myapp}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:postgres}
```

### Generating a Secure 256-Bit Secret Key
Developers running the generated service should generate a secure signing key using OpenSSL:

```bash
# Generate a cryptographically secure 256-bit base64-encoded secret
export JWT_SECRET="$(openssl rand -base64 32)"
export JWT_EXPIRATION_MINUTES=1440

# Start the Spring Boot application
mvn spring-boot:run
```

> **Warning:** Never commit real secrets or `.env` files into public source repositories.

---

## 6. CSRF & CORS Security Model

### Why CSRF is Disabled
Cross-Site Request Forgery (CSRF) attacks occur when malicious sites cause a victim's browser to perform unintended actions using automatically attached session cookies.

In the generated service:
- The session creation policy is strictly **`STATELESS`**.
- The service does not use session cookies or `JSESSIONID`.
- Every protected API call requires an explicit `Authorization: Bearer <token>` header.
- Because browsers do not automatically send bearer token headers across origins, disabling CSRF (`csrf.disable()`) is safe and standard practice for pure token-authenticated REST APIs.

### Frame Options for H2 Console
When the **H2 database** is selected:
- Spring Security enables frame options with `sameOrigin` (`headers.frameOptions(frame -> frame.sameOrigin())`) to allow the built-in `/h2-console` web interface to render frames within the same origin while protecting against cross-origin clickjacking.
- When H2 is not selected, default strict frame restrictions apply.

---

## 7. Production Hardening Checklist

Before deploying a generated Spring Boot service to production, complete the following hardening steps:

- [ ] **Inject Production Secrets via Vault or KMS:** Do not rely on local `.env` files. Provide `JWT_SECRET` and database credentials via secure secret managers (e.g., AWS Secrets Manager, Google Secret Manager, HashiCorp Vault, Kubernetes Secrets).
- [ ] **Set `ddl-auto=validate`:** Change `spring.jpa.hibernate.ddl-auto=validate` and manage schema evolutions using version-controlled migration tools (Flyway or Liquibase).
- [ ] **Enable Database SSL:** Configure `sslmode=verify-full` (PostgreSQL) or `useSSL=true&requireSSL=true` (MySQL) in JDBC connection strings.
- [ ] **Enforce HTTPS / TLS:** Ensure the application runs behind a reverse proxy (e.g., Nginx, Envoy, Cloudflare) that enforces TLS 1.3 and terminates HTTP with automatic redirects to HTTPS.
- [ ] **Configure Restricted CORS:** Update `corsAllowedOrigins` from the development wildcard (`*`) to the specific, trusted front-end domains (e.g., `https://app.example.com`).
- [ ] **Implement Rate Limiting:** Apply rate limiting to `/api/auth/login` and `/api/auth/register` to protect against credential stuffing and brute-force attacks.
