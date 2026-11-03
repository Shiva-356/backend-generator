import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSpringBootProject,
  buildStartupProjectConfig,
  getStartupReferenceProfile,
  validateGeneratedProjectQuality,
  exportProjectToZip,
  ProjectConfig
} from './index';

function findFile(files: { path: string; content: string }[], pathPattern: string) {
  return files.find(f => f.path === pathPattern || f.path.endsWith(pathPattern));
}

test('Startup Reference Profiles: All 4 reference profiles are registered and complete', () => {
  const edtech = getStartupReferenceProfile('EDTECH');
  const ecommerce = getStartupReferenceProfile('ECOMMERCE');
  const saas = getStartupReferenceProfile('SAAS');
  const fintech = getStartupReferenceProfile('FINTECH');

  assert.ok(edtech, 'EdTech profile registered');
  assert.equal(edtech.entities.length, 9, 'EdTech should have 9 entities');
  assert.equal(edtech.entities.map(e => e.name).sort().join(','),
    ['Assessment', 'Certificate', 'Course', 'Enrollment', 'Instructor', 'Lesson', 'Question', 'Student', 'Submission'].join(','));

  assert.ok(ecommerce, 'E-Commerce profile registered');
  assert.equal(ecommerce.entities.length, 11, 'E-Commerce should have 11 entities');
  assert.equal(ecommerce.entities.map(e => e.name).sort().join(','),
    ['Address', 'Cart', 'CartItem', 'Category', 'Customer', 'Inventory', 'Order', 'OrderItem', 'Payment', 'Product', 'Review'].join(','));

  assert.ok(saas, 'SaaS profile registered');
  assert.equal(saas.entities.length, 9, 'SaaS should have 9 entities');
  assert.equal(saas.entities.map(e => e.name).sort().join(','),
    ['AuditLog', 'Membership', 'Organization', 'Project', 'Role', 'Subscription', 'Task', 'User', 'Workspace'].join(','));

  assert.ok(fintech, 'FinTech profile registered');
  assert.equal(fintech.entities.length, 6, 'FinTech should have 6 entities');
  assert.equal(fintech.entities.map(e => e.name).sort().join(','),
    ['Account', 'AuditLog', 'Beneficiary', 'PaymentMethod', 'Transaction', 'User'].join(','));
  assert.ok(fintech.disclaimer?.includes('DISCLAIMER'), 'FinTech profile must contain regulatory disclaimer');
});

test('EdTech Startup Backend: Generates all 9 entities, workflow service, controller, and passes quality check', async () => {
  const config = buildStartupProjectConfig({
    industry: 'EDTECH',
    businessModel: 'B2C_MARKETPLACE'
  }, {
    projectName: 'edtech-cloud',
    packageName: 'com.startup.edtech'
  });

  const project = generateSpringBootProject(config);

  // Verify all 9 entities generated
  const expectedEntities = ['Student', 'Instructor', 'Course', 'Lesson', 'Enrollment', 'Assessment', 'Question', 'Submission', 'Certificate'];
  for (const name of expectedEntities) {
    assert.ok(findFile(project.files, `entity/${name}.java`), `Missing entity ${name}`);
    assert.ok(findFile(project.files, `repository/${name}Repository.java`), `Missing repository ${name}`);
    assert.ok(findFile(project.files, `service/${name}Service.java`), `Missing service ${name}`);
    assert.ok(findFile(project.files, `controller/${name}Controller.java`), `Missing controller ${name}`);
  }

  // Verify EdTech workflow components
  const workflowService = findFile(project.files, 'service/workflow/EdTechWorkflowService.java');
  assert.ok(workflowService, 'Missing EdTechWorkflowService.java');
  assert.match(workflowService.content, /enrollStudent/);
  assert.match(workflowService.content, /DuplicateResourceException/);
  assert.match(workflowService.content, /UnauthorizedAccessException/);
  assert.match(workflowService.content, /issueCertificate/);

  const workflowController = findFile(project.files, 'controller/workflow/EdTechWorkflowController.java');
  assert.ok(workflowController, 'Missing EdTechWorkflowController.java');
  assert.match(workflowController.content, /@RequestMapping\("\/api\/v1\/edtech"\)/);

  // Verify composite repository finders
  const enrollmentRepo = findFile(project.files, 'repository/EnrollmentRepository.java');
  assert.ok(enrollmentRepo);
  assert.match(enrollmentRepo.content, /findByStudentIdAndCourseId/);

  // Pre-download quality report
  const quality = validateGeneratedProjectQuality(project.files, config);
  assert.equal(quality.isValid, true, 'Project must pass quality validation');
  assert.equal(quality.score, 100, 'Score must be 100%');

  // Verify ZIP packaging
  const zipBytes = await exportProjectToZip(project);
  assert.ok(zipBytes.byteLength > 1000);
});

test('E-Commerce Startup Backend: Generates all 11 entities, atomic checkout, inventory decrements, and payment gateway', async () => {
  const config = buildStartupProjectConfig({
    industry: 'ECOMMERCE',
    businessModel: 'B2C_MARKETPLACE'
  }, {
    projectName: 'retail-cloud',
    packageName: 'com.startup.retail'
  });

  const project = generateSpringBootProject(config);

  const expectedEntities = ['Customer', 'Address', 'Product', 'Category', 'Cart', 'CartItem', 'Order', 'OrderItem', 'Payment', 'Inventory', 'Review'];
  for (const name of expectedEntities) {
    assert.ok(findFile(project.files, `entity/${name}.java`), `Missing entity ${name}`);
  }

  // Verify Ecommerce workflow logic
  const workflowService = findFile(project.files, 'service/workflow/EcommerceWorkflowService.java');
  assert.ok(workflowService, 'Missing EcommerceWorkflowService.java');
  assert.match(workflowService.content, /addItemToCart/);
  assert.match(workflowService.content, /checkout/);
  assert.match(workflowService.content, /InsufficientStockException/);
  assert.match(workflowService.content, /@Transactional/);
  assert.match(workflowService.content, /PaymentGateway/);
  assert.match(workflowService.content, /verifyCustomerOrderAccess/);

  const workflowController = findFile(project.files, 'controller/workflow/EcommerceWorkflowController.java');
  assert.ok(workflowController, 'Missing EcommerceWorkflowController.java');
  assert.match(workflowController.content, /@RequestMapping\("\/api\/v1\/ecommerce"\)/);

  // Verify PaymentGateway abstraction
  assert.ok(findFile(project.files, 'integration/payment/PaymentGateway.java'));
  assert.ok(findFile(project.files, 'integration/payment/StripePaymentService.java'));

  // Quality check
  const quality = validateGeneratedProjectQuality(project.files, config);
  assert.equal(quality.isValid, true);
  assert.equal(quality.score, 100);
});

test('SaaS Startup Backend: Generates multi-tenant workspaces, membership guards, subscription limits, and audit logs', async () => {
  const config = buildStartupProjectConfig({
    industry: 'SAAS',
    businessModel: 'B2B_SAAS'
  }, {
    projectName: 'saas-cloud',
    packageName: 'com.startup.saas'
  });

  const project = generateSpringBootProject(config);

  const expectedEntities = ['User', 'Organization', 'Workspace', 'Membership', 'Role', 'Project', 'Task', 'Subscription', 'AuditLog'];
  for (const name of expectedEntities) {
    assert.ok(findFile(project.files, `entity/${name}.java`), `Missing entity ${name}`);
  }

  const workflowService = findFile(project.files, 'service/workflow/SaasWorkflowService.java');
  assert.ok(workflowService, 'Missing SaasWorkflowService.java');
  assert.match(workflowService.content, /registerTenant/);
  assert.match(workflowService.content, /createProjectInWorkspace/);
  assert.match(workflowService.content, /TenantIsolationException/);
  assert.match(workflowService.content, /Subscription project limit reached/);

  const workflowController = findFile(project.files, 'controller/workflow/SaasWorkflowController.java');
  assert.ok(workflowController, 'Missing SaasWorkflowController.java');
  assert.match(workflowController.content, /@RequestMapping\("\/api\/v1\/saas"\)/);

  const quality = validateGeneratedProjectQuality(project.files, config);
  assert.equal(quality.isValid, true);
  assert.equal(quality.score, 100);
});

test('FinTech Startup Backend: Generates atomic transfer logic, InsufficientFundsException, audit logs, and regulatory disclaimer', async () => {
  const config = buildStartupProjectConfig({
    industry: 'FINTECH',
    businessModel: 'B2B_SAAS'
  }, {
    projectName: 'fintech-bank',
    packageName: 'com.startup.fintech'
  });

  const project = generateSpringBootProject(config);

  const expectedEntities = ['User', 'Account', 'Transaction', 'Beneficiary', 'PaymentMethod', 'AuditLog'];
  for (const name of expectedEntities) {
    assert.ok(findFile(project.files, `entity/${name}.java`), `Missing entity ${name}`);
  }

  const workflowService = findFile(project.files, 'service/workflow/FintechWorkflowService.java');
  assert.ok(workflowService, 'Missing FintechWorkflowService.java');
  assert.match(workflowService.content, /transferFunds/);
  assert.match(workflowService.content, /InsufficientFundsException/);
  assert.match(workflowService.content, /sourceAccount\.getBalance\(\)\.compareTo\(request\.getAmount\(\)\) < 0/);
  assert.match(workflowService.content, /addBeneficiary/);
  assert.match(workflowService.content, /REGULATORY DISCLAIMER/);

  const workflowController = findFile(project.files, 'controller/workflow/FintechWorkflowController.java');
  assert.ok(workflowController, 'Missing FintechWorkflowController.java');
  assert.match(workflowController.content, /Authentication authentication/);
  assert.doesNotMatch(workflowController.content, /X-User-Id/);

  // README includes disclaimer
  const readme = findFile(project.files, 'README.md');
  assert.ok(readme);
  assert.match(readme.content, /Regulatory & Compliance Disclaimer/);
  assert.match(readme.content, /does NOT constitute real banking settlement/);

  const quality = validateGeneratedProjectQuality(project.files, config);
  assert.equal(quality.isValid, true);
  assert.equal(quality.score, 100);
});

test('Postman & Environment Configuration: Generates .env.example and startup workflow endpoints', () => {
  const config = buildStartupProjectConfig({
    industry: 'FINTECH',
    businessModel: 'B2B_SAAS'
  });

  const project = generateSpringBootProject(config);

  const envFile = findFile(project.files, '.env.example');
  assert.ok(envFile, 'Missing .env.example');
  assert.match(envFile.content, /SERVER_PORT=8080/);
  assert.match(envFile.content, /JWT_SECRET=/);
  assert.match(envFile.content, /STRIPE_API_KEY=/);
  assert.match(envFile.content, /TWILIO_ACCOUNT_SID=/);
  assert.match(envFile.content, /SENDGRID_API_KEY=/);
  assert.match(envFile.content, /AWS_S3_BUCKET=/);

  const postmanFile = findFile(project.files, 'postman_collection.json');
  assert.ok(postmanFile, 'Missing postman_collection.json');
  const postman = JSON.parse(postmanFile.content);
  assert.ok(postman.item.some((folder: any) => folder.name === 'FinTech Banking Workflows'));
});

test('Pre-Download Quality Validator: Rejects damaged project files', () => {
  const config = buildStartupProjectConfig({
    industry: 'SAAS',
    businessModel: 'B2B_SAAS'
  });

  const project = generateSpringBootProject(config);

  // Intentionally damage files to verify quality check catches it
  const damagedFiles = project.files.filter(f => f.path !== 'pom.xml');
  const report = validateGeneratedProjectQuality(damagedFiles, config);

  assert.equal(report.isValid, false, 'Damaged project must fail quality validation');
  assert.ok(report.score < 100, 'Score must be reduced');
  assert.ok(report.checks.some(c => c.id === 'MAVEN_POM_VALIDITY' && !c.passed));
});
