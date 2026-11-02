/**
 * Predefined domain templates migrated and expanded from `templates.json` and `TemplateEngine.java`.
 * Provides production-ready entity models with real fields, constraints, and relationships for each domain.
 */

import { DomainTemplate, EntityConfig, ProjectConfig, DatabaseType, JavaVersion, SpringBootVersion } from '../types';

export const DOMAIN_TEMPLATES: Record<string, DomainTemplate> = {
  FOOD_DELIVERY: {
    key: 'FOOD_DELIVERY',
    name: 'Food Delivery Backend',
    description: 'Complete backend for online restaurant ordering, menus, delivery tracking, and payments.',
    modules: ['User', 'Restaurant', 'MenuItem', 'Order', 'Payment'],
    sampleApis: [
      'POST /api/users',
      'GET /api/restaurants',
      'POST /api/menu-items',
      'POST /api/orders',
      'POST /api/payments'
    ],
    databaseTables: ['users', 'restaurants', 'menu_items', 'orders', 'payments'],
    securityRules: ['JWT Authentication', 'Role-Based Access (Customer, Merchant, Driver, Admin)'],
    defaultEntities: [
      {
        name: 'User',
        tableName: 'users',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'username', type: 'String', required: true, unique: true, length: 50 },
          { name: 'email', type: 'String', required: true, unique: true, length: 100 },
          { name: 'fullName', type: 'String', required: true, length: 100 },
          { name: 'phone', type: 'String', required: false, length: 20 },
          { name: 'role', type: 'String', required: true, length: 20 },
          { name: 'active', type: 'Boolean', required: true }
        ]
      },
      {
        name: 'Restaurant',
        tableName: 'restaurants',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'name', type: 'String', required: true, length: 100 },
          { name: 'cuisineType', type: 'String', required: true, length: 50 },
          { name: 'address', type: 'String', required: true, length: 255 },
          { name: 'phone', type: 'String', required: true, length: 20 },
          { name: 'rating', type: 'Double', required: false, min: 0, max: 5 },
          { name: 'isOpen', type: 'Boolean', required: true }
        ],
        relationships: [
          {
            name: 'menuItems',
            type: 'ONE_TO_MANY',
            targetEntity: 'MenuItem',
            mappedBy: 'restaurant'
          }
        ]
      },
      {
        name: 'MenuItem',
        tableName: 'menu_items',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'name', type: 'String', required: true, length: 100 },
          { name: 'description', type: 'String', required: false, length: 500 },
          { name: 'price', type: 'BigDecimal', required: true, min: 0, precision: 10, scale: 2 },
          { name: 'category', type: 'String', required: true, length: 50 },
          { name: 'isAvailable', type: 'Boolean', required: true }
        ],
        relationships: [
          {
            name: 'restaurant',
            type: 'MANY_TO_ONE',
            targetEntity: 'Restaurant',
            required: true
          }
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
          { name: 'status', type: 'String', required: true, length: 30 },
          { name: 'deliveryAddress', type: 'String', required: true, length: 255 },
          { name: 'specialInstructions', type: 'String', required: false, length: 255 }
        ],
        relationships: [
          {
            name: 'user',
            type: 'MANY_TO_ONE',
            targetEntity: 'User',
            required: true
          },
          {
            name: 'restaurant',
            type: 'MANY_TO_ONE',
            targetEntity: 'Restaurant',
            required: true
          }
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
          { name: 'paymentMethod', type: 'String', required: true, length: 30 },
          { name: 'status', type: 'String', required: true, length: 30 }
        ],
        relationships: [
          {
            name: 'order',
            type: 'ONE_TO_ONE',
            targetEntity: 'Order',
            required: true,
            isOwningSide: true
          }
        ]
      }
    ]
  },

  ECOMMERCE: {
    key: 'ECOMMERCE',
    name: 'E-Commerce Backend',
    description: 'Scalable e-commerce backend supporting catalog management, carts, orders, and customer accounts.',
    modules: ['User', 'Product', 'CartItem', 'Order'],
    sampleApis: [
      'GET /api/products',
      'POST /api/products',
      'POST /api/cart-items',
      'POST /api/orders'
    ],
    databaseTables: ['users', 'products', 'cart_items', 'orders'],
    securityRules: ['JWT Authentication', 'Customer & Admin Role Access'],
    defaultEntities: [
      {
        name: 'User',
        tableName: 'users',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'username', type: 'String', required: true, unique: true, length: 50 },
          { name: 'email', type: 'String', required: true, unique: true, length: 100 },
          { name: 'fullName', type: 'String', required: true, length: 100 },
          { name: 'role', type: 'String', required: true, length: 20 }
        ]
      },
      {
        name: 'Product',
        tableName: 'products',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'sku', type: 'String', required: true, unique: true, length: 50 },
          { name: 'name', type: 'String', required: true, length: 150 },
          { name: 'description', type: 'String', required: false, length: 1000 },
          { name: 'price', type: 'BigDecimal', required: true, min: 0, precision: 10, scale: 2 },
          { name: 'stockQuantity', type: 'Integer', required: true, min: 0 },
          { name: 'category', type: 'String', required: true, length: 50 }
        ]
      },
      {
        name: 'CartItem',
        tableName: 'cart_items',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'quantity', type: 'Integer', required: true, min: 1 },
          { name: 'unitPrice', type: 'BigDecimal', required: true, min: 0, precision: 10, scale: 2 }
        ],
        relationships: [
          {
            name: 'user',
            type: 'MANY_TO_ONE',
            targetEntity: 'User',
            required: true
          },
          {
            name: 'product',
            type: 'MANY_TO_ONE',
            targetEntity: 'Product',
            required: true
          }
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
          { name: 'status', type: 'String', required: true, length: 30 },
          { name: 'shippingAddress', type: 'String', required: true, length: 255 }
        ],
        relationships: [
          {
            name: 'user',
            type: 'MANY_TO_ONE',
            targetEntity: 'User',
            required: true
          }
        ]
      }
    ]
  },

  BOOKING: {
    key: 'BOOKING',
    name: 'Booking Backend',
    description: 'Reservation management backend for appointments, hotel rooms, event ticketing, and venues.',
    modules: ['User', 'Booking', 'Payment'],
    sampleApis: ['POST /api/bookings', 'GET /api/bookings', 'POST /api/payments'],
    databaseTables: ['users', 'bookings', 'payments'],
    securityRules: ['JWT Authentication', 'Customer & Staff Scopes'],
    defaultEntities: [
      {
        name: 'User',
        tableName: 'users',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'email', type: 'String', required: true, unique: true, length: 100 },
          { name: 'fullName', type: 'String', required: true, length: 100 },
          { name: 'phoneNumber', type: 'String', required: false, length: 20 }
        ]
      },
      {
        name: 'Booking',
        tableName: 'bookings',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'bookingReference', type: 'String', required: true, unique: true, length: 50 },
          { name: 'bookingDate', type: 'LocalDate', required: true },
          { name: 'status', type: 'String', required: true, length: 30 },
          { name: 'guestCount', type: 'Integer', required: true, min: 1 }
        ],
        relationships: [
          {
            name: 'user',
            type: 'MANY_TO_ONE',
            targetEntity: 'User',
            required: true
          }
        ]
      },
      {
        name: 'Payment',
        tableName: 'payments',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'amount', type: 'BigDecimal', required: true, min: 0, precision: 10, scale: 2 },
          { name: 'paymentStatus', type: 'String', required: true, length: 30 },
          { name: 'method', type: 'String', required: true, length: 30 }
        ],
        relationships: [
          {
            name: 'booking',
            type: 'ONE_TO_ONE',
            targetEntity: 'Booking',
            required: true,
            isOwningSide: true
          }
        ]
      }
    ]
  },

  STREAMING: {
    key: 'STREAMING',
    name: 'Streaming Backend',
    description: 'Media and video streaming service backend with catalog, subscriptions, and viewing analytics.',
    modules: ['User', 'VideoContent', 'Subscription'],
    sampleApis: ['GET /api/video-contents', 'POST /api/subscriptions'],
    databaseTables: ['users', 'video_contents', 'subscriptions'],
    securityRules: ['JWT Authentication', 'Tiered Subscription Access'],
    defaultEntities: [
      {
        name: 'User',
        tableName: 'users',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'username', type: 'String', required: true, unique: true, length: 50 },
          { name: 'email', type: 'String', required: true, unique: true, length: 100 }
        ]
      },
      {
        name: 'VideoContent',
        tableName: 'video_contents',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'title', type: 'String', required: true, length: 200 },
          { name: 'description', type: 'String', required: false, length: 1000 },
          { name: 'videoUrl', type: 'String', required: true, length: 500 },
          { name: 'durationSeconds', type: 'Integer', required: true, min: 0 },
          { name: 'genre', type: 'String', required: true, length: 50 }
        ]
      },
      {
        name: 'Subscription',
        tableName: 'subscriptions',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'planName', type: 'String', required: true, length: 50 },
          { name: 'monthlyFee', type: 'BigDecimal', required: true, min: 0, precision: 8, scale: 2 },
          { name: 'startDate', type: 'LocalDate', required: true },
          { name: 'active', type: 'Boolean', required: true }
        ],
        relationships: [
          {
            name: 'user',
            type: 'MANY_TO_ONE',
            targetEntity: 'User',
            required: true
          }
        ]
      }
    ]
  },

  PAYMENT: {
    key: 'PAYMENT',
    name: 'Payment Backend',
    description: 'High-assurance ledger, digital wallet, and transaction reconciliation service.',
    modules: ['User', 'Wallet', 'Transaction'],
    sampleApis: ['POST /api/wallets', 'POST /api/transactions', 'GET /api/transactions'],
    databaseTables: ['users', 'wallets', 'transactions'],
    securityRules: ['JWT Authentication', 'Transaction Signature & Validation'],
    defaultEntities: [
      {
        name: 'User',
        tableName: 'users',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'nationalId', type: 'String', required: true, unique: true, length: 50 },
          { name: 'fullName', type: 'String', required: true, length: 100 },
          { name: 'email', type: 'String', required: true, unique: true, length: 100 }
        ]
      },
      {
        name: 'Wallet',
        tableName: 'wallets',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'walletNumber', type: 'String', required: true, unique: true, length: 50 },
          { name: 'balance', type: 'BigDecimal', required: true, min: 0, precision: 16, scale: 2 },
          { name: 'currency', type: 'String', required: true, length: 3 },
          { name: 'status', type: 'String', required: true, length: 20 }
        ],
        relationships: [
          {
            name: 'user',
            type: 'MANY_TO_ONE',
            targetEntity: 'User',
            required: true
          }
        ]
      },
      {
        name: 'Transaction',
        tableName: 'transactions',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'referenceCode', type: 'String', required: true, unique: true, length: 64 },
          { name: 'amount', type: 'BigDecimal', required: true, min: 0, precision: 16, scale: 2 },
          { name: 'type', type: 'String', required: true, length: 20 },
          { name: 'description', type: 'String', required: false, length: 255 }
        ],
        relationships: [
          {
            name: 'wallet',
            type: 'MANY_TO_ONE',
            targetEntity: 'Wallet',
            required: true
          }
        ]
      }
    ]
  },

  EDUCATION_ERP: {
    key: 'EDUCATION_ERP',
    name: 'Education ERP Backend',
    description: 'Academic management backend for schools and universities: students, faculty, courses, and attendance.',
    modules: ['Student', 'Faculty', 'Course', 'Attendance'],
    sampleApis: ['POST /api/students', 'POST /api/faculty', 'POST /api/courses'],
    databaseTables: ['students', 'faculty', 'courses', 'attendance'],
    securityRules: ['Role-Based Access (Admin, Faculty, Student)'],
    defaultEntities: [
      {
        name: 'Student',
        tableName: 'students',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'studentId', type: 'String', required: true, unique: true, length: 30 },
          { name: 'firstName', type: 'String', required: true, length: 50 },
          { name: 'lastName', type: 'String', required: true, length: 50 },
          { name: 'email', type: 'String', required: true, unique: true, length: 100 },
          { name: 'enrollmentDate', type: 'LocalDate', required: true }
        ],
        relationships: [
          {
            name: 'courses',
            type: 'MANY_TO_MANY',
            targetEntity: 'Course',
            isOwningSide: true
          }
        ]
      },
      {
        name: 'Faculty',
        tableName: 'faculty',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'employeeId', type: 'String', required: true, unique: true, length: 30 },
          { name: 'fullName', type: 'String', required: true, length: 100 },
          { name: 'department', type: 'String', required: true, length: 50 },
          { name: 'email', type: 'String', required: true, unique: true, length: 100 }
        ]
      },
      {
        name: 'Course',
        tableName: 'courses',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'courseCode', type: 'String', required: true, unique: true, length: 20 },
          { name: 'title', type: 'String', required: true, length: 100 },
          { name: 'credits', type: 'Integer', required: true, min: 1, max: 10 },
          { name: 'description', type: 'String', required: false, length: 500 }
        ],
        relationships: [
          {
            name: 'students',
            type: 'MANY_TO_MANY',
            targetEntity: 'Student',
            mappedBy: 'courses'
          }
        ]
      },
      {
        name: 'Attendance',
        tableName: 'attendance',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'date', type: 'LocalDate', required: true },
          { name: 'status', type: 'String', required: true, length: 20 }
        ],
        relationships: [
          {
            name: 'student',
            type: 'MANY_TO_ONE',
            targetEntity: 'Student',
            required: true
          },
          {
            name: 'course',
            type: 'MANY_TO_ONE',
            targetEntity: 'Course',
            required: true
          }
        ]
      }
    ]
  },

  FINTECH_BANKING: {
    key: 'FINTECH_BANKING',
    name: 'FinTech & Core Banking',
    description: 'Modern banking platform with multi-currency accounts, transactions, transfers, beneficiaries, cards, and immutable audit logs.',
    modules: ['Account', 'Transaction', 'Beneficiary', 'PaymentCard', 'AuditLog'],
    sampleApis: [
      'POST /api/accounts',
      'GET /api/accounts',
      'POST /api/transactions',
      'GET /api/transactions',
      'POST /api/beneficiaries',
      'POST /api/payment-cards',
      'GET /api/audit-logs'
    ],
    databaseTables: ['accounts', 'transactions', 'beneficiaries', 'payment_cards', 'audit_logs'],
    securityRules: ['JWT Authentication', 'PCI-DSS Compliant Encryption', 'Role-Based Access (Customer, Teller, Compliance, Admin)'],
    defaultEntities: [
      {
        name: 'Account',
        tableName: 'accounts',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'accountNumber', type: 'String', required: true, unique: true, length: 34 },
          { name: 'accountType', type: 'String', required: true, length: 30 },
          { name: 'currency', type: 'String', required: true, length: 3 },
          { name: 'balance', type: 'BigDecimal', required: true, precision: 18, scale: 2 },
          { name: 'status', type: 'String', required: true, length: 30 },
          { name: 'dailyLimit', type: 'BigDecimal', required: false, precision: 18, scale: 2 },
          { name: 'active', type: 'Boolean', required: true }
        ],
        relationships: [
          { name: 'transactions', type: 'ONE_TO_MANY', targetEntity: 'Transaction', mappedBy: 'account' },
          { name: 'paymentCards', type: 'ONE_TO_MANY', targetEntity: 'PaymentCard', mappedBy: 'account' }
        ]
      },
      {
        name: 'Transaction',
        tableName: 'transactions',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'referenceCode', type: 'String', required: true, unique: true, length: 64 },
          { name: 'transactionType', type: 'String', required: true, length: 30 },
          { name: 'amount', type: 'BigDecimal', required: true, precision: 18, scale: 2 },
          { name: 'currency', type: 'String', required: true, length: 3 },
          { name: 'status', type: 'String', required: true, length: 30 },
          { name: 'description', type: 'String', required: false, length: 255 },
          { name: 'counterpartyAccount', type: 'String', required: false, length: 50 }
        ],
        relationships: [
          { name: 'account', type: 'MANY_TO_ONE', targetEntity: 'Account', required: true }
        ]
      },
      {
        name: 'Beneficiary',
        tableName: 'beneficiaries',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'fullName', type: 'String', required: true, length: 100 },
          { name: 'routingOrBic', type: 'String', required: true, length: 30 },
          { name: 'accountNumber', type: 'String', required: true, length: 50 },
          { name: 'bankName', type: 'String', required: true, length: 100 },
          { name: 'email', type: 'String', required: false, length: 100 },
          { name: 'verified', type: 'Boolean', required: true }
        ]
      },
      {
        name: 'PaymentCard',
        tableName: 'payment_cards',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'cardNumberMasked', type: 'String', required: true, length: 20 },
          { name: 'cardHolderName', type: 'String', required: true, length: 100 },
          { name: 'cardType', type: 'String', required: true, length: 30 },
          { name: 'expiryMonth', type: 'Integer', required: true, min: 1, max: 12 },
          { name: 'expiryYear', type: 'Integer', required: true, min: 2025, max: 2040 },
          { name: 'status', type: 'String', required: true, length: 30 },
          { name: 'dailyAtmLimit', type: 'BigDecimal', required: false, precision: 12, scale: 2 }
        ],
        relationships: [
          { name: 'account', type: 'MANY_TO_ONE', targetEntity: 'Account', required: true }
        ]
      },
      {
        name: 'AuditLog',
        tableName: 'audit_logs',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'action', type: 'String', required: true, length: 50 },
          { name: 'entityType', type: 'String', required: true, length: 50 },
          { name: 'entityId', type: 'Long', required: true },
          { name: 'performedBy', type: 'String', required: true, length: 100 },
          { name: 'ipAddress', type: 'String', required: false, length: 50 },
          { name: 'details', type: 'String', required: false, length: 500 }
        ]
      }
    ]
  },
  HEALTHTECH_EHR: {
    key: 'HEALTHTECH_EHR',
    name: 'HealthTech & Electronic Health Records',
    description: 'HIPAA-compliant medical workflow platform for patient charts, clinical encounters, appointments, and prescriptions.',
    modules: ['Patient', 'Doctor', 'Appointment', 'MedicalRecord', 'Prescription'],
    sampleApis: [
      'POST /api/patients',
      'GET /api/patients',
      'POST /api/doctors',
      'POST /api/appointments',
      'POST /api/medical-records',
      'POST /api/prescriptions'
    ],
    databaseTables: ['patients', 'doctors', 'appointments', 'medical_records', 'prescriptions'],
    securityRules: ['JWT Authentication', 'HIPAA Privacy Safeguards', 'Role-Based Access (Patient, Nurse, Physician, Medical Admin)'],
    defaultEntities: [
      {
        name: 'Patient',
        tableName: 'patients',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'mrn', type: 'String', required: true, unique: true, length: 50 },
          { name: 'firstName', type: 'String', required: true, length: 60 },
          { name: 'lastName', type: 'String', required: true, length: 60 },
          { name: 'dateOfBirth', type: 'LocalDate', required: true },
          { name: 'gender', type: 'String', required: true, length: 20 },
          { name: 'bloodGroup', type: 'String', required: false, length: 10 },
          { name: 'emergencyContact', type: 'String', required: false, length: 100 },
          { name: 'active', type: 'Boolean', required: true }
        ],
        relationships: [
          { name: 'appointments', type: 'ONE_TO_MANY', targetEntity: 'Appointment', mappedBy: 'patient' },
          { name: 'medicalRecords', type: 'ONE_TO_MANY', targetEntity: 'MedicalRecord', mappedBy: 'patient' },
          { name: 'prescriptions', type: 'ONE_TO_MANY', targetEntity: 'Prescription', mappedBy: 'patient' }
        ]
      },
      {
        name: 'Doctor',
        tableName: 'doctors',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'npiNumber', type: 'String', required: true, unique: true, length: 30 },
          { name: 'fullName', type: 'String', required: true, length: 100 },
          { name: 'specialty', type: 'String', required: true, length: 80 },
          { name: 'licenseNumber', type: 'String', required: true, length: 50 },
          { name: 'consultationFee', type: 'BigDecimal', required: false, precision: 10, scale: 2 },
          { name: 'available', type: 'Boolean', required: true }
        ],
        relationships: [
          { name: 'appointments', type: 'ONE_TO_MANY', targetEntity: 'Appointment', mappedBy: 'doctor' }
        ]
      },
      {
        name: 'Appointment',
        tableName: 'appointments',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'appointmentNumber', type: 'String', required: true, unique: true, length: 50 },
          { name: 'scheduledAt', type: 'LocalDateTime', required: true },
          { name: 'status', type: 'String', required: true, length: 30 },
          { name: 'reasonForVisit', type: 'String', required: false, length: 255 },
          { name: 'roomNumber', type: 'String', required: false, length: 20 }
        ],
        relationships: [
          { name: 'patient', type: 'MANY_TO_ONE', targetEntity: 'Patient', required: true },
          { name: 'doctor', type: 'MANY_TO_ONE', targetEntity: 'Doctor', required: true }
        ]
      },
      {
        name: 'MedicalRecord',
        tableName: 'medical_records',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'recordCode', type: 'String', required: true, unique: true, length: 50 },
          { name: 'diagnosisCode', type: 'String', required: true, length: 50 },
          { name: 'clinicalNotes', type: 'String', required: true, length: 500 },
          { name: 'symptoms', type: 'String', required: false, length: 255 },
          { name: 'vitalSigns', type: 'String', required: false, length: 255 }
        ],
        relationships: [
          { name: 'patient', type: 'MANY_TO_ONE', targetEntity: 'Patient', required: true }
        ]
      },
      {
        name: 'Prescription',
        tableName: 'prescriptions',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'rxNumber', type: 'String', required: true, unique: true, length: 50 },
          { name: 'medicationName', type: 'String', required: true, length: 100 },
          { name: 'dosage', type: 'String', required: true, length: 50 },
          { name: 'frequency', type: 'String', required: true, length: 50 },
          { name: 'refillsAllowed', type: 'Integer', required: true, min: 0 },
          { name: 'dispensed', type: 'Boolean', required: true }
        ],
        relationships: [
          { name: 'patient', type: 'MANY_TO_ONE', targetEntity: 'Patient', required: true }
        ]
      }
    ]
  },
  PROPTECH_REALESTATE: {
    key: 'PROPTECH_REALESTATE',
    name: 'PropTech & Real Estate',
    description: 'Property marketplace engine with listings, real estate agents, viewing tours, buyer offers, and contracts.',
    modules: ['Property', 'Agent', 'PropertyListing', 'ViewingAppointment', 'PropertyOffer'],
    sampleApis: [
      'POST /api/properties',
      'GET /api/properties',
      'POST /api/agents',
      'POST /api/property-listings',
      'POST /api/viewing-appointments',
      'POST /api/property-offers'
    ],
    databaseTables: ['properties', 'agents', 'property_listings', 'viewing_appointments', 'property_offers'],
    securityRules: ['JWT Authentication', 'Role-Based Access (Buyer, Agent, Agency Admin)'],
    defaultEntities: [
      {
        name: 'Property',
        tableName: 'properties',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'propertyCode', type: 'String', required: true, unique: true, length: 50 },
          { name: 'title', type: 'String', required: true, length: 150 },
          { name: 'address', type: 'String', required: true, length: 255 },
          { name: 'city', type: 'String', required: true, length: 80 },
          { name: 'propertyType', type: 'String', required: true, length: 50 },
          { name: 'bedrooms', type: 'Integer', required: false, min: 0 },
          { name: 'bathrooms', type: 'Double', required: false, min: 0 },
          { name: 'squareFootage', type: 'Integer', required: false, min: 0 },
          { name: 'yearBuilt', type: 'Integer', required: false }
        ],
        relationships: [
          { name: 'listings', type: 'ONE_TO_MANY', targetEntity: 'PropertyListing', mappedBy: 'property' }
        ]
      },
      {
        name: 'Agent',
        tableName: 'agents',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'licenseNumber', type: 'String', required: true, unique: true, length: 50 },
          { name: 'fullName', type: 'String', required: true, length: 100 },
          { name: 'email', type: 'String', required: true, unique: true, length: 100 },
          { name: 'phone', type: 'String', required: true, length: 25 },
          { name: 'agencyName', type: 'String', required: false, length: 100 },
          { name: 'commissionRate', type: 'Double', required: false, min: 0 }
        ],
        relationships: [
          { name: 'listings', type: 'ONE_TO_MANY', targetEntity: 'PropertyListing', mappedBy: 'agent' }
        ]
      },
      {
        name: 'PropertyListing',
        tableName: 'property_listings',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'listingNumber', type: 'String', required: true, unique: true, length: 50 },
          { name: 'listingType', type: 'String', required: true, length: 30 },
          { name: 'listingPrice', type: 'BigDecimal', required: true, precision: 14, scale: 2 },
          { name: 'status', type: 'String', required: true, length: 30 },
          { name: 'featured', type: 'Boolean', required: true }
        ],
        relationships: [
          { name: 'property', type: 'MANY_TO_ONE', targetEntity: 'Property', required: true },
          { name: 'agent', type: 'MANY_TO_ONE', targetEntity: 'Agent', required: true },
          { name: 'offers', type: 'ONE_TO_MANY', targetEntity: 'PropertyOffer', mappedBy: 'propertyListing' }
        ]
      },
      {
        name: 'ViewingAppointment',
        tableName: 'viewing_appointments',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'visitorName', type: 'String', required: true, length: 100 },
          { name: 'visitorPhone', type: 'String', required: true, length: 25 },
          { name: 'scheduledTime', type: 'LocalDateTime', required: true },
          { name: 'feedbackNotes', type: 'String', required: false, length: 255 },
          { name: 'status', type: 'String', required: true, length: 30 }
        ],
        relationships: [
          { name: 'property', type: 'MANY_TO_ONE', targetEntity: 'Property', required: true }
        ]
      },
      {
        name: 'PropertyOffer',
        tableName: 'property_offers',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'offerReference', type: 'String', required: true, unique: true, length: 50 },
          { name: 'buyerName', type: 'String', required: true, length: 100 },
          { name: 'buyerEmail', type: 'String', required: true, length: 100 },
          { name: 'offerAmount', type: 'BigDecimal', required: true, precision: 14, scale: 2 },
          { name: 'financingApproved', type: 'Boolean', required: true },
          { name: 'status', type: 'String', required: true, length: 30 }
        ],
        relationships: [
          { name: 'propertyListing', type: 'MANY_TO_ONE', targetEntity: 'PropertyListing', required: true }
        ]
      }
    ]
  },
  LOGISTICS_SUPPLY_CHAIN: {
    key: 'LOGISTICS_SUPPLY_CHAIN',
    name: 'Logistics & Supply Chain',
    description: 'Freight tracking, warehouse operations, shipment dispatching, vehicle fleet, and carrier networks.',
    modules: ['Shipment', 'Warehouse', 'Carrier', 'TrackingEvent', 'FleetVehicle'],
    sampleApis: [
      'POST /api/shipments',
      'GET /api/shipments',
      'POST /api/warehouses',
      'POST /api/carriers',
      'POST /api/tracking-events',
      'POST /api/fleet-vehicles'
    ],
    databaseTables: ['shipments', 'warehouses', 'carriers', 'tracking_events', 'fleet_vehicles'],
    securityRules: ['JWT Authentication', 'Role-Based Access (Driver, Dispatcher, Warehouse Manager, Ops Admin)'],
    defaultEntities: [
      {
        name: 'Shipment',
        tableName: 'shipments',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'trackingNumber', type: 'String', required: true, unique: true, length: 50 },
          { name: 'originAddress', type: 'String', required: true, length: 255 },
          { name: 'destinationAddress', type: 'String', required: true, length: 255 },
          { name: 'weightKg', type: 'Double', required: true, min: 0 },
          { name: 'freightCost', type: 'BigDecimal', required: true, precision: 12, scale: 2 },
          { name: 'status', type: 'String', required: true, length: 30 }
        ],
        relationships: [
          { name: 'carrier', type: 'MANY_TO_ONE', targetEntity: 'Carrier', required: false },
          { name: 'trackingEvents', type: 'ONE_TO_MANY', targetEntity: 'TrackingEvent', mappedBy: 'shipment' }
        ]
      },
      {
        name: 'Warehouse',
        tableName: 'warehouses',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'warehouseCode', type: 'String', required: true, unique: true, length: 30 },
          { name: 'facilityName', type: 'String', required: true, length: 100 },
          { name: 'city', type: 'String', required: true, length: 80 },
          { name: 'capacitySqFt', type: 'Integer', required: true, min: 100 },
          { name: 'operationalStatus', type: 'String', required: true, length: 30 }
        ]
      },
      {
        name: 'Carrier',
        tableName: 'carriers',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'dotNumber', type: 'String', required: true, unique: true, length: 30 },
          { name: 'carrierName', type: 'String', required: true, length: 100 },
          { name: 'contactEmail', type: 'String', required: true, length: 100 },
          { name: 'fleetSize', type: 'Integer', required: false, min: 1 },
          { name: 'rating', type: 'Double', required: false, min: 0, max: 5 },
          { name: 'active', type: 'Boolean', required: true }
        ],
        relationships: [
          { name: 'shipments', type: 'ONE_TO_MANY', targetEntity: 'Shipment', mappedBy: 'carrier' }
        ]
      },
      {
        name: 'TrackingEvent',
        tableName: 'tracking_events',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'eventCode', type: 'String', required: true, length: 30 },
          { name: 'checkpointLocation', type: 'String', required: true, length: 120 },
          { name: 'eventTimestamp', type: 'LocalDateTime', required: true },
          { name: 'eventDescription', type: 'String', required: true, length: 255 }
        ],
        relationships: [
          { name: 'shipment', type: 'MANY_TO_ONE', targetEntity: 'Shipment', required: true }
        ]
      },
      {
        name: 'FleetVehicle',
        tableName: 'fleet_vehicles',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'vinNumber', type: 'String', required: true, unique: true, length: 40 },
          { name: 'licensePlate', type: 'String', required: true, unique: true, length: 20 },
          { name: 'model', type: 'String', required: true, length: 80 },
          { name: 'mileageKm', type: 'Integer', required: true, min: 0 },
          { name: 'inService', type: 'Boolean', required: true }
        ]
      }
    ]
  },
  SOCIAL_COMMUNITY: {
    key: 'SOCIAL_COMMUNITY',
    name: 'Social Network & Community',
    description: 'Community platform with user posts, comments, community groups, follow relationships, and activity feeds.',
    modules: ['UserPost', 'PostComment', 'CommunityGroup', 'Follower', 'ActivityFeed'],
    sampleApis: [
      'POST /api/user-posts',
      'GET /api/user-posts',
      'POST /api/post-comments',
      'POST /api/community-groups',
      'POST /api/followers',
      'GET /api/activity-feeds'
    ],
    databaseTables: ['user_posts', 'post_comments', 'community_groups', 'followers', 'activity_feeds'],
    securityRules: ['JWT Authentication', 'Role-Based Access (Member, Moderator, Admin)'],
    defaultEntities: [
      {
        name: 'CommunityGroup',
        tableName: 'community_groups',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'slug', type: 'String', required: true, unique: true, length: 60 },
          { name: 'title', type: 'String', required: true, length: 100 },
          { name: 'description', type: 'String', required: false, length: 500 },
          { name: 'isPrivate', type: 'Boolean', required: true },
          { name: 'memberCount', type: 'Integer', required: true, min: 0 }
        ],
        relationships: [
          { name: 'posts', type: 'ONE_TO_MANY', targetEntity: 'UserPost', mappedBy: 'group' }
        ]
      },
      {
        name: 'UserPost',
        tableName: 'user_posts',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'postTitle', type: 'String', required: true, length: 150 },
          { name: 'contentBody', type: 'String', required: true, length: 500 },
          { name: 'authorUsername', type: 'String', required: true, length: 50 },
          { name: 'likeCount', type: 'Integer', required: true, min: 0 },
          { name: 'viewCount', type: 'Integer', required: true, min: 0 },
          { name: 'published', type: 'Boolean', required: true }
        ],
        relationships: [
          { name: 'group', type: 'MANY_TO_ONE', targetEntity: 'CommunityGroup', required: false },
          { name: 'comments', type: 'ONE_TO_MANY', targetEntity: 'PostComment', mappedBy: 'post' }
        ]
      },
      {
        name: 'PostComment',
        tableName: 'post_comments',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'authorUsername', type: 'String', required: true, length: 50 },
          { name: 'commentText', type: 'String', required: true, length: 500 },
          { name: 'upvotes', type: 'Integer', required: true, min: 0 },
          { name: 'flagCount', type: 'Integer', required: true, min: 0 }
        ],
        relationships: [
          { name: 'post', type: 'MANY_TO_ONE', targetEntity: 'UserPost', required: true }
        ]
      },
      {
        name: 'Follower',
        tableName: 'followers',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'followerUsername', type: 'String', required: true, length: 50 },
          { name: 'followedUsername', type: 'String', required: true, length: 50 },
          { name: 'followedAt', type: 'LocalDateTime', required: true },
          { name: 'notificationsMuted', type: 'Boolean', required: true }
        ]
      },
      {
        name: 'ActivityFeed',
        tableName: 'activity_feeds',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'actorUsername', type: 'String', required: true, length: 50 },
          { name: 'activityType', type: 'String', required: true, length: 40 },
          { name: 'targetResourceId', type: 'String', required: true, length: 60 },
          { name: 'summary', type: 'String', required: true, length: 255 }
        ]
      }
    ]
  },
  PROJECT_MANAGEMENT_SAAS: {
    key: 'PROJECT_MANAGEMENT_SAAS',
    name: 'Project Management & Issue Tracker SaaS',
    description: 'Workspaces, agile sprint milestones, project tasks, team discussions, and developer assignments.',
    modules: ['Workspace', 'ProjectTask', 'ProjectMilestone', 'TaskComment', 'TeamMember'],
    sampleApis: [
      'POST /api/workspaces',
      'GET /api/workspaces',
      'POST /api/project-tasks',
      'POST /api/project-milestones',
      'POST /api/task-comments',
      'POST /api/team-members'
    ],
    databaseTables: ['workspaces', 'project_tasks', 'project_milestones', 'task_comments', 'team_members'],
    securityRules: ['JWT Authentication', 'Multi-Tenant Workspace Isolation', 'Role-Based Access (Guest, Member, Lead, Admin)'],
    defaultEntities: [
      {
        name: 'Workspace',
        tableName: 'workspaces',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'workspaceSlug', type: 'String', required: true, unique: true, length: 50 },
          { name: 'name', type: 'String', required: true, length: 100 },
          { name: 'planTier', type: 'String', required: true, length: 30 },
          { name: 'seatsUsed', type: 'Integer', required: true, min: 1 },
          { name: 'active', type: 'Boolean', required: true }
        ],
        relationships: [
          { name: 'tasks', type: 'ONE_TO_MANY', targetEntity: 'ProjectTask', mappedBy: 'workspace' },
          { name: 'milestones', type: 'ONE_TO_MANY', targetEntity: 'ProjectMilestone', mappedBy: 'workspace' }
        ]
      },
      {
        name: 'ProjectMilestone',
        tableName: 'project_milestones',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'title', type: 'String', required: true, length: 100 },
          { name: 'targetDate', type: 'LocalDate', required: true },
          { name: 'completed', type: 'Boolean', required: true }
        ],
        relationships: [
          { name: 'workspace', type: 'MANY_TO_ONE', targetEntity: 'Workspace', required: true },
          { name: 'tasks', type: 'ONE_TO_MANY', targetEntity: 'ProjectTask', mappedBy: 'milestone' }
        ]
      },
      {
        name: 'ProjectTask',
        tableName: 'project_tasks',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'taskKey', type: 'String', required: true, unique: true, length: 30 },
          { name: 'title', type: 'String', required: true, length: 150 },
          { name: 'description', type: 'String', required: false, length: 500 },
          { name: 'priority', type: 'String', required: true, length: 20 },
          { name: 'status', type: 'String', required: true, length: 30 },
          { name: 'estimatePoints', type: 'Integer', required: false, min: 0 }
        ],
        relationships: [
          { name: 'workspace', type: 'MANY_TO_ONE', targetEntity: 'Workspace', required: true },
          { name: 'milestone', type: 'MANY_TO_ONE', targetEntity: 'ProjectMilestone', required: false },
          { name: 'comments', type: 'ONE_TO_MANY', targetEntity: 'TaskComment', mappedBy: 'task' }
        ]
      },
      {
        name: 'TaskComment',
        tableName: 'task_comments',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'authorName', type: 'String', required: true, length: 80 },
          { name: 'commentContent', type: 'String', required: true, length: 500 }
        ],
        relationships: [
          { name: 'task', type: 'MANY_TO_ONE', targetEntity: 'ProjectTask', required: true }
        ]
      },
      {
        name: 'TeamMember',
        tableName: 'team_members',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'email', type: 'String', required: true, unique: true, length: 100 },
          { name: 'displayName', type: 'String', required: true, length: 100 },
          { name: 'role', type: 'String', required: true, length: 30 },
          { name: 'department', type: 'String', required: false, length: 60 }
        ]
      }
    ]
  },
  CRM_SALES: {
    key: 'CRM_SALES',
    name: 'CRM & Sales Pipeline',
    description: 'B2B enterprise CRM with accounts, leads, deals pipeline stages, activities, and contact relationships.',
    modules: ['Lead', 'Contact', 'Deal', 'SalesActivity', 'AccountOrganization'],
    sampleApis: [
      'POST /api/leads',
      'GET /api/leads',
      'POST /api/contacts',
      'POST /api/deals',
      'POST /api/sales-activities',
      'POST /api/account-organizations'
    ],
    databaseTables: ['leads', 'contacts', 'deals', 'sales_activities', 'account_organizations'],
    securityRules: ['JWT Authentication', 'Role-Based Access (Sales Rep, Account Exec, Sales Manager, Admin)'],
    defaultEntities: [
      {
        name: 'AccountOrganization',
        tableName: 'account_organizations',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'orgName', type: 'String', required: true, length: 100 },
          { name: 'domain', type: 'String', required: true, unique: true, length: 100 },
          { name: 'industry', type: 'String', required: true, length: 50 },
          { name: 'annualRevenue', type: 'BigDecimal', required: false, precision: 15, scale: 2 },
          { name: 'employeeCount', type: 'Integer', required: false, min: 1 }
        ],
        relationships: [
          { name: 'contacts', type: 'ONE_TO_MANY', targetEntity: 'Contact', mappedBy: 'organization' },
          { name: 'deals', type: 'ONE_TO_MANY', targetEntity: 'Deal', mappedBy: 'organization' }
        ]
      },
      {
        name: 'Lead',
        tableName: 'leads',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'firstName', type: 'String', required: true, length: 60 },
          { name: 'lastName', type: 'String', required: true, length: 60 },
          { name: 'email', type: 'String', required: true, length: 100 },
          { name: 'company', type: 'String', required: false, length: 100 },
          { name: 'leadSource', type: 'String', required: true, length: 50 },
          { name: 'leadScore', type: 'Integer', required: false, min: 0, max: 100 },
          { name: 'status', type: 'String', required: true, length: 30 }
        ]
      },
      {
        name: 'Contact',
        tableName: 'contacts',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'firstName', type: 'String', required: true, length: 60 },
          { name: 'lastName', type: 'String', required: true, length: 60 },
          { name: 'email', type: 'String', required: true, unique: true, length: 100 },
          { name: 'phone', type: 'String', required: false, length: 25 },
          { name: 'jobTitle', type: 'String', required: false, length: 60 }
        ],
        relationships: [
          { name: 'organization', type: 'MANY_TO_ONE', targetEntity: 'AccountOrganization', required: false }
        ]
      },
      {
        name: 'Deal',
        tableName: 'deals',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'dealTitle', type: 'String', required: true, length: 120 },
          { name: 'dealValue', type: 'BigDecimal', required: true, precision: 14, scale: 2 },
          { name: 'pipelineStage', type: 'String', required: true, length: 40 },
          { name: 'probabilityPercent', type: 'Integer', required: true, min: 0, max: 100 },
          { name: 'expectedCloseDate', type: 'LocalDate', required: false }
        ],
        relationships: [
          { name: 'organization', type: 'MANY_TO_ONE', targetEntity: 'AccountOrganization', required: false },
          { name: 'activities', type: 'ONE_TO_MANY', targetEntity: 'SalesActivity', mappedBy: 'deal' }
        ]
      },
      {
        name: 'SalesActivity',
        tableName: 'sales_activities',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'activityType', type: 'String', required: true, length: 30 },
          { name: 'subject', type: 'String', required: true, length: 150 },
          { name: 'activityDate', type: 'LocalDateTime', required: true },
          { name: 'outcome', type: 'String', required: false, length: 255 }
        ],
        relationships: [
          { name: 'deal', type: 'MANY_TO_ONE', targetEntity: 'Deal', required: false }
        ]
      }
    ]
  },
  HRTECH_TALENT: {
    key: 'HRTECH_TALENT',
    name: 'HRTech & Talent Management',
    description: 'Human resources information system (HRIS) covering employees, departments, job openings, applications, and leaves.',
    modules: ['Employee', 'Department', 'JobOpening', 'CandidateApplication', 'LeaveRequest'],
    sampleApis: [
      'POST /api/employees',
      'GET /api/employees',
      'POST /api/departments',
      'POST /api/job-openings',
      'POST /api/candidate-applications',
      'POST /api/leave-requests'
    ],
    databaseTables: ['employees', 'departments', 'job_openings', 'candidate_applications', 'leave_requests'],
    securityRules: ['JWT Authentication', 'Role-Based Access (Employee, Recruiter, HR Manager, Admin)'],
    defaultEntities: [
      {
        name: 'Department',
        tableName: 'departments',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'code', type: 'String', required: true, unique: true, length: 20 },
          { name: 'name', type: 'String', required: true, length: 80 },
          { name: 'costCenter', type: 'String', required: true, length: 30 },
          { name: 'budget', type: 'BigDecimal', required: false, precision: 14, scale: 2 }
        ],
        relationships: [
          { name: 'employees', type: 'ONE_TO_MANY', targetEntity: 'Employee', mappedBy: 'department' }
        ]
      },
      {
        name: 'Employee',
        tableName: 'employees',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'employeeNumber', type: 'String', required: true, unique: true, length: 30 },
          { name: 'firstName', type: 'String', required: true, length: 60 },
          { name: 'lastName', type: 'String', required: true, length: 60 },
          { name: 'workEmail', type: 'String', required: true, unique: true, length: 100 },
          { name: 'jobTitle', type: 'String', required: true, length: 80 },
          { name: 'hireDate', type: 'LocalDate', required: true },
          { name: 'salary', type: 'BigDecimal', required: false, precision: 12, scale: 2 },
          { name: 'employmentStatus', type: 'String', required: true, length: 30 }
        ],
        relationships: [
          { name: 'department', type: 'MANY_TO_ONE', targetEntity: 'Department', required: true },
          { name: 'leaveRequests', type: 'ONE_TO_MANY', targetEntity: 'LeaveRequest', mappedBy: 'employee' }
        ]
      },
      {
        name: 'JobOpening',
        tableName: 'job_openings',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'requisitionCode', type: 'String', required: true, unique: true, length: 30 },
          { name: 'positionTitle', type: 'String', required: true, length: 100 },
          { name: 'departmentName', type: 'String', required: true, length: 80 },
          { name: 'minYearsExperience', type: 'Integer', required: false, min: 0 },
          { name: 'remoteAllowed', type: 'Boolean', required: true },
          { name: 'openPositions', type: 'Integer', required: true, min: 1 },
          { name: 'status', type: 'String', required: true, length: 30 }
        ],
        relationships: [
          { name: 'applications', type: 'ONE_TO_MANY', targetEntity: 'CandidateApplication', mappedBy: 'jobOpening' }
        ]
      },
      {
        name: 'CandidateApplication',
        tableName: 'candidate_applications',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'candidateName', type: 'String', required: true, length: 100 },
          { name: 'candidateEmail', type: 'String', required: true, length: 100 },
          { name: 'resumeUrl', type: 'String', required: true, length: 255 },
          { name: 'currentStage', type: 'String', required: true, length: 40 },
          { name: 'appliedAt', type: 'LocalDateTime', required: true }
        ],
        relationships: [
          { name: 'jobOpening', type: 'MANY_TO_ONE', targetEntity: 'JobOpening', required: true }
        ]
      },
      {
        name: 'LeaveRequest',
        tableName: 'leave_requests',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'leaveType', type: 'String', required: true, length: 30 },
          { name: 'startDate', type: 'LocalDate', required: true },
          { name: 'endDate', type: 'LocalDate', required: true },
          { name: 'reason', type: 'String', required: false, length: 255 },
          { name: 'approvalStatus', type: 'String', required: true, length: 30 }
        ],
        relationships: [
          { name: 'employee', type: 'MANY_TO_ONE', targetEntity: 'Employee', required: true }
        ]
      }
    ]
  },
  CUSTOM: {
    key: 'CUSTOM',
    name: 'Custom Backend',
    description: 'Clean starter backend architecture for building custom domain services and APIs.',
    modules: ['User'],
    sampleApis: ['POST /api/users', 'GET /api/users'],
    databaseTables: ['users'],
    securityRules: ['Basic Security'],
    defaultEntities: [
      {
        name: 'User',
        tableName: 'users',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'username', type: 'String', required: true, unique: true, length: 50 },
          { name: 'email', type: 'String', required: true, unique: true, length: 100 },
          { name: 'fullName', type: 'String', required: true, length: 100 },
          { name: 'active', type: 'Boolean', required: true }
        ]
      }
    ]
  }
};

/**
 * Normalizes input key to handle legacy discrepancies:
 * - `EDUCATION` (from createProject.jsp)
 * - `EDUCATION_SYSTEM` (from TemplateEngine.java)
 * - `EDUCATION_ERP` (from templates.json)
 */
export function resolveTemplateKey(key: string): string {
  const normalized = key ? key.trim().toUpperCase() : 'CUSTOM';
  if (normalized === 'EDUCATION' || normalized === 'EDUCATION_SYSTEM' || normalized === 'EDUCATION_ERP' || normalized === 'EDTECH') {
    return 'EDUCATION_ERP';
  }
  if (normalized === 'FINTECH' || normalized === 'BANKING' || normalized === 'FINTECH_BANKING') {
    return 'FINTECH_BANKING';
  }
  if (normalized === 'HEALTHCARE' || normalized === 'HEALTHTECH' || normalized === 'EHR' || normalized === 'HEALTHTECH_EHR') {
    return 'HEALTHTECH_EHR';
  }
  if (normalized === 'REALESTATE' || normalized === 'PROPTECH' || normalized === 'PROPTECH_REALESTATE') {
    return 'PROPTECH_REALESTATE';
  }
  if (normalized === 'LOGISTICS' || normalized === 'SUPPLY_CHAIN' || normalized === 'LOGISTICS_SUPPLY_CHAIN') {
    return 'LOGISTICS_SUPPLY_CHAIN';
  }
  if (normalized === 'SOCIAL' || normalized === 'COMMUNITY' || normalized === 'SOCIAL_COMMUNITY') {
    return 'SOCIAL_COMMUNITY';
  }
  if (normalized === 'PROJECT_MANAGEMENT' || normalized === 'PROJECT_MANAGEMENT_SAAS' || normalized === 'TASK_MANAGEMENT') {
    return 'PROJECT_MANAGEMENT_SAAS';
  }
  if (normalized === 'CRM' || normalized === 'SALES' || normalized === 'CRM_SALES') {
    return 'CRM_SALES';
  }
  if (normalized === 'HR' || normalized === 'HRTECH' || normalized === 'TALENT' || normalized === 'HRTECH_TALENT') {
    return 'HRTECH_TALENT';
  }
  if (normalized === 'FOOD' || normalized === 'FOODTECH' || normalized === 'FOOD_DELIVERY') {
    return 'FOOD_DELIVERY';
  }
  if (DOMAIN_TEMPLATES[normalized]) {
    return normalized;
  }
  return 'CUSTOM';
}

export function getDomainTemplate(key: string): DomainTemplate {
  const resolvedKey = resolveTemplateKey(key);
  return DOMAIN_TEMPLATES[resolvedKey] || DOMAIN_TEMPLATES.CUSTOM;
}

export function createProjectConfigFromTemplate(
  templateKey: string,
  overrides?: Partial<ProjectConfig>
): ProjectConfig {
  const template = getDomainTemplate(templateKey);
  const baseName = overrides?.projectName || `${template.key.toLowerCase().replace(/_/g, '-')}-backend`;
  const sanitizedArtifactId = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const sanitizedPackageSuffix = sanitizedArtifactId.replace(/[-_]/g, '');

  return {
    projectName: baseName,
    groupId: overrides?.groupId || 'com.example',
    artifactId: overrides?.artifactId || sanitizedArtifactId,
    packageName: overrides?.packageName || `com.example.${sanitizedPackageSuffix}`,
    description: overrides?.description || template.description,
    javaVersion: overrides?.javaVersion || '17',
    springBootVersion: overrides?.springBootVersion || '3.3.0',
    database: overrides?.database || 'postgresql',
    entities: overrides?.entities || JSON.parse(JSON.stringify(template.defaultEntities)),
    security: overrides?.security,
    startup: overrides?.startup,
    options: {
      enableDtos: true,
      enableValidation: true,
      enableGlobalExceptionHandler: true,
      serverPort: 8080,
      ...overrides?.options
    }
  };
}
