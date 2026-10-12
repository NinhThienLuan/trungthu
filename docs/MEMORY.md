# MEMORY — Trung Thu Backend

> Last updated: 2026-10-12 | Tests: **24/24 PASS** ✅

---

## Active Project
- **Repo**: `D:\GitHub\trungthu\be`
- **Package**: `fpt.sba.trungthu`
- **Stack**: Spring Boot 3, JPA/Hibernate, H2 (test), JWT, MockMvc tests
- **Test cmd**: `mvn -f "D:\GitHub\trungthu\be\pom.xml" test`

---

## Architecture Overview

### Key Infrastructure
| Class | Location | Purpose |
|-------|----------|---------|
| `BaseEntity` | `common/infrastructure/` | `@Id UUID id`, `createdAt`, `updatedAt` |
| `CreatedEntity` | `common/infrastructure/` | `@Id UUID id`, `createdAt` only |
| `WebSecurityConfig` | `common/config/` | JWT stateless, CSRF disabled, WHITELIST |
| `SecurityContextService` | `common/security/` | `getCurrentUser()`, `isOwner()`, `hasRole()` |
| `PageResponse<T>` | `dto/response/` | Standard paging wrapper |
| `ProductMapper` | `common/mapper/` | Entity → DTO |
| `UserMapper` | `common/mapper/` | User → UserResponse |

### Auth Gateway Pattern
- `AuthGateway` interface → `LocalAuthGatewayImpl`, `GoogleAuthGatewayImpl`
- `UserSocialAccount` entity → links User to social provider identity
- `AuthServiceImpl` routes via `switch(provider)` → bean name → `gateway.authenticate()`

### Services
- `AuthService` / `AuthServiceImpl` — register, login, refresh, forgot/reset password, Google OAuth
- `ProductService` / `ProductServiceImpl` — CRUD with paging, mapper, try-catch-finally logging
- `ProviderService` / `ProviderServiceImpl` — store profile management, season toggle
- All services: **use `AuthenticationService` interface, never raw repo calls across service boundaries**

---

## Enum Status (COMPLETE ✅)

All entity status/state/type fields are now proper Java enums with `@Enumerated(EnumType.STRING)`.

### Enum Files (`entity/enumeration/`)
| Enum | Used By | Has `validateTransition()` |
|------|---------|--------------------------|
| `UserStatus` | `User.status` | ✅ |
| `UserRole` | `User.role` | — |
| `ProductStatus` | `Product.status`, `ProductVariant.status` | ✅ |
| `OrderStatus` | `Order.orderStatus` | ✅ |
| `PaymentStatus` | `Order.paymentStatus`, `PaymentTransaction.paymentStatus` | ✅ |
| `PaymentMethod` | `PaymentTransaction.paymentMethod` | — |
| `OrderBatchStatus` | `OrderBatch.batchStatus` | ✅ |
| `ProductionBatchStatus` | `ProductionBatch.status` | ✅ |
| `SubscriptionStatus` | `Subscription.status` | ✅ |
| `BulkRequestStatus` | `BulkRequest.status` | ✅ |
| `QuoteStatus` | `ProviderQuotation.status` | ✅ |
| `ComplianceDocType` | `StoreComplianceDoc.documentType` | — |
| `ComplianceDocStatus` | `StoreComplianceDoc.verificationStatus` | ✅ |
| `ComplaintType` | `Complaint.complaintType` | — |
| `ComplaintStatus` | `Complaint.status` | ✅ |
| `AuthProviderType` | `UserSocialAccount.provider` | — |
| `ProductType` | `Product.productType` | — |

### Key Pattern: transition methods on entities
```java
entity.transitionStatus(NewStatus.VALUE);  // validates via switch-case then sets field
```

---

## Architecture Requirements (User-Defined)
1. **Provider has 2 services**: `ProviderService` (store/KYC/subscriptions) + `ProductService` (products)
2. **`@PreAuthorize`** for controller authorization
3. **Owner check**: `securityContextService.isOwner(resourceOwnerId)` pattern
4. **No separate public ProductController** — one unified `/api/products/**` (also `/api/public/**`)
5. **Response paging**: use `PageResponse<T>` for all list responses
6. **`boxCapacity > 0`** (never hardcode 2/4/6)
7. **Mapper layer**: `ProductMapper`, `UserMapper` for Entity→DTO
8. **Comments**: `// type comment` to clarify sections
9. **State transitions**: `switch-case` or `if-else` via enum methods
10. **`OrderItem` only via `OrderService/OrderBatchService`** — never standalone at service layer
11. **`try-catch-finally`** + structured logging in all service methods

---

## Known Gotchas
- **`"ACTIVE".equals(user.getStatus())`** → ALWAYS `false` now that `status` is `UserStatus` enum → causes 403. Use `user.getStatus() != UserStatus.ACTIVE` or `== UserStatus.ACTIVE`.
- **`UserRepository.findByEmailAndStatus(String, String)`** → bridged to `(String, UserStatus)` via `default` interface method — still works if you pass String, but prefer enum overload directly.
- **`@Check` on `ProductVariant`**: `box_capacity IS NULL OR box_capacity > 0` (was `IN (2, 4, 6)` — caused H2 test failures).
- **H2 in-memory** for tests — schema auto-created by Hibernate. `@Check` constraints are enforced.

---

## Next Areas (Not Yet Started)
- `OrderService` / `OrderServiceImpl` — order lifecycle, batch assignment
- `SubscriptionService` — subscription lifecycle (activate, suspend, expire)
- `BulkRequestService` — B2B bulk order flow
- `ComplaintService` — complaint CRUD + status transitions
- Frontend integration
