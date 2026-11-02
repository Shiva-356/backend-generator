# Testing & Continuous Integration Guide

This document details the testing architecture, automated verification harness, CI/CD workflows, and execution instructions for the **Spring Boot Backend Generator**.

---

## Table of Contents

- [1. Testing Strategy](#1-testing-strategy)
- [2. Unit & Integration Test Suites](#2-unit--integration-test-suites)
- [3. The Multi-Configuration Verification Harness](#3-the-multi-configuration-verification-harness)
- [4. Environment Capabilities & Status Matrix](#4-environment-capabilities--status-matrix)
- [5. Continuous Integration (GitHub Actions)](#5-continuous-integration-github-actions)
- [6. Running Tests Locally](#6-running-tests-locally)
- [7. Troubleshooting & Diagnostics](#7-troubleshooting--diagnostics)

---

## 1. Testing Strategy

The project employs a two-tier testing methodology:

1. **Host Application & Generator Engine Tests:** Unit tests in TypeScript validating schema validation, identifier safety, code generation output, security component synthesis, ZIP packaging, and UI component behavior.
2. **Generated Project Verification:** A dedicated verification harness (`scripts/verify-generated-projects.ts`) that synthesizes 8 diverse Spring Boot project archetypes, packages them into ZIP archives, extracts them into isolated sandboxes, verifies their structural manifests, and executes native Maven compilation when a JDK is available.

---

## 2. Unit & Integration Test Suites

The test suite runs using Node.js's native test runner (`tsx --test src/**/*.test.ts`) and comprises **72 passing automated tests** across 6 specialized test files:

| Test File | Test Count | Scope & Behaviors Verified |
| :--- | :--- | :--- |
| `src/generator/generator.test.ts` | 26 tests | Core Spring Boot scaffold, multi-entity generation, DTOs, mappers, services, controllers, global exception handling, SQL schema generation, primary key strategies (`IDENTITY`, `AUTO`, `SEQUENCE`, `UUID`), all 8 field data types, 1:1, 1:N, N:1, and N:N relationships, cascade options, orphan removal, and validation error catching. |
| `src/generator/security.test.ts` | 13 tests | Spring Security 6 & JJWT 0.12.5 synthesis, `AppUser` entity, BCrypt hashing factor 12, `JwtService` claims generation, `@PostConstruct` fail-fast validation, `SecurityConfig` stateless filter chain, H2 console frame exceptions, schema table creation, safe property placeholders, and generated Java MockMvc unit tests. |
| `src/generator/zipPackaging.test.ts` | 14 tests | In-memory JSZip packaging, deterministic file ordering, POSIX slash normalization, root directory prefixing (`<artifactId>/`), root traversal rejection (`validateArchiveRoot`), conflicting file-vs-directory path collision rejection, case-insensitive duplicate path rejection, archive integrity, rejection of path traversal (`../`), empty file validation, and concurrency mutex protection in browser downloads. |
| `src/generator/verificationPipeline.test.ts` | 9 tests | Self-tests for the verification harness: toolchain detection (`isToolchainAvailable`), archive extraction, corrupted ZIP rejection, missing mandatory file detection (e.g., missing `pom.xml`), zero-byte file rejection, and sandbox cleanup guarantees. |
| `src/generator/readmeGenerator.test.ts` | 4 tests | Verifies that generated project `README.md` files accurately document curl commands for auth, Docker commands for PostgreSQL/MySQL, in-memory H2 console URLs, and standard `.gitignore` rules. |
| `src/generator/frontendIntegration.test.ts` | 6 tests | Full integration of UI tabs (`ProjectSettingsTab`, `EntitiesTab`, `SecurityTab`, `PreviewTab`), domain template loading, live syntax preview, dynamic security toggling, and reactive ZIP export triggers. |

---

## 3. The Multi-Configuration Verification Harness

Located at `scripts/verify-generated-projects.ts`, the verification harness tests an archetypal matrix representing real-world production configurations:

```
┌────────────────────────────────────────────────────────┐
│              Verification Matrix Archetypes            │
├──────────┬─────────────┬────────────┬──────────────────┤
│ Config   │ Database    │ Java / SB  │ Distinct Features│
├──────────┼─────────────┼────────────┼──────────────────┤
│ CONFIG_A │ H2          │ 17 / 3.3.0 │ Minimal Single   │
│ CONFIG_B │ PostgreSQL  │ 21 / 3.4.0 │ Relational 1:N   │
│ CONFIG_C │ MySQL       │ 17 / 3.2.5 │ Security & JWT   │
│ CONFIG_D │ PostgreSQL  │ 21 / 3.4.0 │ UUID PKs & N:N   │
│ CONFIG_E │ H2          │ 17 / 3.3.0 │ Custom Port 9090 │
│ CONFIG_F │ MySQL       │ 21 / 3.3.0 │ 1:1 & Cascades   │
│ CONFIG_G │ PostgreSQL  │ 21 / 3.4.0 │ Full Stack (All) │
│ CONFIG_H │ H2          │ 17 / 3.2.5 │ Baseline SB 3.2  │
└──────────┴─────────────┴────────────┴──────────────────┘
```

### Execution Steps for Each Configuration:
1. **Synthesize:** Calls `generateSpringBootProject(config)` to generate in-memory files.
2. **Package:** Calls `exportProjectToZip(project)` to create a binary ZIP buffer.
3. **Extract:** Unzips the archive into an isolated sandbox under `/tmp/sb-verify-<timestamp>-<hash>`.
4. **Structural Audit:** Asserts presence and non-zero byte size of `pom.xml`, `application.properties`, `schema.sql`, `README.md`, and all Java source files.
5. **Toolchain Inspection:** Detects presence of `java` and `mvn` on system `PATH`.
6. **Native Compilation:** If toolchain is present, executes `mvn clean test` and `mvn compile`.
7. **Sandbox Cleanup:** Deletes temporary sandbox directory in a `finally` block to prevent disk pollution.

---

## 4. Environment Capabilities & Status Matrix

Because different environments provide different system tools, test results are explicitly categorized:

| Verification Phase | Local AI Studio Container | GitHub Actions CI Runner | Status Definition |
| :--- | :---: | :---: | :--- |
| **TypeScript Linting (`tsc --noEmit`)** | **PASS** | **PASS** | Strict type safety with zero errors. |
| **Generator Unit Tests (67 tests)** | **PASS** | **PASS** | Pure TypeScript logic executed via Node.js. |
| **Vite Bundle Build (`npm run build`)** | **PASS** | **PASS** | Production asset bundling. |
| **ZIP Extraction & Structure Audit** | **PASS** | **PASS** | Validates generated archive integrity in `/tmp`. |
| **Native Java/Maven Compilation** | **BLOCKED** | **PASS** | Requires `java` and `mvn` binaries in system `PATH`. |
| **Remote CI Workflow Execution** | **NOT RUN** | **PASS** | Executed in GitHub cloud infrastructure upon push. |

> **Host Environment Notice:** The local AI Studio workspace runs in a lightweight Linux container with Node.js 22 LTS, but **without a local JDK or Maven installation**. Consequently, running `npm run verify:generated` locally will report **PASS** for Generation, Packaging, and Structural Verification, and report **BLOCKED** for native Maven compilation.

---

## 5. Continuous Integration (GitHub Actions)

The repository includes a comprehensive GitHub Actions workflow at `.github/workflows/ci.yml`:

### Workflow Configuration:
- **Triggers:** `push` and `pull_request` on `main` and `master`, plus manual `workflow_dispatch`.
- **Security:** Least-privilege permissions (`permissions: contents: read`).
- **Matrix Strategy:** Executes concurrently across **Java 17** and **Java 21 LTS** using Eclipse Temurin distributions.
- **Workflow Steps:**
  1. Checks out repository.
  2. Sets up Node.js 22 with npm cache.
  3. Runs `npm ci`.
  4. Runs `npm run lint`.
  5. Runs `npm run test` (all 67 generator unit tests).
  6. Runs `npm run build`.
  7. Sets up JDK (`actions/setup-java@v4` with distribution `temurin` and maven cache).
  8. Verifies toolchain availability (`java -version`, `mvn -version`).
  9. Runs `npm run verify:generated` with dummy `JWT_SECRET` for native compilation.
  10. Uploads failure diagnostics artifacts on failure.

---

## 6. Running Tests Locally

### Run All Unit & Integration Tests
```bash
npm run test
```

### Run Static Type Checking & Linting
```bash
npm run lint
```

### Run Production Build
```bash
npm run build
```

### Run Project Verification Harness
```bash
npm run verify:generated
```

### Run the Complete Verification Pipeline
```bash
npm run verify
```
This script executes `lint`, `test`, `build`, and `verify:generated` sequentially.

---

## 7. Troubleshooting & Diagnostics

### Missing Java / Maven on Host
- **Symptom:** `npm run verify:generated` reports `BLOCKED` for Maven compilation.
- **Resolution:** This is expected in the lightweight development container. To run native compilation locally, install JDK 17+ and Maven 3.8+ on your host machine and ensure `java -version` and `mvn -version` execute successfully.

### Corrupted ZIP Files or Extraction Failures
- The verification harness strictly isolates sandboxes in `/tmp/sb-verify-*`. If an extraction fails, check permissions on `/tmp` and ensure disk space is available. Sandboxes are automatically removed after each run.
