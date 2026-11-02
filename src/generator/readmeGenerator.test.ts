import test from 'node:test';
import assert from 'node:assert/strict';
import { generateReadme, generateGitignore } from './readmeGenerator';
import { ProjectConfig } from './types';

const baseConfig: ProjectConfig = {
  projectName: 'Order Service',
  groupId: 'com.store',
  artifactId: 'order-service',
  packageName: 'com.store.order',
  javaVersion: '17',
  springBootVersion: '3.3.0',
  database: 'postgresql',
  entities: [
    {
      name: 'Order',
      fields: [
        { name: 'orderNumber', type: 'String', required: true },
        { name: 'totalAmount', type: 'BigDecimal', required: true }
      ],
      relationships: [
        {
          name: 'items',
          type: 'ONE_TO_MANY',
          targetEntity: 'OrderItem',
          mappedBy: 'order'
        }
      ]
    },
    {
      name: 'OrderItem',
      fields: [
        { name: 'productName', type: 'String', required: true },
        { name: 'quantity', type: 'Integer', required: true }
      ],
      relationships: [
        {
          name: 'order',
          type: 'MANY_TO_ONE',
          targetEntity: 'Order'
        }
      ]
    }
  ]
};

test('Generated README: Security enabled produces JWT documentation and curl examples', () => {
  const secureConfig: ProjectConfig = {
    ...baseConfig,
    security: {
      enabled: true,
      jwtSecretEnvVar: 'CUSTOM_JWT_SECRET',
      tokenExpirationMinutes: 120
    }
  };

  const readme = generateReadme(secureConfig);

  // General details
  assert.ok(readme.includes('# Order Service'));
  assert.ok(readme.includes('Spring Boot 3.3.0'));
  assert.ok(readme.includes('Java 17'));
  assert.ok(readme.includes('POSTGRESQL'));

  // Security tech stack & section
  assert.ok(readme.includes('Spring Security 6 & JJWT 0.12.x'));
  assert.ok(readme.includes('## Authentication & Security'));
  assert.ok(readme.includes('POST /api/auth/register'));
  assert.ok(readme.includes('POST /api/auth/login'));
  assert.ok(readme.includes('CUSTOM_JWT_SECRET'));
  assert.ok(readme.includes('JWT_EXPIRATION_MINUTES'));
  assert.ok(readme.includes('120'));

  // Curl examples
  assert.ok(readme.includes('curl -s -X POST http://localhost:8080/api/auth/register'));
  assert.ok(readme.includes('curl -s -X POST http://localhost:8080/api/auth/login'));
  assert.ok(readme.includes('Authorization: Bearer <your-jwt-token>'));

  // Database setup
  assert.ok(readme.includes('docker run --name order_service-postgres'));

  // Relationships
  assert.ok(readme.includes('## Entity Relationships'));
  assert.ok(readme.includes('- **items** (`ONE_TO_MANY`) -> `OrderItem` (mappedBy: `order`)'));
  assert.ok(readme.includes('- **order** (`MANY_TO_ONE`) -> `Order` (owning side)'));

  // Build & test
  assert.ok(readme.includes('mvn test'));
  assert.ok(readme.includes('java -jar target/order-service-0.0.1-SNAPSHOT.jar'));
});

test('Generated README: Security disabled completely omits security and JWT content', () => {
  const publicConfig: ProjectConfig = {
    ...baseConfig,
    security: {
      enabled: false
    }
  };

  const readme = generateReadme(publicConfig);

  // Must NOT include security sections or JWT references
  assert.ok(!readme.includes('## Authentication & Security'));
  assert.ok(!readme.includes('Spring Security 6'));
  assert.ok(!readme.includes('JWT_SECRET'));
  assert.ok(!readme.includes('/api/auth/login'));
  assert.ok(!readme.includes('/api/auth/register'));
  assert.ok(!readme.includes('Bearer <your-jwt-token>'));

  // Must still include base features
  assert.ok(readme.includes('# Order Service'));
  assert.ok(readme.includes('POST   /api/orders'));
  assert.ok(readme.includes('GET    /api/orders'));
  assert.ok(readme.includes('## Building and Testing'));
  assert.ok(readme.includes('## Error Handling'));
});

test('Generated README: H2 database displays in-memory console instructions', () => {
  const h2Config: ProjectConfig = {
    ...baseConfig,
    database: 'h2'
  };

  const readme = generateReadme(h2Config);
  assert.ok(readme.includes('### H2 Database Console'));
  assert.ok(readme.includes('http://localhost:8080/h2-console'));
  assert.ok(readme.includes('jdbc:h2:mem:order_service'));
  assert.ok(!readme.includes('docker run --name'));
});

test('Generated .gitignore includes standard Java and IDE exclusions', () => {
  const gitignore = generateGitignore();
  assert.ok(gitignore.includes('target/'));
  assert.ok(gitignore.includes('.idea'));
  assert.ok(gitignore.includes('.vscode/'));
  assert.ok(gitignore.includes('.DS_Store'));
});
