import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOMAIN_TEMPLATES,
  getDomainTemplate,
  resolveTemplateKey,
  createProjectConfigFromTemplate,
  generateSpringBootProject,
  generatePostmanCollection,
  buildStartupProjectConfig,
  INDUSTRY_PRESETS,
  BUSINESS_MODELS
} from './index';

test('Domain Templates: All 15 domain templates are registered with full default entities', () => {
  const expectedKeys = [
    'FOOD_DELIVERY',
    'ECOMMERCE',
    'BOOKING',
    'STREAMING',
    'PAYMENT',
    'EDUCATION_ERP',
    'FINTECH_BANKING',
    'HEALTHTECH_EHR',
    'PROPTECH_REALESTATE',
    'LOGISTICS_SUPPLY_CHAIN',
    'SOCIAL_COMMUNITY',
    'PROJECT_MANAGEMENT_SAAS',
    'CRM_SALES',
    'HRTECH_TALENT',
    'CUSTOM'
  ];

  for (const key of expectedKeys) {
    assert.ok(DOMAIN_TEMPLATES[key], `Missing template: ${key}`);
    const tmpl = DOMAIN_TEMPLATES[key];
    assert.ok(tmpl.name.length > 0);
    assert.ok(tmpl.description.length > 0);
    assert.ok(tmpl.modules.length > 0);
    assert.ok(tmpl.defaultEntities.length > 0);
  }
});

test('Domain Templates: Key resolution handles aliases and case variations', () => {
  assert.equal(resolveTemplateKey('fintech'), 'FINTECH_BANKING');
  assert.equal(resolveTemplateKey('BANKING'), 'FINTECH_BANKING');
  assert.equal(resolveTemplateKey('healthcare'), 'HEALTHTECH_EHR');
  assert.equal(resolveTemplateKey('ehr'), 'HEALTHTECH_EHR');
  assert.equal(resolveTemplateKey('proptech'), 'PROPTECH_REALESTATE');
  assert.equal(resolveTemplateKey('realestate'), 'PROPTECH_REALESTATE');
  assert.equal(resolveTemplateKey('logistics'), 'LOGISTICS_SUPPLY_CHAIN');
  assert.equal(resolveTemplateKey('social'), 'SOCIAL_COMMUNITY');
  assert.equal(resolveTemplateKey('project_management'), 'PROJECT_MANAGEMENT_SAAS');
  assert.equal(resolveTemplateKey('crm'), 'CRM_SALES');
  assert.equal(resolveTemplateKey('hrtech'), 'HRTECH_TALENT');
  assert.equal(resolveTemplateKey('edtech'), 'EDUCATION_ERP');
  assert.equal(resolveTemplateKey('unknown_key'), 'CUSTOM');
});

test('Domain Templates: Generation works seamlessly across all 8 new real-world domains', () => {
  const newDomainKeys = [
    'FINTECH_BANKING',
    'HEALTHTECH_EHR',
    'PROPTECH_REALESTATE',
    'LOGISTICS_SUPPLY_CHAIN',
    'SOCIAL_COMMUNITY',
    'PROJECT_MANAGEMENT_SAAS',
    'CRM_SALES',
    'HRTECH_TALENT'
  ];

  for (const key of newDomainKeys) {
    const config = createProjectConfigFromTemplate(key, {
      database: 'postgresql',
      security: { enabled: true }
    });

    const project = generateSpringBootProject(config);

    assert.ok(project.files.length >= 15, `Expected >= 15 files for ${key}, got ${project.files.length}`);
    assert.ok(project.summary.entityCount >= 4, `Expected >= 4 entities for ${key}`);

    // Verify schema.sql was synthesized cleanly
    const schemaFile = project.files.find(f => f.path.endsWith('schema.sql'));
    assert.ok(schemaFile, `Missing schema.sql for ${key}`);
    assert.ok(schemaFile.content.includes('CREATE TABLE'), `Schema missing table definitions in ${key}`);

    // Verify postman collection included
    const postmanFile = project.files.find(f => f.path.endsWith('postman_collection.json'));
    assert.ok(postmanFile, `Missing postman_collection.json for ${key}`);

    // Verify pom.xml has springdoc-openapi
    const pomFile = project.files.find(f => f.path.endsWith('pom.xml'));
    assert.ok(pomFile?.content.includes('springdoc-openapi-starter-webmvc-ui'), `Missing springdoc in ${key}`);
  }
});

test('Startup Builder: buildStartupProjectConfig builds cohesive project for FinTech B2B SaaS', () => {
  const config = buildStartupProjectConfig({
    industry: 'FINTECH',
    businessModel: 'B2B_SAAS',
    targetAudience: 'Global Enterprise Banks',
    integrations: {
      paymentGateway: 'stripe',
      notificationService: 'twilio',
      storageService: 's3',
      complianceNotes: ['PCI_DSS', 'SOC2']
    }
  });

  assert.equal(config.database, 'postgresql');
  assert.equal(config.security?.enabled, true);
  assert.ok(config.entities.length >= 5);
  assert.ok(config.startup);
  assert.equal(config.startup.industry, 'FINTECH');
  assert.equal(config.startup.businessModel, 'B2B_SAAS');

  const project = generateSpringBootProject(config);
  assert.ok(project.files.length > 20);

  const appProps = project.files.find(f => f.path.endsWith('application.properties'))!;
  assert.ok(appProps.content.includes('springdoc.swagger-ui.path=/swagger-ui.html'));
  assert.ok(appProps.content.includes('security.jwt.secret'));
});

test('Postman Generator: Emits valid v2.1.0 collection with auto-token auth scripts', () => {
  const config = createProjectConfigFromTemplate('FINTECH_BANKING', {
    security: { enabled: true }
  });

  const postmanJson = generatePostmanCollection(config);
  const parsed = JSON.parse(postmanJson);

  assert.equal(parsed.info.schema, 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json');
  assert.ok(parsed.item.length > 0);

  // Auth folder present
  const authFolder = parsed.item.find((it: any) => it.name === 'Authentication');
  assert.ok(authFolder, 'Missing Authentication folder in Postman collection');
  assert.equal(authFolder.item.length, 2);

  // Entities folders present
  const accountFolder = parsed.item.find((it: any) => it.name === 'Account');
  assert.ok(accountFolder, 'Missing Account folder in Postman collection');
  assert.equal(accountFolder.item.length, 5); // 5 CRUD endpoints
});
