/**
 * Postman Collection v2.1.0 generator.
 * Produces an automated, ready-to-import Postman JSON collection with:
 * - Authentication (Register, Login, Auto-set Bearer token)
 * - Complete CRUD endpoints for all entities
 * - Sample request payloads with mock data tailored to field types
 * - Query parameters for pagination and sorting
 */

import { ProjectConfig, EntityConfig, FieldConfig } from './types';
import { toPluralKebabCase } from './controllerGenerator';
import { isSecurityEnabled } from './validation';

function generateSampleFieldValue(field: FieldConfig): any {
  if (field.defaultValue !== undefined) {
    if (field.type === 'Boolean') return field.defaultValue === 'true';
    if (field.type === 'Integer' || field.type === 'Long') return parseInt(field.defaultValue, 10) || 1;
    if (field.type === 'Double' || field.type === 'BigDecimal') return parseFloat(field.defaultValue) || 10.0;
    return field.defaultValue;
  }

  const name = field.name.toLowerCase();

  switch (field.type) {
    case 'String':
      if (name.includes('email')) return 'user@example.com';
      if (name.includes('phone')) return '+1-555-0199';
      if (name.includes('url')) return 'https://example.com/asset';
      if (name.includes('code') || name.includes('number') || name.includes('sku') || name.includes('mrn')) return 'REF-1001';
      if (name.includes('name')) return 'Sample Name';
      if (name.includes('address')) return '123 Tech Boulevard';
      if (name.includes('status')) return 'ACTIVE';
      if (name.includes('type') || name.includes('category')) return 'STANDARD';
      return `Sample ${field.name}`;

    case 'Integer':
      if (field.min !== undefined) return field.min;
      return 10;

    case 'Long':
      return 100;

    case 'Double':
      return 19.99;

    case 'BigDecimal':
      return 99.50;

    case 'Boolean':
      return true;

    case 'LocalDate':
      return '2025-01-15';

    case 'LocalDateTime':
      return '2025-01-15T09:30:00';

    default:
      return 'value';
  }
}

function buildSampleRequestBody(entity: EntityConfig): Record<string, any> {
  const body: Record<string, any> = {};
  for (const field of entity.fields) {
    body[field.name] = generateSampleFieldValue(field);
  }
  return body;
}

export function generatePostmanCollection(config: ProjectConfig): string {
  const { projectName, description, entities, options } = config;
  const port = options?.serverPort || 8080;
  const securityOn = isSecurityEnabled(config);

  const authHeader = securityOn
    ? {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{bearerToken}}',
            type: 'string'
          }
        ]
      }
    : undefined;

  const items: any[] = [];

  // 1. Authentication Folder (when Spring Security enabled)
  if (securityOn) {
    items.push({
      name: 'Authentication',
      item: [
        {
          name: '1. Register New User',
          request: {
            method: 'POST',
            header: [
              {
                key: 'Content-Type',
                value: 'application/json'
              }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  username: 'founder_admin',
                  email: 'admin@startup.example',
                  password: 'Password123!'
                },
                null,
                2
              )
            },
            url: {
              raw: '{{baseUrl}}/api/auth/register',
              host: ['{{baseUrl}}'],
              path: ['api', 'auth', 'register']
            },
            description: 'Registers a new user and returns a signed JWT token.'
          }
        },
        {
          name: '2. Login (Get JWT Token)',
          event: [
            {
              listen: 'test',
              script: {
                type: 'text/javascript',
                exec: [
                  'var jsonData = pm.response.json();',
                  'if (jsonData && jsonData.token) {',
                  '    pm.environment.set("bearerToken", jsonData.token);',
                  '    pm.collectionVariables.set("bearerToken", jsonData.token);',
                  '    console.log("Bearer token automatically saved to collection variables!");',
                  '}'
                ]
              }
            }
          ],
          request: {
            method: 'POST',
            header: [
              {
                key: 'Content-Type',
                value: 'application/json'
              }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  username: 'founder_admin',
                  password: 'Password123!'
                },
                null,
                2
              )
            },
            url: {
              raw: '{{baseUrl}}/api/auth/login',
              host: ['{{baseUrl}}'],
              path: ['api', 'auth', 'login']
            },
            description: 'Authenticates credentials, returns JWT token, and auto-populates {{bearerToken}}.'
          }
        }
      ]
    });
  }

  // 2. Entity Endpoints
  for (const entity of entities) {
    const pluralKebab = toPluralKebabCase(entity.name);
    const sampleBody = buildSampleRequestBody(entity);
    const sampleBodyRaw = JSON.stringify(sampleBody, null, 2);

    const entityFolder = {
      name: entity.name,
      item: [
        {
          name: `Get All ${entity.name}s (Paginated)`,
          request: {
            method: 'GET',
            auth: authHeader,
            header: [],
            url: {
              raw: `{{baseUrl}}/api/${pluralKebab}?page=0&size=10&sort=id,desc`,
              host: ['{{baseUrl}}'],
              path: ['api', pluralKebab],
              query: [
                { key: 'page', value: '0', description: 'Page index (0-based)' },
                { key: 'size', value: '10', description: 'Page size limit' },
                { key: 'sort', value: 'id,desc', description: 'Sorting criteria' }
              ]
            },
            description: `Fetches paginated list of ${entity.name} records.`
          }
        },
        {
          name: `Get ${entity.name} by ID`,
          request: {
            method: 'GET',
            auth: authHeader,
            header: [],
            url: {
              raw: `{{baseUrl}}/api/${pluralKebab}/1`,
              host: ['{{baseUrl}}'],
              path: ['api', pluralKebab, '1']
            },
            description: `Fetches single ${entity.name} by its identifier.`
          }
        },
        {
          name: `Create ${entity.name}`,
          request: {
            method: 'POST',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: sampleBodyRaw
            },
            url: {
              raw: `{{baseUrl}}/api/${pluralKebab}`,
              host: ['{{baseUrl}}'],
              path: ['api', pluralKebab]
            },
            description: `Creates a new ${entity.name} record.`
          }
        },
        {
          name: `Update ${entity.name}`,
          request: {
            method: 'PUT',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: sampleBodyRaw
            },
            url: {
              raw: `{{baseUrl}}/api/${pluralKebab}/1`,
              host: ['{{baseUrl}}'],
              path: ['api', pluralKebab, '1']
            },
            description: `Updates an existing ${entity.name} by ID.`
          }
        },
        {
          name: `Delete ${entity.name}`,
          request: {
            method: 'DELETE',
            auth: authHeader,
            header: [],
            url: {
              raw: `{{baseUrl}}/api/${pluralKebab}/1`,
              host: ['{{baseUrl}}'],
              path: ['api', pluralKebab, '1']
            },
            description: `Deletes ${entity.name} record by ID.`
          }
        }
      ]
    };

    items.push(entityFolder);
  }

  // 3. Startup Workflow Business Logic Endpoints
  const entityNames = new Set(entities.map(e => e.name));
  const isEdTech = config.startup?.industry === 'EDTECH' || (entityNames.has('Course') && entityNames.has('Enrollment'));
  const isEcommerce = config.startup?.industry === 'ECOMMERCE' || (entityNames.has('Product') && entityNames.has('Order'));
  const isSaas = config.startup?.industry === 'SAAS' || (entityNames.has('Workspace') && entityNames.has('Project'));
  const isFintech = config.startup?.industry === 'FINTECH' || (entityNames.has('Account') && entityNames.has('Transaction'));

  if (isEdTech) {
    items.push({
      name: 'EdTech Workflows',
      item: [
        {
          name: '1. Enroll Student in Course',
          request: {
            method: 'POST',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ studentId: 1, courseId: 1 }, null, 2)
            },
            url: { raw: '{{baseUrl}}/api/v1/edtech/enrollments', host: ['{{baseUrl}}'], path: ['api', 'v1', 'edtech', 'enrollments'] },
            description: 'Enrolls a student with duplicate prevention and active course validation.'
          }
        },
        {
          name: '2. Update Course Content (Instructor Guard)',
          request: {
            method: 'PUT',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ instructorId: 1, title: 'Advanced Spring Boot Architecture', description: 'Mastering microservices', credits: 4, price: 199.99 }, null, 2)
            },
            url: { raw: '{{baseUrl}}/api/v1/edtech/courses/1', host: ['{{baseUrl}}'], path: ['api', 'v1', 'edtech', 'courses', '1'] },
            description: 'Updates course details enforcing instructor ownership check.'
          }
        },
        {
          name: '3. Submit Assessment',
          request: {
            method: 'POST',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ studentId: 1, assessmentId: 1, score: 92 }, null, 2)
            },
            url: { raw: '{{baseUrl}}/api/v1/edtech/submissions', host: ['{{baseUrl}}'], path: ['api', 'v1', 'edtech', 'submissions'] },
            description: 'Submits assessment answers, computes passing score, and records submission.'
          }
        },
        {
          name: '4. Issue Completion Certificate',
          request: {
            method: 'POST',
            auth: authHeader,
            header: [],
            url: {
              raw: '{{baseUrl}}/api/v1/edtech/certificates?studentId=1&courseId=1',
              host: ['{{baseUrl}}'],
              path: ['api', 'v1', 'edtech', 'certificates'],
              query: [{ key: 'studentId', value: '1' }, { key: 'courseId', value: '1' }]
            },
            description: 'Issues a verifiable course completion certificate.'
          }
        }
      ]
    });
  }

  if (isEcommerce) {
    items.push({
      name: 'E-Commerce Workflows',
      item: [
        {
          name: '1. Add Item to Cart (Stock Check)',
          request: {
            method: 'POST',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ customerId: 1, productId: 1, quantity: 2 }, null, 2)
            },
            url: { raw: '{{baseUrl}}/api/v1/ecommerce/cart/items', host: ['{{baseUrl}}'], path: ['api', 'v1', 'ecommerce', 'cart', 'items'] },
            description: 'Adds item to shopping cart after validating real-time inventory.'
          }
        },
        {
          name: '2. Atomic Checkout (Inventory Lock & Stripe)',
          request: {
            method: 'POST',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ customerId: 1, shippingAddressId: 1, paymentMethodToken: 'tok_visa' }, null, 2)
            },
            url: { raw: '{{baseUrl}}/api/v1/ecommerce/checkout', host: ['{{baseUrl}}'], path: ['api', 'v1', 'ecommerce', 'checkout'] },
            description: 'Executes atomic checkout with inventory decrements and payment settlement.'
          }
        },
        {
          name: '3. Customer Order Isolation Lookup',
          request: {
            method: 'GET',
            auth: authHeader,
            header: [],
            url: {
              raw: '{{baseUrl}}/api/v1/ecommerce/orders/1?customerId=1',
              host: ['{{baseUrl}}'],
              path: ['api', 'v1', 'ecommerce', 'orders', '1'],
              query: [{ key: 'customerId', value: '1' }]
            },
            description: 'Retrieves order verifying customer ownership.'
          }
        }
      ]
    });
  }

  if (isSaas) {
    items.push({
      name: 'SaaS Multi-Tenant Workflows',
      item: [
        {
          name: '1. Register Tenant Organization',
          request: {
            method: 'POST',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ organizationName: 'Acme SaaS Corp', organizationSlug: 'acme-corp', ownerEmail: 'owner@acme.example', ownerFullName: 'Alice Acme', planType: 'PRO' }, null, 2)
            },
            url: { raw: '{{baseUrl}}/api/v1/saas/tenants', host: ['{{baseUrl}}'], path: ['api', 'v1', 'saas', 'tenants'] },
            description: 'Provisions new tenant organization with default workspace and admin role.'
          }
        },
        {
          name: '2. Create Workspace Project (Subscription Limits)',
          request: {
            method: 'POST',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ userId: 1, projectName: 'Mobile App Core', projectKey: 'MAC', description: 'Flagship client mobile application' }, null, 2)
            },
            url: { raw: '{{baseUrl}}/api/v1/saas/workspaces/1/projects', host: ['{{baseUrl}}'], path: ['api', 'v1', 'saas', 'workspaces', '1', 'projects'] },
            description: 'Creates project checking tenant membership and subscription limits.'
          }
        },
        {
          name: '3. Create Project Task (Workspace Scoped)',
          request: {
            method: 'POST',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ userId: 1, title: 'Implement OAuth Login Flow', description: 'Support Google and GitHub OAuth', priority: 'HIGH', assigneeId: 1 }, null, 2)
            },
            url: { raw: '{{baseUrl}}/api/v1/saas/workspaces/1/projects/1/tasks', host: ['{{baseUrl}}'], path: ['api', 'v1', 'saas', 'workspaces', '1', 'projects', '1', 'tasks'] },
            description: 'Creates project task enforcing tenant isolation boundary.'
          }
        }
      ]
    });
  }

  if (isFintech) {
    items.push({
      name: 'FinTech Banking Workflows',
      item: [
        {
          name: '1. Fund Transfer (Atomic Ledger Debit & Credit)',
          request: {
            method: 'POST',
            auth: authHeader,
            header: [
              { key: 'Content-Type', value: 'application/json' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ sourceAccountId: 1, targetAccountId: 2, amount: 250.00, description: 'Vendor invoice payment' }, null, 2)
            },
            url: { raw: '{{baseUrl}}/api/v1/fintech/transfers', host: ['{{baseUrl}}'], path: ['api', 'v1', 'fintech', 'transfers'] },
            description: 'Executes atomic double-entry funds transfer authenticated via verified server-side JWT principal.'
          }
        },
        {
          name: '2. Add Beneficiary (Duplicate Protected)',
          request: {
            method: 'POST',
            auth: authHeader,
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ userId: 1, name: 'Robert Supplier', accountNumber: 'ACCT-9876543210', routingNumber: 'ROUT-112233' }, null, 2)
            },
            url: { raw: '{{baseUrl}}/api/v1/fintech/beneficiaries', host: ['{{baseUrl}}'], path: ['api', 'v1', 'fintech', 'beneficiaries'] },
            description: 'Registers beneficiary account preventing duplicate registrations.'
          }
        }
      ]
    });
  }

  const collection = {
    info: {
      _postman_id: `sb-gen-${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `${projectName} REST API`,
      description: description || `Generated Postman Collection for ${projectName} Spring Boot backend service.`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: items,
    variable: [
      {
        key: 'baseUrl',
        value: `http://localhost:${port}`,
        type: 'string'
      },
      {
        key: 'bearerToken',
        value: '',
        type: 'string'
      }
    ]
  };

  return JSON.stringify(collection, null, 2);
}
