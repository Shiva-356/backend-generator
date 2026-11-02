/**
 * Complete Reference Startup Profiles for Phase 10:
 * 1. EdTech Startup (9 entities)
 * 2. E-Commerce Startup (11 entities)
 * 3. SaaS Startup (9 entities)
 * 4. FinTech Startup (6 entities)
 *
 * Each profile defines production-grade entities, typed relationships,
 * and business workflow requirements.
 */

import { EntityConfig, StartupIndustry } from '../types';

export interface StartupReferenceProfile {
  industry: StartupIndustry;
  name: string;
  tagline: string;
  description: string;
  entities: EntityConfig[];
  workflowServiceName: string;
  workflowControllerName: string;
  businessRules: string[];
  disclaimer?: string;
}

// -----------------------------------------------------------------------------
// 1. EdTech Startup Profile (9 Entities)
// -----------------------------------------------------------------------------
export const EDTECH_REFERENCE_PROFILE: StartupReferenceProfile = {
  industry: 'EDTECH',
  name: 'NextGen EdTech Learning Platform',
  tagline: 'Course catalogs, student enrollments, lessons, assessments, and verifiable certificates',
  description: 'Scalable educational backend with duplicate enrollment prevention, instructor course ownership enforcement, assessment scoring engine, and completion certificate issuance.',
  workflowServiceName: 'EdTechWorkflowService',
  workflowControllerName: 'EdTechWorkflowController',
  businessRules: [
    'Duplicate enrollment prevention: A student cannot enroll in the same course twice',
    'Inactive course protection: Students cannot enroll in courses marked inactive',
    'Instructor ownership check: Only the assigned instructor or admin can modify course content',
    'Assessment grading engine: Automatic submission scoring against passing threshold',
    'Duplicate certificate prevention: Prevents issuing duplicate completion certificates'
  ],
  entities: [
    {
      name: 'Student',
      tableName: 'students',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, length: 100 },
        { name: 'email', type: 'String', required: true, unique: true, length: 120 },
        { name: 'studentNumber', type: 'String', required: true, unique: true, length: 50 },
        { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' }
      ],
      relationships: [
        { name: 'enrollments', type: 'ONE_TO_MANY', targetEntity: 'Enrollment', mappedBy: 'student' },
        { name: 'submissions', type: 'ONE_TO_MANY', targetEntity: 'Submission', mappedBy: 'student' },
        { name: 'certificates', type: 'ONE_TO_MANY', targetEntity: 'Certificate', mappedBy: 'student' }
      ]
    },
    {
      name: 'Instructor',
      tableName: 'instructors',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, length: 100 },
        { name: 'email', type: 'String', required: true, unique: true, length: 120 },
        { name: 'department', type: 'String', required: true, length: 80 },
        { name: 'bio', type: 'String', required: false, length: 500 },
        { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' }
      ],
      relationships: [
        { name: 'courses', type: 'ONE_TO_MANY', targetEntity: 'Course', mappedBy: 'instructor' }
      ]
    },
    {
      name: 'Course',
      tableName: 'courses',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'title', type: 'String', required: true, length: 150 },
        { name: 'code', type: 'String', required: true, unique: true, length: 30 },
        { name: 'description', type: 'String', required: false, length: 1000 },
        { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' },
        { name: 'credits', type: 'Integer', required: true, min: 1, max: 10 },
        { name: 'price', type: 'BigDecimal', required: true, min: 0, precision: 10, scale: 2 }
      ],
      relationships: [
        { name: 'instructor', type: 'MANY_TO_ONE', targetEntity: 'Instructor', required: true },
        { name: 'lessons', type: 'ONE_TO_MANY', targetEntity: 'Lesson', mappedBy: 'course' },
        { name: 'enrollments', type: 'ONE_TO_MANY', targetEntity: 'Enrollment', mappedBy: 'course' },
        { name: 'assessments', type: 'ONE_TO_MANY', targetEntity: 'Assessment', mappedBy: 'course' }
      ]
    },
    {
      name: 'Lesson',
      tableName: 'lessons',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'title', type: 'String', required: true, length: 150 },
        { name: 'content', type: 'String', required: false, length: 2000 },
        { name: 'sequenceOrder', type: 'Integer', required: true, min: 1 },
        { name: 'durationMinutes', type: 'Integer', required: true, min: 1 }
      ],
      relationships: [
        { name: 'course', type: 'MANY_TO_ONE', targetEntity: 'Course', required: true }
      ]
    },
    {
      name: 'Enrollment',
      tableName: 'enrollments',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'enrollmentDate', type: 'LocalDate', required: true },
        { name: 'status', type: 'String', required: true, length: 30, defaultValue: 'ACTIVE' },
        { name: 'grade', type: 'String', required: false, length: 10 }
      ],
      relationships: [
        { name: 'student', type: 'MANY_TO_ONE', targetEntity: 'Student', required: true },
        { name: 'course', type: 'MANY_TO_ONE', targetEntity: 'Course', required: true }
      ]
    },
    {
      name: 'Assessment',
      tableName: 'assessments',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'title', type: 'String', required: true, length: 150 },
        { name: 'maxScore', type: 'Integer', required: true, min: 1 },
        { name: 'passingScore', type: 'Integer', required: true, min: 1 }
      ],
      relationships: [
        { name: 'course', type: 'MANY_TO_ONE', targetEntity: 'Course', required: true },
        { name: 'questions', type: 'ONE_TO_MANY', targetEntity: 'Question', mappedBy: 'assessment' },
        { name: 'submissions', type: 'ONE_TO_MANY', targetEntity: 'Submission', mappedBy: 'assessment' }
      ]
    },
    {
      name: 'Question',
      tableName: 'questions',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'prompt', type: 'String', required: true, length: 500 },
        { name: 'questionType', type: 'String', required: true, length: 30 },
        { name: 'points', type: 'Integer', required: true, min: 1 }
      ],
      relationships: [
        { name: 'assessment', type: 'MANY_TO_ONE', targetEntity: 'Assessment', required: true }
      ]
    },
    {
      name: 'Submission',
      tableName: 'submissions',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'score', type: 'Integer', required: true },
        { name: 'passed', type: 'Boolean', required: true },
        { name: 'submittedAt', type: 'LocalDateTime', required: true }
      ],
      relationships: [
        { name: 'assessment', type: 'MANY_TO_ONE', targetEntity: 'Assessment', required: true },
        { name: 'student', type: 'MANY_TO_ONE', targetEntity: 'Student', required: true }
      ]
    },
    {
      name: 'Certificate',
      tableName: 'certificates',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'certificateNumber', type: 'String', required: true, unique: true, length: 60 },
        { name: 'issueDate', type: 'LocalDate', required: true },
        { name: 'verificationUrl', type: 'String', required: false, length: 255 }
      ],
      relationships: [
        { name: 'student', type: 'MANY_TO_ONE', targetEntity: 'Student', required: true },
        { name: 'course', type: 'MANY_TO_ONE', targetEntity: 'Course', required: true }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 2. E-Commerce Startup Profile (11 Entities)
// -----------------------------------------------------------------------------
export const ECOMMERCE_REFERENCE_PROFILE: StartupReferenceProfile = {
  industry: 'ECOMMERCE',
  name: 'Omnichannel E-Commerce Retail Platform',
  tagline: 'Catalogs, inventory locking, atomic checkout, and payment settlement',
  description: 'Production-ready retail backend with transactional stock decrementing, server-side price recalculation, customer order isolation, and PaymentGateway integration.',
  workflowServiceName: 'EcommerceWorkflowService',
  workflowControllerName: 'EcommerceWorkflowController',
  businessRules: [
    'Transactional stock decrement: Atomic inventory locking to prevent overselling',
    'Server-side price verification: Order totals calculated strictly from database product prices',
    'Customer order ownership check: Customers can only query, modify, or cancel their own orders',
    'Duplicate order prevention: Prevents accidental duplicate checkout with idempotency checks',
    'PaymentGateway abstraction: Decoupled Stripe/mock settlement with full audit trail'
  ],
  entities: [
    {
      name: 'Customer',
      tableName: 'customers',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, length: 100 },
        { name: 'email', type: 'String', required: true, unique: true, length: 120 },
        { name: 'phone', type: 'String', required: false, length: 30 },
        { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' }
      ],
      relationships: [
        { name: 'addresses', type: 'ONE_TO_MANY', targetEntity: 'Address', mappedBy: 'customer' },
        { name: 'orders', type: 'ONE_TO_MANY', targetEntity: 'Order', mappedBy: 'customer' },
        { name: 'reviews', type: 'ONE_TO_MANY', targetEntity: 'Review', mappedBy: 'customer' }
      ]
    },
    {
      name: 'Address',
      tableName: 'addresses',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'street', type: 'String', required: true, length: 200 },
        { name: 'city', type: 'String', required: true, length: 100 },
        { name: 'state', type: 'String', required: true, length: 100 },
        { name: 'postalCode', type: 'String', required: true, length: 20 },
        { name: 'country', type: 'String', required: true, length: 100 },
        { name: 'isDefault', type: 'Boolean', required: true, defaultValue: 'false' }
      ],
      relationships: [
        { name: 'customer', type: 'MANY_TO_ONE', targetEntity: 'Customer', required: true }
      ]
    },
    {
      name: 'Category',
      tableName: 'categories',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, unique: true, length: 80 },
        { name: 'slug', type: 'String', required: true, unique: true, length: 100 },
        { name: 'description', type: 'String', required: false, length: 300 },
        { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' }
      ],
      relationships: [
        { name: 'products', type: 'ONE_TO_MANY', targetEntity: 'Product', mappedBy: 'category' }
      ]
    },
    {
      name: 'Product',
      tableName: 'products',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, length: 150 },
        { name: 'sku', type: 'String', required: true, unique: true, length: 50 },
        { name: 'description', type: 'String', required: false, length: 1000 },
        { name: 'price', type: 'BigDecimal', required: true, min: 0, precision: 12, scale: 2 },
        { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' }
      ],
      relationships: [
        { name: 'category', type: 'MANY_TO_ONE', targetEntity: 'Category', required: true },
        { name: 'inventory', type: 'ONE_TO_ONE', targetEntity: 'Inventory', mappedBy: 'product' },
        { name: 'reviews', type: 'ONE_TO_MANY', targetEntity: 'Review', mappedBy: 'product' }
      ]
    },
    {
      name: 'Inventory',
      tableName: 'inventories',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'availableStock', type: 'Integer', required: true, min: 0 },
        { name: 'reservedStock', type: 'Integer', required: true, min: 0, defaultValue: '0' },
        { name: 'minStockThreshold', type: 'Integer', required: true, min: 0, defaultValue: '5' }
      ],
      relationships: [
        { name: 'product', type: 'ONE_TO_ONE', targetEntity: 'Product', required: true, isOwningSide: true }
      ]
    },
    {
      name: 'Cart',
      tableName: 'carts',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'sessionId', type: 'String', required: true, unique: true, length: 80 },
        { name: 'status', type: 'String', required: true, length: 30, defaultValue: 'ACTIVE' }
      ],
      relationships: [
        { name: 'customer', type: 'MANY_TO_ONE', targetEntity: 'Customer', required: true },
        { name: 'items', type: 'ONE_TO_MANY', targetEntity: 'CartItem', mappedBy: 'cart' }
      ]
    },
    {
      name: 'CartItem',
      tableName: 'cart_items',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'quantity', type: 'Integer', required: true, min: 1 },
        { name: 'unitPrice', type: 'BigDecimal', required: true, min: 0, precision: 12, scale: 2 }
      ],
      relationships: [
        { name: 'cart', type: 'MANY_TO_ONE', targetEntity: 'Cart', required: true },
        { name: 'product', type: 'MANY_TO_ONE', targetEntity: 'Product', required: true }
      ]
    },
    {
      name: 'Order',
      tableName: 'orders',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'orderNumber', type: 'String', required: true, unique: true, length: 50 },
        { name: 'totalAmount', type: 'BigDecimal', required: true, min: 0, precision: 12, scale: 2 },
        { name: 'status', type: 'String', required: true, length: 30, defaultValue: 'PENDING' }
      ],
      relationships: [
        { name: 'customer', type: 'MANY_TO_ONE', targetEntity: 'Customer', required: true },
        { name: 'shippingAddress', type: 'MANY_TO_ONE', targetEntity: 'Address', required: true },
        { name: 'items', type: 'ONE_TO_MANY', targetEntity: 'OrderItem', mappedBy: 'order' },
        { name: 'payment', type: 'ONE_TO_ONE', targetEntity: 'Payment', mappedBy: 'order' }
      ]
    },
    {
      name: 'OrderItem',
      tableName: 'order_items',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'quantity', type: 'Integer', required: true, min: 1 },
        { name: 'unitPrice', type: 'BigDecimal', required: true, min: 0, precision: 12, scale: 2 },
        { name: 'subtotal', type: 'BigDecimal', required: true, min: 0, precision: 12, scale: 2 }
      ],
      relationships: [
        { name: 'order', type: 'MANY_TO_ONE', targetEntity: 'Order', required: true },
        { name: 'product', type: 'MANY_TO_ONE', targetEntity: 'Product', required: true }
      ]
    },
    {
      name: 'Payment',
      tableName: 'payments',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'transactionReference', type: 'String', required: true, unique: true, length: 100 },
        { name: 'amount', type: 'BigDecimal', required: true, min: 0, precision: 12, scale: 2 },
        { name: 'status', type: 'String', required: true, length: 30, defaultValue: 'PENDING' },
        { name: 'paymentMethod', type: 'String', required: true, length: 40 }
      ],
      relationships: [
        { name: 'order', type: 'ONE_TO_ONE', targetEntity: 'Order', required: true, isOwningSide: true }
      ]
    },
    {
      name: 'Review',
      tableName: 'reviews',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'rating', type: 'Integer', required: true, min: 1, max: 5 },
        { name: 'comment', type: 'String', required: false, length: 500 }
      ],
      relationships: [
        { name: 'customer', type: 'MANY_TO_ONE', targetEntity: 'Customer', required: true },
        { name: 'product', type: 'MANY_TO_ONE', targetEntity: 'Product', required: true }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 3. SaaS Startup Profile (9 Entities)
// -----------------------------------------------------------------------------
export const SAAS_REFERENCE_PROFILE: StartupReferenceProfile = {
  industry: 'SAAS',
  name: 'Multi-Tenant B2B SaaS Platform',
  tagline: 'Workspaces, team memberships, RBAC permissions, and subscription limits',
  description: 'Enterprise-grade multi-tenant backend enforcing workspace data isolation, seat limits, role-based membership guards, and immutable audit logs.',
  workflowServiceName: 'SaasWorkflowService',
  workflowControllerName: 'SaasWorkflowController',
  businessRules: [
    'Multi-tenant workspace isolation: Queries and updates are strictly bound to verified workspace boundaries',
    'Membership & permission validation: Actions require valid organization membership and role permissions',
    'Subscription tier limits: Prevents creating projects or workspaces exceeding subscription plan maximums',
    'Audit trail: Critical organization and project actions automatically record immutable audit events',
    'Tenant isolation protection: Disallows cross-workspace entity references'
  ],
  entities: [
    {
      name: 'User',
      tableName: 'users',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'email', type: 'String', required: true, unique: true, length: 120 },
        { name: 'fullName', type: 'String', required: true, length: 100 },
        { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' }
      ],
      relationships: [
        { name: 'memberships', type: 'ONE_TO_MANY', targetEntity: 'Membership', mappedBy: 'user' }
      ]
    },
    {
      name: 'Organization',
      tableName: 'organizations',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, length: 100 },
        { name: 'slug', type: 'String', required: true, unique: true, length: 80 },
        { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' }
      ],
      relationships: [
        { name: 'workspaces', type: 'ONE_TO_MANY', targetEntity: 'Workspace', mappedBy: 'organization' },
        { name: 'memberships', type: 'ONE_TO_MANY', targetEntity: 'Membership', mappedBy: 'organization' },
        { name: 'subscription', type: 'ONE_TO_ONE', targetEntity: 'Subscription', mappedBy: 'organization' }
      ]
    },
    {
      name: 'Workspace',
      tableName: 'workspaces',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, length: 100 },
        { name: 'slug', type: 'String', required: true, length: 80 }
      ],
      relationships: [
        { name: 'organization', type: 'MANY_TO_ONE', targetEntity: 'Organization', required: true },
        { name: 'projects', type: 'ONE_TO_MANY', targetEntity: 'Project', mappedBy: 'workspace' }
      ]
    },
    {
      name: 'Role',
      tableName: 'roles',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, unique: true, length: 50 },
        { name: 'permissions', type: 'String', required: true, length: 500 }
      ],
      relationships: [
        { name: 'memberships', type: 'ONE_TO_MANY', targetEntity: 'Membership', mappedBy: 'role' }
      ]
    },
    {
      name: 'Membership',
      tableName: 'memberships',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'status', type: 'String', required: true, length: 30, defaultValue: 'ACTIVE' }
      ],
      relationships: [
        { name: 'user', type: 'MANY_TO_ONE', targetEntity: 'User', required: true },
        { name: 'organization', type: 'MANY_TO_ONE', targetEntity: 'Organization', required: true },
        { name: 'role', type: 'MANY_TO_ONE', targetEntity: 'Role', required: true }
      ]
    },
    {
      name: 'Project',
      tableName: 'projects',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, length: 120 },
        { name: 'key', type: 'String', required: true, length: 20 },
        { name: 'description', type: 'String', required: false, length: 500 },
        { name: 'maxTasksAllowed', type: 'Integer', required: true, defaultValue: '1000' }
      ],
      relationships: [
        { name: 'workspace', type: 'MANY_TO_ONE', targetEntity: 'Workspace', required: true },
        { name: 'tasks', type: 'ONE_TO_MANY', targetEntity: 'Task', mappedBy: 'project' }
      ]
    },
    {
      name: 'Task',
      tableName: 'tasks',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'title', type: 'String', required: true, length: 150 },
        { name: 'description', type: 'String', required: false, length: 1000 },
        { name: 'status', type: 'String', required: true, length: 30, defaultValue: 'TODO' },
        { name: 'priority', type: 'String', required: true, length: 20, defaultValue: 'MEDIUM' }
      ],
      relationships: [
        { name: 'project', type: 'MANY_TO_ONE', targetEntity: 'Project', required: true },
        { name: 'assignee', type: 'MANY_TO_ONE', targetEntity: 'User', required: false }
      ]
    },
    {
      name: 'Subscription',
      tableName: 'subscriptions',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'planType', type: 'String', required: true, length: 40, defaultValue: 'PRO' },
        { name: 'status', type: 'String', required: true, length: 30, defaultValue: 'ACTIVE' },
        { name: 'maxProjects', type: 'Integer', required: true, defaultValue: '10' }
      ],
      relationships: [
        { name: 'organization', type: 'ONE_TO_ONE', targetEntity: 'Organization', required: true, isOwningSide: true }
      ]
    },
    {
      name: 'AuditLog',
      tableName: 'audit_logs',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'action', type: 'String', required: true, length: 80 },
        { name: 'entityName', type: 'String', required: true, length: 80 },
        { name: 'entityId', type: 'Long', required: true },
        { name: 'performedBy', type: 'String', required: true, length: 120 },
        { name: 'details', type: 'String', required: false, length: 500 }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// 4. FinTech Startup Profile (6 Entities)
// -----------------------------------------------------------------------------
export const FINTECH_REFERENCE_PROFILE: StartupReferenceProfile = {
  industry: 'FINTECH',
  name: 'FinTech Multi-Currency Digital Banking',
  tagline: 'Double-entry balance verification, KYC checks, and secure fund transfers',
  description: 'Transactional digital banking ledger supporting account verification, atomic fund transfers with balance guarantees, beneficiary validation, and immutable audit logs.',
  workflowServiceName: 'FintechWorkflowService',
  workflowControllerName: 'FintechWorkflowController',
  disclaimer: 'DISCLAIMER: This backend serves as a production-grade software integration architecture. It does NOT constitute real banking settlement, regulatory clearing, or a certified banking license. Do not claim PCI-DSS or SOC 2 compliance without independent third-party audits and compliant hardware infrastructure.',
  businessRules: [
    'Account status validation: Accounts must be ACTIVE (not FROZEN or CLOSED) for debit or credit',
    'KYC status verification: Initiating users must have VERIFIED KYC status before initiating transfers',
    'Balance protection & InsufficientFundsException: Transfers verify sufficient funds prior to atomic debit',
    'Double-entry atomic balance updates: Source debited and target credited within a single @Transactional boundary',
    'Immutable audit trail: Every transfer generates an immutable transaction log and audit record',
    'Beneficiary duplicate check: Prevents adding duplicate beneficiary account numbers for a user'
  ],
  entities: [
    {
      name: 'User',
      tableName: 'users',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'username', type: 'String', required: true, unique: true, length: 60 },
        { name: 'email', type: 'String', required: true, unique: true, length: 120 },
        { name: 'fullName', type: 'String', required: true, length: 100 },
        { name: 'kycStatus', type: 'String', required: true, length: 30, defaultValue: 'VERIFIED' },
        { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' }
      ],
      relationships: [
        { name: 'accounts', type: 'ONE_TO_MANY', targetEntity: 'Account', mappedBy: 'user' },
        { name: 'beneficiaries', type: 'ONE_TO_MANY', targetEntity: 'Beneficiary', mappedBy: 'user' },
        { name: 'paymentMethods', type: 'ONE_TO_MANY', targetEntity: 'PaymentMethod', mappedBy: 'user' }
      ]
    },
    {
      name: 'Account',
      tableName: 'accounts',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'accountNumber', type: 'String', required: true, unique: true, length: 34 },
        { name: 'currency', type: 'String', required: true, length: 3, defaultValue: 'USD' },
        { name: 'balance', type: 'BigDecimal', required: true, min: 0, precision: 19, scale: 4, defaultValue: '0.0000' },
        { name: 'status', type: 'String', required: true, length: 20, defaultValue: 'ACTIVE' }
      ],
      relationships: [
        { name: 'user', type: 'MANY_TO_ONE', targetEntity: 'User', required: true },
        { name: 'outgoingTransactions', type: 'ONE_TO_MANY', targetEntity: 'Transaction', mappedBy: 'sourceAccount' },
        { name: 'incomingTransactions', type: 'ONE_TO_MANY', targetEntity: 'Transaction', mappedBy: 'targetAccount' }
      ]
    },
    {
      name: 'Transaction',
      tableName: 'transactions',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'reference', type: 'String', required: true, unique: true, length: 64 },
        { name: 'amount', type: 'BigDecimal', required: true, min: 0.01, precision: 19, scale: 4 },
        { name: 'transactionType', type: 'String', required: true, length: 30, defaultValue: 'TRANSFER' },
        { name: 'status', type: 'String', required: true, length: 30, defaultValue: 'COMPLETED' },
        { name: 'description', type: 'String', required: false, length: 255 }
      ],
      relationships: [
        { name: 'sourceAccount', type: 'MANY_TO_ONE', targetEntity: 'Account', required: true },
        { name: 'targetAccount', type: 'MANY_TO_ONE', targetEntity: 'Account', required: true }
      ]
    },
    {
      name: 'Beneficiary',
      tableName: 'beneficiaries',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, length: 100 },
        { name: 'accountNumber', type: 'String', required: true, length: 34 },
        { name: 'routingNumber', type: 'String', required: false, length: 30 },
        { name: 'verified', type: 'Boolean', required: true, defaultValue: 'true' }
      ],
      relationships: [
        { name: 'user', type: 'MANY_TO_ONE', targetEntity: 'User', required: true }
      ]
    },
    {
      name: 'PaymentMethod',
      tableName: 'payment_methods',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'type', type: 'String', required: true, length: 30 },
        { name: 'providerToken', type: 'String', required: true, length: 100 },
        { name: 'isDefault', type: 'Boolean', required: true, defaultValue: 'false' }
      ],
      relationships: [
        { name: 'user', type: 'MANY_TO_ONE', targetEntity: 'User', required: true }
      ]
    },
    {
      name: 'AuditLog',
      tableName: 'audit_logs',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'action', type: 'String', required: true, length: 80 },
        { name: 'actorId', type: 'String', required: true, length: 80 },
        { name: 'ipAddress', type: 'String', required: false, length: 45 },
        { name: 'payloadSummary', type: 'String', required: false, length: 500 }
      ]
    }
  ]
};

export const STARTUP_REFERENCE_PROFILES: Record<string, StartupReferenceProfile> = {
  EDTECH: EDTECH_REFERENCE_PROFILE,
  ECOMMERCE: ECOMMERCE_REFERENCE_PROFILE,
  SAAS: SAAS_REFERENCE_PROFILE,
  FINTECH: FINTECH_REFERENCE_PROFILE
};

export function getStartupReferenceProfile(industry: StartupIndustry | string): StartupReferenceProfile | undefined {
  return STARTUP_REFERENCE_PROFILES[industry.toUpperCase()];
}
