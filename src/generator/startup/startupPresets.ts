/**
 * Startup presets and industry architectures for the Startup Builder.
 * Maps startup industry and business model selections to optimized Spring Boot
 * backend configurations, entities, user roles, security, and integration guidelines.
 */

import {
  StartupIndustry,
  StartupBusinessModel,
  StartupConfig,
  ProjectConfig,
  DatabaseType
} from '../types';
import { getDomainTemplate, DOMAIN_TEMPLATES } from '../templates/domainTemplates';
import { STARTUP_REFERENCE_PROFILES, getStartupReferenceProfile } from './startupReferenceProfiles';

export * from './startupReferenceProfiles';

export interface IndustryMetadata {
  id: StartupIndustry;
  name: string;
  tagline: string;
  description: string;
  recommendedDb: DatabaseType;
  defaultRoles: string[];
  recommendedPayment: 'stripe' | 'paypal' | 'razorpay' | 'none';
  recommendedNotification: 'twilio' | 'sendgrid' | 'firebase' | 'none';
  recommendedStorage: 's3' | 'cloudinary' | 'local';
  complianceBadges: Array<'GDPR' | 'HIPAA' | 'PCI_DSS' | 'SOC2'>;
  templateKey: string;
}

export interface BusinessModelMetadata {
  id: StartupBusinessModel;
  name: string;
  description: string;
  keyConcerns: string[];
  architectureFocus: string;
}

export const INDUSTRY_PRESETS: Record<StartupIndustry, IndustryMetadata> = {
  FINTECH: {
    id: 'FINTECH',
    name: 'FinTech & Digital Banking',
    tagline: 'High-security multi-currency banking and payment ledger',
    description: 'Stateless JWT auth with role hierarchy, immutable audit logs, precision BigDecimal accounting, and strict transaction isolation.',
    recommendedDb: 'postgresql',
    defaultRoles: ['ROLE_CUSTOMER', 'ROLE_TELLER', 'ROLE_COMPLIANCE_OFFICER', 'ROLE_ADMIN'],
    recommendedPayment: 'stripe',
    recommendedNotification: 'twilio',
    recommendedStorage: 's3',
    complianceBadges: ['PCI_DSS', 'SOC2', 'GDPR'],
    templateKey: 'FINTECH_BANKING'
  },
  HEALTHTECH: {
    id: 'HEALTHTECH',
    name: 'HealthTech & Telehealth',
    tagline: 'HIPAA-compliant patient records & clinical encounters',
    description: 'Role-based access control for medical staff and patients, encrypted health records, appointments, and prescription auditing.',
    recommendedDb: 'postgresql',
    defaultRoles: ['ROLE_PATIENT', 'ROLE_NURSE', 'ROLE_PHYSICIAN', 'ROLE_MEDICAL_ADMIN'],
    recommendedPayment: 'stripe',
    recommendedNotification: 'sendgrid',
    recommendedStorage: 's3',
    complianceBadges: ['HIPAA', 'GDPR', 'SOC2'],
    templateKey: 'HEALTHTECH_EHR'
  },
  PROPTECH: {
    id: 'PROPTECH',
    name: 'PropTech & Real Estate',
    tagline: 'Property listings, broker networks, and transaction pipeline',
    description: 'Multi-entity marketplace connecting buyers, verified agents, scheduled property viewings, and purchase offers.',
    recommendedDb: 'postgresql',
    defaultRoles: ['ROLE_BUYER', 'ROLE_AGENT', 'ROLE_AGENCY_ADMIN', 'ROLE_ADMIN'],
    recommendedPayment: 'stripe',
    recommendedNotification: 'sendgrid',
    recommendedStorage: 's3',
    complianceBadges: ['GDPR'],
    templateKey: 'PROPTECH_REALESTATE'
  },
  LOGISTICSTECH: {
    id: 'LOGISTICSTECH',
    name: 'LogisticsTech & Freight',
    tagline: 'Live parcel tracking, fleet dispatch, and warehouse stock',
    description: 'Carrier networks, vehicle telemetry records, checkpoint tracking events, and multi-facility warehouse stock.',
    recommendedDb: 'postgresql',
    defaultRoles: ['ROLE_DISPATCHER', 'ROLE_DRIVER', 'ROLE_WAREHOUSE_MGR', 'ROLE_ADMIN'],
    recommendedPayment: 'none',
    recommendedNotification: 'twilio',
    recommendedStorage: 's3',
    complianceBadges: ['SOC2'],
    templateKey: 'LOGISTICS_SUPPLY_CHAIN'
  },
  SAAS: {
    id: 'SAAS',
    name: 'B2B SaaS & Developer Tools',
    tagline: 'Multi-tenant workspaces, subscription seats, and team agile boards',
    description: 'Linear/Jira style workspaces, sprint milestone tracking, tasks, team roles, and subscription tier validation.',
    recommendedDb: 'postgresql',
    defaultRoles: ['ROLE_GUEST', 'ROLE_MEMBER', 'ROLE_TEAM_LEAD', 'ROLE_ORG_ADMIN'],
    recommendedPayment: 'stripe',
    recommendedNotification: 'sendgrid',
    recommendedStorage: 's3',
    complianceBadges: ['SOC2', 'GDPR'],
    templateKey: 'PROJECT_MANAGEMENT_SAAS'
  },
  ECOMMERCE: {
    id: 'ECOMMERCE',
    name: 'E-Commerce & Digital Retail',
    tagline: 'Product catalogs, cart checkout, order fulfillment, and reviews',
    description: 'High-throughput inventory management, order processing state machine, payment records, and customer reviews.',
    recommendedDb: 'postgresql',
    defaultRoles: ['ROLE_CUSTOMER', 'ROLE_MERCHANT', 'ROLE_SUPPORT', 'ROLE_ADMIN'],
    recommendedPayment: 'stripe',
    recommendedNotification: 'sendgrid',
    recommendedStorage: 'cloudinary',
    complianceBadges: ['PCI_DSS', 'GDPR'],
    templateKey: 'ECOMMERCE'
  },
  FOODTECH: {
    id: 'FOODTECH',
    name: 'FoodTech & Restaurant Ordering',
    tagline: 'Restaurant menus, delivery dispatching, and live tracking',
    description: 'Restaurant catalogs, dynamic menu items, live customer orders, courier dispatching, and payment receipts.',
    recommendedDb: 'postgresql',
    defaultRoles: ['ROLE_CUSTOMER', 'ROLE_RESTAURANT_OWNER', 'ROLE_COURIER', 'ROLE_ADMIN'],
    recommendedPayment: 'stripe',
    recommendedNotification: 'twilio',
    recommendedStorage: 'cloudinary',
    complianceBadges: ['PCI_DSS', 'GDPR'],
    templateKey: 'FOOD_DELIVERY'
  },
  EDTECH: {
    id: 'EDTECH',
    name: 'EdTech & Learning Management',
    tagline: 'Student courses, academic grading, faculty, and enrollments',
    description: 'Academic institution ERP with course syllabi, student enrollment workflows, faculty schedules, and grade books.',
    recommendedDb: 'postgresql',
    defaultRoles: ['ROLE_STUDENT', 'ROLE_INSTRUCTOR', 'ROLE_ACADEMIC_ADVISOR', 'ROLE_ADMIN'],
    recommendedPayment: 'stripe',
    recommendedNotification: 'sendgrid',
    recommendedStorage: 's3',
    complianceBadges: ['GDPR'],
    templateKey: 'EDUCATION_ERP'
  },
  HRTECH: {
    id: 'HRTECH',
    name: 'HRTech & Talent Acquisition',
    tagline: 'Employee records, candidate pipelines, and leave approvals',
    description: 'HRIS platform with organization departments, employee profiles, job openings, candidate applicants, and time-off tracking.',
    recommendedDb: 'postgresql',
    defaultRoles: ['ROLE_EMPLOYEE', 'ROLE_RECRUITER', 'ROLE_HR_MANAGER', 'ROLE_ADMIN'],
    recommendedPayment: 'none',
    recommendedNotification: 'sendgrid',
    recommendedStorage: 's3',
    complianceBadges: ['GDPR', 'SOC2'],
    templateKey: 'HRTECH_TALENT'
  },
  TRAVELTECH: {
    id: 'TRAVELTECH',
    name: 'TravelTech & Hospitality',
    tagline: 'Hotel reservations, flight booking, itinerary, and amenities',
    description: 'Reservation engine with room/seat availability calendars, cancellation policies, booking confirmations, and guests.',
    recommendedDb: 'postgresql',
    defaultRoles: ['ROLE_GUEST', 'ROLE_HOTEL_STAFF', 'ROLE_CONCIERGE', 'ROLE_ADMIN'],
    recommendedPayment: 'stripe',
    recommendedNotification: 'twilio',
    recommendedStorage: 's3',
    complianceBadges: ['PCI_DSS', 'GDPR'],
    templateKey: 'BOOKING'
  }
};

export const BUSINESS_MODELS: Record<StartupBusinessModel, BusinessModelMetadata> = {
  B2B_SAAS: {
    id: 'B2B_SAAS',
    name: 'B2B SaaS / Multi-Tenant',
    description: 'Subscription software for organizations with workspace boundaries, team permissions, and seat-based licenses.',
    keyConcerns: ['Tenant Data Isolation', 'Role-Based Access Control', 'Seat Management', 'Webhook Integrations'],
    architectureFocus: 'Workspace entity scoping, strict JWT claims validation, and OpenAPI documentation for client integrations.'
  },
  B2C_MARKETPLACE: {
    id: 'B2C_MARKETPLACE',
    name: 'B2C Two-Sided Marketplace',
    description: 'Platform connecting individual buyers and third-party sellers with listings, reviews, ratings, and escrow payouts.',
    keyConcerns: ['Seller Onboarding', 'Listing Moderation', 'Escrow Payments', 'Fraud Prevention'],
    architectureFocus: 'Dual-role user models, transaction records with status transitions, and public search endpoints.'
  },
  ON_DEMAND: {
    id: 'ON_DEMAND',
    name: 'On-Demand Service / Delivery',
    description: 'Real-time booking and dispatch matching customers with mobile service providers or delivery couriers.',
    keyConcerns: ['Low-Latency State Updates', 'Geolocation Tracking', 'Instant Dispatch', 'SMS Alerts'],
    architectureFocus: 'Event tracking tables, lightweight transactional updates, and Twilio notification triggers.'
  },
  INTERNAL_TOOL: {
    id: 'INTERNAL_TOOL',
    name: 'Internal Enterprise Tool / Portal',
    description: 'High-efficiency operational dashboard and back-office system for company employees and operators.',
    keyConcerns: ['Audit Trails', 'SSO / Corporate Identity', 'Bulk Operations', 'Data Export'],
    architectureFocus: 'Comprehensive audit log entities, strict administrative security, and database indexing.'
  }
};

/**
 * Builds a complete ProjectConfig customized for a startup's industry,
 * business model, and required integrations.
 */
export function buildStartupProjectConfig(
  startup: StartupConfig,
  overrides?: Partial<ProjectConfig>
): ProjectConfig {
  const preset = INDUSTRY_PRESETS[startup.industry] || INDUSTRY_PRESETS.SAAS;
  const refProfile = getStartupReferenceProfile(startup.industry);
  const template = getDomainTemplate(preset.templateKey);
  const model = BUSINESS_MODELS[startup.businessModel] || BUSINESS_MODELS.B2B_SAAS;

  const sanitizedBaseName = `${startup.industry.toLowerCase()}-${startup.businessModel.toLowerCase().replace(/_/g, '-')}-backend`;
  const projectName = overrides?.projectName || sanitizedBaseName;
  const artifactId = overrides?.artifactId || projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const packageSuffix = artifactId.replace(/[-_]/g, '');

  const defaultEntities = refProfile
    ? JSON.parse(JSON.stringify(refProfile.entities))
    : JSON.parse(JSON.stringify(template.defaultEntities));

  return {
    projectName,
    groupId: overrides?.groupId || 'com.startup',
    artifactId,
    packageName: overrides?.packageName || `com.startup.${packageSuffix}`,
    description: overrides?.description || `${preset.name} (${model.name}) - ${preset.tagline}`,
    javaVersion: overrides?.javaVersion || '17',
    springBootVersion: overrides?.springBootVersion || '3.3.0',
    database: overrides?.database || preset.recommendedDb,
    entities: overrides?.entities || defaultEntities,
    security: {
      enabled: true,
      jwtSecretEnvVar: 'JWT_SECRET',
      tokenExpirationMinutes: 1440,
      enableRegistration: true,
      corsAllowedOrigins: ['http://localhost:3000', 'http://localhost:5173', 'https://*.vercel.app']
    },
    options: {
      enableDtos: true,
      enableValidation: true,
      enableGlobalExceptionHandler: true,
      enableSwagger: true,
      enablePostman: true,
      enablePagination: true,
      serverPort: 8080,
      ...overrides?.options
    },
    startup: {
      industry: startup.industry,
      businessModel: startup.businessModel,
      targetAudience: startup.targetAudience || 'Modern Web & Mobile Users',
      integrations: {
        paymentGateway: startup.integrations?.paymentGateway || preset.recommendedPayment,
        notificationService: startup.integrations?.notificationService || preset.recommendedNotification,
        storageService: startup.integrations?.storageService || preset.recommendedStorage,
        complianceNotes: startup.integrations?.complianceNotes || preset.complianceBadges,
        userRoles: startup.integrations?.userRoles || preset.defaultRoles
      }
    }
  };
}
