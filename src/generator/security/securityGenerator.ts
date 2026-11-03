/**
 * Spring Security 6 & JJWT 0.12.x code generator for Spring Boot 3.x applications.
 * Generates stateless JWT authentication, password hashing with BCrypt, user persistence,
 * secure filters, explicit endpoint protection, exception entry points, and tests.
 */

import { ProjectConfig } from '../types';
import { resolveSecurityConfig } from '../validation';

export function generateAppUserEntity(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

/**
 * Dedicated persistence entity for Spring Security authentication and authorization.
 * Kept separate from business entities to isolate security credentials and lifecycle.
 */
@Entity
@Table(name = "app_users")
public class AppUser implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String role = "ROLE_USER";

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public AppUser() {
    }

    public AppUser(String username, String email, String password, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = (role != null && !role.isBlank()) ? role : "ROLE_USER";
        this.enabled = true;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // UserDetails implementation

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(this.role));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.enabled;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AppUser appUser)) return false;
        return Objects.equals(id, appUser.id) && Objects.equals(username, appUser.username);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, username);
    }
}
`;
}

export function generateAppUserRepository(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.repository;

import ${packageName}.security.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    Optional<AppUser> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
`;
}

export function generateAuthRequestDto(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    public AuthRequest() {
    }

    public AuthRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
`;
}

export function generateRegisterRequestDto(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email address is required")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    public RegisterRequest() {
    }

    public RegisterRequest(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
`;
}

export function generateAuthResponseDto(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.dto;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private long expiresInSeconds;
    private String username;
    private String role;

    public AuthResponse() {
    }

    public AuthResponse(String token, long expiresInSeconds, String username, String role) {
        this.token = token;
        this.tokenType = "Bearer";
        this.expiresInSeconds = expiresInSeconds;
        this.username = username;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public void setExpiresInSeconds(long expiresInSeconds) {
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
`;
}

export function generateJwtService(config: ProjectConfig): string {
  const { packageName } = config;
  const sec = resolveSecurityConfig(config);

  return `package ${packageName}.security.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service for issuing, signing, parsing, and validating JSON Web Tokens (JWT).
 * Uses JJWT 0.12.x HMAC-SHA256 cryptography with strict 256-bit key enforcement.
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final String secretKeyString;
    private final long expirationMinutes;
    private SecretKey cachedSigningKey;

    public JwtService(
            @Value("\${security.jwt.secret:}") String secretKeyString,
            @Value("\${security.jwt.expiration-minutes:${sec.tokenExpirationMinutes}}") long expirationMinutes
    ) {
        this.secretKeyString = secretKeyString;
        this.expirationMinutes = expirationMinutes;
    }

    @PostConstruct
    public void validateKeyOnStartup() {
        // Enforce secret presence and >= 256-bit strength at application bootstrap
        getSigningKey();
    }

    private SecretKey getSigningKey() {
        if (this.cachedSigningKey != null) {
            return this.cachedSigningKey;
        }

        if (this.secretKeyString == null || this.secretKeyString.isBlank()) {
            throw new IllegalStateException(
                "CRITICAL SECURITY CONFIGURATION ERROR: JWT signing key is not configured. " +
                "You must supply a secret of at least 256 bits (32 bytes) via the ${sec.jwtSecretEnvVar} environment variable."
            );
        }

        byte[] keyBytes = this.secretKeyString.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                "CRITICAL SECURITY CONFIGURATION ERROR: JWT signing key must be at least 256 bits (32 bytes). " +
                "Current key length is only " + keyBytes.length + " bytes. Generate a secure key using: openssl rand -base64 32"
            );
        }

        this.cachedSigningKey = Keys.hmacShaKeyFor(keyBytes);
        return this.cachedSigningKey;
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", userDetails.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_USER"));
        return generateToken(extraClaims, userDetails.getUsername());
    }

    public String generateToken(Map<String, Object> extraClaims, String username) {
        long nowMillis = System.currentTimeMillis();
        long expMillis = nowMillis + (expirationMinutes * 60 * 1000L);

        return Jwts.builder()
                .claims(extraClaims)
                .subject(username)
                .issuedAt(new Date(nowMillis))
                .expiration(new Date(expMillis))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public long getExpirationSeconds() {
        return this.expirationMinutes * 60;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
`;
}

export function generateUserDetailsServiceImpl(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.service;

import ${packageName}.security.repository.AppUserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AppUserRepository userRepository;

    public UserDetailsServiceImpl(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Find user by username or email for flexible, secure login
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
    }
}
`;
}

export function generateAuthService(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.service;

import ${packageName}.security.dto.AuthRequest;
import ${packageName}.security.dto.AuthResponse;
import ${packageName}.security.dto.RegisterRequest;
import ${packageName}.security.entity.AppUser;
import ${packageName}.security.repository.AppUserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email address is already registered.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        AppUser newUser = new AppUser(
                request.getUsername().trim(),
                request.getEmail().trim().toLowerCase(),
                encodedPassword,
                "ROLE_USER"
        );

        userRepository.save(newUser);

        String token = jwtService.generateToken(newUser);
        return new AuthResponse(token, jwtService.getExpirationSeconds(), newUser.getUsername(), newUser.getRole());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(Object::toString)
                    .orElse("ROLE_USER");

            return new AuthResponse(token, jwtService.getExpirationSeconds(), userDetails.getUsername(), role);
        } catch (BadCredentialsException ex) {
            // Constant response message prevents credential/username enumeration
            throw new BadCredentialsException("Invalid username or password.");
        }
    }
}
`;
}

export function generateAuthController(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.controller;

import ${packageName}.security.dto.AuthRequest;
import ${packageName}.security.dto.AuthResponse;
import ${packageName}.security.dto.RegisterRequest;
import ${packageName}.security.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
`;
}

export function generateJwtAuthenticationFilter(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.filter;

import ${packageName}.security.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that intercepts incoming HTTP requests to parse and validate the Bearer JWT token.
 * Populates Spring Security's SecurityContextHolder with the authenticated principal.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String username = jwtService.extractUsername(jwt);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Clear context if token is malformed, invalid signature, or expired
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
`;
}

export function generateJwtAuthenticationEntryPoint(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Rejects unauthenticated requests with HTTP 401 Unauthorized and a clean JSON error response.
 * Never leaks stack traces or server internal details.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", "Full authentication is required to access this resource.");
        body.put("path", request.getRequestURI());
        body.put("timestamp", LocalDateTime.now().toString());

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
`;
}

export function generateJwtAccessDeniedHandler(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Rejects unauthorized requests with HTTP 403 Forbidden and a clean JSON error response.
 */
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_FORBIDDEN);
        body.put("error", "Forbidden");
        body.put("message", "Access is denied for this user role.");
        body.put("path", request.getRequestURI());
        body.put("timestamp", LocalDateTime.now().toString());

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
`;
}

export function generateSecurityConfig(config: ProjectConfig): string {
  const { packageName, database } = config;
  const sec = resolveSecurityConfig(config);

  const corsOriginsArray = sec.corsAllowedOrigins.map(o => `"${o}"`).join(', ');

  const h2ConsoleConfig = database === 'h2'
    ? `
            // Permit H2 Console for local testing and disable frame options for the iframe console
            .authorizeHttpRequests(auth -> auth.requestMatchers("/h2-console/**").permitAll())
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()))`
    : '';

  return `package ${packageName}.security.config;

import ${packageName}.security.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security 6 stateless JWT configuration.
 * CSRF is disabled deliberately: this API is stateless and authenticates via Bearer tokens
 * in the Authorization header, which are not susceptible to browser cookie-based CSRF attacks.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthFilter,
            UserDetailsService userDetailsService,
            JwtAuthenticationEntryPoint authenticationEntryPoint,
            JwtAccessDeniedHandler accessDeniedHandler
    ) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CSRF is disabled because authentication uses Bearer tokens and no browser cookies/sessions are stored
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(this.authenticationEntryPoint)
                .accessDeniedHandler(this.accessDeniedHandler)
            )${h2ConsoleConfig}
            .authorizeHttpRequests(auth -> auth
                // Public authentication and registration endpoints
                .requestMatchers("/api/auth/**").permitAll()
                // Public Swagger & OpenAPI 3 documentation endpoints
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                // Require authentication for all other business API endpoints
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(${corsOriginsArray}));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
`;
}

export function generateJwtServiceTest(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security;

import ${packageName}.security.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    // 256-bit test key for unit test assertions (not used in production)
    private static final String TEST_SECRET = "01234567890123456789012345678901test_key_for_unit_tests_only_32b";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(TEST_SECRET, 60);
    }

    @Test
    @DisplayName("Should generate a valid JWT token and extract the username correctly")
    void testGenerateAndExtractUsername() {
        UserDetails userDetails = new User("alice", "password", Collections.emptyList());
        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertEquals("alice", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    @DisplayName("Should fail token validation when username does not match")
    void testTokenValidationUsernameMismatch() {
        UserDetails alice = new User("alice", "password", Collections.emptyList());
        UserDetails bob = new User("bob", "password", Collections.emptyList());

        String token = jwtService.generateToken(alice);
        assertFalse(jwtService.isTokenValid(token, bob));
    }

    @Test
    @DisplayName("Should fail safely when signing secret is empty or too short")
    void testWeakOrEmptySecretThrowsException() {
        JwtService invalidService = new JwtService("too_short_key", 60);
        UserDetails user = new User("alice", "password", Collections.emptyList());

        assertThrows(IllegalStateException.class, () -> invalidService.generateToken(user));
    }

    @Test
    @DisplayName("Should reject expired tokens")
    void testExpiredTokenValidation() {
        JwtService shortLivedService = new JwtService(TEST_SECRET, -5); // already expired
        UserDetails user = new User("alice", "password", Collections.emptyList());
        String expiredToken = shortLivedService.generateToken(user);

        assertFalse(shortLivedService.isTokenValid(expiredToken, user));
    }
}
`;
}

export function generateAuthControllerTest(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.security;

import ${packageName}.exception.GlobalExceptionHandler;
import ${packageName}.security.config.JwtAccessDeniedHandler;
import ${packageName}.security.config.JwtAuthenticationEntryPoint;
import ${packageName}.security.controller.AuthController;
import ${packageName}.security.dto.AuthRequest;
import ${packageName}.security.dto.AuthResponse;
import ${packageName}.security.dto.RegisterRequest;
import ${packageName}.security.filter.JwtAuthenticationFilter;
import ${packageName}.security.service.AuthService;
import ${packageName}.security.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Unit slice test for AuthController
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthFilter;

    @MockBean
    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    @MockBean
    private JwtAccessDeniedHandler accessDeniedHandler;

    @Test
    @DisplayName("POST /api/auth/register should create a user and return token")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("john_doe", "john@example.com", "Password123!");
        AuthResponse response = new AuthResponse("mock.jwt.token", 3600, "john_doe", "ROLE_USER");

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.username").value("john_doe"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    @DisplayName("POST /api/auth/register with invalid data should return 400 Bad Request")
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest invalidRequest = new RegisterRequest("", "invalid-email", "short");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login with valid credentials returns 200 and token")
    void testLoginSuccess() throws Exception {
        AuthRequest request = new AuthRequest("john_doe", "Password123!");
        AuthResponse response = new AuthResponse("mock.jwt.token", 3600, "john_doe", "ROLE_USER");

        when(authService.login(any(AuthRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.username").value("john_doe"));
    }

    @Test
    @DisplayName("POST /api/auth/login with invalid credentials returns 401 Unauthorized")
    void testLoginInvalidCredentials() throws Exception {
        AuthRequest request = new AuthRequest("john_doe", "WrongPassword");

        when(authService.login(any(AuthRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid username or password."));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
`;
}
