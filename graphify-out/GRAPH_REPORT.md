# Graph Report - trungthu  (2026-11-12)

## Corpus Check
- 393 files · ~180,904 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: (none) 7, .properties 7, .example 3)

## Summary
- 3181 nodes · 12431 edges · 125 communities (66 shown, 59 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 772 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `746f009e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- uuid
- lombok.Getter
- constants/index.ts
- DemoFlowSeeder
- org.springframework.transaction.annotation.Transactional
- OrderCreationTests
- react
- GiftSetService.java
- index.tsx
- sellerService.ts
- lombok.experimental.SuperBuilder
- org.springframework.http.ResponseEntity
- DailyCapacity
- ProductVariant
- User
- GiftSetService
- V1__initial_schema.sql
- AuthResponse
- Complaint
- Icon
- BulkRequest
- cn
- ApiResponseDTO
- lombok.RequiredArgsConstructor
- Order
- org.junit.jupiter.api.Test
- environment
- OrderServiceImpl.java
- package.json
- AuthServiceImpl.java
- GiftSetComponent.java
- OrderStatus
- DemoFlowSeeder.java
- AuthProviderType
- CheckoutServiceImpl
- BulkOrderService
- RfqFlowTests
- SubscriptionResponse
- CheckoutFlowTests
- org.springframework.web.multipart.MultipartFile
- BulkOrder
- OrderLifecycleServiceImpl
- ComplianceFlowIntegrationTests
- WebSecurityConfig.java
- SubscriptionServiceImpl
- Subscription
- BakeLinesViewTests
- SecurityContextServiceImpl
- OrderPersistenceTests
- compilerOptions
- AuthServiceImpl
- EmailService
- lombok.NoArgsConstructor
- UserResponse
- ComplianceDocStatus
- ProviderQuotation
- compilerOptions
- fpt.sba.trungthu.entity.User
- GiftSetStockTests
- ProductService
- RfqServiceImpl
- ComplaintController.java
- CatalogInventoryApiTests
- RfqSchemaCompatibility.java
- CatalogInventoryApiTests.java
- BakeBatchPage.tsx
- ProductionBatch
- Promotion
- jakarta.servlet.http.HttpServletResponse
- CapacityController
- Product
- PaymentTransaction
- SubscriptionPlan
- PayosSubscriptionGateway
- .findByEmailAndStatus
- StockWebSocketHandler
- ProductController.java
- EmailServiceImpl
- OpenApiConfig.java
- .getCurrentUser
- RegisterRequest
- BulkOrderDay
- VerificationToken
- UserSocialAccount
- BulkOrderController
- OrderDetailResponse
- CustomBox
- StoreReviewController
- SystemConfig
- .getVietQr
- RefreshTokenRequest
- TrungthuApplication.java
- ComplaintType
- GoogleLoginRequest
- RfqDeliveryEstimator
- VerifyOtpRequest
- PasswordPolicy
- VnFormats
- tsconfig.json
- fe/vercel.json
- vercel.json
- fpt.sba:trungthu
- fpt.sba:trungthu-deploy

## God Nodes (most connected - your core abstractions)
1. `ApiResponseDTO` - 136 edges
2. `User` - 114 edges
3. `ProductResponse` - 76 edges
4. `Product` - 75 edges
5. `useApi()` - 71 edges
6. `UserRepository` - 66 edges
7. `ProductVariant` - 65 edges
8. `Order` - 63 edges
9. `react` - 61 edges
10. `OrderStatus` - 57 edges

## Surprising Connections (you probably didn't know these)
- `navClass()` --calls--> `cn()`  [EXTRACTED]
  fe/src/components/layouts/Header.tsx → fe/src/lib/format.ts
- `linkClass()` --calls--> `cn()`  [EXTRACTED]
  fe/src/components/layouts/AdminLayout.tsx → fe/src/lib/format.ts
- `ProductReviews()` --calls--> `useAuthStore`  [EXTRACTED]
  fe/src/components/ProductReviews.tsx → fe/src/stores/authStore.ts
- `ProductDetailPage()` --calls--> `ProductReviews()`  [EXTRACTED]
  fe/src/pages/user/ProductDetailPage.tsx → fe/src/components/ProductReviews.tsx
- `Header()` --calls--> `cn()`  [EXTRACTED]
  fe/src/components/layouts/Header.tsx → fe/src/lib/format.ts

## Import Cycles
- 3-file cycle: `fe/src/apis/http.ts -> fe/src/stores/authStore.ts -> fe/src/services/authService.ts -> fe/src/apis/http.ts`

## Communities (125 total, 59 thin omitted)

### Community 0 - "uuid"
Cohesion: 0.06
Nodes (12): CheckoutLeadTime, CheckoutPreviewResponse, Line, ProviderPrice, OrderPaymentStatus, DEPOSITED, PAID_FULL, UNPAID (+4 more)

### Community 1 - "lombok.Getter"
Cohesion: 0.10
Nodes (15): DemoAlbum, AddSetComponentRequest, AdjustStockRequest, CreateSubscriptionRequest, DiscontinueVariantRequest, ImportStockRequest, ProductImageRequest, ProductImagesRequest (+7 more)

### Community 2 - "constants/index.ts"
Cohesion: 0.06
Nodes (66): CatalogCard(), BoxItemDetails(), OrderItemsSummary(), Props, QuantityStepper(), BRAND, BULK_LEAD_DAYS, BULK_ORDER_QUANTITY (+58 more)

### Community 3 - "DemoFlowSeeder"
Cohesion: 0.12
Nodes (7): DemoFlowSeeder, SkuRef, AddCartItemRequest, UpdateCartItemRequest, CartLineResponse, CartService, CartServiceImpl

### Community 4 - "org.springframework.transaction.annotation.Transactional"
Cohesion: 0.11
Nodes (4): ProductMapper, ProductRequest, ProductServiceImpl, ProviderPolicyService

### Community 5 - "OrderCreationTests"
Cohesion: 0.21
Nodes (5): CreateOrdersCommand, ItemSnapshot, ProviderOrder, VatInfo, OrderCreationTests

### Community 6 - "react"
Cohesion: 0.06
Nodes (54): App(), CLIENT_ID, GoogleId, GoogleLoginButton(), GoogleLoginButtonProps, loadGis(), Window, LEVELS (+46 more)

### Community 7 - "GiftSetService.java"
Cohesion: 0.06
Nodes (28): ProductView, PROVIDER, PUBLIC_DETAIL, PUBLIC_LIST, GiftSetComponentResponse, InventoryAuditType, ADJUSTMENT_BROKEN, ADJUSTMENT_EXPIRED (+20 more)

### Community 9 - "index.tsx"
Cohesion: 0.10
Nodes (79): errorMessage(), BuyerRfqDashboard(), DocumentPreview(), DocumentUploadField(), StitchPage(), OrderPaymentPanel(), useCountdown(), VietQrPanel() (+71 more)

### Community 10 - "sellerService.ts"
Cohesion: 0.08
Nodes (37): http, unwrap(), SellerStatusBanner(), hasApprovedCompliance(), isSubscriptionActive(), REQUIRED_DOCUMENTS, SELLER_STATUS_CHANGED, vietnamDate (+29 more)

### Community 12 - "org.springframework.http.ResponseEntity"
Cohesion: 0.08
Nodes (5): AuthController, ProviderProductController, PlanView, ProductResponse, ProductVariantResponse

### Community 13 - "DailyCapacity"
Cohesion: 0.11
Nodes (5): DailyCapacity, DailyCapacityRepository, CapacityApiTests, BoxChoice, GiftSetCheckoutTests

### Community 14 - "ProductVariant"
Cohesion: 0.10
Nodes (7): Details, InventoryConflictException, ReserveLine, ReservedLineResponse, ProductVariant, CapacityKey, InventoryServiceImpl

### Community 15 - "User"
Cohesion: 0.08
Nodes (15): CartNotBuyableException, CustomUserDetailService, UserRole, CUSTOMER, PLATFORM_ADMIN, PROVIDER, UserStatus, ACTIVE (+7 more)

### Community 16 - "GiftSetService"
Cohesion: 0.13
Nodes (5): GiftSetComponent, GiftSetComponentRepository, StockChangedEvent, GiftSetService, StockBroadcastListener

### Community 17 - "V1__initial_schema.sql"
Cohesion: 0.07
Nodes (51): bulk_request, cart_item, complaint, custom_box, custom_box_item, daily_capacity, gift_set_component, idx_social_provider_user_id (+43 more)

### Community 19 - "AuthResponse"
Cohesion: 0.07
Nodes (5): ForgotPasswordRequest, LoginRequest, ResetPasswordRequest, AuthResponse, AuthService

### Community 20 - "Complaint"
Cohesion: 0.13
Nodes (7): Complaint, ComplaintStatus, IN_PROGRESS, OPEN, REJECTED, RESOLVED, ComplaintRepository

### Community 21 - "Icon"
Cohesion: 0.06
Nodes (54): HeroMotion(), shouldLoadVideo(), Icon(), Props, ADMIN_NAV, AdminLayout(), linkClass(), NAV (+46 more)

### Community 22 - "BulkRequest"
Cohesion: 0.12
Nodes (8): BulkRequest, BulkRequestStatus, DISTRIBUTED, LOST, NEW, QUOTES_RECEIVED, WON, BulkRequestRepository

### Community 23 - "cn"
Cohesion: 0.07
Nodes (57): BakeCalendar(), CalendarMode, COUNT_FORMAT, loadMonth(), METRICS, MonthContents(), shiftMonth(), STATUS_GROUP (+49 more)

### Community 25 - "lombok.RequiredArgsConstructor"
Cohesion: 0.10
Nodes (13): SecurityContextService, AdminComplianceController, AdminDashboardController, AdminSubscriptionController, CartController, DummyPaymentController, PayosSubscriptionWebhookController, ProviderComplianceController (+5 more)

### Community 26 - "Order"
Cohesion: 0.08
Nodes (13): PaymentMethod, COD, DIRECT_BANK, MOMO, PAYOS, VIETQR, VNPAY, Order (+5 more)

### Community 27 - "org.junit.jupiter.api.Test"
Cohesion: 0.10
Nodes (3): PromotionTest, OrderApiTests, TrungthuApplicationTests

### Community 28 - "environment"
Cohesion: 0.05
Nodes (39): build, depends_on, environment, ports, context, condition, environment, healthcheck (+31 more)

### Community 30 - "package.json"
Cohesion: 0.06
Nodes (48): dependencies, axios@^1.10.0, lucide-react@^0.522.0, qrcode.react@^4.2.0, react@^19.1.0, react-dom@^19.1.0, react-router-dom@^7.6.2, zod@^3.25.67 (+40 more)

### Community 32 - "GiftSetComponent.java"
Cohesion: 0.24
Nodes (3): CartItem, ProductImage, SetInventoryAudit

### Community 33 - "OrderStatus"
Cohesion: 0.05
Nodes (25): OrderMapper, OrderStatusTransitionValidator, ReleaseLine, CustomerRank, ProviderDashboardResponse, VariantRank, Period, VariantOrderStatsResponse (+17 more)

### Community 34 - "DemoFlowSeeder.java"
Cohesion: 0.13
Nodes (6): BakeViewInitializer, DataInitializer, DemoCheckoutSeeder, UserMapper, InventoryService, BakeViewInitializerTests

### Community 35 - "AuthProviderType"
Cohesion: 0.13
Nodes (9): GoogleIdTokenVerifier, AuthGatewayRequest, AuthUserProfile, AuthProviderType, GOOGLE, LOCAL, AuthGateway, GoogleAuthGatewayImpl (+1 more)

### Community 36 - "CheckoutServiceImpl"
Cohesion: 0.11
Nodes (6): CheckoutServiceImpl, Line, Plan, Receiver, Snap, CheckoutDepositTest

### Community 37 - "BulkOrderService"
Cohesion: 0.29
Nodes (3): BulkOrderResponse, Day, BulkOrderService

### Community 38 - "RfqFlowTests"
Cohesion: 0.12
Nodes (7): RfqController, CreateRfqRequest, SubmitQuoteRequest, QuoteResponse, RfqResponse, RfqService, RfqFlowTests

### Community 39 - "SubscriptionResponse"
Cohesion: 0.21
Nodes (3): SubscriptionResponse, SubscriptionService, SubscriptionFlowTests

### Community 40 - "CheckoutFlowTests"
Cohesion: 0.08
Nodes (8): OrderExpirationJob, CheckoutRequest, Group, Item, OrderLifecycleService, CheckoutFlowTests, OrderExpirationJobTests, PasswordFlowTests

### Community 41 - "org.springframework.web.multipart.MultipartFile"
Cohesion: 0.20
Nodes (3): LocalStorageServiceImpl, StorageService, LocalStorageServiceTests

### Community 42 - "BulkOrder"
Cohesion: 0.11
Nodes (11): BulkOrderExpirationJob, BulkOrder, BulkOrderStatus, CANCELLED, COMPLETED, DELIVERING, PRODUCTION, READY_TO_SHIP (+3 more)

### Community 43 - "OrderLifecycleServiceImpl"
Cohesion: 0.17
Nodes (4): ReleaseStockCommand, DummyOrderResponse, OrderLifecycleServiceImpl, PendingChannelRelease

### Community 44 - "ComplianceFlowIntegrationTests"
Cohesion: 0.17
Nodes (5): ComplianceDocType, BUSINESS_LICENSE, FOOD_SAFETY_CERT, IDENTITY_KYC, ComplianceFlowIntegrationTests

### Community 45 - "WebSecurityConfig.java"
Cohesion: 0.11
Nodes (3): CookieProperties, WebSecurityConfig, JwtProperties

### Community 47 - "Subscription"
Cohesion: 0.10
Nodes (8): SubscriptionStatus, ACTIVE, CANCELLED, EXPIRED, PENDING_PAYMENT, SUSPENDED, Subscription, SubscriptionRepository

### Community 51 - "OrderPersistenceTests"
Cohesion: 0.09
Nodes (3): OrderBatch, OrderBatchRepository, OrderPersistenceTests

### Community 52 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+12 more)

### Community 55 - "lombok.NoArgsConstructor"
Cohesion: 0.20
Nodes (11): ActivateSubscriptionRequest, ReviewComplianceDocRequest, UploadComplianceDocRequest, AdminDashboardResponse, RecentComplaintItem, RecentKycDocItem, RecentSubscriptionItem, BakeSheetResponse (+3 more)

### Community 56 - "UserResponse"
Cohesion: 0.16
Nodes (3): UserResponse, ProviderServiceImpl, ProviderService

### Community 57 - "ComplianceDocStatus"
Cohesion: 0.08
Nodes (9): ComplianceDocResponse, ComplianceDocStatus, APPROVED, EXPIRED, PENDING, REJECTED, StoreComplianceDoc, StoreComplianceDocRepository (+1 more)

### Community 58 - "ProviderQuotation"
Cohesion: 0.15
Nodes (6): QuoteStatus, ACCEPTED, EXPIRED, REJECTED, SUBMITTED, ProviderQuotation

### Community 59 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+10 more)

### Community 60 - "fpt.sba.trungthu.entity.User"
Cohesion: 0.23
Nodes (3): PromotionController, PromotionRequest, PromotionResponse

### Community 62 - "ProductService"
Cohesion: 0.17
Nodes (3): DemoProductSeeder, ProductVariantRequest, ProductService

### Community 64 - "ComplaintController.java"
Cohesion: 0.17
Nodes (5): ComplaintController, ComplaintResponse, CreateComplaintRequest, UpdateComplaintRequest, ComplaintFlowTests

### Community 65 - "CatalogInventoryApiTests"
Cohesion: 0.18
Nodes (3): ReserveStockCommand, CatalogInventoryApiTests, Created

### Community 67 - "CatalogInventoryApiTests.java"
Cohesion: 0.09
Nodes (9): JsonAuthenticationEntryPoint, ProductStatus, ACTIVE, ARCHIVED, DRAFT, SOLD_OUT, ProductRepository, DemoFlowSeederTests (+1 more)

### Community 68 - "BakeBatchPage.tsx"
Cohesion: 0.09
Nodes (36): Field(), FieldProps, InputProps, TextArea(), TextareaProps, TextInput(), normalize(), SearchableSelect() (+28 more)

### Community 69 - "ProductionBatch"
Cohesion: 0.16
Nodes (6): ProductionBatchStatus, CANCELLED, COMPLETED, IN_PRODUCTION, SCHEDULED, ProductionBatch

### Community 70 - "Promotion"
Cohesion: 0.11
Nodes (6): PromotionType, BUY_X_GET_Y, BUY_X_PAY_Y, PERCENT_OFF, Promotion, PromotionRepository

### Community 72 - "CapacityController"
Cohesion: 0.29
Nodes (4): CapacityController, CapacityDay, DayAvailability, SetCapacityRequest

### Community 74 - "PaymentTransaction"
Cohesion: 0.15
Nodes (6): TransactionStatus, CANCELLED, PENDING, SUCCESS, PaymentTransaction, PaymentTransactionRepository

### Community 77 - "SubscriptionPlan"
Cohesion: 0.28
Nodes (4): SubscriptionPlan, BASIC, PREMIUM, STANDARD

### Community 81 - "ProductController.java"
Cohesion: 0.15
Nodes (4): CheckoutController, ProductController, CheckoutService, LeadTime

### Community 84 - "OpenApiConfig.java"
Cohesion: 0.11
Nodes (3): OpenApiConfig, UploadsWebConfig, StockWebSocketConfig

### Community 86 - ".getCurrentUser"
Cohesion: 0.13
Nodes (3): BankAccountRequest, ProviderCheckoutSettingsController, SettingsView

### Community 89 - "VerificationToken"
Cohesion: 0.20
Nodes (3): VerificationTokenType, PASSWORD_RESET, VerificationToken

### Community 92 - "OrderDetailResponse"
Cohesion: 0.16
Nodes (8): OrderController, DepositRequest, OrderLifecycleController, StatusRequest, OrderQueryRequest, OrderDetailResponse, OrderSummaryResponse, OrderService

### Community 94 - "StoreReviewController"
Cohesion: 0.26
Nodes (5): ReviewRequest, ReviewResponse, StoreReviewController, StoreSummary, StoreReviewControllerTest

### Community 103 - "ComplaintType"
Cohesion: 0.29
Nodes (6): ComplaintType, DAMAGED, LATE_DELIVERY, MOLDED, OTHER, WRONG_SPECIFICATION

## Knowledge Gaps
- **104 isolated node(s):** `DEPOSITED`, `PAID_FULL`, `UNPAID`, `ORDER_BALANCE`, `ORDER_DEPOSIT` (+99 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 707 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **59 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `uuid`, `DemoFlowSeeder`, `org.springframework.transaction.annotation.Transactional`, `GiftSetService.java`, `org.springframework.boot.test.context.SpringBootTest`, `lombok.experimental.SuperBuilder`, `DailyCapacity`, `AuthResponse`, `Complaint`, `BulkRequest`, `Order`, `AuthServiceImpl.java`, `GiftSetComponent.java`, `OrderStatus`, `DemoFlowSeeder.java`, `SubscriptionResponse`, `ComplianceFlowIntegrationTests`, `Subscription`, `RfqFlowTests.java`, `SecurityContextServiceImpl`, `OrderPersistenceTests`, `AuthServiceImpl`, `UserResponse`, `ComplianceDocStatus`, `ProviderQuotation`, `GiftSetStockTests`, `ComplaintController.java`, `CatalogInventoryApiTests`, `CatalogInventoryApiTests.java`, `jakarta.servlet.http.HttpServletResponse`, `CapacityController`, `Product`, `lombok`, `.findByEmailAndStatus`, `SubscriptionFlowTests.java`, `.getCurrentUser`, `RegisterRequest`, `VerificationToken`, `UserSocialAccount`, `SystemConfig`, `RfqDeliveryEstimator`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `DEPOSITED`, `PAID_FULL`, `UNPAID` to the rest of the system?**
  _104 weakly-connected nodes found - possible missing edges._
- **Should `uuid` be split into smaller, more focused modules?**
  _Cohesion score 0.06219918548685672 - nodes in this community are weakly interconnected._
- **Why does `Product` connect `Product` to `GiftSetComponent.java`, `OrderStatus`, `DemoFlowSeeder.java`, `CatalogInventoryApiTests.java`, `org.springframework.transaction.annotation.Transactional`, `DemoFlowSeeder`, `uuid`, `GiftSetService.java`, `CatalogInventoryApiTests`, `lombok.experimental.SuperBuilder`, `ProductVariant`, `User`, `GiftSetService`, `BulkRequest`, `lombok.NoArgsConstructor`, `Order`, `ProductService`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `lombok.Getter` be split into smaller, more focused modules?**
  _Cohesion score 0.09898242368177614 - nodes in this community are weakly interconnected._
- **Why does `DailyCapacity` connect `DailyCapacity` to `uuid`, `DemoFlowSeeder.java`, `CatalogInventoryApiTests.java`, `ProductionBatch`, `RfqFlowTests`, `.setUp`, `CapacityController`, `org.springframework.boot.test.context.SpringBootTest`, `CheckoutFlowTests`, `lombok.experimental.SuperBuilder`, `User`, `RfqFlowTests.java`, `OrderPersistenceTests`, `BulkOrderDay`, `Order`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `constants/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061122538936232734 - nodes in this community are weakly interconnected._