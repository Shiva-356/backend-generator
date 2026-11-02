import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {
  generateSpringBootProject,
  exportProjectToZip,
  validateProjectConfig,
  ConfigValidationError,
  ProjectConfig
} from './index';

const baseConfig: ProjectConfig = {
  projectName: 'secure-service',
  groupId: 'com.example.secure',
  artifactId: 'secure-service',
  packageName: 'com.example.secure',
  javaVersion: '17',
  springBootVersion: '3.3.0',
  database: 'postgresql',
  entities: [
    {
      name: 'Product',
      fields: [
        { name: 'title', type: 'String', required: true },
        { name: 'price', type: 'BigDecimal', precision: 10, scale: 2 }
      ]
    }
  ]
};

describe('Spring Security 6 & JWT Generator Tests', () => {

  // Test 1: Security Disabled
  it('1. When security is disabled, zero security files or dependencies are generated', () => {
    const config: ProjectConfig = {
      ...baseConfig,
      security: { enabled: false }
    };

    const project = generateSpringBootProject(config);

    assert.equal(project.summary.securityEnabled, false);

    // Verify no security classes exist
    const securityFiles = project.files.filter(f => f.path.includes('/security/'));
    assert.equal(securityFiles.length, 0);

    // Verify pom.xml has no security dependencies
    const pomFile = project.files.find(f => f.path === 'pom.xml')!;
    assert.ok(!pomFile.content.includes('spring-boot-starter-security'));
    assert.ok(!pomFile.content.includes('jjwt'));
    assert.ok(!pomFile.content.includes('spring-security-test'));

    // Verify application.properties has no JWT properties
    const appProps = project.files.find(f => f.path.endsWith('application.properties'))!;
    assert.ok(!appProps.content.includes('security.jwt.secret'));

    // Verify schema.sql has no app_users table
    const schemaSql = project.files.find(f => f.path.endsWith('schema.sql'))!;
    assert.ok(!schemaSql.content.includes('app_users'));

    // Business entities continue to exist normally
    assert.ok(project.files.some(f => f.path.endsWith('ProductController.java')));
    assert.ok(project.files.some(f => f.path.endsWith('ProductService.java')));
  });

  // Test 2: Security Enabled - Complete File Set
  it('2. When security is enabled, all required components and tests are generated', () => {
    const config: ProjectConfig = {
      ...baseConfig,
      security: {
        enabled: true,
        jwtSecretEnvVar: 'APP_JWT_SECRET',
        tokenExpirationMinutes: 120
      }
    };

    const project = generateSpringBootProject(config);
    assert.equal(project.summary.securityEnabled, true);

    const expectedPaths = [
      'src/main/java/com/example/secure/security/entity/AppUser.java',
      'src/main/java/com/example/secure/security/repository/AppUserRepository.java',
      'src/main/java/com/example/secure/security/dto/AuthRequest.java',
      'src/main/java/com/example/secure/security/dto/RegisterRequest.java',
      'src/main/java/com/example/secure/security/dto/AuthResponse.java',
      'src/main/java/com/example/secure/security/service/JwtService.java',
      'src/main/java/com/example/secure/security/service/UserDetailsServiceImpl.java',
      'src/main/java/com/example/secure/security/service/AuthService.java',
      'src/main/java/com/example/secure/security/controller/AuthController.java',
      'src/main/java/com/example/secure/security/filter/JwtAuthenticationFilter.java',
      'src/main/java/com/example/secure/security/config/JwtAuthenticationEntryPoint.java',
      'src/main/java/com/example/secure/security/config/JwtAccessDeniedHandler.java',
      'src/main/java/com/example/secure/security/config/SecurityConfig.java',
      'src/test/java/com/example/secure/security/JwtServiceTest.java',
      'src/test/java/com/example/secure/security/AuthControllerTest.java'
    ];

    for (const p of expectedPaths) {
      assert.ok(
        project.files.some(f => f.path === p),
        `Missing expected security file: ${p}`
      );
    }
  });

  // Test 3: Dependency Selection in pom.xml
  it('3. Security dependencies in pom.xml are accurate, compatible, and managed', () => {
    const config: ProjectConfig = {
      ...baseConfig,
      security: { enabled: true }
    };

    const project = generateSpringBootProject(config);
    const pomFile = project.files.find(f => f.path === 'pom.xml')!;

    // Spring Security 6 starter without explicit version (parent BOM managed)
    assert.match(pomFile.content, /<artifactId>spring-boot-starter-security<\/artifactId>/);
    assert.doesNotMatch(pomFile.content, /<artifactId>spring-boot-starter-security<\/artifactId>\s*<version>/);

    // JJWT 0.12.5 dependencies with explicit version and proper runtime scopes
    assert.match(pomFile.content, /<groupId>io\.jsonwebtoken<\/groupId>\s*<artifactId>jjwt-api<\/artifactId>\s*<version>0\.12\.5<\/version>/);
    assert.match(pomFile.content, /<groupId>io\.jsonwebtoken<\/groupId>\s*<artifactId>jjwt-impl<\/artifactId>\s*<version>0\.12\.5<\/version>\s*<scope>runtime<\/scope>/);
    assert.match(pomFile.content, /<groupId>io\.jsonwebtoken<\/groupId>\s*<artifactId>jjwt-jackson<\/artifactId>\s*<version>0\.12\.5<\/version>\s*<scope>runtime<\/scope>/);

    // spring-security-test in test scope
    assert.match(pomFile.content, /<artifactId>spring-security-test<\/artifactId>\s*<scope>test<\/scope>/);
  });

  // Test 4: Package and Import Consistency
  it('4. All security classes declare matching package names and correct cross-references', () => {
    const config: ProjectConfig = {
      ...baseConfig,
      packageName: 'org.acme.portal',
      security: { enabled: true }
    };

    const project = generateSpringBootProject(config);
    const securityFiles = project.files.filter(f => f.path.includes('/security/'));

    for (const file of securityFiles) {
      // Must start with declared package
      assert.match(file.content, new RegExp(`^package org\\.acme\\.portal\\.security`));
    }

    // Verify specific cross-references
    const secConfig = project.files.find(f => f.path.endsWith('SecurityConfig.java'))!;
    assert.match(secConfig.content, /import org\.acme\.portal\.security\.filter\.JwtAuthenticationFilter;/);

    const authService = project.files.find(f => f.path.endsWith('AuthService.java'))!;
    assert.match(authService.content, /import org\.acme\.portal\.security\.repository\.AppUserRepository;/);
    assert.match(authService.content, /import org\.acme\.portal\.security\.entity\.AppUser;/);
    assert.match(authService.content, /private final JwtService jwtService;/);
  });

  // Test 5: AppUser Entity and Password Security
  it('5. AppUser persists password_hash with BCrypt, never exposes passwords in DTOs', () => {
    const config: ProjectConfig = {
      ...baseConfig,
      security: { enabled: true }
    };

    const project = generateSpringBootProject(config);
    const appUserFile = project.files.find(f => f.path.endsWith('AppUser.java'))!;
    const authResponseFile = project.files.find(f => f.path.endsWith('AuthResponse.java'))!;
    const authServiceFile = project.files.find(f => f.path.endsWith('AuthService.java'))!;
    const secConfigFile = project.files.find(f => f.path.endsWith('SecurityConfig.java'))!;

    // AppUser entity details
    assert.match(appUserFile.content, /@Table\(name = "app_users"\)/);
    assert.match(appUserFile.content, /@Column\(name = "password_hash", nullable = false/);
    assert.match(appUserFile.content, /public class AppUser implements UserDetails/);

    // BCrypt bean configured
    assert.match(secConfigFile.content, /public PasswordEncoder passwordEncoder\(\)\s*\{\s*return new BCryptPasswordEncoder\(\);\s*\}/);

    // AuthService hashes password
    assert.match(authServiceFile.content, /passwordEncoder\.encode\(request\.getPassword\(\)\)/);

    // AuthResponse does NOT contain password or password_hash fields
    assert.doesNotMatch(authResponseFile.content, /password/i);
    assert.match(authResponseFile.content, /private String token;/);
  });

  // Test 6: JJWT 0.12.x Modern Cryptography & Key Size Validation
  it('6. JwtService implements modern JJWT API and enforces >= 256-bit secret keys', () => {
    const config: ProjectConfig = {
      ...baseConfig,
      security: {
        enabled: true,
        jwtSecretEnvVar: 'MY_CUSTOM_JWT_SECRET',
        tokenExpirationMinutes: 30
      }
    };

    const project = generateSpringBootProject(config);
    const jwtServiceFile = project.files.find(f => f.path.endsWith('JwtService.java'))!;

    // Modern JJWT 0.12.x syntax
    assert.match(jwtServiceFile.content, /Jwts\.builder\(\)/);
    assert.match(jwtServiceFile.content, /Jwts\.SIG\.HS256/);
    assert.match(jwtServiceFile.content, /Jwts\.parser\(\)\s*\.verifyWith\(getSigningKey\(\)\)/);

    // Key size validation and startup fail-fast
    assert.match(jwtServiceFile.content, /import jakarta\.annotation\.PostConstruct;/);
    assert.match(jwtServiceFile.content, /@PostConstruct\s*public void validateKeyOnStartup\(\)/);
    assert.match(jwtServiceFile.content, /keyBytes\.length < 32/);
    assert.match(jwtServiceFile.content, /MY_CUSTOM_JWT_SECRET/);
    assert.match(jwtServiceFile.content, /30/);
  });

  // Test 7: Spring Security 6 Authorization, Statelessness, and CSRF
  it('7. SecurityConfig configures stateless session, CSRF rationale, and protects business routes', () => {
    const config: ProjectConfig = {
      ...baseConfig,
      security: { enabled: true }
    };

    const project = generateSpringBootProject(config);
    const secConfigFile = project.files.find(f => f.path.endsWith('SecurityConfig.java'))!;

    // Stateless session
    assert.match(secConfigFile.content, /SessionCreationPolicy\.STATELESS/);

    // CSRF disabled deliberately for stateless API
    assert.match(secConfigFile.content, /\.csrf\(AbstractHttpConfigurer::disable\)/);
    assert.match(secConfigFile.content, /CSRF is disabled because authentication uses Bearer tokens/);

    // Public auth vs protected business endpoints
    assert.match(secConfigFile.content, /\.requestMatchers\("\/api\/auth\/\*\*"\)\.permitAll\(\)/);
    assert.match(secConfigFile.content, /\.requestMatchers\("\/api\/\*\*"\)\.authenticated\(\)/);

    // Custom entry point and access denied handler
    assert.match(secConfigFile.content, /\.authenticationEntryPoint\(this\.authenticationEntryPoint\)/);
    assert.match(secConfigFile.content, /\.accessDeniedHandler\(this\.accessDeniedHandler\)/);
  });

  // Test 8: H2 Console Permission
  it('8. When database is H2, SecurityConfig permits /h2-console/** and allows same-origin frames', () => {
    const configH2: ProjectConfig = {
      ...baseConfig,
      database: 'h2',
      security: { enabled: true }
    };

    const project = generateSpringBootProject(configH2);
    const secConfigFile = project.files.find(f => f.path.endsWith('SecurityConfig.java'))!;

    assert.match(secConfigFile.content, /requestMatchers\("\/h2-console\/\*\*"\)\.permitAll\(\)/);
    assert.match(secConfigFile.content, /frameOptions -> frameOptions\.sameOrigin\(\)/);
  });

  // Test 9: Database DDL Schema for PostgreSQL, MySQL, and H2
  it('9. Database schema.sql generates dialect-specific app_users table with unique constraints', () => {
    for (const db of ['postgresql', 'mysql', 'h2'] as const) {
      const config: ProjectConfig = {
        ...baseConfig,
        database: db,
        security: { enabled: true }
      };

      const project = generateSpringBootProject(config);
      const schemaFile = project.files.find(f => f.path.endsWith('schema.sql'))!;

      assert.match(schemaFile.content, /CREATE TABLE IF NOT EXISTS app_users/);
      assert.match(schemaFile.content, /username VARCHAR\(50\) NOT NULL UNIQUE/);
      assert.match(schemaFile.content, /email VARCHAR\(100\) NOT NULL UNIQUE/);
      assert.match(schemaFile.content, /password_hash VARCHAR\(255\) NOT NULL/);

      if (db === 'postgresql') {
        assert.match(schemaFile.content, /id BIGSERIAL PRIMARY KEY/);
      } else if (db === 'mysql') {
        assert.match(schemaFile.content, /id BIGINT AUTO_INCREMENT PRIMARY KEY/);
        assert.match(schemaFile.content, /ENGINE=InnoDB DEFAULT CHARSET=utf8mb4/);
      } else {
        assert.match(schemaFile.content, /id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY/);
      }
    }
  });

  // Test 10: Environment Variables & Secrets Safety
  it('10. application.properties uses safe placeholders, never hardcoding secrets', () => {
    const config: ProjectConfig = {
      ...baseConfig,
      security: {
        enabled: true,
        jwtSecretEnvVar: 'PRODUCTION_SECRET_KEY',
        tokenExpirationMinutes: 45
      }
    };

    const project = generateSpringBootProject(config);
    const appProps = project.files.find(f => f.path.endsWith('application.properties'))!;

    assert.match(appProps.content, /security\.jwt\.secret=\${PRODUCTION_SECRET_KEY:}/);
    assert.match(appProps.content, /security\.jwt\.expiration-minutes=\${JWT_EXPIRATION_MINUTES:45}/);

    // Confirm no literal secrets exist in files
    for (const file of project.files) {
      assert.doesNotMatch(file.content, /password=supersecret/i);
      assert.doesNotMatch(file.content, /jwt\.secret=my-secret/i);
    }
  });

  // Test 11: Validation Errors & Entity Name Collision Protection
  it('11. Security configuration validates environment variable naming and detects entity name collisions', () => {
    // Invalid env var format
    assert.throws(
      () => validateProjectConfig({
        ...baseConfig,
        security: {
          enabled: true,
          jwtSecretEnvVar: 'invalid-env-var-lowercase!'
        }
      }),
      (err: Error) => {
        assert.ok(err instanceof ConfigValidationError);
        assert.ok(err.message.includes('Must follow standard ENV_VAR uppercase naming conventions'));
        return true;
      }
    );

    // Invalid expiration minutes
    assert.throws(
      () => validateProjectConfig({
        ...baseConfig,
        security: {
          enabled: true,
          tokenExpirationMinutes: 0
        }
      }),
      (err: Error) => {
        assert.ok(err instanceof ConfigValidationError);
        assert.ok(err.message.includes('tokenExpirationMinutes (0) is invalid'));
        return true;
      }
    );

    // Collision with AppUser entity
    assert.throws(
      () => validateProjectConfig({
        ...baseConfig,
        entities: [
          ...baseConfig.entities,
          { name: 'AppUser', fields: [{ name: 'dummy', type: 'String' }] }
        ],
        security: { enabled: true }
      }),
      (err: Error) => {
        assert.ok(err instanceof ConfigValidationError);
        assert.ok(err.message.includes('conflicts with the built-in Spring Security authentication entity'));
        return true;
      }
    );
  });

  // Test 12: ZIP Packaging Inclusion and Integrity
  it('12. In-memory ZIP packaging cleanly includes all security files when enabled, excludes when disabled', async () => {
    // 12a. Enabled in ZIP
    const secConfig: ProjectConfig = {
      ...baseConfig,
      security: { enabled: true }
    };

    const zipBytesEnabled = await exportProjectToZip(secConfig);
    const zipEnabled = await JSZip.loadAsync(zipBytesEnabled);
    const filenamesEnabled = Object.keys(zipEnabled.files);

    assert.ok(filenamesEnabled.some(f => f.endsWith('AppUser.java')));
    assert.ok(filenamesEnabled.some(f => f.endsWith('SecurityConfig.java')));
    assert.ok(filenamesEnabled.some(f => f.endsWith('JwtServiceTest.java')));

    // 12b. Disabled in ZIP
    const disabledConfig: ProjectConfig = {
      ...baseConfig,
      security: { enabled: false }
    };

    const zipBytesDisabled = await exportProjectToZip(disabledConfig);
    const zipDisabled = await JSZip.loadAsync(zipBytesDisabled);
    const filenamesDisabled = Object.keys(zipDisabled.files);

    assert.ok(!filenamesDisabled.some(f => f.includes('/security/')));
  });

  // Test 13: Generated Java Tests Verification
  it('13. Generated Java test files contain complete assertions for hashing, login, and token claims', () => {
    const config: ProjectConfig = {
      ...baseConfig,
      security: { enabled: true }
    };

    const project = generateSpringBootProject(config);
    const jwtTest = project.files.find(f => f.path.endsWith('JwtServiceTest.java'))!;
    const authControllerTest = project.files.find(f => f.path.endsWith('AuthControllerTest.java'))!;

    // JwtServiceTest checks
    assert.match(jwtTest.content, /testGenerateAndExtractUsername/);
    assert.match(jwtTest.content, /testTokenValidationUsernameMismatch/);
    assert.match(jwtTest.content, /testWeakOrEmptySecretThrowsException/);
    assert.match(jwtTest.content, /testExpiredTokenValidation/);

    // AuthControllerTest checks
    assert.match(authControllerTest.content, /testRegisterSuccess/);
    assert.match(authControllerTest.content, /testRegisterValidationFailure/);
    assert.match(authControllerTest.content, /testLoginSuccess/);
    assert.match(authControllerTest.content, /testLoginInvalidCredentials/);
  });
});
