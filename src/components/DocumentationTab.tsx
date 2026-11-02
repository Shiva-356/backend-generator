import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Terminal,
  Shield,
  Database,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  FileCode,
  Zap,
  Globe
} from 'lucide-react';

export const DocumentationTab: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Spring Boot Platform Documentation
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Developer Guide
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Architecture, compilation guides, database provisioning, security workflows, and verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Architecture & Directory Structure */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          1. Clean Layered Architecture
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Every generated Spring Boot project implements a decoupled, production-grade enterprise architecture:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5 font-sans">
              <FileCode className="w-4 h-4" />
              Domain & Persistence Layer
            </div>
            <ul className="space-y-1 text-slate-300 pl-2">
              <li>• <span className="text-indigo-300">entity/</span>: JPA Jakarta entities with constraints, relationships, & indexes</li>
              <li>• <span className="text-indigo-300">repository/</span>: Spring Data JPA repositories with query derivations</li>
              <li>• <span className="text-indigo-300">resources/schema.sql</span>: Deterministic DDL for initial table schema</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5 font-sans">
              <Zap className="w-4 h-4" />
              API & Service Layer
            </div>
            <ul className="space-y-1 text-slate-300 pl-2">
              <li>• <span className="text-indigo-300">dto/</span>: Request and Response DTOs with Jakarta Bean Validation</li>
              <li>• <span className="text-indigo-300">mapper/</span>: Manual zero-overhead DTO-to-entity transformation mappers</li>
              <li>• <span className="text-indigo-300">service/</span>: @Service layer with declarative @Transactional methods</li>
              <li>• <span className="text-indigo-300">controller/</span>: @RestController exposing RESTful CRUD endpoints</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 2: Quickstart Commands */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          2. Getting Started with Your Downloaded Project
        </h3>

        <div className="space-y-3">
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Step 1: Extract Archive & Run with Maven</span>
              <button
                type="button"
                onClick={() => copyToClipboard('unzip project.zip\ncd project\nmvn clean spring-boot:run', 'step1')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedCmd === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'step1' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950/40">
{`unzip project.zip
cd project
mvn clean spring-boot:run`}
            </pre>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Step 2: Run Unit & MockMvc Tests</span>
              <button
                type="button"
                onClick={() => copyToClipboard('mvn test', 'step2')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedCmd === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'step2' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950/40">
{`mvn test`}
            </pre>
          </div>
        </div>
      </div>

      {/* Section 3: Database Setup Guide */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          3. Local Database Provisioning via Docker
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase font-mono">PostgreSQL Container</span>
              <button
                type="button"
                onClick={() => copyToClipboard('docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dev_backend -p 5432:5432 -d postgres:16-alpine', 'pg-docker')}
                className="text-xs text-slate-400 hover:text-white"
              >
                {copiedCmd === 'pg-docker' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-slate-300 bg-slate-950 rounded-lg overflow-x-auto leading-relaxed">
{`docker run --name postgres-dev \\
  -e POSTGRES_PASSWORD=postgres \\
  -e POSTGRES_DB=dev_backend \\
  -p 5432:5432 -d postgres:16-alpine`}
            </pre>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase font-mono">MySQL Container</span>
              <button
                type="button"
                onClick={() => copyToClipboard('docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=dev_backend -p 3306:3306 -d mysql:8.0', 'mysql-docker')}
                className="text-xs text-slate-400 hover:text-white"
              >
                {copiedCmd === 'mysql-docker' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-slate-300 bg-slate-950 rounded-lg overflow-x-auto leading-relaxed">
{`docker run --name mysql-dev \\
  -e MYSQL_ROOT_PASSWORD=root \\
  -e MYSQL_DATABASE=dev_backend \\
  -p 3306:3306 -d mysql:8.0`}
            </pre>
          </div>
        </div>
      </div>

      {/* Section 4: Security & JWT */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          4. Spring Security 6 & JWT Workflow
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          When security is enabled, the backend generates stateless JWT authentication with BCrypt hashing and fail-fast key validation:
        </p>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-200">Generate 256-bit Secure Secret Key:</div>
            <pre className="p-3 text-xs font-mono text-slate-300 bg-slate-950 rounded-lg">
{`# Linux / macOS / WSL
export JWT_SECRET="$(openssl rand -base64 32)"`}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-200">Authenticate via cURL:</div>
            <pre className="p-3 text-xs font-mono text-slate-300 bg-slate-950 rounded-lg overflow-x-auto leading-relaxed">
{`# 1. Login to retrieve token
curl -X POST http://localhost:8080/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"Password123!"}'

# 2. Access protected endpoint with Bearer header
curl -X GET http://localhost:8080/api/items \\
  -H "Authorization: Bearer <TOKEN>"`}
            </pre>
          </div>
        </div>
      </div>

      {/* Section 5: Swagger UI & Postman */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          5. OpenAPI 3, Swagger UI & Postman Collection
        </h3>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs text-slate-300">
          <p>
            Your generated backend automatically mounts interactive OpenAPI documentation powered by <span className="font-mono text-cyan-300">springdoc-openapi 2.5.0</span>:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-mono text-[11px]">
            <li>Swagger UI: <span className="text-white">http://localhost:8080/swagger-ui.html</span></li>
            <li>OpenAPI 3 JSON: <span className="text-white">http://localhost:8080/v3/api-docs</span></li>
          </ul>
          <p className="pt-2">
            The ZIP package also includes <span className="font-mono text-cyan-300">postman_collection.json</span> at the root with full CRUD endpoints and automatic JWT environment token population.
          </p>
        </div>
      </div>
    </div>
  );
};
