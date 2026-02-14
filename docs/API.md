# API Documentation

## Base URL
```
Production: https://api.fluxforge.ai
Development: http://localhost:3000
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <token>
```

Or use API Key authentication:

```http
X-API-Key: ffx_your_api_key_here
```

## Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_123",
  "fullName": "John Doe",
  "organizationName": "Acme Inc" // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "customer"
  },
  "organization": {
    "id": "uuid",
    "name": "Acme Inc",
    "slug": "acme-inc-abc123"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... },
  "organization": { ... },
  "subscription": {
    "tier": "free",
    "status": "active"
  },
  "token": "jwt_token_here"
}
```

---

### Projects

#### GET /api/projects
List all projects for the authenticated user's organization.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "projects": [
    {
      "id": "uuid",
      "name": "My SaaS App",
      "slug": "my-saas-app-xyz",
      "description": "Customer management system",
      "status": "active",
      "deploymentUrl": "https://my-app.com",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-20T00:00:00Z"
    }
  ]
}
```

#### POST /api/projects
Create a new project.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My New Project",
  "description": "Project description",
  "config": {
    "theme": "dark",
    "features": ["auth", "payments"]
  },
  "aiSettings": {
    "model": "llama3.2",
    "temperature": 0.7
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "My New Project",
    "slug": "my-new-project-abc",
    "status": "draft",
    "createdAt": "2026-01-25T00:00:00Z"
  }
}
```

---

### AI Chat

#### POST /api/ai/chat
Send a prompt to the AI and get a completion.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "Generate a user authentication flow",
  "projectId": "uuid", // optional
  "context": {
    "industry": "fintech",
    "userRole": "developer"
  },
  "stream": false // set to true for streaming
}
```

**Response (200):**
```json
{
  "success": true,
  "response": "Here's a secure authentication flow...",
  "usage": {
    "promptTokens": 25,
    "completionTokens": 150,
    "totalTokens": 175
  },
  "metadata": {
    "model": "llama3.2",
    "provider": "ollama"
  }
}
```

**Streaming Response:**
When `stream: true`, returns Server-Sent Events (SSE):

```
data: {"chunk": "Here's"}
data: {"chunk": " a"}
data: {"chunk": " secure"}
...
data: [DONE]
```

---

### Webhooks

#### POST /api/webhooks/stripe
Receive Stripe webhook events (signature verification required).

**Headers:**
```http
Stripe-Signature: t=timestamp,v1=signature
Content-Type: application/json
```

**Supported Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `checkout.session.completed`

**Response (200):**
```json
{
  "received": true,
  "eventId": "uuid"
}
```

#### POST /api/webhooks/flutterwave
Receive Flutterwave webhook events.

**Headers:**
```http
Verif-Hash: your_secret_hash
Content-Type: application/json
```

**Supported Events:**
- `charge.completed`
- `charge.failed`
- `transfer.completed`

#### POST /api/webhooks/mercury
Receive Mercury banking webhook events.

**Headers:**
```http
Mercury-Signature: hmac_signature
Content-Type: application/json
```

**Supported Events:**
- `transaction.updated`
- `account.updated`

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // optional
}
```

### Common Error Codes
- `AUTH_REQUIRED` (401) - Authentication required
- `INVALID_CREDENTIALS` (401) - Invalid email/password
- `INSUFFICIENT_PERMISSIONS` (403) - User lacks required permissions
- `RESOURCE_NOT_FOUND` (404) - Resource doesn't exist
- `VALIDATION_ERROR` (400) - Request validation failed
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

---

## Rate Limits

- **Free Tier**: 100 requests / 15 minutes
- **Starter**: 1,000 requests / 15 minutes
- **Pro**: 10,000 requests / 15 minutes
- **Enterprise**: Unlimited

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1643673600
```

---

## Webhooks (Outgoing)

Configure webhook URLs in your project settings to receive events:

**Event Types:**
- `project.created`
- `project.updated`
- `ai.request.completed`
- `payment.succeeded`
- `payment.failed`

**Webhook Payload:**
```json
{
  "id": "evt_uuid",
  "type": "project.created",
  "timestamp": "2026-01-25T00:00:00Z",
  "data": {
    "project": { ... }
  }
}
```

**Headers Sent:**
```http
X-FluxForge-Signature: hmac_sha256_signature
X-FluxForge-Event: project.created
Content-Type: application/json
```

**Signature Verification:**
```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import FluxForge from '@fluxforge/sdk';

const client = new FluxForge({
  apiKey: 'ffx_your_api_key'
});

// Create project
const project = await client.projects.create({
  name: 'My App',
  description: 'My awesome SaaS'
});

// AI completion
const response = await client.ai.chat({
  prompt: 'Generate landing page copy',
  projectId: project.id
});
```

### Python
```python
from fluxforge import FluxForge

client = FluxForge(api_key='ffx_your_api_key')

# Create project
project = client.projects.create(
    name='My App',
    description='My awesome SaaS'
)

# AI completion
response = client.ai.chat(
    prompt='Generate landing page copy',
    project_id=project.id
)
```

### cURL
```bash
curl -X POST https://api.fluxforge.ai/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Generate authentication code",
    "context": { "language": "typescript" }
  }'
```

---

## Support

For API support:
- Email: api@fluxforge.ai
- Discord: https://discord.gg/fluxforge
- Documentation: https://docs.fluxforge.ai
