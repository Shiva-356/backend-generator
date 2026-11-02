# Project Configuration Reference

This guide provides the complete schema specification, field types, relationship rules, validation constraints, and supported combinations for configuring projects in the **Spring Boot Backend Generator**.

---

## Table of Contents

- [1. Configuration Model Schema](#1-configuration-model-schema)
- [2. Project-Level Settings](#2-project-level-settings)
- [3. Database & Dialect Settings](#3-database--dialect-settings)
- [4. Entity Specifications](#4-entity-specifications)
- [5. Field Data Types & Constraints](#5-field-data-types--constraints)
- [6. JPA Relationship Specifications](#6-jpa-relationship-specifications)
- [7. Spring Security Configuration](#7-spring-security-configuration)
- [8. Architectural Options](#8-architectural-options)
- [9. Semantic Validation Rules](#9-semantic-validation-rules)
- [10. Explicitly Unsupported Options](#10-explicitly-unsupported-options)

---

## 1. Configuration Model Schema

The top-level configuration object is defined by the `ProjectConfig` interface in `src/generator/types.ts`:

```typescript
export interface ProjectConfig {
  projectName: string;
  groupId: string;
  artifactId: string;
  packageName: string;
  description?: string;
  javaVersion: '17' | '21';
  springBootVersion: '3.2.5' | '3.3.0' | '3.4.0';
  database: 'postgresql' | 'mysql' | 'h2';
  entities: EntityConfig[];
  security?: SecurityConfig;
  options?: GeneratorOptions;
}
```

---

## 2. Project-Level Settings

| Property | Type | Default | Constraints & Rules | Example |
| :--- | :--- | :--- | :--- | :--- |
| `projectName` | `string` | *(Required)* | 1–100 characters. Letters, numbers, spaces, and hyphens. | `"E-Commerce Service"` |
| `groupId` | `string` | *(Required)* | Standard reverse-domain notation. Regex: `^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$` | `"com.mycompany.shop"` |
| `artifactId` | `string` | *(Required)* | Kebab-case Maven identifier. Regex: `^[a-z][a-z0-9-]*$` | `"ecommerce-api"` |
| `packageName` | `string` | *(Required)* | Valid Java package identifier. No reserved keywords. | `"com.mycompany.shop"` |
| `description` | `string` | `""` | Brief description included in `pom.xml` and `README.md`. | `"Order processing backend"` |
| `javaVersion` | `'17' \| '21'` | `'17'` | Must be LTS release Java 17 or Java 21. | `'21'` |
| `springBootVersion` | `'3.2.5' \| '3.3.0' \| '3.4.0'` | `'3.3.0'` | Must be one of the verified Spring Boot 3 releases. | `'3.3.0'` |

---

## 3. Database & Dialect Settings

The `database` property selects the target database engine, configuring runtime JDBC dependencies, driver classes, dialect configurations, and DDL syntax in `schema.sql`:

| Database | Driver Dependency | Dialect Behavior | Sample Connection URL |
| :--- | :--- | :--- | :--- |
| **`postgresql`** | `org.postgresql:postgresql` | `SERIAL` / `BIGSERIAL` primary keys, `TIMESTAMPTZ`, PostgreSQL boolean columns | `jdbc:postgresql://localhost:5432/mydb` |
| **`mysql`** | `com.mysql:mysql-connector-j` | `AUTO_INCREMENT` primary keys, `DATETIME(6)`, backticked table identifiers | `jdbc:mysql://localhost:3306/mydb` |
| **`h2`** | `com.h2database:h2` (runtime) | In-memory `jdbc:h2:mem:dbname`, web console enabled at `/h2-console` | `jdbc:h2:mem:testdb` |

---

## 4. Entity Specifications

Each entry in the `entities` array defines a persistent JPA entity:

```typescript
export interface EntityConfig {
  name: string;
  tableName?: string;
  idType?: 'Long' | 'Integer' | 'UUID' | 'String';
  idGeneration?: 'IDENTITY' | 'AUTO' | 'SEQUENCE' | 'UUID' | 'NONE';
  idFieldName?: string;
  fields: FieldConfig[];
  relationships?: RelationshipConfig[];
  description?: string;
}
```

### Identifier Configuration
- **`idType`:**
  - `Long` (Recommended default) — Maps to SQL `BIGINT`.
  - `Integer` — Maps to SQL `INT`.
  - `UUID` — Maps to `java.util.UUID` in Java and native UUID or `VARCHAR(36)` in SQL.
  - `String` — Maps to `VARCHAR(255)`.
- **`idGeneration`:**
  - `IDENTITY` (Default for numeric types) — Database auto-increment / serial.
  - `AUTO` — Persistence provider default.
  - `SEQUENCE` — Database sequence generator.
  - `UUID` — Automatic UUID generation (`@GeneratedValue`).
  - `NONE` — Assigned primary key (user must supply ID on creation).

---

## 5. Field Data Types & Constraints

The generator strictly supports **eight primitive and temporal data types**:

| Type (`FieldDataType`) | Java Type | PostgreSQL DDL | MySQL DDL | H2 DDL |
| :--- | :--- | :--- | :--- | :--- |
| **`String`** | `String` | `VARCHAR(255)` / `TEXT` | `VARCHAR(255)` / `TEXT` | `VARCHAR(255)` |
| **`Integer`** | `Integer` | `INTEGER` | `INT` | `INT` |
| **`Long`** | `Long` | `BIGINT` | `BIGINT` | `BIGINT` |
| **`Double`** | `Double` | `DOUBLE PRECISION` | `DOUBLE` | `DOUBLE` |
| **`BigDecimal`** | `java.math.BigDecimal` | `NUMERIC(p, s)` | `DECIMAL(p, s)` | `DECIMAL(p, s)` |
| **`Boolean`** | `Boolean` | `BOOLEAN` | `BOOLEAN` / `TINYINT(1)` | `BOOLEAN` |
| **`LocalDate`** | `java.time.LocalDate` | `DATE` | `DATE` | `DATE` |
| **`LocalDateTime`** | `java.time.LocalDateTime`| `TIMESTAMP` | `DATETIME(6)` | `TIMESTAMP` |

### Field Constraints & Validation Options
- `required?: boolean` — Emits `@NotNull` (or `@NotBlank` for `String`) in DTOs and `NOT NULL` in DDL.
- `unique?: boolean` — Emits `@Column(unique = true)` and `UNIQUE` constraint in DDL.
- `columnName?: string` — Explicit column name override (default: snake_case of field name).
- `length?: number` — Maximum string length (`@Size(max = length)`, `VARCHAR(length)`).
- `precision?: number` & `scale?: number` — Precision and scale for `BigDecimal`.
- `min?: number` & `max?: number` — Range validation (`@Min`, `@Max`).
- `pattern?: string` — Regular expression validation (`@Pattern(regexp = "...")`).

---

## 6. JPA Relationship Specifications

Relationships between entities are configured via the `relationships` array:

```typescript
export interface RelationshipConfig {
  name: string;
  type: 'MANY_TO_ONE' | 'ONE_TO_MANY' | 'ONE_TO_ONE' | 'MANY_TO_MANY';
  targetEntity: string;
  isOwningSide?: boolean;
  joinColumnName?: string;
  joinTableName?: string;
  joinTableInverseColumnName?: string;
  mappedBy?: string;
  required?: boolean;
  fetch?: 'LAZY' | 'EAGER';
  cascade?: ('ALL' | 'PERSIST' | 'MERGE' | 'REMOVE' | 'REFRESH' | 'DETACH')[];
  orphanRemoval?: boolean;
}
```

### Relationship Types & Rules

1. **`MANY_TO_ONE` (Many entities reference One parent)**
   - Always the **owning side** in JPA.
   - Cannot declare `mappedBy` or `orphanRemoval = true`.
   - Generates `@ManyToOne(fetch = FetchType.LAZY)` and `@JoinColumn(name = "target_id")`.
   - Emits a foreign key column and constraint in `schema.sql`.

2. **`ONE_TO_MANY` (One parent references Many children)**
   - Typically the **inverse side** (`mappedBy = "parentField"`).
   - Can be unidirectional if `mappedBy` is omitted (generates `@JoinColumn` on parent table).
   - Supports `orphanRemoval = true`.
   - DTOs exclude the inverse collection to prevent cyclic JSON serialization recursion.

3. **`ONE_TO_ONE` (Single entity relationship)**
   - The owning side declares `@JoinColumn(unique = true)`.
   - The inverse side declares `mappedBy = "fieldName"`.
   - Generates `UNIQUE` foreign key column in `schema.sql`.

4. **`MANY_TO_MANY` (Many entities reference Many entities)**
   - Owning side declares `@JoinTable` with `joinColumns` and `inverseJoinColumns`.
   - Inverse side declares `mappedBy = "fieldName"`.
   - Generates dedicated join table with composite primary key in `schema.sql`:
     ```sql
     CREATE TABLE IF NOT EXISTS student_course_enrollments (
       student_id BIGINT NOT NULL,
       course_id BIGINT NOT NULL,
       PRIMARY KEY (student_id, course_id),
       CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
       CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
     );
     ```

---

## 7. Spring Security Configuration

When security is enabled, the generator synthesizes a complete authentication subsystem:

```typescript
export interface SecurityConfig {
  enabled: boolean;
  jwtSecretEnvVar?: string;        // Default: "JWT_SECRET"
  tokenExpirationMinutes?: number; // Default: 1440 (24 hours)
  enableRegistration?: boolean;    // Default: true
  corsAllowedOrigins?: string[];   // Default: ["*"]
}
```

- **Reserved Entity Name:** When security is enabled, user entities cannot be named `AppUser` to prevent collision with the internal security entity.
- **Environment Variable Name:** `jwtSecretEnvVar` must be a valid uppercase POSIX identifier (e.g., `APP_JWT_SECRET`).
- **Secret Key Length:** The secret must be $\ge 256$ bits (32 bytes).

---

## 8. Architectural Options

Global project options are toggled via `GeneratorOptions`:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableDtos` | `boolean` | `true` | Generates dedicated Request/Response DTOs and mappers. |
| `enableValidation` | `boolean` | `true` | Emits Jakarta Bean Validation annotations in DTOs. |
| `enableGlobalExceptionHandler` | `boolean` | `true` | Generates `@ControllerAdvice` global error interceptor. |
| `serverPort` | `number` | `8080` | Configures `server.port` in `application.properties`. |

---

## 9. Semantic Validation Rules

The validator (`src/generator/validation.ts`) rejects invalid configurations with explicit, descriptive error messages:

- **Entity & Field Names:** Must be valid Java identifiers, start with a letter, and contain no hyphens, spaces, or dots.
- **Duplicate Entities:** Entity names must be strictly unique across the project.
- **Duplicate Fields:** Field names must be unique within their parent entity.
- **Reserved Words:** Java keywords (`class`, `import`, `package`, `return`, `void`, etc.) are forbidden as entity, field, or package names.
- **Target Entity Existence:** All relationship `targetEntity` references must resolve to an entity in the project.
- **Bidirectional Mapping:** When `mappedBy` is specified, the target entity must contain a reciprocal relationship with that exact name.
- **JPA Invariants:** `MANY_TO_ONE` cannot declare `mappedBy` or `orphanRemoval`.

---

## 10. Explicitly Unsupported Options

To maintain predictable compilation and zero ambiguous configurations, the following options are **intentionally not supported**:

- **Build Systems:** Gradle (`build.gradle`, `build.gradle.kts`) is not supported.
- **Reactive Stack:** Spring WebFlux (`ReactiveCrudRepository`, `Mono`, `Flux`) is not supported.
- **NoSQL Databases:** MongoDB, Cassandra, DynamoDB, and Redis primary stores are not supported.
- **Languages:** Kotlin and Groovy are not supported.
- **Legacy Framework Versions:** Java 8, 11, and Spring Boot 2.x are deprecated and unsupported.
