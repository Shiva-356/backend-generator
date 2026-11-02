# Spring Boot 3.x Backend Generator

[![Node.js CI](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.x-blue.svg)](https://www.typescriptlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2%20|%203.3%20|%203.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17%20|%2021%20LTS-orange.svg)](https://www.oracle.com/java/)
[![Tests](https://img.shields.io/badge/Unit%20Tests-72%20Passing-success.svg)](docs/TESTING.md)

A modern, full-stack, browser-based developer tool for modeling, configuring, and generating production-ready **Java Spring Boot 3.x** REST API services. The generator runs completely client-side in TypeScript, producing compilation-ready Maven projects packaged into clean ZIP archives with zero server-side storage or tracking.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation and Quick Start](#installation-and-quick-start)
- [Architecture Overview](#architecture-overview)
- [Repository Structure](#repository-structure)
- [Configuration Matrix](#configuration-matrix)
- [Known Boundaries & Limitations](#known-boundaries--limitations)
- [Maintenance & Developer Guide](#maintenance--developer-guide)
- [Documentation Index](#documentation-index)

---

## Overview

Designing enterprise Spring Boot applications from scratch requires orchestrating entity models, JPA relationships, layered clean architecture (`Entity -> Repository -> DTO -> Mapper -> Service -> Controller`), SQL schemas, validation annotations, and security filter chains. 

The **Spring Boot Backend Generator** provides an intuitive web interface and an automated TypeScript generation engine to configure domain entities, establish database relationships, configure authentication, and export an entire, pristine Maven project in seconds.

---

## Core Features

- **Modern Spring Boot & Java LTS:** Supports Java 17 and Java 21 LTS with Spring Boot versions `3.2.5`, `3.3.0`, and `3.4.0`.
- **Relational Database Dialects:** Generates dialect-tuned DDL (`schema.sql`) and `application.properties` for **PostgreSQL**, **MySQL**, and in-memory **H2**.
- **Complete Layered Architecture:**
  - JPA Entities with configurable IDs (`Long`, `Integer`, `UUID`, `String`) and strategies (`IDENTITY`, `AUTO`, `SEQUENCE`, `UUID`, `NONE`).
  - Spring Data JPA Repositories with custom derived query hooks.
  - Decoupled Request and Response DTOs with Jakarta Validation annotations (`@NotBlank`, `@NotNull`, `@Min`, `@Max`, `@Pattern`, `@Size`).
  - Dedicated Mapper components preventing entity leakage and cyclic serialization.
  - Service layer encapsulating transactional business logic and repository calls.
  - REST Controllers exposing standard CRUD endpoints with proper HTTP status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`).
  - Global Exception Handling with structured JSON error response payloads.
- **Relational JPA Modeling:** Supports all standard entity relationships:
  - `@OneToOne` (with owning/inverse side and unique foreign key constraints)
  - `@OneToMany` (bidirectional mapped by or unidirectional join column)
  - `@ManyToOne` (foreign key persistence with lazy fetching)
  - `@ManyToMany` (join table generation with composite primary keys)
- **Spring Security 6 & JJWT 0.12.x:**
  - Stateless Bearer JWT authentication filter chain (`JwtAuthenticationFilter`).
  - Cryptographically secure password hashing using BCrypt with strength factor 12.
  - User registration (`POST /api/auth/register`) and authentication (`POST /api/auth/login`).
  - HMAC-SHA256 signing requiring $\ge 256$-bit secret keys provided safely via environment variables.
  - Automated MockMvc and slice tests (`JwtServiceTest`, `AuthControllerTest`).
- **In-Browser ZIP Packaging:** Fast, deterministic in-memory ZIP generation using JSZip 3.10 with normalized POSIX paths, folder root prefixing, and browser download concurrency protection.
- **Live Code Preview & Domain Templates:** Includes pre-modeled templates for E-Commerce, Food Delivery, Booking/Reservations, Streaming, Payments, and Education ERP.

---

## Technology Stack

### Generator Host Application
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Client-side reactive user interface |
| **Language** | [TypeScript 7.x](https://www.typescriptlang.org/) | Strict static typing across generator and UI |
| **Bundler / Dev Server** | [Vite 8](https://vite.dev/) | High-speed ESM development server and bundler |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) | Modern utility-first responsive styling |
| **Packaging Engine** | [JSZip 3.10](https://stuk.github.io/jszip/) | Pure client-side in-memory ZIP creation |
| **Icons & Animation** | [Lucide React](https://lucide.dev/) / Motion | UI icons and smooth state transitions |
| **Testing Harness** | Node.js Test Runner / `tsx` | Native TypeScript test runner and verification scripts |

### Generated Spring Boot Application
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Core Framework** | [Spring Boot 3.x](https://spring.io/projects/spring-boot) | Standalone, production-grade Spring application |
| **Language** | Java 17 or Java 21 LTS | Modern Java LTS with records and pattern matching |
| **Build System** | Apache Maven 3.8+ | Standard dependency and lifecycle management |
| **Persistence** | Spring Data JPA / Hibernate 6 | Relational object-relational mapping |
| **Security** | Spring Security 6 & JJWT 0.12.5 | Stateless JWT bearer authentication |
| **Database Drivers** | PostgreSQL / MySQL / H2 | Official runtime JDBC drivers |
| **Validation** | Jakarta Bean Validation | Declarative constraint annotations |

---

## Prerequisites

### For Developing the Generator
- **Node.js:** `v20.x` or `v22.x` LTS (`v22.14.0` verified)
- **Package Manager:** `npm` v10.x or higher

### For Running Generated Projects
- **Java Development Kit (JDK):** JDK 17 or 21 LTS installed and set in `PATH`
- **Maven:** Apache Maven 3.8+ (or use the included Maven wrapper `./mvnw`)
- **Database:**
  - For PostgreSQL: Local PostgreSQL instance or Docker container (`postgres:16-alpine`)
  - For MySQL: Local MySQL instance or Docker container (`mysql:8.0`)
  - For H2: None (runs in-memory automatically)

---

## Installation and Quick Start

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd backend-generator
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The generator UI will be accessible at `http://localhost:3000`.

### 3. Run the Test Suite
```bash
npm run test
```
Executes all 72 unit and integration tests across generator modules, security generation, ZIP packaging, and UI components.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory.

### 5. Run the Project Verification Pipeline
```bash
npm run verify:generated
```
Generates 8 representative project archetypes (CONFIG_A through CONFIG_H), validates ZIP archives, extracts them to sandboxes, inspects structural manifests, and runs native Maven verification if a JDK toolchain is present.

---

## Architecture Overview

The generator operates as an immutable, functional pipeline with strict stage separation:

```
┌─────────────────────────┐
│   User Configuration    │  (React UI / Domain Templates)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Validation & Linting   │  (src/generator/validation.ts)
└────────────┬────────────┘  - Checks naming, types, cyclic refs, reserved words
             │
             ▼
┌─────────────────────────┐
│ Code Generation Modules │  (src/generator/*.ts & security/*.ts)
└────────────┬────────────┘  - Generates Java classes, DDL, properties, pom.xml
             │
             ▼
┌─────────────────────────┐
│ File Collection Buffer  │  (GeneratedFile[] in memory)
└────────────┬────────────┘  - Sorted deterministically by POSIX path
             │
             ▼
┌─────────────────────────┐
│ In-Memory ZIP Packaging │  (src/generator/zipPackaging.ts)
└────────────┬────────────┘  - Normalizes paths, applies root folder prefix
             │
             ▼
┌─────────────────────────┐
│ Browser Blob / Download │  (src/generator/download.ts)
└────────────┬────────────┘  - Triggers client-side download with concurrency guard
             │
             ▼
┌─────────────────────────┐
│ Verification Matrix     │  (scripts/verify-generated-projects.ts)
└─────────────────────────┘  - Extracts archives and verifies compilation
```

For deep architectural details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Repository Structure

```
backend-generator/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI matrix (Java 17 & 21 verification)
├── docs/
│   ├── ARCHITECTURE.md            # Comprehensive 7-stage pipeline architecture
│   ├── CONFIGURATION.md           # Full configuration schema & constraints reference
│   ├── SECURITY.md                # Security architecture & credential safety guide
│   └── TESTING.md                 # Test harness, verification matrix & CI guide
├── scripts/
│   └── verify-generated-projects.ts # Multi-configuration verification harness
├── src/
│   ├── components/                # React UI components (Tabs, Navbar, Preview)
│   │   ├── EntitiesTab.tsx        # Entity and relationship visual editor
│   │   ├── Navbar.tsx             # Header bar and quick action buttons
│   │   ├── PreviewTab.tsx         # File tree and syntax-highlighted code viewer
│   │   ├── ProjectSettingsTab.tsx # Maven, Java, Spring Boot & DB settings
│   │   ├── SecurityTab.tsx        # Spring Security 6 & JWT toggles
│   │   └── ValidationBanner.tsx   # Live error and warning notifications
│   ├── generator/                 # Pure TypeScript generation engine
│   │   ├── applicationGenerator.ts# Main application class & application.properties
│   │   ├── controllerGenerator.ts # Spring REST controllers
│   │   ├── download.ts            # Browser Blob download utility
│   │   ├── dtoGenerator.ts        # Request/Response DTOs and Mappers
│   │   ├── entityGenerator.ts     # JPA entity classes with annotations
│   │   ├── exceptionGenerator.ts  # Global exception handler & error response
│   │   ├── index.ts               # Generator public API facade
│   │   ├── pomGenerator.ts        # Maven pom.xml with managed dependencies
│   │   ├── readmeGenerator.ts     # Generated project README.md and .gitignore
│   │   ├── repositoryGenerator.ts # Spring Data JPA repositories
│   │   ├── security/              # Security entities, JWT service, filters, config
│   │   │   └── securityGenerator.ts
│   │   ├── sqlGenerator.ts        # Dialect-specific schema.sql DDL generator
│   │   ├── templates/             # Domain templates (E-Commerce, Food, Booking, etc.)
│   │   │   └── domainTemplates.ts
│   │   ├── types.ts               # Core TypeScript type definitions
│   │   ├── validation.ts          # Semantic validation & integrity rules
│   │   ├── zipPackaging.ts        # JSZip archive packaging & path normalization
│   │   └── *.test.ts              # Unit test suites (67 passing tests)
│   ├── App.tsx                    # Top-level React container
│   ├── index.css                  # Global Tailwind CSS styles
│   └── main.tsx                   # React DOM entry point
├── package.json                   # Project scripts and dependencies
├── tsconfig.json                  # TypeScript compiler configuration
└── vite.config.ts                 # Vite bundler configuration
```

---

## Configuration Matrix

The generator supports the following verified technologies and options:

| Category | Supported Options | Notes |
| :--- | :--- | :--- |
| **Java Versions** | `17`, `21` | LTS releases supported by Spring Boot 3.x |
| **Spring Boot** | `3.2.5`, `3.3.0`, `3.4.0` | Production releases on Maven Central |
| **Databases** | `postgresql`, `mysql`, `h2` | Includes official JDBC drivers and dialect DDL |
| **Build Tool** | `Maven` | standard `pom.xml` with `spring-boot-starter-parent` |
| **Primary Keys** | `Long`, `Integer`, `UUID`, `String` | Strategies: `IDENTITY`, `AUTO`, `SEQUENCE`, `UUID`, `NONE` |
| **Field Types** | `String`, `Integer`, `Long`, `Double`, `BigDecimal`, `Boolean`, `LocalDate`, `LocalDateTime` | Maps to standard Java types and SQL column types |
| **Relationships** | `ONE_TO_ONE`, `ONE_TO_MANY`, `MANY_TO_ONE`, `MANY_TO_MANY` | Configurable cascade, fetch type, owning side, and join tables |
| **Security** | Spring Security 6 + JJWT 0.12.5 | Stateless Bearer JWT, BCrypt, MockMvc tests |
| **Architecture Options** | DTOs, Mappers, Global Exception Handler | Configurable toggles per project |

For complete schema details and validation rules, see [docs/CONFIGURATION.md](docs/CONFIGURATION.md).

---

## Known Boundaries & Limitations

To maintain uncompromising reliability and compile guarantees, the generator adheres to strict design boundaries:

1. **Relational Databases Only:** The generator produces SQL schemas and JPA entities. NoSQL databases (MongoDB, Cassandra, Redis as primary store) are unsupported.
2. **Maven Only:** Gradle build scripts (`build.gradle`, `build.gradle.kts`) are currently not supported.
3. **Synchronous REST:** The generator creates Spring MVC servlet-based applications (`spring-boot-starter-web`). Reactive WebFlux (`spring-boot-starter-webflux`) is not supported.
4. **Java Language Only:** Kotlin and Groovy language generation are unsupported.
5. **Environment Compilation Status:**
   - In the local AI Studio container, Node.js is present but native `java` and `mvn` binaries are omitted from the PATH. Therefore, native Maven compilation (`mvn compile`) is **BLOCKED** locally, while TypeScript type checks, bundle builds, and in-memory ZIP structural validations **PASS** (67/67).
   - In GitHub Actions CI (`.github/workflows/ci.yml`), full JDK 17 & 21 toolchains are installed, executing live `mvn test` verification on all generated archetypes.

---

## Maintenance & Developer Guide

### Key NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on port 3000 |
| `npm run build` | Compiles TypeScript and builds production distribution |
| `npm run lint` | Runs TypeScript static type checking (`tsc --noEmit`) |
| `npm run test` | Runs all 67 unit and integration tests using `tsx` |
| `npm run verify:generated` | Runs the 8-project archetype verification matrix |
| `npm run verify` | Runs `lint`, `test`, `build`, and `verify:generated` in sequence |

### Adding a New Field Type
1. Add the type name to `FieldDataType` in `src/generator/types.ts`.
2. Map the type to Java in `src/generator/entityGenerator.ts` and `src/generator/dtoGenerator.ts`.
3. Map the type to SQL DDL in `src/generator/sqlGenerator.ts`.
4. Add test coverage in `src/generator/generator.test.ts`.

---

## Documentation Index

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Architectural design, data flow diagrams, pipeline lifecycle, and engineering trade-offs.
- **[docs/CONFIGURATION.md](docs/CONFIGURATION.md)** — Comprehensive configuration model, validation constraints, field specifications, and unsupported combinations.
- **[docs/SECURITY.md](docs/SECURITY.md)** — Security architecture, JWT signing rules, BCrypt hashing, secret protection, and production hardening checklist.
- **[docs/TESTING.md](docs/TESTING.md)** — Testing philosophy, unit test breakdown, verification harness matrix, and CI/CD workflow documentation.

---

## License

This project is licensed under the Apache 2.0 License.
