const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Express backend with authentication and role-based access control',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login',
        },
      },
      schemas: {
        // Auth Schemas
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'john_doe',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'password', 'role'],
          properties: {
            username: {
              type: 'string',
              example: 'john_doe',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
            role: {
              type: 'string',
              enum: ['OWNER', 'MANAGER', 'WORKER', 'CLIENT', 'ADMIN'],
              example: 'WORKER',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  example: '550e8400-e29b-41d4-a716-446655440000',
                },
                username: {
                  type: 'string',
                  example: 'john_doe',
                },
                role: {
                  type: 'string',
                  example: 'ADMIN',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            username: {
              type: 'string',
              example: 'john_doe',
            },
            role: {
              type: 'string',
              enum: ['OWNER', 'MANAGER', 'WORKER', 'CLIENT', 'ADMIN'],
              example: 'ADMIN',
            },
          },
        },

        // Task Schemas
        CreateTaskRequest: {
          type: 'object',
          required: ['title', 'assigned_to'],
          properties: {
            title: {
              type: 'string',
              example: 'Complete project documentation',
            },
            description: {
              type: 'string',
              example: 'Write comprehensive documentation for the new feature',
            },
            assigned_to: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440001',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '660e8400-e29b-41d4-a716-446655440000',
            },
            title: {
              type: 'string',
              example: 'Complete project documentation',
            },
            description: {
              type: 'string',
              example: 'Write comprehensive documentation',
            },
            assigned_to: {
              type: 'string',
              format: 'uuid',
            },
            assigned_by: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
              example: 'PENDING',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        UpdateTaskStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
              example: 'IN_PROGRESS',
            },
          },
        },
        TaskSearchResponse: {
          type: 'object',
          properties: {
            tasks: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Task',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1,
                },
                limit: {
                  type: 'integer',
                  example: 10,
                },
                total: {
                  type: 'integer',
                  example: 50,
                },
                totalPages: {
                  type: 'integer',
                  example: 5,
                },
              },
            },
          },
        },

        // Request Schemas
        CreateRequestRequest: {
          type: 'object',
          required: ['type', 'title'],
          properties: {
            type: {
              type: 'string',
              enum: ['TASK', 'PURCHASE', 'LEAVE', 'VACATION', 'EXPENSE', 'OTHER'],
              example: 'PURCHASE',
            },
            title: {
              type: 'string',
              example: 'New laptop request',
            },
            description: {
              type: 'string',
              example: 'Need a MacBook Pro for development work',
            },
            metadata: {
              type: 'object',
              example: {
                amount: 2500,
                department: 'Engineering',
              },
            },
          },
        },
        Request: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '770e8400-e29b-41d4-a716-446655440000',
            },
            type: {
              type: 'string',
              enum: ['TASK', 'PURCHASE', 'LEAVE', 'VACATION', 'EXPENSE', 'OTHER'],
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            requested_by: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
            },
            metadata: {
              type: 'object',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ApproveRequest: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['APPROVED'],
            },
          },
        },
        RejectRequest: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: {
              type: 'string',
              example: 'Budget constraints for this quarter',
            },
          },
        },

        // Audit Schemas
        AuditLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            entity_type: {
              type: 'string',
              example: 'task',
            },
            entity_id: {
              type: 'string',
              format: 'uuid',
            },
            action: {
              type: 'string',
              example: 'CREATED',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
            },
            user_username: {
              type: 'string',
            },
            details: {
              type: 'object',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // Error Schemas
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message here',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Missing required fields: title and assigned_to are required',
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Unauthorized - Invalid or missing authentication token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Unauthorized',
              },
            },
          },
        },
        Forbidden: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Forbidden',
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Resource not found',
              },
            },
          },
        },
        BadRequest: {
          description: 'Bad request - Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Internal server error',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints',
      },
      {
        name: 'Requests',
        description: 'Request/Approval management endpoints',
      },
      {
        name: 'Audit',
        description: 'Audit log endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
