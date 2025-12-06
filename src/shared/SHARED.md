# Shared Guide — Type-Safe API Contracts

This guide explains how to define shared types, request/response contracts, and domain models that work seamlessly between your client and server.

## What You'll Learn

- 📦 **Domain entities** — Core business models (Product, Progress, User)
- 📋 **Request/Response contracts** — Standardized API input/output shapes
- 🏷️ **Enums** — Type-safe constants (e.g., ProgressStatus)
- 🔐 **Type safety** — Ensure client and server agree on API contracts
- 🎯 **Single source of truth** — Define types once, use everywhere

## Directory Structure

```
src/shared/
├── entities/
│   └── product.entity.ts       # Domain models (Product, Progress, User)
├── enums/
│   └── product.enum.ts         # Constants (ProgressStatus)
├── requests/
│   └── product.request.ts       # API request shapes
├── responses/
│   └── product.response.ts      # API response shapes
├── api.ts                       # Main re-export (public API)
├── api.legacy.ts               # Backwards compatibility
└── index.ts                     # Barrel export
```

**Key concept:** Each file handles one concern — entities, enums, requests, and responses are kept separate for clarity and maintainability.

## Core Concepts

### Entities — Your Domain Models

Entities represent the core business objects in your application:

```typescript
// src/shared/entities/product.entity.ts
export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface Progress {
  id: number;
  productId: number;
  percentage: number;
  status: ProgressStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}
```

**Entities represent:**
- ✅ Core business objects that persist in your store/database
- ✅ Objects that have a stable identity (an `id`)
- ✅ Data that can be created, read, updated, deleted
- ✅ Types used across multiple API endpoints

**Entities DON'T contain:**
- ❌ Request-specific fields (like `confirmPassword`)
- ❌ Response-specific metadata (like `createdAt` timestamps on requests)
- ❌ HTTP-related information (like status codes)

### Enums — Type-Safe Constants

Enums ensure that status values and other constants are type-safe:

```typescript
// src/shared/enums/product.enum.ts
export enum ProgressStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Completed = 'completed'
}
```

**Benefits:**
- ✅ Autocomplete in your editor for valid status values
- ✅ TypeScript catches invalid status assignments at compile time
- ✅ Single source of truth for allowed values
- ✅ Easy to add new statuses without breaking code

**Usage:**
```typescript
// Server
const progress = {
  id: 1,
  productId: 1,
  percentage: 50,
  status: ProgressStatus.InProgress, // ✅ Type-safe
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-02T00:00:00Z'
};

// Client
const isComplete = progress.status === ProgressStatus.Completed; // ✅ Works
const isInvalid = progress.status === 'in progress'; // ❌ TypeScript error
```

### Requests — API Input Contracts

Request types define what data the client sends to the server:

```typescript
// src/shared/requests/product.request.ts
export namespace ProductRequest {
  export interface Create {
    name: string;
    price: number;
  }

  export interface Update {
    name?: string;
    price?: number;
  }
}

export namespace ProgressRequest {
  export interface Create {
    percentage: number;
    productId: number;
    status?: ProgressStatus;
  }

  export interface Update {
    percentage?: number;
    status?: ProgressStatus;
  }
}

export namespace UserRequest {
  export interface Create {
    email: string;
    name: string;
  }

  export interface Update {
    email?: string;
    name?: string;
  }
}
```

**Naming convention:**
- Use **namespaces** to organize related requests: `ProductRequest`, `ProgressRequest`, `UserRequest`
- Use **descriptive names**: `Create`, `Update`, `Filter`, `Search`
- Use **optional fields** for updates: `name?: string`

**Key differences from entities:**
- 🔍 Requests have only the fields the client sends
- ✅ Fields are optional for PATCH/PUT requests
- ❌ Requests never have timestamps or computed fields
- 📝 Requests may have additional validation fields (e.g., `confirmPassword`)

### Responses — API Output Contracts

Response types define what data the server returns to the client:

```typescript
// src/shared/responses/product.response.ts
export namespace ProductResponse {
  export interface GetList {
    products: Product[];
  }

  export interface GetById {
    product: Product;
  }

  export interface Create {
    created: Product;
  }

  export interface Update {
    updated: Product;
  }

  export interface Delete {
    deleted: number; // The deleted ID
  }
}

export namespace ProgressResponse {
  export interface GetList {
    progress: Progress[];
  }

  export interface GetById {
    progress: Progress;
  }

  export interface Create {
    created: Progress;
  }

  export interface Update {
    updated: Progress;
  }

  export interface Delete {
    deleted: number; // The deleted ID
  }
}

export namespace UserResponse {
  export interface GetList {
    users: User[];
  }

  export interface GetById {
    user: User;
  }

  export interface Create {
    created: User;
  }

  export interface Update {
    updated: User;
  }

  export interface Delete {
    deleted: number; // The deleted ID
  }
}
```

**Response conventions:**
- 🔍 Responses use singular wrapper names: `{ product }` not `{ products }`
- ✅ List endpoints return arrays: `{ products: [] }`
- 📦 Create/Update wrap the entity: `{ created: {...} }` not just `{...}`
- 🗑️ Delete returns the deleted ID for reference
- ✅ Include all computed fields (timestamps, status, etc.)

## Putting It Together

### Complete Request/Response Cycle

Here's how entities, requests, and responses work together:

**1. Client sends a request:**
```typescript
// Client code
import { ProductRequest } from '@/shared';

const response = await fetch('/api/product', {
  method: 'POST',
  body: JSON.stringify({ name: 'New Product', price: 99.99 } as ProductRequest.Create)
});
```

**2. Server receives and validates:**
```typescript
// Server handler
import { ProductRequest, ProductResponse } from '../../shared';
import { productService } from '../service/product.service';

export const POST = ({ body }: any): ProductResponse.Create => {
  const req = body as ProductRequest.Create; // Type assertion
  return productService.createProduct(req);
};
```

**3. Server returns a response:**
```typescript
// Server service
import type { Product } from '../../shared';

export const productService = {
  createProduct(data: ProductRequest.Create): ProductResponse.Create {
    const newProduct: Product = {
      id: nextId(),
      name: data.name,
      price: data.price
    };
    store.products.push(newProduct);
    return { created: newProduct };
  }
};
```

**4. Client uses the typed response:**
```typescript
// Client code
const data: ProductResponse.Create = await response.json();
console.log(`Created product: ${data.created.name}`); // ✅ TypeScript knows the shape
```

### Type Safety Flow

```
Client                          Server
  │                              │
  ├─ Request (ProductRequest)   ─┤
  │  { name, price }            │
  │                              ├─ Validate against ProductRequest
  │                              ├─ Call service
  │                              ├─ Get back Product (entity)
  │  Response (ProductResponse) ─┤
  │  { created: Product }        │
  ├─ Validate response shape     │
  └─ Use typed data
```

## Barrel Exports — Clean Imports

The `index.ts` file exports everything for cleaner imports:

```typescript
// src/shared/index.ts
export * from './entities/product.entity';
export * from './enums/product.enum';
export * from './requests/product.request';
export * from './responses/product.response';
export * as api from './api';
export * as api_legacy from './api.legacy';
```

**Benefits:**
```typescript
// Instead of:
import { Product } from '../shared/entities/product.entity';
import { ProgressStatus } from '../shared/enums/product.enum';
import { ProductRequest } from '../shared/requests/product.request';
import { ProductResponse } from '../shared/responses/product.response';

// You can write:
import { Product, ProgressStatus, ProductRequest, ProductResponse } from '../shared';
```

## Backwards Compatibility

The `api.legacy.ts` file maintains old API class-based namespaces for existing code:

```typescript
// src/shared/api.legacy.ts
import { Product, Progress } from './entities/product.entity';
import { ProgressStatus } from './enums/product.enum';

export namespace ProductAPI {
  export type GetListResponse = { products: Product[] };
  export type GetByIdResponse = { product: Product };
  export type CreateRequest = { name: string; price: number };
  export type CreateResponse = { created: Product };
  export type UpdateRequest = { name?: string; price?: number };
  export type UpdateResponse = { updated: Product };
  export type DeleteResponse = { deleted: number };
}

// ... similar for ProgressAPI, UserAPI
```

**When to use legacy vs new:**
- ✅ **New code:** Use `ProductRequest`, `ProductResponse` namespaces
- 🔄 **Existing code:** Keep using `ProductAPI` until you can refactor
- 📚 **Documentation:** Reference the new structured approach

## Best Practices

### Naming Conventions

✅ **DO:**
- Use **PascalCase** for entity names: `Product`, `Progress`, `User`
- Use **namespaces** to group related types: `ProductRequest`, `ProductResponse`
- Use **descriptive operation names**: `Create`, `Update`, `Delete`, `GetList`, `GetById`
- Use **singular names** in response wrappers: `{ product }` not `{ products }`

❌ **DON'T:**
- Mix entity fields with request-specific fields
- Use HTTP status codes in response types
- Define different shapes for the same entity
- Create separate types for every endpoint

### Code Organization

✅ **DO:**
- Keep entities separate from requests/responses
- Group related types with namespaces
- Use a single file per concern (one for entities, one for requests, etc.)
- Export types from `src/shared/index.ts` for clean imports

❌ **DON'T:**
- Define types in your handlers or components
- Create types scattered across multiple files
- Mix client-specific types with shared types
- Duplicate type definitions

### Type Safety

✅ **DO:**
- Use `as` to assert request body types in handlers
- Validate request data matches the shape
- Export types from shared, not defining locally
- Keep types strict (no `any` unless necessary)

❌ **DON'T:**
- Use `any` for request/response types
- Skip validation on incoming requests
- Define interfaces in your handler files
- Allow different client/server type versions

## Quick Reference

### Adding a New Entity

```typescript
// 1. Define the entity
export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
}

// 2. Create request types
export namespace PostRequest {
  export interface Create {
    title: string;
    content: string;
    authorId: number;
  }

  export interface Update {
    title?: string;
    content?: string;
  }
}

// 3. Create response types
export namespace PostResponse {
  export interface GetList { posts: Post[] }
  export interface GetById { post: Post }
  export interface Create { created: Post }
  export interface Update { updated: Post }
  export interface Delete { deleted: number }
}

// 4. Export from index.ts
export * from './entities/post.entity';
export * from './requests/post.request';
export * from './responses/post.response';
```

### Adding a New Status Enum

```typescript
// src/shared/enums/order.enum.ts
export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled'
}

// Use in handler
const order = {
  id: 1,
  status: OrderStatus.Processing
};

// Use in component
if (order.status === OrderStatus.Delivered) {
  showDeliveryConfirmation();
}
```

## Next Steps

Now that you understand the shared layer, learn how to use these types:

- **[Server Guide](../server/SERVER.md)** — Use shared types in your API handlers
- **[Client Guide](../client/CLIENT.md)** — Use shared types in your Vue components
- **[Full Example Project](https://github.com/kamil5b/bev-fs-example)** — See it all in action

---

**Principle:** Define types once in `src/shared`, use everywhere on client and server. This is your single source of truth for API contracts.
