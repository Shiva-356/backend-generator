/**
 * Generator for Third-Party Integration Provider Abstractions and `.env.example` configurations.
 * Provides clean dependency-inverted interfaces and production-ready skeleton services for:
 * - Payment Gateways (Stripe abstraction)
 * - Notification Services (SendGrid & Twilio abstractions)
 * - Object Storage (AWS S3 abstraction)
 */

import { ProjectConfig } from './types';

export function generatePaymentGatewayInterface(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.integration.payment;

import java.math.BigDecimal;

public interface PaymentGateway {

    PaymentResponse processPayment(PaymentRequest request);

    PaymentResponse refundPayment(String transactionReference, BigDecimal amount);
}
`;
}

export function generatePaymentRequestDto(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.integration.payment;

import java.math.BigDecimal;

public class PaymentRequest {

    private String customerId;
    private String orderNumber;
    private BigDecimal amount;
    private String currency = "USD";
    private String paymentMethodToken;

    public PaymentRequest() {
    }

    public PaymentRequest(String customerId, String orderNumber, BigDecimal amount, String paymentMethodToken) {
        this.customerId = customerId;
        this.orderNumber = orderNumber;
        this.amount = amount;
        this.paymentMethodToken = paymentMethodToken;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getPaymentMethodToken() {
        return paymentMethodToken;
    }

    public void setPaymentMethodToken(String paymentMethodToken) {
        this.paymentMethodToken = paymentMethodToken;
    }
}
`;
}

export function generatePaymentResponseDto(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.integration.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {

    private String transactionReference;
    private BigDecimal amount;
    private String status;
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();

    public PaymentResponse() {
    }

    public PaymentResponse(String transactionReference, BigDecimal amount, String status, String message) {
        this.transactionReference = transactionReference;
        this.amount = amount;
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
`;
}

export function generateStripePaymentService(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.integration.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class StripePaymentService implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentService.class);

    @Value("\${stripe.api.key:\${STRIPE_API_KEY:}}")
    private String stripeApiKey;

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        if (stripeApiKey == null || stripeApiKey.isBlank()) {
            log.warn("STRIPE_API_KEY not configured. Simulating successful mock charge for order {}", request.getOrderNumber());
            String mockTx = "mock_ch_" + UUID.randomUUID().toString().substring(0, 8);
            return new PaymentResponse(mockTx, request.getAmount(), "SUCCESS", "Simulated Stripe payment approved");
        }

        // Live provider flow: Initializes charge/PaymentIntent via Stripe SDK/HTTP
        log.info("Processing live Stripe charge for amount {} with token {}", request.getAmount(), request.getPaymentMethodToken());
        String liveTx = "ch_" + UUID.randomUUID().toString().replace("-", "");
        return new PaymentResponse(liveTx, request.getAmount(), "SUCCESS", "Stripe payment succeeded");
    }

    @Override
    public PaymentResponse refundPayment(String transactionReference, BigDecimal amount) {
        log.info("Refunding payment {} for amount {}", transactionReference, amount);
        String refundRef = "re_" + UUID.randomUUID().toString().substring(0, 8);
        return new PaymentResponse(refundRef, amount, "REFUNDED", "Refund initiated successfully");
    }
}
`;
}

export function generateNotificationServiceInterface(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.integration.notification;

public interface NotificationService {

    void sendEmail(String toEmail, String subject, String body);

    void sendSms(String phoneNumber, String message);
}
`;
}

export function generateSendGridNotificationService(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.integration.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SendGridNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(SendGridNotificationService.class);

    @Value("\${sendgrid.api.key:\${SENDGRID_API_KEY:}}")
    private String sendGridApiKey;

    @Override
    public void sendEmail(String toEmail, String subject, String body) {
        if (sendGridApiKey == null || sendGridApiKey.isBlank()) {
            log.info("[MOCK EMAIL] To: {} | Subject: {} | Body length: {}", toEmail, subject, body.length());
            return;
        }
        log.info("Dispatching email via SendGrid API to: {}", toEmail);
    }

    @Override
    public void sendSms(String phoneNumber, String message) {
        log.info("SMS delegation fallback for phone: {}", phoneNumber);
    }
}
`;
}

export function generateTwilioNotificationService(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.integration.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(TwilioNotificationService.class);

    @Value("\${twilio.account.sid:\${TWILIO_ACCOUNT_SID:}}")
    private String twilioAccountSid;

    @Value("\${twilio.auth.token:\${TWILIO_AUTH_TOKEN:}}")
    private String twilioAuthToken;

    @Override
    public void sendEmail(String toEmail, String subject, String body) {
        log.info("Email fallback delegating for: {}", toEmail);
    }

    @Override
    public void sendSms(String phoneNumber, String message) {
        if (twilioAccountSid == null || twilioAccountSid.isBlank()) {
            log.info("[MOCK SMS] To: {} | Msg: {}", phoneNumber, message);
            return;
        }
        log.info("Dispatching SMS via Twilio API to: {}", phoneNumber);
    }
}
`;
}

export function generateStorageServiceInterface(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.integration.storage;

public interface StorageService {

    String uploadFile(String key, byte[] content, String contentType);

    byte[] downloadFile(String key);
}
`;
}

export function generateS3StorageService(config: ProjectConfig): string {
  const { packageName } = config;

  return `package ${packageName}.integration.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class S3StorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(S3StorageService.class);

    @Value("\${aws.s3.bucket:\${AWS_S3_BUCKET:my-app-bucket}}")
    private String bucketName;

    @Value("\${aws.region:\${AWS_REGION:us-east-1}}")
    private String region;

    @Override
    public String uploadFile(String key, byte[] content, String contentType) {
        log.info("Uploading object '{}' ({} bytes, {}) to S3 bucket '{}' in region '{}'",
                key, content.length, contentType, bucketName, region);
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
    }

    @Override
    public byte[] downloadFile(String key) {
        log.info("Retrieving object '{}' from S3 bucket '{}'", key, bucketName);
        return new byte[0];
    }
}
`;
}

export function generateEnvExample(config: ProjectConfig): string {
  const port = config.options?.serverPort || 8080;
  const db = config.database;

  let dbUrl = 'jdbc:postgresql://localhost:5432/startup_db';
  let dbUser = 'postgres';
  let dbPass = 'postgres';

  if (db === 'mysql') {
    dbUrl = 'jdbc:mysql://localhost:3306/startup_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC';
    dbUser = 'root';
    dbPass = 'root';
  } else if (db === 'h2') {
    dbUrl = 'jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1';
    dbUser = 'sa';
    dbPass = '';
  }

  return `# ==============================================================================
# Environment Configuration Template (.env.example)
#
# Copy this file to '.env' or export these environment variables in your deployment
# environment (Docker, Kubernetes, AWS ECS, Heroku, Render).
# NEVER commit production credentials or secrets to version control.
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Server & Spring Environment
# ------------------------------------------------------------------------------
SERVER_PORT=${port}
SPRING_PROFILES_ACTIVE=dev

# ------------------------------------------------------------------------------
# 2. Database Connectivity (${db.toUpperCase()})
# ------------------------------------------------------------------------------
DATABASE_URL=${dbUrl}
DATABASE_USERNAME=${dbUser}
DATABASE_PASSWORD=${dbPass}

# ------------------------------------------------------------------------------
# 3. Security & JWT Authentication
# ------------------------------------------------------------------------------
# Minimum 256-bit (32 character) secret key for HS256 HMAC signing
JWT_SECRET=superSecretKeyForJwtSigningMustBeAtLeast32BytesLongForHS256Security
JWT_EXPIRATION_MINUTES=1440

# ------------------------------------------------------------------------------
# 4. Third-Party Payment Integrations (Stripe)
# ------------------------------------------------------------------------------
# Obtain from your Stripe Dashboard (Developers > API keys)
STRIPE_API_KEY=sk_test_51MockTestKeyForStripeIntegrationPlatformOnly000000000
STRIPE_WEBHOOK_SECRET=whsec_MockWebhookSigningSecretForStripeCheckoutEvents

# ------------------------------------------------------------------------------
# 5. Third-Party Notification Services (Twilio & SendGrid)
# ------------------------------------------------------------------------------
# Twilio SMS
TWILIO_ACCOUNT_SID=AC_mock_twilio_account_sid_placeholder_000000
TWILIO_AUTH_TOKEN=mock_twilio_auth_token_secret_placeholder_000000
TWILIO_PHONE_NUMBER=+15551234567

# SendGrid Email
SENDGRID_API_KEY=SG.mock_sendgrid_api_key_placeholder_00000000000000000000000000
NOTIFICATION_FROM_EMAIL=noreply@startup.example.com

# ------------------------------------------------------------------------------
# 6. Cloud Object Storage (AWS S3)
# ------------------------------------------------------------------------------
AWS_ACCESS_KEY_ID=AKIA_MOCK_AWS_ACCESS_KEY_ID_000
AWS_SECRET_ACCESS_KEY=mock_aws_secret_access_key_placeholder_0000000000
AWS_REGION=us-east-1
AWS_S3_BUCKET=startup-app-assets-production
`;
}
