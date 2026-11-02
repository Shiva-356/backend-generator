/**
 * Strongly-typed configuration models and interface definitions
 * for the Spring Boot Backend Generator.
 */

export type JavaVersion = '17' | '21';

export type SpringBootVersion = '3.2.5' | '3.3.0' | '3.4.0';

export type DatabaseType = 'postgresql' | 'mysql' | 'h2';

export type IdType = 'Long' | 'Integer' | 'UUID' | 'String';

export type IdGenerationStrategy = 'IDENTITY' | 'AUTO' | 'SEQUENCE' | 'UUID' | 'NONE';

export type FieldDataType =
  | 'String'
  | 'Integer'
  | 'Long'
  | 'Double'
  | 'BigDecimal'
  | 'Boolean'
  | 'LocalDate'
  | 'LocalDateTime';

export interface FieldConfig {
  name: string;
  type: FieldDataType;
  required?: boolean;
  unique?: boolean;
  columnName?: string;
  length?: number;
  precision?: number;
  scale?: number;
  min?: number;
  max?: number;
  pattern?: string;
  defaultValue?: string;
  description?: string;
}

export type RelationshipType = 'MANY_TO_ONE' | 'ONE_TO_MANY' | 'ONE_TO_ONE' | 'MANY_TO_MANY';

export type CascadeType = 'ALL' | 'PERSIST' | 'MERGE' | 'REMOVE' | 'REFRESH' | 'DETACH';

export type FetchType = 'LAZY' | 'EAGER';

export interface RelationshipConfig {
  name: string;
  type: RelationshipType;
  targetEntity: string;
  isOwningSide?: boolean;
  joinColumnName?: string;
  joinTableName?: string;
  joinTableInverseColumnName?: string;
  mappedBy?: string;
  required?: boolean;
  fetch?: FetchType;
  cascade?: CascadeType[];
  orphanRemoval?: boolean;
  description?: string;
}

export interface EntityConfig {
  name: string;
  tableName?: string;
  idType?: IdType;
  idGeneration?: IdGenerationStrategy;
  idFieldName?: string;
  fields: FieldConfig[];
  relationships?: RelationshipConfig[];
  description?: string;
}

export interface SecurityConfig {
  enabled: boolean;
  jwtSecretEnvVar?: string;
  tokenExpirationMinutes?: number;
  enableRegistration?: boolean;
  corsAllowedOrigins?: string[];
}

export type StartupIndustry =
  | 'FINTECH'
  | 'EDTECH'
  | 'HEALTHTECH'
  | 'ECOMMERCE'
  | 'SAAS'
  | 'FOODTECH'
  | 'LOGISTICSTECH'
  | 'TRAVELTECH'
  | 'PROPTECH'
  | 'HRTECH';

export type StartupBusinessModel =
  | 'B2B_SAAS'
  | 'B2C_MARKETPLACE'
  | 'ON_DEMAND'
  | 'INTERNAL_TOOL';

export interface StartupIntegrationConfig {
  paymentGateway?: 'stripe' | 'paypal' | 'razorpay' | 'none';
  notificationService?: 'twilio' | 'sendgrid' | 'firebase' | 'none';
  storageService?: 's3' | 'cloudinary' | 'local';
  complianceNotes?: Array<'GDPR' | 'HIPAA' | 'PCI_DSS' | 'SOC2'>;
  userRoles?: string[];
}

export interface StartupConfig {
  industry: StartupIndustry;
  businessModel: StartupBusinessModel;
  targetAudience?: string;
  integrations?: StartupIntegrationConfig;
}

export interface GeneratorOptions {
  enableDtos?: boolean;
  enableValidation?: boolean;
  enableGlobalExceptionHandler?: boolean;
  enableSwagger?: boolean;
  enablePostman?: boolean;
  enablePagination?: boolean;
  serverPort?: number;
  security?: SecurityConfig;
}

export interface ProjectConfig {
  projectName: string;
  groupId: string;
  artifactId: string;
  packageName: string;
  description?: string;
  javaVersion: JavaVersion;
  springBootVersion: SpringBootVersion;
  database: DatabaseType;
  entities: EntityConfig[];
  security?: SecurityConfig;
  options?: GeneratorOptions;
  startup?: StartupConfig;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface ProjectSummary {
  projectName: string;
  packageName: string;
  database: DatabaseType;
  javaVersion: JavaVersion;
  springBootVersion: SpringBootVersion;
  entityCount: number;
  fileCount: number;
  entities: string[];
  securityEnabled?: boolean;
}

export interface GeneratedProject {
  files: GeneratedFile[];
  summary: ProjectSummary;
}

export interface DomainTemplate {
  key: string;
  name: string;
  description: string;
  modules: string[];
  sampleApis: string[];
  databaseTables: string[];
  securityRules: string[];
  defaultEntities: EntityConfig[];
}

export interface QualityCheckItem {
  id: string;
  name: string;
  category: 'MAVEN' | 'PACKAGING' | 'ENTITIES' | 'SECURITY' | 'APIS' | 'HYGIENE';
  passed: boolean;
  message: string;
}

export interface QualityReport {
  isValid: boolean;
  score: number;
  checks: QualityCheckItem[];
  warnings: string[];
  totalFiles: number;
}

