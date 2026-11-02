# Generator Architecture & Pipeline Design

This document details the architectural design, generation pipeline, module responsibilities, and system boundaries of the **Spring Boot Backend Generator**.

---

## 1. Architectural Philosophy

The generator is engineered around four core tenets:

1. **Client-First In-Memory Processing:** All generation logic executes directly in the user's browser or runtime container in pure TypeScript. No user schemas, entity models, or generated code strings are transmitted to or stored on external servers.
2. **Zero Incomplete Scaffolds:** Every generated project is fully articulated. Entities have matching repositories, DTOs, mappers, transactional services, REST controllers, SQL schemas, configuration files, and integration tests.
3. **Compile-Safety by Construction:** Generated Java code adheres strictly to standard Spring Boot 3.x, Jakarta EE 10, and Hibernate 6 conventions. Identifiers, package declarations, imports, and cross-references are guaranteed consistent across files.
4. **Deterministic Packaging:** Project files are sorted alphabetically by POSIX path and packaged into an in-memory ZIP archive with predictable directory trees and zero duplicate paths.

---

## 2. End-to-End Generation Pipeline

The generation lifecycle flows through seven discrete, verifiable stages:

```
┌────────────────────────────────────────────────────────┐
│  STAGE 1: User Configuration & Domain Templates         │
│  - React UI forms or pre-modeled domain templates      │
│  - Generates immutable ProjectConfig model             │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 2: Semantic Validation & Integrity Checking     │
│  - Java identifier syntax & reserved keyword check     │
│  - Entity & relationship integrity (mappedBy, owning)   │
│  - Security environment variable syntax validation     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 3: Specialized Code Synthesis Modules           │
│  - pomGenerator.ts: Maven dependencies & plugins       │
│  - applicationGenerator.ts: Main class & properties    │
│  - entityGenerator.ts: JPA entities & annotations      │
│  - repositoryGenerator.ts: Spring Data JPA interfaces  │
│  - dtoGenerator.ts: Request/Response DTOs & Mappers    │
│  - serviceGenerator.ts: Transactional business logic   │
│  - controllerGenerator.ts: REST CRUD endpoints         │
│  - exceptionGenerator.ts: ResourceNotFound & handler   │
│  - sqlGenerator.ts: Dialect DDL (Postgres, MySQL, H2)  │
│  - securityGenerator.ts: JWT, AppUser, filters, tests  │
│  - readmeGenerator.ts: Project README & .gitignore     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 4: In-Memory File Buffering & Sorting           │
│  - Collects all GeneratedFile objects (path, content)   │
│  - Deterministic lexicographical sorting by path       │
│  - Computes ProjectSummary metadata                    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 5: In-Memory ZIP Packaging (JSZip)              │
│  - Normalizes paths (POSIX slashes, strips ../)        │
│  - Prepends predictable root folder: <artifactId>/     │
│  - Generates binary Uint8Array or Blob                 │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 6: Browser Download & Concurrency Guard         │
│  - Generates temporary Object URL                      │
│  - Injects synthetic anchor click                      │
│  - Guard prevents overlapping download requests        │
│  - Revokes URL cleanly to prevent memory leaks         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  STAGE 7: Multi-Configuration Verification Harness     │
│  - scripts/verify-generated-projects.ts                │
│  - Extracts ZIP archives into isolated sandboxes       │
│  - Validates structural completeness and syntax        │
│  - Executes native Maven compilation when JDK present  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Pipeline Stages

### Stage 1: User Configuration & Domain Templates
- **Entry Points:** `src/App.tsx`, `src/generator/templates/domainTemplates.ts`.
- **Function:** Captures user specifications into a strongly typed `ProjectConfig` object. Users may build a custom configuration from scratch or select one of seven domain templates:
  - Food Delivery (`Restaurant`, `MenuItem`, `CustomerOrder`, `DeliveryPartner`)
  - E-Commerce (`Product`, `Category`, `Customer`, `Order`, `OrderItem`)
  - Booking & Reservations (`Hotel`, `Room`, `Guest`, `Reservation`)
  - Media Streaming (`MediaItem`, `Creator`, `Playlist`, `Subscription`)
  - Financial Payments (`Account`, `Transaction`, `PaymentMethod`, `Invoice`)
  - Education ERP (`Department`, `Instructor`, `Course`, `Student`)
  - Custom (Empty canvas)

### Stage 2: Validation & Semantic Integrity
- **Module:** `src/generator/validation.ts`.
- **Function:** Enforces over 30 structural rules before code synthesis begins:
  - **Naming Conventions:** Validates Java identifiers, package names (`com.example.app`), Maven group and artifact naming rules.
  - **Reserved Keywords:** Disallows Java keywords (`class`, `public`, `return`, `interface`, etc.) and database reserved words for table and column names.
  - **Entity Integrity:** Guarantees unique entity names, unique field names per entity, and valid primary key configurations.
  - **Relationship Verification:**
    - Checks that target entities exist in the project configuration.
    - Validates `mappedBy` targets to ensure reciprocal relationships exist and are named correctly.
    - Rejects invalid JPA configurations (e.g., `mappedBy` on `@ManyToOne` or `orphanRemoval` on `@ManyToOne`).
    - Enforces uniqueness constraints on `@OneToOne` join columns.
    - Prevents relationship names from colliding with entity fields or ID properties.
  - **Security Configuration:** Validates environment variable naming (POSIX compliant, uppercase alphanumeric + underscore) and detects collisions with the generated `AppUser` entity.

### Stage 3: Specialized Code Synthesis Modules
The generator divides synthesis across specialized single-responsibility modules:

| Generator Module | Target Path | Key Responsibilities |
| :--- | :--- | :--- |
| `pomGenerator.ts` | `pom.xml` | Manages Maven coordinates, `spring-boot-starter-parent` version, starter web, starter validation, starter data JPA, database drivers, test dependencies, JJWT dependencies, and `spring-boot-maven-plugin`. |
| `applicationGenerator.ts` | `Application.java`, `application.properties` | Generates the `@SpringBootApplication` entry point class and configuration properties with safe environment variable overrides. |
| `entityGenerator.ts` | `entity/{Name}.java` | Generates JPA entity classes with `@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@Column`, `@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@JoinColumn`, and `@JoinTable`. |
| `repositoryGenerator.ts` | `repository/{Name}Repository.java` | Generates Spring Data JPA repository interfaces extending `JpaRepository<Entity, IdType>`. |
| `dtoGenerator.ts` | `dto/{Name}RequestDTO.java`, `dto/{Name}ResponseDTO.java`, `mapper/{Name}Mapper.java` | Generates decoupled request/response records or classes with Jakarta validation constraints and clean mapper components. |
| `serviceGenerator.ts` | `service/{Name}Service.java` | Generates transactional service classes (`@Service`, `@Transactional`) managing CRUD operations, exception handling, and DTO conversion. |
| `controllerGenerator.ts` | `controller/{Name}Controller.java` | Generates REST controllers (`@RestController`, `@RequestMapping("/api/...")`) with standard HTTP mapping annotations (`@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`). |
| `exceptionGenerator.ts` | `exception/*` | Generates custom `ResourceNotFoundException`, `ErrorResponse` envelope, and `@ControllerAdvice` `GlobalExceptionHandler`. |
| `sqlGenerator.ts` | `resources/schema.sql` | Generates dialect-specific SQL DDL with appropriate column types, `AUTO_INCREMENT`/`SERIAL`, primary keys, unique constraints, and foreign key constraints with `ON DELETE CASCADE`. |
| `securityGenerator.ts` | `security/*` | When enabled, generates `AppUser` entity, `AppUserRepository`, `JwtService` (JJWT 0.12.5), `UserDetailsServiceImpl`, `AuthService`, `AuthController`, `JwtAuthenticationFilter`, `SecurityConfig`, and integration tests. |
| `readmeGenerator.ts` | `README.md`, `.gitignore` | Generates tailored developer documentation with curl commands, environment variables, database instructions, and standard git ignores. |

### Stage 4: In-Memory File Buffering & Sorting
- **Module:** `src/generator/index.ts`.
- **Function:** Aggregates all files into a `GeneratedFile[]` array and applies deterministic sorting:
  ```typescript
  files.sort((a, b) => a.path.localeCompare(b.path));
  ```
  This ensures that identical configurations generate identical archives, facilitating byte-level caching and reproducibility.

### Stage 5: In-Memory ZIP Packaging
- **Module:** `src/generator/zipPackaging.ts`.
- **Function:** Uses JSZip 3.10.2 to construct an in-memory ZIP archive:
  - **Path Normalization:** Replaces backslashes with forward slashes, strips leading/trailing slashes, and eliminates dangerous path traversal components (`../`, `./`).
  - **Root Folder Prefix:** Automatically prepends `<artifactId>/` (or user-defined prefix) so the extracted archive expands into a clean, dedicated folder.
  - **Binary Generation:** Produces a `Uint8Array` in Node environments or a `Blob` in browser contexts.

### Stage 6: Browser Download & Concurrency Guard
- **Module:** `src/generator/download.ts`.
- **Function:** Manages the browser download lifecycle:
  - Encapsulates binary data into a `Blob([buffer], { type: 'application/zip' })`.
  - Creates a temporary object URL via `URL.createObjectURL(blob)`.
  - Injects a hidden `<a download="filename.zip">` element and triggers a synthetic click.
  - Revokes the object URL asynchronously to reclaim browser memory.
  - Protects against rapid repeated clicks via an atomic in-flight mutex lock.

### Stage 7: Project Verification Harness
- **Module:** `scripts/verify-generated-projects.ts`.
- **Function:** Automated testing pipeline for generated artifacts:
  - Exercises 8 distinct archetype configurations (`CONFIG_A` through `CONFIG_H`).
  - Tests minimal H2 setups, complex PostgreSQL relationships, MySQL security configs, and UUID primary keys.
  - Extracts archives to sandboxes in the OS temporary directory (`/tmp/sb-verify-*`).
  - Validates file presence, non-zero file sizes, package consistency, and SQL syntax.
  - Executes `mvn clean test` and `mvn compile` when a native JDK/Maven toolchain is detected.

---

## 4. Generated Application Architecture

Every generated Spring Boot project implements standard **Layered Clean Architecture**:

```
                  ┌───────────────────────────────┐
                  │      HTTP Client / Browser     │
                  └───────────────┬───────────────┘
                                  │ JSON / Bearer Token
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Spring Security Filter Chain                │
│  JwtAuthenticationFilter  ──►  SecurityContextHolder            │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ Authenticated Principal
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REST Controller Layer                       │
│  @RestController, @RequestMapping("/api/orders")                │
│  Input Validation: @Valid OrderRequestDTO                       │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ DTOs
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Service & Business Layer                    │
│  @Service, @Transactional                                       │
│  OrderMapper: DTO ◄──► JPA Entity                               │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ Entity Models
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Spring Data JPA Repository                  │
│  OrderRepository extends JpaRepository<Order, Long>             │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ SQL Queries / DDL
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Relational Database (PostgreSQL / MySQL / H2)   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Key Design Trade-Offs

| Decision | Chosen Approach | Alternative Considered | Rationale |
| :--- | :--- | :--- | :--- |
| **Execution Environment** | Pure client-side generation | Server-side template rendering | Eliminates backend server infrastructure requirements, eliminates user data retention risks, enables zero-latency previews, and guarantees offline execution. |
| **Template Engine** | Pure TypeScript string interpolators | Mustache / FreeMarker / Handlebars | TypeScript template functions provide compile-time type safety, direct refactoring support, zero runtime template parsing overhead, and zero third-party templating vulnerabilities. |
| **Security Architecture** | Stateless Bearer JWT with Spring Security 6 | Stateful HTTP Session / Cookie | Stateless JWTs decouple the backend from session storage, allow horizontal scaling out of the box, and naturally prevent CSRF vulnerabilities in REST APIs. |
| **Archive Creation** | In-memory JSZip streaming | Server-side `zip` command invocation | Enables identical packaging logic in both the browser client and Node.js automated verification scripts without native OS dependencies. |
