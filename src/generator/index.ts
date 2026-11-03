/**
 * Unified generation engine for Java Spring Boot 3.x backend projects.
 * Orchestrates configuration validation, file synthesis, and in-memory ZIP packaging.
 */

import JSZip from 'jszip';
import { ProjectConfig, GeneratedProject, GeneratedFile, ProjectSummary } from './types';
import { validateProjectConfig } from './validation';
import { generatePomXml } from './pomGenerator';
import {
  generateMainApplicationClass,
  generateApplicationProperties,
  getApplicationClassName
} from './applicationGenerator';
import { generateEntityClass } from './entityGenerator';
import { generateRepositoryInterface } from './repositoryGenerator';
import {
  generateRequestDtoClass,
  generateResponseDtoClass,
  generateMapperClass
} from './dtoGenerator';
import { generateServiceClass } from './serviceGenerator';
import { generateControllerClass } from './controllerGenerator';
import {
  generateResourceNotFoundException,
  generateDuplicateResourceException,
  generateBusinessRuleException,
  generateInsufficientStockException,
  generateInsufficientFundsException,
  generateUnauthorizedAccessException,
  generateTenantIsolationException,
  generateErrorResponseClass,
  generateGlobalExceptionHandler
} from './exceptionGenerator';
import {
  generatePaymentGatewayInterface,
  generatePaymentRequestDto,
  generatePaymentResponseDto,
  generateStripePaymentService,
  generateNotificationServiceInterface,
  generateSendGridNotificationService,
  generateTwilioNotificationService,
  generateStorageServiceInterface,
  generateS3StorageService,
  generateEnvExample
} from './integrationGenerator';
import { generateStartupWorkflowFiles } from './startup/workflowGenerator';
import { validateGeneratedProjectQuality, QualityReport, QualityCheckItem } from './qualityCheck';
import { generateSqlSchema } from './sqlGenerator';
import { generateReadme, generateGitignore } from './readmeGenerator';
import { generatePostmanCollection } from './postmanGenerator';
import { isSecurityEnabled } from './validation';
import {
  generateAppUserEntity,
  generateAppUserRepository,
  generateAuthRequestDto,
  generateRegisterRequestDto,
  generateAuthResponseDto,
  generateJwtService,
  generateUserDetailsServiceImpl,
  generateAuthService,
  generateAuthController,
  generateJwtAuthenticationFilter,
  generateJwtAuthenticationEntryPoint,
  generateJwtAccessDeniedHandler,
  generateSecurityConfig,
  generateJwtServiceTest,
  generateAuthControllerTest
} from './security/securityGenerator';

import { packageProjectToZip, ZipExportOptions } from './zipPackaging';

export * from './types';
export * from './validation';
export * from './templates/domainTemplates';
export * from './startup/startupPresets';
export * from './startup/startupReferenceProfiles';
export * from './startup/workflowGenerator';
export * from './integrationGenerator';
export * from './qualityCheck';
export * from './postmanGenerator';
export * from './zipPackaging';
export * from './download';
export * from './security/securityGenerator';

export function generateSpringBootProject(config: ProjectConfig): GeneratedProject {
  // 1. Strict validation
  validateProjectConfig(config);

  const files: GeneratedFile[] = [];
  const { packageName, entities, options } = config;
  const enableDtos = options?.enableDtos ?? true;
  const enableExceptions = options?.enableGlobalExceptionHandler ?? true;
  const enablePostman = options?.enablePostman ?? true;

  const packagePath = `src/main/java/${packageName.replace(/\./g, '/')}`;

  // 2. Root Build & Config Files
  files.push({
    path: 'pom.xml',
    content: generatePomXml(config)
  });

  files.push({
    path: '.gitignore',
    content: generateGitignore()
  });

  files.push({
    path: '.env.example',
    content: generateEnvExample(config)
  });

  files.push({
    path: 'README.md',
    content: generateReadme(config)
  });

  if (enablePostman) {
    files.push({
      path: 'postman_collection.json',
      content: generatePostmanCollection(config)
    });
  }

  // 3. Resources
  files.push({
    path: 'src/main/resources/application.properties',
    content: generateApplicationProperties(config)
  });

  files.push({
    path: 'src/main/resources/schema.sql',
    content: generateSqlSchema(config)
  });

  // 4. Main Spring Boot Application Entry Point
  const mainClassName = getApplicationClassName(config.projectName);
  files.push({
    path: `${packagePath}/${mainClassName}.java`,
    content: generateMainApplicationClass(config)
  });

  // 5. Global Exception Handling & Domain Exceptions
  if (enableExceptions) {
    files.push({
      path: `${packagePath}/exception/ResourceNotFoundException.java`,
      content: generateResourceNotFoundException(config)
    });
    files.push({
      path: `${packagePath}/exception/DuplicateResourceException.java`,
      content: generateDuplicateResourceException(config)
    });
    files.push({
      path: `${packagePath}/exception/BusinessRuleException.java`,
      content: generateBusinessRuleException(config)
    });
    files.push({
      path: `${packagePath}/exception/InsufficientStockException.java`,
      content: generateInsufficientStockException(config)
    });
    files.push({
      path: `${packagePath}/exception/InsufficientFundsException.java`,
      content: generateInsufficientFundsException(config)
    });
    files.push({
      path: `${packagePath}/exception/UnauthorizedAccessException.java`,
      content: generateUnauthorizedAccessException(config)
    });
    files.push({
      path: `${packagePath}/exception/TenantIsolationException.java`,
      content: generateTenantIsolationException(config)
    });
    files.push({
      path: `${packagePath}/exception/ErrorResponse.java`,
      content: generateErrorResponseClass(config)
    });
    files.push({
      path: `${packagePath}/exception/GlobalExceptionHandler.java`,
      content: generateGlobalExceptionHandler(config)
    });
  }

  // 6. Third-Party Integration Provider Abstractions
  files.push({
    path: `${packagePath}/integration/payment/PaymentGateway.java`,
    content: generatePaymentGatewayInterface(config)
  });
  files.push({
    path: `${packagePath}/integration/payment/PaymentRequest.java`,
    content: generatePaymentRequestDto(config)
  });
  files.push({
    path: `${packagePath}/integration/payment/PaymentResponse.java`,
    content: generatePaymentResponseDto(config)
  });
  files.push({
    path: `${packagePath}/integration/payment/StripePaymentService.java`,
    content: generateStripePaymentService(config)
  });

  files.push({
    path: `${packagePath}/integration/notification/NotificationService.java`,
    content: generateNotificationServiceInterface(config)
  });
  files.push({
    path: `${packagePath}/integration/notification/SendGridNotificationService.java`,
    content: generateSendGridNotificationService(config)
  });
  files.push({
    path: `${packagePath}/integration/notification/TwilioNotificationService.java`,
    content: generateTwilioNotificationService(config)
  });

  files.push({
    path: `${packagePath}/integration/storage/StorageService.java`,
    content: generateStorageServiceInterface(config)
  });
  files.push({
    path: `${packagePath}/integration/storage/S3StorageService.java`,
    content: generateS3StorageService(config)
  });

  // 7. Startup Domain Workflow Services & Controllers
  const workflowFiles = generateStartupWorkflowFiles(config);
  files.push(...workflowFiles);

  // 6. Entity & Layered Architecture Classes
  for (const entity of entities) {
    // Entity
    files.push({
      path: `${packagePath}/entity/${entity.name}.java`,
      content: generateEntityClass(entity, config)
    });

    // Repository
    files.push({
      path: `${packagePath}/repository/${entity.name}Repository.java`,
      content: generateRepositoryInterface(entity, config)
    });

    // DTOs & Mapper
    if (enableDtos) {
      files.push({
        path: `${packagePath}/dto/${entity.name}RequestDTO.java`,
        content: generateRequestDtoClass(entity, config)
      });
      files.push({
        path: `${packagePath}/dto/${entity.name}ResponseDTO.java`,
        content: generateResponseDtoClass(entity, config)
      });
      files.push({
        path: `${packagePath}/mapper/${entity.name}Mapper.java`,
        content: generateMapperClass(entity, config)
      });
    }

    // Service
    files.push({
      path: `${packagePath}/service/${entity.name}Service.java`,
      content: generateServiceClass(entity, config)
    });

    // Controller
    files.push({
      path: `${packagePath}/controller/${entity.name}Controller.java`,
      content: generateControllerClass(entity, config)
    });
  }

  // 7. Spring Security 6 & JWT Components
  const securityEnabled = isSecurityEnabled(config);
  if (securityEnabled) {
    const testPackagePath = `src/test/java/${packageName.replace(/\./g, '/')}`;

    // Security Entity & Repository
    files.push({
      path: `${packagePath}/security/entity/AppUser.java`,
      content: generateAppUserEntity(config)
    });
    files.push({
      path: `${packagePath}/security/repository/AppUserRepository.java`,
      content: generateAppUserRepository(config)
    });

    // Authentication DTOs
    files.push({
      path: `${packagePath}/security/dto/AuthRequest.java`,
      content: generateAuthRequestDto(config)
    });
    files.push({
      path: `${packagePath}/security/dto/RegisterRequest.java`,
      content: generateRegisterRequestDto(config)
    });
    files.push({
      path: `${packagePath}/security/dto/AuthResponse.java`,
      content: generateAuthResponseDto(config)
    });

    // JWT & UserDetailsService & AuthService
    files.push({
      path: `${packagePath}/security/service/JwtService.java`,
      content: generateJwtService(config)
    });
    files.push({
      path: `${packagePath}/security/service/UserDetailsServiceImpl.java`,
      content: generateUserDetailsServiceImpl(config)
    });
    files.push({
      path: `${packagePath}/security/service/AuthService.java`,
      content: generateAuthService(config)
    });

    // Auth Controller
    files.push({
      path: `${packagePath}/security/controller/AuthController.java`,
      content: generateAuthController(config)
    });

    // Filter & Security Configuration
    files.push({
      path: `${packagePath}/security/filter/JwtAuthenticationFilter.java`,
      content: generateJwtAuthenticationFilter(config)
    });
    files.push({
      path: `${packagePath}/security/config/JwtAuthenticationEntryPoint.java`,
      content: generateJwtAuthenticationEntryPoint(config)
    });
    files.push({
      path: `${packagePath}/security/config/JwtAccessDeniedHandler.java`,
      content: generateJwtAccessDeniedHandler(config)
    });
    files.push({
      path: `${packagePath}/security/config/SecurityConfig.java`,
      content: generateSecurityConfig(config)
    });

    // Security Java Unit and MockMvc Tests
    files.push({
      path: `${testPackagePath}/security/JwtServiceTest.java`,
      content: generateJwtServiceTest(config)
    });
    files.push({
      path: `${testPackagePath}/security/AuthControllerTest.java`,
      content: generateAuthControllerTest(config)
    });
    files.push({
      path: 'src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker',
      content: 'mock-maker-subclass\n'
    });
  }

  // Sort files deterministically by relative path
  files.sort((a, b) => a.path.localeCompare(b.path));

  const summary: ProjectSummary = {
    projectName: config.projectName,
    packageName: config.packageName,
    database: config.database,
    javaVersion: config.javaVersion,
    springBootVersion: config.springBootVersion,
    entityCount: entities.length,
    fileCount: files.length,
    entities: entities.map(e => e.name),
    securityEnabled
  };

  return { files, summary };
}

/**
 * Packages generated files into an in-memory ZIP archive using JSZip.
 * Browser & Node compatible.
 */
export async function exportProjectToZip(
  target: GeneratedProject | ProjectConfig,
  options?: ZipExportOptions
): Promise<Uint8Array> {
  return packageProjectToZip(target, options);
}

