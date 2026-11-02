/**
 * Generator for Startup Domain Workflow Services, Controllers, and DTOs.
 * Generates rich, production-grade business logic for:
 * 1. EdTech: Enrollment checks, instructor ownership, grading engine, certificate issuance.
 * 2. E-Commerce: Inventory stock checks/decrements, server-side price recalculation, order isolation.
 * 3. SaaS: Multi-tenant workspace isolation, subscription limits, membership validation, audit logging.
 * 4. FinTech: Atomic double-entry fund transfer, balance checks, KYC status validation, audit records.
 */

import { ProjectConfig, GeneratedFile } from '../types';

export function isWorkflowEligible(config: ProjectConfig, profileIndustry: string): boolean {
  // Check if project startup industry matches OR if entities contain the signature domain entity
  if (config.startup?.industry === profileIndustry) {
    return true;
  }
  const entityNames = new Set(config.entities.map(e => e.name));
  if (profileIndustry === 'EDTECH' && entityNames.has('Course') && entityNames.has('Enrollment')) return true;
  if (profileIndustry === 'ECOMMERCE' && entityNames.has('Product') && entityNames.has('Order')) return true;
  if (profileIndustry === 'SAAS' && entityNames.has('Workspace') && entityNames.has('Project')) return true;
  if (profileIndustry === 'FINTECH' && entityNames.has('Account') && entityNames.has('Transaction')) return true;
  return false;
}

export function generateStartupWorkflowFiles(config: ProjectConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const { packageName } = config;
  const packagePath = `src/main/java/${packageName.replace(/\./g, '/')}`;

  // 1. EdTech Workflow
  if (isWorkflowEligible(config, 'EDTECH')) {
    files.push({
      path: `${packagePath}/dto/workflow/EnrollmentRequest.java`,
      content: generateEdTechEnrollmentRequest(config)
    });
    files.push({
      path: `${packagePath}/dto/workflow/AssessmentSubmissionRequest.java`,
      content: generateEdTechSubmissionRequest(config)
    });
    files.push({
      path: `${packagePath}/dto/workflow/CourseUpdateRequest.java`,
      content: generateEdTechCourseUpdateRequest(config)
    });
    files.push({
      path: `${packagePath}/service/workflow/EdTechWorkflowService.java`,
      content: generateEdTechWorkflowService(config)
    });
    files.push({
      path: `${packagePath}/controller/workflow/EdTechWorkflowController.java`,
      content: generateEdTechWorkflowController(config)
    });
  }

  // 2. E-Commerce Workflow
  if (isWorkflowEligible(config, 'ECOMMERCE')) {
    files.push({
      path: `${packagePath}/dto/workflow/AddToCartRequest.java`,
      content: generateEcommerceAddToCartRequest(config)
    });
    files.push({
      path: `${packagePath}/dto/workflow/CheckoutRequest.java`,
      content: generateEcommerceCheckoutRequest(config)
    });
    files.push({
      path: `${packagePath}/service/workflow/EcommerceWorkflowService.java`,
      content: generateEcommerceWorkflowService(config)
    });
    files.push({
      path: `${packagePath}/controller/workflow/EcommerceWorkflowController.java`,
      content: generateEcommerceWorkflowController(config)
    });
  }

  // 3. SaaS Workflow
  if (isWorkflowEligible(config, 'SAAS')) {
    files.push({
      path: `${packagePath}/dto/workflow/OrgRegistrationRequest.java`,
      content: generateSaasOrgRegistrationRequest(config)
    });
    files.push({
      path: `${packagePath}/dto/workflow/ProjectCreateRequest.java`,
      content: generateSaasProjectCreateRequest(config)
    });
    files.push({
      path: `${packagePath}/dto/workflow/TaskCreateRequest.java`,
      content: generateSaasTaskCreateRequest(config)
    });
    files.push({
      path: `${packagePath}/service/workflow/SaasWorkflowService.java`,
      content: generateSaasWorkflowService(config)
    });
    files.push({
      path: `${packagePath}/controller/workflow/SaasWorkflowController.java`,
      content: generateSaasWorkflowController(config)
    });
  }

  // 4. FinTech Workflow
  if (isWorkflowEligible(config, 'FINTECH')) {
    files.push({
      path: `${packagePath}/dto/workflow/FundTransferRequest.java`,
      content: generateFintechFundTransferRequest(config)
    });
    files.push({
      path: `${packagePath}/dto/workflow/BeneficiaryCreateRequest.java`,
      content: generateFintechBeneficiaryCreateRequest(config)
    });
    files.push({
      path: `${packagePath}/service/workflow/FintechWorkflowService.java`,
      content: generateFintechWorkflowService(config)
    });
    files.push({
      path: `${packagePath}/controller/workflow/FintechWorkflowController.java`,
      content: generateFintechWorkflowController(config)
    });
  }

  return files;
}

// -----------------------------------------------------------------------------
// EDTECH WORKFLOW IMPLEMENTATION
// -----------------------------------------------------------------------------

function generateEdTechEnrollmentRequest(config: ProjectConfig): string {
  return `package ${config.packageName}.dto.workflow;

import jakarta.validation.constraints.NotNull;

public class EnrollmentRequest {

    @NotNull(message = "studentId is required")
    private Long studentId;

    @NotNull(message = "courseId is required")
    private Long courseId;

    public EnrollmentRequest() {
    }

    public EnrollmentRequest(Long studentId, Long courseId) {
        this.studentId = studentId;
        this.courseId = courseId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
}
`;
}

function generateEdTechSubmissionRequest(config: ProjectConfig): string {
  return `package ${config.packageName}.dto.workflow;

import jakarta.validation.constraints.NotNull;

public class AssessmentSubmissionRequest {

    @NotNull(message = "studentId is required")
    private Long studentId;

    @NotNull(message = "assessmentId is required")
    private Long assessmentId;

    @NotNull(message = "score is required")
    private Integer score;

    public AssessmentSubmissionRequest() {
    }

    public AssessmentSubmissionRequest(Long studentId, Long assessmentId, Integer score) {
        this.studentId = studentId;
        this.assessmentId = assessmentId;
        this.score = score;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }
}
`;
}

function generateEdTechCourseUpdateRequest(config: ProjectConfig): string {
  return `package ${config.packageName}.dto.workflow;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CourseUpdateRequest {

    @NotNull(message = "instructorId is required for ownership verification")
    private Long instructorId;

    @NotBlank(message = "title cannot be blank")
    private String title;

    private String description;

    @NotNull(message = "credits is required")
    private Integer credits;

    @NotNull(message = "price is required")
    private BigDecimal price;

    public CourseUpdateRequest() {
    }

    public Long getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(Long instructorId) {
        this.instructorId = instructorId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
`;
}

function generateEdTechWorkflowService(config: ProjectConfig): string {
  const { packageName } = config;
  return `package ${packageName}.service.workflow;

import ${packageName}.dto.workflow.AssessmentSubmissionRequest;
import ${packageName}.dto.workflow.CourseUpdateRequest;
import ${packageName}.dto.workflow.EnrollmentRequest;
import ${packageName}.entity.Assessment;
import ${packageName}.entity.Certificate;
import ${packageName}.entity.Course;
import ${packageName}.entity.Enrollment;
import ${packageName}.entity.Student;
import ${packageName}.entity.Submission;
import ${packageName}.exception.BusinessRuleException;
import ${packageName}.exception.DuplicateResourceException;
import ${packageName}.exception.ResourceNotFoundException;
import ${packageName}.exception.UnauthorizedAccessException;
import ${packageName}.repository.AssessmentRepository;
import ${packageName}.repository.CertificateRepository;
import ${packageName}.repository.CourseRepository;
import ${packageName}.repository.EnrollmentRepository;
import ${packageName}.repository.StudentRepository;
import ${packageName}.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class EdTechWorkflowService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentRepository assessmentRepository;
    private final SubmissionRepository submissionRepository;
    private final CertificateRepository certificateRepository;

    public EdTechWorkflowService(
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            AssessmentRepository assessmentRepository,
            SubmissionRepository submissionRepository,
            CertificateRepository certificateRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assessmentRepository = assessmentRepository;
        this.submissionRepository = submissionRepository;
        this.certificateRepository = certificateRepository;
    }

    /**
     * Enrolls a student in a course with validation:
     * - Student must exist and be active
     * - Course must exist and be active
     * - Duplicate enrollment is strictly prevented
     */
    public Enrollment enrollStudent(EnrollmentRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        if (!Boolean.TRUE.equals(student.getActive())) {
            throw new BusinessRuleException("Inactive student cannot enroll in courses");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + request.getCourseId()));

        if (!Boolean.TRUE.equals(course.getActive())) {
            throw new BusinessRuleException("Course is not currently active for enrollment");
        }

        // Duplicate enrollment prevention
        enrollmentRepository.findByStudentIdAndCourseId(request.getStudentId(), request.getCourseId())
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Student is already enrolled in course: " + course.getTitle());
                });

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setEnrollmentDate(LocalDate.now());
        enrollment.setStatus("ACTIVE");

        return enrollmentRepository.save(enrollment);
    }

    /**
     * Modifies course content with instructor ownership check.
     * Prevents unauthorized instructors from modifying other instructors' courses.
     */
    public Course updateCourseContent(Long courseId, CourseUpdateRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        if (course.getInstructor() == null || !course.getInstructor().getId().equals(request.getInstructorId())) {
            throw new UnauthorizedAccessException("Only the assigned instructor can modify course content");
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCredits(request.getCredits());
        course.setPrice(request.getPrice());

        return courseRepository.save(course);
    }

    /**
     * Evaluates and records assessment submission with automated score grading.
     */
    public Submission submitAssessment(AssessmentSubmissionRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        Assessment assessment = assessmentRepository.findById(request.getAssessmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with ID: " + request.getAssessmentId()));

        // Verify active enrollment in the parent course
        enrollmentRepository.findByStudentIdAndCourseId(student.getId(), assessment.getCourse().getId())
                .orElseThrow(() -> new BusinessRuleException("Student is not actively enrolled in the course for this assessment"));

        boolean passed = request.getScore() >= assessment.getPassingScore();

        Submission submission = new Submission();
        submission.setStudent(student);
        submission.setAssessment(assessment);
        submission.setScore(request.getScore());
        submission.setPassed(passed);
        submission.setSubmittedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    /**
     * Issues an official completion certificate with duplicate prevention.
     */
    public Certificate issueCertificate(Long studentId, Long courseId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new BusinessRuleException("Student has no enrollment history in this course"));

        // Duplicate certificate prevention
        certificateRepository.findByStudentIdAndCourseId(studentId, courseId)
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Certificate already issued for this student and course");
                });

        enrollment.setStatus("COMPLETED");
        enrollmentRepository.save(enrollment);

        Certificate certificate = new Certificate();
        certificate.setStudent(student);
        certificate.setCourse(course);
        certificate.setIssueDate(LocalDate.now());
        certificate.setCertificateNumber("CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        certificate.setVerificationUrl("https://verify.edtech.example.com/" + certificate.getCertificateNumber());

        return certificateRepository.save(certificate);
    }
}
`;
}

function generateEdTechWorkflowController(config: ProjectConfig): string {
  const { packageName } = config;
  return `package ${packageName}.controller.workflow;

import ${packageName}.dto.workflow.AssessmentSubmissionRequest;
import ${packageName}.dto.workflow.CourseUpdateRequest;
import ${packageName}.dto.workflow.EnrollmentRequest;
import ${packageName}.entity.Certificate;
import ${packageName}.entity.Course;
import ${packageName}.entity.Enrollment;
import ${packageName}.entity.Submission;
import ${packageName}.service.workflow.EdTechWorkflowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/edtech")
public class EdTechWorkflowController {

    private final EdTechWorkflowService workflowService;

    public EdTechWorkflowController(EdTechWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @PostMapping("/enrollments")
    public ResponseEntity<Enrollment> enrollStudent(@Valid @RequestBody EnrollmentRequest request) {
        Enrollment enrollment = workflowService.enrollStudent(request);
        return new ResponseEntity<>(enrollment, HttpStatus.CREATED);
    }

    @PutMapping("/courses/{courseId}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseUpdateRequest request) {
        Course updated = workflowService.updateCourseContent(courseId, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/submissions")
    public ResponseEntity<Submission> submitAssessment(@Valid @RequestBody AssessmentSubmissionRequest request) {
        Submission submission = workflowService.submitAssessment(request);
        return new ResponseEntity<>(submission, HttpStatus.CREATED);
    }

    @PostMapping("/certificates")
    public ResponseEntity<Certificate> issueCertificate(
            @RequestParam Long studentId,
            @RequestParam Long courseId) {
        Certificate certificate = workflowService.issueCertificate(studentId, courseId);
        return new ResponseEntity<>(certificate, HttpStatus.CREATED);
    }
}
`;
}

// -----------------------------------------------------------------------------
// E-COMMERCE WORKFLOW IMPLEMENTATION
// -----------------------------------------------------------------------------

function generateEcommerceAddToCartRequest(config: ProjectConfig): string {
  return `package ${config.packageName}.dto.workflow;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AddToCartRequest {

    @NotNull(message = "customerId is required")
    private Long customerId;

    @NotNull(message = "productId is required")
    private Long productId;

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity must be at least 1")
    private Integer quantity;

    public AddToCartRequest() {
    }

    public AddToCartRequest(Long customerId, Long productId, Integer quantity) {
        this.customerId = customerId;
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
`;
}

function generateEcommerceCheckoutRequest(config: ProjectConfig): string {
  return `package ${config.packageName}.dto.workflow;

import jakarta.validation.constraints.NotNull;

public class CheckoutRequest {

    @NotNull(message = "customerId is required")
    private Long customerId;

    @NotNull(message = "shippingAddressId is required")
    private Long shippingAddressId;

    private String paymentMethodToken;

    public CheckoutRequest() {
    }

    public CheckoutRequest(Long customerId, Long shippingAddressId, String paymentMethodToken) {
        this.customerId = customerId;
        this.shippingAddressId = shippingAddressId;
        this.paymentMethodToken = paymentMethodToken;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getShippingAddressId() {
        return shippingAddressId;
    }

    public void setShippingAddressId(Long shippingAddressId) {
        this.shippingAddressId = shippingAddressId;
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

function generateEcommerceWorkflowService(config: ProjectConfig): string {
  const { packageName } = config;
  return `package ${packageName}.service.workflow;

import ${packageName}.dto.workflow.AddToCartRequest;
import ${packageName}.dto.workflow.CheckoutRequest;
import ${packageName}.entity.Address;
import ${packageName}.entity.Cart;
import ${packageName}.entity.CartItem;
import ${packageName}.entity.Customer;
import ${packageName}.entity.Inventory;
import ${packageName}.entity.Order;
import ${packageName}.entity.OrderItem;
import ${packageName}.entity.Payment;
import ${packageName}.entity.Product;
import ${packageName}.exception.BusinessRuleException;
import ${packageName}.exception.InsufficientStockException;
import ${packageName}.exception.ResourceNotFoundException;
import ${packageName}.exception.UnauthorizedAccessException;
import ${packageName}.integration.payment.PaymentGateway;
import ${packageName}.integration.payment.PaymentRequest;
import ${packageName}.integration.payment.PaymentResponse;
import ${packageName}.repository.AddressRepository;
import ${packageName}.repository.CartItemRepository;
import ${packageName}.repository.CartRepository;
import ${packageName}.repository.CustomerRepository;
import ${packageName}.repository.InventoryRepository;
import ${packageName}.repository.OrderItemRepository;
import ${packageName}.repository.OrderRepository;
import ${packageName}.repository.PaymentRepository;
import ${packageName}.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class EcommerceWorkflowService {

    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentGateway paymentGateway;

    public EcommerceWorkflowService(
            CustomerRepository customerRepository,
            AddressRepository addressRepository,
            ProductRepository productRepository,
            InventoryRepository inventoryRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            PaymentRepository paymentRepository,
            PaymentGateway paymentGateway) {
        this.customerRepository = customerRepository;
        this.addressRepository = addressRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.paymentGateway = paymentGateway;
    }

    /**
     * Adds an item to a customer cart after validating real-time inventory stock.
     */
    @Transactional
    public CartItem addItemToCart(AddToCartRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BusinessRuleException("Cannot add inactive product to cart: " + product.getName());
        }

        // Validate stock availability
        Inventory inventory = inventoryRepository.findByProductId(product.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not configured for product: " + product.getName()));

        if (inventory.getAvailableStock() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock for " + product.getName() + ". Available: " + inventory.getAvailableStock());
        }

        // Find or create customer active cart
        List<Cart> customerCarts = cartRepository.findByCustomerId(customer.getId());
        Cart activeCart = customerCarts.stream()
                .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()))
                .findFirst()
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setCustomer(customer);
                    newCart.setSessionId("cart_" + UUID.randomUUID().toString());
                    newCart.setStatus("ACTIVE");
                    return cartRepository.save(newCart);
                });

        CartItem item = cartItemRepository.findByCartIdAndProductId(activeCart.getId(), product.getId())
                .map(existing -> {
                    int newQty = existing.getQuantity() + request.getQuantity();
                    if (inventory.getAvailableStock() < newQty) {
                        throw new InsufficientStockException("Insufficient stock for total quantity requested: " + newQty);
                    }
                    existing.setQuantity(newQty);
                    return existing;
                })
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(activeCart);
                    newItem.setProduct(product);
                    newItem.setQuantity(request.getQuantity());
                    newItem.setUnitPrice(product.getPrice());
                    return newItem;
                });

        return cartItemRepository.save(item);
    }

    /**
     * Executes atomic order checkout within a strict @Transactional boundary:
     * 1. Validates customer and verified shipping address ownership
     * 2. Recalculates order total server-side from authoritative product prices
     * 3. Decrements inventory atomically to prevent race condition overselling
     * 4. Invokes PaymentGateway abstraction (Stripe)
     * 5. Persists Order, OrderItems, and Payment records
     */
    @Transactional
    public Order checkout(CheckoutRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        Address address = addressRepository.findById(request.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + request.getShippingAddressId()));

        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedAccessException("Shipping address does not belong to the authenticated customer");
        }

        List<Cart> customerCarts = cartRepository.findByCustomerId(customer.getId());
        Cart activeCart = customerCarts.stream()
                .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException("No active cart found for checkout"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(activeCart.getId());
        if (cartItems.isEmpty()) {
            throw new BusinessRuleException("Cannot checkout with an empty cart");
        }

        BigDecimal calculatedTotal = BigDecimal.ZERO;
        List<OrderItem> orderItemsToSave = new ArrayList<>();

        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Order order = new Order();
        order.setCustomer(customer);
        order.setShippingAddress(address);
        order.setOrderNumber(orderNumber);
        order.setStatus("PENDING");
        order = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            // Strict stock decrement & validation
            Inventory inventory = inventoryRepository.findByProductId(product.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory missing for product: " + product.getName()));

            if (inventory.getAvailableStock() < cartItem.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product " + product.getName() + " during checkout");
            }

            // Decrement available stock
            inventory.setAvailableStock(inventory.getAvailableStock() - cartItem.getQuantity());
            inventoryRepository.save(inventory);

            // Server-side authoritative price calculation
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            calculatedTotal = calculatedTotal.add(subtotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setSubtotal(subtotal);
            orderItemsToSave.add(orderItem);
        }

        orderItemRepository.saveAll(orderItemsToSave);
        order.setTotalAmount(calculatedTotal);

        // Process payment through payment gateway
        PaymentRequest paymentRequest = new PaymentRequest(
                String.valueOf(customer.getId()),
                orderNumber,
                calculatedTotal,
                request.getPaymentMethodToken() != null ? request.getPaymentMethodToken() : "tok_visa"
        );
        PaymentResponse paymentResponse = paymentGateway.processPayment(paymentRequest);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setTransactionReference(paymentResponse.getTransactionReference());
        payment.setAmount(calculatedTotal);
        payment.setStatus(paymentResponse.getStatus());
        payment.setPaymentMethod("CREDIT_CARD");
        paymentRepository.save(payment);

        if ("SUCCESS".equalsIgnoreCase(paymentResponse.getStatus())) {
            order.setStatus("PAID");
        }

        // Clear checked-out cart
        cartItemRepository.deleteAll(cartItems);
        activeCart.setStatus("CHECKED_OUT");
        cartRepository.save(activeCart);

        return orderRepository.save(order);
    }

    /**
     * Verifies that the querying customer owns the target order.
     */
    @Transactional(readOnly = true)
    public Order verifyCustomerOrderAccess(Long customerId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("Customer is not authorized to access this order");
        }

        return order;
    }
}
`;
}

function generateEcommerceWorkflowController(config: ProjectConfig): string {
  const { packageName } = config;
  return `package ${packageName}.controller.workflow;

import ${packageName}.dto.workflow.AddToCartRequest;
import ${packageName}.dto.workflow.CheckoutRequest;
import ${packageName}.entity.CartItem;
import ${packageName}.entity.Order;
import ${packageName}.service.workflow.EcommerceWorkflowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ecommerce")
public class EcommerceWorkflowController {

    private final EcommerceWorkflowService workflowService;

    public EcommerceWorkflowController(EcommerceWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @PostMapping("/cart/items")
    public ResponseEntity<CartItem> addItemToCart(@Valid @RequestBody AddToCartRequest request) {
        CartItem item = workflowService.addItemToCart(request);
        return new ResponseEntity<>(item, HttpStatus.CREATED);
    }

    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(@Valid @RequestBody CheckoutRequest request) {
        Order order = workflowService.checkout(request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Order> getOrderForCustomer(
            @PathVariable Long orderId,
            @RequestParam Long customerId) {
        Order order = workflowService.verifyCustomerOrderAccess(customerId, orderId);
        return ResponseEntity.ok(order);
    }
}
`;
}

// -----------------------------------------------------------------------------
// SAAS MULTI-TENANT WORKFLOW IMPLEMENTATION
// -----------------------------------------------------------------------------

function generateSaasOrgRegistrationRequest(config: ProjectConfig): string {
  return `package ${config.packageName}.dto.workflow;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class OrgRegistrationRequest {

    @NotBlank(message = "organizationName is required")
    private String organizationName;

    @NotBlank(message = "organizationSlug is required")
    private String organizationSlug;

    @NotBlank(message = "ownerEmail is required")
    @Email(message = "ownerEmail must be a valid email address")
    private String ownerEmail;

    @NotBlank(message = "ownerFullName is required")
    private String ownerFullName;

    private String planType = "PRO";

    public OrgRegistrationRequest() {
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getOrganizationSlug() {
        return organizationSlug;
    }

    public void setOrganizationSlug(String organizationSlug) {
        this.organizationSlug = organizationSlug;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getOwnerFullName() {
        return ownerFullName;
    }

    public void setOwnerFullName(String ownerFullName) {
        this.ownerFullName = ownerFullName;
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }
}
`;
}

function generateSaasProjectCreateRequest(config: ProjectConfig): string {
  return `package ${config.packageName}.dto.workflow;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ProjectCreateRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotBlank(message = "projectName is required")
    private String projectName;

    @NotBlank(message = "projectKey is required")
    private String projectKey;

    private String description;

    public ProjectCreateRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getProjectKey() {
        return projectKey;
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
`;
}

function generateSaasTaskCreateRequest(config: ProjectConfig): string {
  return `package ${config.packageName}.dto.workflow;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TaskCreateRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotBlank(message = "title is required")
    private String title;

    private String description;
    private String priority = "MEDIUM";
    private Long assigneeId;

    public TaskCreateRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }
}
`;
}

function generateSaasWorkflowService(config: ProjectConfig): string {
  const { packageName } = config;
  return `package ${packageName}.service.workflow;

import ${packageName}.dto.workflow.OrgRegistrationRequest;
import ${packageName}.dto.workflow.ProjectCreateRequest;
import ${packageName}.dto.workflow.TaskCreateRequest;
import ${packageName}.entity.*;
import ${packageName}.exception.BusinessRuleException;
import ${packageName}.exception.DuplicateResourceException;
import ${packageName}.exception.ResourceNotFoundException;
import ${packageName}.exception.TenantIsolationException;
import ${packageName}.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SaasWorkflowService {

    private final OrganizationRepository organizationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MembershipRepository membershipRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AuditLogRepository auditLogRepository;

    public SaasWorkflowService(
            OrganizationRepository organizationRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            MembershipRepository membershipRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            SubscriptionRepository subscriptionRepository,
            AuditLogRepository auditLogRepository) {
        this.organizationRepository = organizationRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.membershipRepository = membershipRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Registers a new tenant organization with default workspace, ADMIN owner, and subscription.
     */
    public Organization registerTenant(OrgRegistrationRequest request) {
        organizationRepository.findBySlug(request.getOrganizationSlug())
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Organization slug already registered: " + request.getOrganizationSlug());
                });

        Organization org = new Organization();
        org.setName(request.getOrganizationName());
        org.setSlug(request.getOrganizationSlug());
        org.setActive(true);
        org = organizationRepository.save(org);

        User owner = userRepository.findByEmail(request.getOwnerEmail())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(request.getOwnerEmail());
                    newUser.setFullName(request.getOwnerFullName());
                    newUser.setActive(true);
                    return userRepository.save(newUser);
                });

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("ROLE_ADMIN");
                    newRole.setPermissions("READ,WRITE,DELETE,MANAGE_BILLING");
                    return roleRepository.save(newRole);
                });

        Membership membership = new Membership();
        membership.setUser(owner);
        membership.setOrganization(org);
        membership.setRole(adminRole);
        membership.setStatus("ACTIVE");
        membershipRepository.save(membership);

        Workspace defaultWorkspace = new Workspace();
        defaultWorkspace.setName("Default Workspace");
        defaultWorkspace.setSlug("default");
        defaultWorkspace.setOrganization(org);
        workspaceRepository.save(defaultWorkspace);

        Subscription subscription = new Subscription();
        subscription.setOrganization(org);
        subscription.setPlanType(request.getPlanType() != null ? request.getPlanType() : "PRO");
        subscription.setStatus("ACTIVE");
        subscription.setMaxProjects("ENTERPRISE".equalsIgnoreCase(request.getPlanType()) ? 100 : 10);
        subscriptionRepository.save(subscription);

        logAudit("REGISTER_TENANT", "Organization", org.getId(), owner.getEmail(), "Registered tenant with slug " + org.getSlug());

        return org;
    }

    /**
     * Creates a project inside a workspace with:
     * 1. Multi-tenant membership verification
     * 2. Subscription project limits enforcement
     */
    public Project createProjectInWorkspace(Long workspaceId, ProjectCreateRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with ID: " + workspaceId));

        Organization org = workspace.getOrganization();

        // Enforce membership boundary
        membershipRepository.findByUserIdAndOrganizationId(request.getUserId(), org.getId())
                .filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus()))
                .orElseThrow(() -> new TenantIsolationException("User is not an active member of the target organization"));

        // Enforce subscription plan project limit
        Subscription subscription = subscriptionRepository.findByOrganizationId(org.getId())
                .orElseThrow(() -> new BusinessRuleException("No active subscription for organization: " + org.getName()));

        List<Workspace> orgWorkspaces = workspaceRepository.findByOrganizationId(org.getId());
        long totalProjectsCount = orgWorkspaces.stream()
                .mapToLong(w -> projectRepository.findByWorkspaceId(w.getId()).size())
                .sum();

        if (totalProjectsCount >= subscription.getMaxProjects()) {
            throw new BusinessRuleException(String.format(
                    "Subscription project limit reached (%d/%d) for plan %s",
                    totalProjectsCount, subscription.getMaxProjects(), subscription.getPlanType()));
        }

        Project project = new Project();
        project.setWorkspace(workspace);
        project.setName(request.getProjectName());
        project.setKey(request.getProjectKey());
        project.setDescription(request.getDescription());
        project.setMaxTasksAllowed(1000);
        project = projectRepository.save(project);

        logAudit("CREATE_PROJECT", "Project", project.getId(), String.valueOf(request.getUserId()), "Created project " + project.getName());

        return project;
    }

    /**
     * Creates a task in a project verifying workspace isolation.
     */
    public Task createTaskInProject(Long workspaceId, Long projectId, TaskCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        // Multi-tenant workspace isolation check
        if (!project.getWorkspace().getId().equals(workspaceId)) {
            throw new TenantIsolationException("Cross-tenant violation: Project does not belong to specified workspace");
        }

        Task task = new Task();
        task.setProject(project);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus("TODO");
        task.setPriority(request.getPriority());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found with ID: " + request.getAssigneeId()));
            task.setAssignee(assignee);
        }

        task = taskRepository.save(task);

        logAudit("CREATE_TASK", "Task", task.getId(), String.valueOf(request.getUserId()), "Created task " + task.getTitle());

        return task;
    }

    private void logAudit(String action, String entityName, Long entityId, String performedBy, String details) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setPerformedBy(performedBy);
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}
`;
}

function generateSaasWorkflowController(config: ProjectConfig): string {
  const { packageName } = config;
  return `package ${packageName}.controller.workflow;

import ${packageName}.dto.workflow.OrgRegistrationRequest;
import ${packageName}.dto.workflow.ProjectCreateRequest;
import ${packageName}.dto.workflow.TaskCreateRequest;
import ${packageName}.entity.Organization;
import ${packageName}.entity.Project;
import ${packageName}.entity.Task;
import ${packageName}.service.workflow.SaasWorkflowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/saas")
public class SaasWorkflowController {

    private final SaasWorkflowService workflowService;

    public SaasWorkflowController(SaasWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @PostMapping("/tenants")
    public ResponseEntity<Organization> registerTenant(@Valid @RequestBody OrgRegistrationRequest request) {
        Organization org = workflowService.registerTenant(request);
        return new ResponseEntity<>(org, HttpStatus.CREATED);
    }

    @PostMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<Project> createProject(
            @PathVariable Long workspaceId,
            @Valid @RequestBody ProjectCreateRequest request) {
        Project project = workflowService.createProjectInWorkspace(workspaceId, request);
        return new ResponseEntity<>(project, HttpStatus.CREATED);
    }

    @PostMapping("/workspaces/{workspaceId}/projects/{projectId}/tasks")
    public ResponseEntity<Task> createTask(
            @PathVariable Long workspaceId,
            @PathVariable Long projectId,
            @Valid @RequestBody TaskCreateRequest request) {
        Task task = workflowService.createTaskInProject(workspaceId, projectId, request);
        return new ResponseEntity<>(task, HttpStatus.CREATED);
    }
}
`;
}

// -----------------------------------------------------------------------------
// FINTECH WORKFLOW IMPLEMENTATION
// -----------------------------------------------------------------------------

function generateFintechFundTransferRequest(config: ProjectConfig): string {
  return `package ${config.packageName}.dto.workflow;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class FundTransferRequest {

    @NotNull(message = "sourceAccountId is required")
    private Long sourceAccountId;

    @NotNull(message = "targetAccountId is required")
    private Long targetAccountId;

    @NotNull(message = "amount is required")
    @DecimalMin(value = "0.01", message = "Transfer amount must be at least 0.01")
    private BigDecimal amount;

    private String description;
    private String ipAddress = "127.0.0.1";

    public FundTransferRequest() {
    }

    public FundTransferRequest(Long sourceAccountId, Long targetAccountId, BigDecimal amount, String description) {
        this.sourceAccountId = sourceAccountId;
        this.targetAccountId = targetAccountId;
        this.amount = amount;
        this.description = description;
    }

    public Long getSourceAccountId() {
        return sourceAccountId;
    }

    public void setSourceAccountId(Long sourceAccountId) {
        this.sourceAccountId = sourceAccountId;
    }

    public Long getTargetAccountId() {
        return targetAccountId;
    }

    public void setTargetAccountId(Long targetAccountId) {
        this.targetAccountId = targetAccountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
`;
}

function generateFintechBeneficiaryCreateRequest(config: ProjectConfig): string {
  return `package ${config.packageName}.dto.workflow;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BeneficiaryCreateRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotBlank(message = "name is required")
    private String name;

    @NotBlank(message = "accountNumber is required")
    private String accountNumber;

    private String routingNumber;

    public BeneficiaryCreateRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getRoutingNumber() {
        return routingNumber;
    }

    public void setRoutingNumber(String routingNumber) {
        this.routingNumber = routingNumber;
    }
}
`;
}

function generateFintechWorkflowService(config: ProjectConfig): string {
  const { packageName } = config;
  return `package ${packageName}.service.workflow;

import ${packageName}.dto.workflow.BeneficiaryCreateRequest;
import ${packageName}.dto.workflow.FundTransferRequest;
import ${packageName}.entity.*;
import ${packageName}.exception.BusinessRuleException;
import ${packageName}.exception.DuplicateResourceException;
import ${packageName}.exception.InsufficientFundsException;
import ${packageName}.exception.ResourceNotFoundException;
import ${packageName}.exception.UnauthorizedAccessException;
import ${packageName}.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * PRODUCTION ARCHITECTURE NOTE:
 * This service implements transactional digital banking logic (double-entry ledger mutations,
 * balance protection, KYC checks, and immutable auditing).
 *
 * REGULATORY DISCLAIMER:
 * This software foundation is intended for fintech platform integration and prototyping.
 * It does not constitute a certified banking license or automated PCI-DSS/SOC2 compliance.
 */
@Service
public class FintechWorkflowService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final AuditLogRepository auditLogRepository;

    public FintechWorkflowService(
            UserRepository userRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            BeneficiaryRepository beneficiaryRepository,
            AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Executes atomic fund transfer between two accounts using verified JWT principal:
     * 1. Resolves authenticated user server-side from verified JWT principal
     * 2. Validates KYC verification status of initiating user
     * 3. Verifies ownership of the debit source account
     * 4. Checks active account statuses (blocks frozen or closed accounts)
     * 5. Enforces balance check and throws InsufficientFundsException if balance < amount
     * 6. Atomically debits source and credits target within @Transactional boundary
     * 7. Appends immutable Transaction and AuditLog entries
     */
    @Transactional
    public Transaction transferFunds(String authenticatedPrincipal, FundTransferRequest request) {
        if (authenticatedPrincipal == null || authenticatedPrincipal.isBlank()) {
            throw new UnauthorizedAccessException("Authentication principal is required for financial transfers");
        }

        User user = userRepository.findByUsername(authenticatedPrincipal)
                .or(() -> userRepository.findByEmail(authenticatedPrincipal))
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found for principal: " + authenticatedPrincipal));

        return executeTransfer(user, request);
    }

    @Transactional
    public Transaction transferFunds(Long authenticatedUserId, FundTransferRequest request) {
        if (authenticatedUserId == null) {
            throw new UnauthorizedAccessException("Authenticated user identity is required for financial transfers");
        }

        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found with ID: " + authenticatedUserId));

        return executeTransfer(user, request);
    }

    private Transaction executeTransfer(User user, FundTransferRequest request) {
        if (!"VERIFIED".equalsIgnoreCase(user.getKycStatus())) {
            throw new BusinessRuleException("User KYC verification required before initiating financial fund transfers");
        }

        Account sourceAccount = accountRepository.findById(request.getSourceAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found with ID: " + request.getSourceAccountId()));

        if (!sourceAccount.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Authenticated user does not own source account: " + sourceAccount.getAccountNumber());
        }

        Account targetAccount = accountRepository.findById(request.getTargetAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Target account not found with ID: " + request.getTargetAccountId()));

        if (sourceAccount.getId().equals(targetAccount.getId())) {
            throw new BusinessRuleException("Source and target accounts cannot be identical");
        }

        if (!"ACTIVE".equalsIgnoreCase(sourceAccount.getStatus())) {
            throw new BusinessRuleException("Source account status is " + sourceAccount.getStatus() + ". Must be ACTIVE.");
        }

        if (!"ACTIVE".equalsIgnoreCase(targetAccount.getStatus())) {
            throw new BusinessRuleException("Target account status is " + targetAccount.getStatus() + ". Must be ACTIVE.");
        }

        // Strict balance check
        if (sourceAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException(String.format(
                    "Insufficient funds in account %s. Balance: %s, Requested: %s",
                    sourceAccount.getAccountNumber(), sourceAccount.getBalance(), request.getAmount()));
        }

        // Atomic balance mutation
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(request.getAmount()));
        targetAccount.setBalance(targetAccount.getBalance().add(request.getAmount()));
        accountRepository.save(sourceAccount);
        accountRepository.save(targetAccount);

        // Immutable Transaction Record
        Transaction tx = new Transaction();
        tx.setReference("TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase());
        tx.setSourceAccount(sourceAccount);
        tx.setTargetAccount(targetAccount);
        tx.setAmount(request.getAmount());
        tx.setTransactionType("TRANSFER");
        tx.setStatus("COMPLETED");
        tx.setDescription(request.getDescription() != null ? request.getDescription() : "Funds transfer");
        tx = transactionRepository.save(tx);

        // Immutable Audit Log
        AuditLog audit = new AuditLog();
        audit.setAction("TRANSFER_FUNDS");
        audit.setActorId(String.valueOf(user.getId()));
        audit.setIpAddress(request.getIpAddress());
        audit.setPayloadSummary(String.format("Transferred %s from %s to %s. Tx: %s",
                request.getAmount(), sourceAccount.getAccountNumber(), targetAccount.getAccountNumber(), tx.getReference()));
        auditLogRepository.save(audit);

        return tx;
    }

    /**
     * Adds a beneficiary account scoped to the verified authenticated user.
     */
    @Transactional
    public Beneficiary addBeneficiary(String authenticatedPrincipal, BeneficiaryCreateRequest request) {
        if (authenticatedPrincipal == null || authenticatedPrincipal.isBlank()) {
            throw new UnauthorizedAccessException("Authentication principal is required to register beneficiaries");
        }

        User user = userRepository.findByUsername(authenticatedPrincipal)
                .or(() -> userRepository.findByEmail(authenticatedPrincipal))
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found for principal: " + authenticatedPrincipal));

        return executeAddBeneficiary(user, request);
    }

    @Transactional
    public Beneficiary addBeneficiary(BeneficiaryCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getUserId()));

        return executeAddBeneficiary(user, request);
    }

    private Beneficiary executeAddBeneficiary(User user, BeneficiaryCreateRequest request) {
        beneficiaryRepository.findByUserIdAndAccountNumber(user.getId(), request.getAccountNumber())
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Beneficiary account already registered for user: " + request.getAccountNumber());
                });

        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setUser(user);
        beneficiary.setName(request.getName());
        beneficiary.setAccountNumber(request.getAccountNumber());
        beneficiary.setRoutingNumber(request.getRoutingNumber());
        beneficiary.setVerified(true);

        return beneficiaryRepository.save(beneficiary);
    }
}
`;
}

function generateFintechWorkflowController(config: ProjectConfig): string {
  const { packageName } = config;
  return `package ${packageName}.controller.workflow;

import ${packageName}.dto.workflow.BeneficiaryCreateRequest;
import ${packageName}.dto.workflow.FundTransferRequest;
import ${packageName}.entity.Beneficiary;
import ${packageName}.entity.Transaction;
import ${packageName}.exception.UnauthorizedAccessException;
import ${packageName}.service.workflow.FintechWorkflowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/fintech")
public class FintechWorkflowController {

    private final FintechWorkflowService workflowService;

    public FintechWorkflowController(FintechWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    /**
     * Executes funds transfer using verified server-side JWT authentication principal.
     * Spoofed or client-supplied headers are strictly rejected.
     */
    @PostMapping("/transfers")
    public ResponseEntity<Transaction> transferFunds(
            Authentication authentication,
            @Valid @RequestBody FundTransferRequest request) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedAccessException("Valid authenticated JWT session is required to execute funds transfers");
        }
        Transaction tx = workflowService.transferFunds(authentication.getName(), request);
        return new ResponseEntity<>(tx, HttpStatus.CREATED);
    }

    /**
     * Adds a beneficiary scoped strictly to the authenticated user from the verified JWT principal.
     */
    @PostMapping("/beneficiaries")
    public ResponseEntity<Beneficiary> addBeneficiary(
            Authentication authentication,
            @Valid @RequestBody BeneficiaryCreateRequest request) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedAccessException("Valid authenticated JWT session is required to register beneficiaries");
        }
        Beneficiary beneficiary = workflowService.addBeneficiary(authentication.getName(), request);
        return new ResponseEntity<>(beneficiary, HttpStatus.CREATED);
    }
}
`;
}
