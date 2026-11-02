-- =============================================================================
-- V1__initial_schema.sql
-- Nền tảng Bán bánh Trung Thu Trực Tuyến (trungthu)
-- PostgreSQL Initial Schema Migration
-- =============================================================================

-- 1. Table: "USER"
CREATE TABLE IF NOT EXISTS "USER" (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    email VARCHAR(254) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    store_name VARCHAR(255),
    address TEXT,
    bank_code VARCHAR(20),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(150),
    is_compliance_approved BOOLEAN NOT NULL DEFAULT FALSE,
    is_season_active BOOLEAN NOT NULL DEFAULT TRUE,
    require_password_change BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_user PRIMARY KEY (id),
    CONSTRAINT uq_user_email UNIQUE (email),
    CONSTRAINT ck_user_role CHECK (role IN ('CUSTOMER', 'PROVIDER', 'PLATFORM_ADMIN'))
);

-- 2. Table: store_compliance_doc
CREATE TABLE IF NOT EXISTS store_compliance_doc (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    provider_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(2048) NOT NULL,
    verification_status VARCHAR(30) NOT NULL,
    verified_by UUID,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(500),
    CONSTRAINT pk_store_compliance_doc PRIMARY KEY (id),
    CONSTRAINT fk_store_compliance_doc_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT fk_store_compliance_doc_verified_by FOREIGN KEY (verified_by) REFERENCES "USER" (id)
);
CREATE INDEX IF NOT EXISTS ix_store_compliance_doc_provider_id ON store_compliance_doc (provider_id);
CREATE INDEX IF NOT EXISTS ix_store_compliance_doc_verified_by ON store_compliance_doc (verified_by);

-- 3. Table: subscription
CREATE TABLE IF NOT EXISTS subscription (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    provider_id UUID NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    price NUMERIC(18,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_products_allowed INTEGER,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL,
    payment_note VARCHAR(500),
    CONSTRAINT pk_subscription PRIMARY KEY (id),
    CONSTRAINT fk_subscription_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT ck_subscription_price CHECK (price >= 0),
    CONSTRAINT ck_subscription_dates CHECK (end_date >= start_date),
    CONSTRAINT ck_subscription_max_products CHECK (max_products_allowed IS NULL OR max_products_allowed > 0)
);
CREATE INDEX IF NOT EXISTS ix_subscription_provider_id ON subscription (provider_id);

-- 4. Table: product
CREATE TABLE IF NOT EXISTS product (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    provider_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    sale_price NUMERIC(18,2),
    description TEXT,
    ingredients TEXT,
    story TEXT,
    CONSTRAINT pk_product PRIMARY KEY (id),
    CONSTRAINT fk_product_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT ck_product_sale_price CHECK (sale_price IS NULL OR sale_price >= 0)
);
CREATE INDEX IF NOT EXISTS ix_product_provider_id ON product (provider_id);

-- 5. Table: product_variant
CREATE TABLE IF NOT EXISTS product_variant (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    product_id UUID NOT NULL,
    sku VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    price NUMERIC(18,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    weight_gram INTEGER,
    box_capacity INTEGER,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT pk_product_variant PRIMARY KEY (id),
    CONSTRAINT uq_product_variant_sku UNIQUE (sku),
    CONSTRAINT fk_product_variant_product_id FOREIGN KEY (product_id) REFERENCES product (id),
    CONSTRAINT ck_product_variant_price CHECK (price >= 0),
    CONSTRAINT ck_product_variant_stock_quantity CHECK (stock_quantity >= 0),
    CONSTRAINT ck_product_variant_box_capacity CHECK (box_capacity IS NULL OR box_capacity > 0)
);
CREATE INDEX IF NOT EXISTS ix_product_variant_product_id ON product_variant (product_id);

-- 6. Table: product_image
CREATE TABLE IF NOT EXISTS product_image (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    product_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT pk_product_image PRIMARY KEY (id),
    CONSTRAINT fk_product_image_product_id FOREIGN KEY (product_id) REFERENCES product (id),
    CONSTRAINT ck_product_image_display_order CHECK (display_order >= 0)
);
CREATE INDEX IF NOT EXISTS ix_product_image_product_id ON product_image (product_id);

-- 7. Table: daily_capacity
CREATE TABLE IF NOT EXISTS daily_capacity (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    provider_id UUID NOT NULL,
    capacity_date DATE NOT NULL,
    max_quantity INTEGER NOT NULL,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (max_quantity - reserved_quantity) STORED,
    CONSTRAINT pk_daily_capacity PRIMARY KEY (id),
    CONSTRAINT uq_daily_capacity_provider_date UNIQUE (provider_id, capacity_date),
    CONSTRAINT fk_daily_capacity_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT ck_daily_capacity_max_quantity CHECK (max_quantity >= 0),
    CONSTRAINT ck_daily_capacity_reserved_quantity CHECK (reserved_quantity >= 0),
    CONSTRAINT ck_daily_capacity_reserved CHECK (reserved_quantity <= max_quantity)
);
CREATE INDEX IF NOT EXISTS ix_daily_capacity_provider_id ON daily_capacity (provider_id);

-- 8. Table: "ORDER"
CREATE TABLE IF NOT EXISTS "ORDER" (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    order_code VARCHAR(255) NOT NULL,
    checkout_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    ordered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    order_status VARCHAR(30) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    list_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    subtotal_amount NUMERIC(18,2) NOT NULL,
    discount_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    shipping_fee NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,2) NOT NULL,
    deposit_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    hold_expires_at TIMESTAMP WITH TIME ZONE,
    hold_extension_count INTEGER NOT NULL DEFAULT 0,
    hold_extended_at TIMESTAMP WITH TIME ZONE,
    hold_extended_by UUID,
    hold_extension_reason VARCHAR(500),
    require_vat_invoice BOOLEAN NOT NULL DEFAULT FALSE,
    vat_company_name VARCHAR(255),
    vat_tax_code VARCHAR(50),
    vat_company_address TEXT,
    vat_email VARCHAR(254),
    CONSTRAINT pk_order PRIMARY KEY (id),
    CONSTRAINT uq_order_order_code UNIQUE (order_code),
    CONSTRAINT uq_order_checkout_provider UNIQUE (checkout_id, provider_id),
    CONSTRAINT fk_order_customer_id FOREIGN KEY (customer_id) REFERENCES "USER" (id),
    CONSTRAINT fk_order_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT fk_order_hold_extended_by FOREIGN KEY (hold_extended_by) REFERENCES "USER" (id),
    CONSTRAINT ck_order_amounts CHECK (
        subtotal_amount >= 0 AND shipping_fee >= 0 AND total_amount >= 0
        AND deposit_amount >= 0 AND deposit_amount <= total_amount
        AND list_amount >= 0 AND discount_amount >= 0 AND discount_amount <= list_amount
    ),
    CONSTRAINT ck_order_hold_count CHECK (hold_extension_count BETWEEN 0 AND 1),
    CONSTRAINT ck_order_cod CHECK (payment_method <> 'COD' OR (deposit_amount = 0 AND hold_expires_at IS NULL)),
    CONSTRAINT ck_order_hold_state CHECK (
        (order_status = 'PENDING_DEPOSIT' AND payment_method = 'VIETQR' AND hold_expires_at IS NOT NULL)
        OR (order_status <> 'PENDING_DEPOSIT' AND hold_expires_at IS NULL)
    ),
    CONSTRAINT ck_order_hold_audit CHECK (
        hold_extension_count = 0 OR (hold_extended_at IS NOT NULL AND hold_extended_by IS NOT NULL AND hold_extension_reason IS NOT NULL)
    )
);
CREATE INDEX IF NOT EXISTS ix_order_customer_id ON "ORDER" (customer_id);
CREATE INDEX IF NOT EXISTS ix_order_provider_id ON "ORDER" (provider_id);
CREATE INDEX IF NOT EXISTS ix_order_checkout_id ON "ORDER" (checkout_id);
CREATE INDEX IF NOT EXISTS ix_order_status_hold ON "ORDER" (order_status, hold_expires_at);

-- 9. Table: order_batch
CREATE TABLE IF NOT EXISTS order_batch (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    order_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    delivery_date DATE NOT NULL,
    subtotal NUMERIC(18,2) NOT NULL,
    capacity_id UUID,
    CONSTRAINT pk_order_batch PRIMARY KEY (id),
    CONSTRAINT uq_order_batch_order_id UNIQUE (order_id),
    CONSTRAINT fk_order_batch_order_id FOREIGN KEY (order_id) REFERENCES "ORDER" (id),
    CONSTRAINT fk_order_batch_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT fk_order_batch_capacity_id FOREIGN KEY (capacity_id) REFERENCES daily_capacity (id),
    CONSTRAINT ck_order_batch_subtotal CHECK (subtotal >= 0)
);
CREATE INDEX IF NOT EXISTS ix_order_batch_provider_date ON order_batch (provider_id, delivery_date);
CREATE INDEX IF NOT EXISTS ix_order_batch_capacity_id ON order_batch (capacity_id);

-- 10. Table: order_item
CREATE TABLE IF NOT EXISTS order_item (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    order_batch_id UUID NOT NULL,
    variant_id UUID NOT NULL,
    source_set_id UUID,
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(18,2) NOT NULL,
    subtotal NUMERIC(18,2) NOT NULL,
    personalization_fee NUMERIC(18,2) NOT NULL DEFAULT 0,
    personalization_text VARCHAR(50),
    bake_quantity INTEGER NOT NULL DEFAULT 0,
    direct_from_set INTEGER NOT NULL DEFAULT 0,
    stock_reserved_quantity INTEGER,
    CONSTRAINT pk_order_item PRIMARY KEY (id),
    CONSTRAINT fk_order_item_order_batch_id FOREIGN KEY (order_batch_id) REFERENCES order_batch (id),
    CONSTRAINT fk_order_item_variant_id FOREIGN KEY (variant_id) REFERENCES product_variant (id),
    CONSTRAINT fk_order_item_source_set_id FOREIGN KEY (source_set_id) REFERENCES product (id),
    CONSTRAINT ck_order_item_quantity CHECK (quantity > 0),
    CONSTRAINT ck_order_item_unit_price CHECK (unit_price >= 0),
    CONSTRAINT ck_order_item_subtotal CHECK (subtotal >= 0),
    CONSTRAINT ck_order_item_personalization_fee CHECK (personalization_fee >= 0),
    CONSTRAINT ck_order_item_bake_quantity CHECK (bake_quantity >= 0),
    CONSTRAINT ck_order_item_stock_reserved_quantity CHECK (
        stock_reserved_quantity IS NULL OR (stock_reserved_quantity >= 0 AND stock_reserved_quantity <= quantity)
    )
);
CREATE INDEX IF NOT EXISTS ix_order_item_order_batch_id ON order_item (order_batch_id);
CREATE INDEX IF NOT EXISTS ix_order_item_variant_id ON order_item (variant_id);

-- 11. Table: payment_transaction
CREATE TABLE IF NOT EXISTS payment_transaction (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    order_id UUID,
    subscription_id UUID,
    transaction_code VARCHAR(255) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT pk_payment_transaction PRIMARY KEY (id),
    CONSTRAINT uq_payment_transaction_transaction_code UNIQUE (transaction_code),
    CONSTRAINT fk_payment_transaction_order_id FOREIGN KEY (order_id) REFERENCES "ORDER" (id),
    CONSTRAINT fk_payment_transaction_subscription_id FOREIGN KEY (subscription_id) REFERENCES subscription (id),
    CONSTRAINT ck_payment_transaction_amount CHECK (amount > 0),
    CONSTRAINT ck_payment_transaction_owner CHECK (
        (transaction_type = 'SUBSCRIPTION_FEE' AND subscription_id IS NOT NULL AND order_id IS NULL)
        OR (transaction_type IN ('ORDER_DEPOSIT', 'ORDER_BALANCE') AND order_id IS NOT NULL AND subscription_id IS NULL)
    ),
    CONSTRAINT ck_payment_transaction_paid_at CHECK (
        (payment_status = 'SUCCESS' AND paid_at IS NOT NULL)
        OR (payment_status <> 'SUCCESS' AND paid_at IS NULL)
    )
);
CREATE INDEX IF NOT EXISTS ix_payment_transaction_order_id ON payment_transaction (order_id);
CREATE INDEX IF NOT EXISTS ix_payment_transaction_subscription_id ON payment_transaction (subscription_id);

-- 12. Table: bulk_request
CREATE TABLE IF NOT EXISTS bulk_request (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    request_code VARCHAR(255) NOT NULL,
    customer_id UUID NOT NULL,
    company_name VARCHAR(255),
    tax_code VARCHAR(50),
    contact_name VARCHAR(255),
    contact_position VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(254),
    requested_quantity INTEGER NOT NULL,
    expected_date DATE,
    expected_budget NUMERIC(18,2),
    logo_url VARCHAR(2048),
    description TEXT,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT pk_bulk_request PRIMARY KEY (id),
    CONSTRAINT uq_bulk_request_request_code UNIQUE (request_code),
    CONSTRAINT fk_bulk_request_customer_id FOREIGN KEY (customer_id) REFERENCES "USER" (id),
    CONSTRAINT ck_bulk_request_requested_quantity CHECK (requested_quantity > 0),
    CONSTRAINT ck_bulk_request_expected_budget CHECK (expected_budget IS NULL OR expected_budget >= 0)
);
CREATE INDEX IF NOT EXISTS ix_bulk_request_customer_id ON bulk_request (customer_id);

-- 13. Table: provider_quotation
CREATE TABLE IF NOT EXISTS provider_quotation (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    request_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    quoted_price NUMERIC(18,2) NOT NULL,
    offered_quantity INTEGER NOT NULL,
    estimated_delivery_date DATE,
    valid_until DATE,
    note TEXT,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT pk_provider_quotation PRIMARY KEY (id),
    CONSTRAINT uq_provider_quotation_request_provider UNIQUE (request_id, provider_id),
    CONSTRAINT fk_provider_quotation_request_id FOREIGN KEY (request_id) REFERENCES bulk_request (id),
    CONSTRAINT fk_provider_quotation_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT ck_provider_quotation_quoted_price CHECK (quoted_price >= 0),
    CONSTRAINT ck_provider_quotation_offered_quantity CHECK (offered_quantity > 0)
);
CREATE INDEX IF NOT EXISTS ix_provider_quotation_request_id ON provider_quotation (request_id);
CREATE INDEX IF NOT EXISTS ix_provider_quotation_provider_id ON provider_quotation (provider_id);

-- 14. Table: promotion
CREATE TABLE IF NOT EXISTS promotion (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    provider_id UUID NOT NULL,
    product_id UUID,
    name VARCHAR(150) NOT NULL,
    promotion_type VARCHAR(30) NOT NULL,
    min_quantity INTEGER,
    percent_off INTEGER,
    buy_quantity INTEGER,
    free_quantity INTEGER,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_promotion PRIMARY KEY (id),
    CONSTRAINT fk_promotion_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT fk_promotion_product_id FOREIGN KEY (product_id) REFERENCES product (id)
);
CREATE INDEX IF NOT EXISTS ix_promotion_provider_id ON promotion (provider_id);

-- 15. Table: cart_item
CREATE TABLE IF NOT EXISTS cart_item (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    customer_id UUID NOT NULL,
    variant_id UUID,
    set_product_id UUID,
    quantity INTEGER NOT NULL,
    selected BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_cart_item PRIMARY KEY (id),
    CONSTRAINT uq_cart_item_customer_variant UNIQUE (customer_id, variant_id),
    CONSTRAINT uq_cart_item_customer_set UNIQUE (customer_id, set_product_id),
    CONSTRAINT fk_cart_item_customer_id FOREIGN KEY (customer_id) REFERENCES "USER" (id),
    CONSTRAINT fk_cart_item_variant_id FOREIGN KEY (variant_id) REFERENCES product_variant (id),
    CONSTRAINT fk_cart_item_set_product_id FOREIGN KEY (set_product_id) REFERENCES product (id),
    CONSTRAINT ck_cart_item_quantity CHECK (quantity > 0),
    CONSTRAINT ck_cart_item_target CHECK (
        (variant_id IS NOT NULL AND set_product_id IS NULL) OR (variant_id IS NULL AND set_product_id IS NOT NULL)
    )
);
CREATE INDEX IF NOT EXISTS ix_cart_item_customer_id ON cart_item (customer_id);
CREATE INDEX IF NOT EXISTS ix_cart_item_set_product_id ON cart_item (set_product_id);

-- 16. Table: gift_set_component
CREATE TABLE IF NOT EXISTS gift_set_component (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    set_product_id UUID NOT NULL,
    component_variant_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    per_set_quantity INTEGER NOT NULL,
    direct_quantity INTEGER NOT NULL,
    CONSTRAINT pk_gift_set_component PRIMARY KEY (id),
    CONSTRAINT uq_gift_set_component_set_component UNIQUE (set_product_id, component_variant_id),
    CONSTRAINT fk_gift_set_component_set_product_id FOREIGN KEY (set_product_id) REFERENCES product (id),
    CONSTRAINT fk_gift_set_component_component_variant_id FOREIGN KEY (component_variant_id) REFERENCES product_variant (id),
    CONSTRAINT ck_gift_set_component_quantity CHECK (quantity >= 0),
    CONSTRAINT ck_gift_set_component_per_set CHECK (per_set_quantity > 0),
    CONSTRAINT ck_gift_set_component_direct CHECK (direct_quantity >= 0 AND direct_quantity <= quantity)
);
CREATE INDEX IF NOT EXISTS ix_gift_set_component_set_product_id ON gift_set_component (set_product_id);
CREATE INDEX IF NOT EXISTS ix_gift_set_component_component_variant_id ON gift_set_component (component_variant_id);

-- 17. Table: inventory_audit
CREATE TABLE IF NOT EXISTS inventory_audit (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    provider_id UUID NOT NULL,
    variant_id UUID NOT NULL,
    order_id UUID,
    audit_type VARCHAR(50) NOT NULL,
    quantity_delta INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    created_by VARCHAR(254) NOT NULL,
    reason VARCHAR(500),
    CONSTRAINT pk_inventory_audit PRIMARY KEY (id),
    CONSTRAINT fk_inventory_audit_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT fk_inventory_audit_variant_id FOREIGN KEY (variant_id) REFERENCES product_variant (id),
    CONSTRAINT fk_inventory_audit_order_id FOREIGN KEY (order_id) REFERENCES "ORDER" (id)
);
CREATE INDEX IF NOT EXISTS ix_inventory_audit_variant_id ON inventory_audit (variant_id);

-- 18. Table: set_inventory_audit
CREATE TABLE IF NOT EXISTS set_inventory_audit (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    provider_id UUID NOT NULL,
    set_product_id UUID NOT NULL,
    audit_type VARCHAR(50) NOT NULL,
    quantity_delta INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    created_by VARCHAR(254) NOT NULL,
    reason VARCHAR(500),
    CONSTRAINT pk_set_inventory_audit PRIMARY KEY (id),
    CONSTRAINT fk_set_inventory_audit_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT fk_set_inventory_audit_set_product_id FOREIGN KEY (set_product_id) REFERENCES product (id)
);
CREATE INDEX IF NOT EXISTS ix_set_inventory_audit_set_product_id ON set_inventory_audit (set_product_id);

-- 19. Table: custom_box
CREATE TABLE IF NOT EXISTS custom_box (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    order_batch_id UUID NOT NULL,
    box_name VARCHAR(255) NOT NULL,
    box_price NUMERIC(18,2) NOT NULL,
    note VARCHAR(255),
    CONSTRAINT pk_custom_box PRIMARY KEY (id),
    CONSTRAINT fk_custom_box_order_batch_id FOREIGN KEY (order_batch_id) REFERENCES order_batch (id),
    CONSTRAINT ck_custom_box_box_price CHECK (box_price >= 0)
);
CREATE INDEX IF NOT EXISTS ix_custom_box_order_batch_id ON custom_box (order_batch_id);

-- 20. Table: custom_box_item
CREATE TABLE IF NOT EXISTS custom_box_item (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    custom_box_id UUID NOT NULL,
    variant_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(18,2) NOT NULL,
    CONSTRAINT pk_custom_box_item PRIMARY KEY (id),
    CONSTRAINT fk_custom_box_item_custom_box_id FOREIGN KEY (custom_box_id) REFERENCES custom_box (id),
    CONSTRAINT fk_custom_box_item_variant_id FOREIGN KEY (variant_id) REFERENCES product_variant (id),
    CONSTRAINT ck_custom_box_item_quantity CHECK (quantity > 0),
    CONSTRAINT ck_custom_box_item_unit_price CHECK (unit_price >= 0)
);
CREATE INDEX IF NOT EXISTS ix_custom_box_item_custom_box_id ON custom_box_item (custom_box_id);
CREATE INDEX IF NOT EXISTS ix_custom_box_item_variant_id ON custom_box_item (variant_id);

-- 21. Table: complaint
CREATE TABLE IF NOT EXISTS complaint (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    customer_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    order_id UUID NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    complaint_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    resolution VARCHAR(1000),
    resolved_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT pk_complaint PRIMARY KEY (id),
    CONSTRAINT fk_complaint_customer_id FOREIGN KEY (customer_id) REFERENCES "USER" (id),
    CONSTRAINT fk_complaint_provider_id FOREIGN KEY (provider_id) REFERENCES "USER" (id),
    CONSTRAINT fk_complaint_order_id FOREIGN KEY (order_id) REFERENCES "ORDER" (id)
);
CREATE INDEX IF NOT EXISTS ix_complaint_customer_id ON complaint (customer_id);
CREATE INDEX IF NOT EXISTS ix_complaint_provider_id ON complaint (provider_id);
CREATE INDEX IF NOT EXISTS ix_complaint_order_id ON complaint (order_id);

-- 22. Table: production_batch
CREATE TABLE IF NOT EXISTS production_batch (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    variant_id UUID NOT NULL,
    capacity_id UUID,
    production_date DATE NOT NULL,
    planned_quantity INTEGER NOT NULL,
    produced_quantity INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT pk_production_batch PRIMARY KEY (id),
    CONSTRAINT fk_production_batch_variant_id FOREIGN KEY (variant_id) REFERENCES product_variant (id),
    CONSTRAINT fk_production_batch_capacity_id FOREIGN KEY (capacity_id) REFERENCES daily_capacity (id),
    CONSTRAINT ck_production_batch_planned_quantity CHECK (planned_quantity >= 0),
    CONSTRAINT ck_production_batch_produced_quantity CHECK (produced_quantity >= 0)
);
CREATE INDEX IF NOT EXISTS ix_production_batch_variant_id ON production_batch (variant_id);
CREATE INDEX IF NOT EXISTS ix_production_batch_capacity_id ON production_batch (capacity_id);

-- 23. Table: user_social_accounts
CREATE TABLE IF NOT EXISTS user_social_accounts (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(150) NOT NULL,
    provider_email VARCHAR(254),
    CONSTRAINT pk_user_social_accounts PRIMARY KEY (id),
    CONSTRAINT uq_social_provider_account UNIQUE (provider, provider_user_id),
    CONSTRAINT fk_user_social_accounts_user_id FOREIGN KEY (user_id) REFERENCES "USER" (id)
);
CREATE INDEX IF NOT EXISTS idx_social_provider_user_id ON user_social_accounts (provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_social_user_id ON user_social_accounts (user_id);

-- 24. Table: verification_tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    token_type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT pk_verification_tokens PRIMARY KEY (id),
    CONSTRAINT fk_verification_tokens_user_id FOREIGN KEY (user_id) REFERENCES "USER" (id)
);
CREATE INDEX IF NOT EXISTS ix_verification_tokens_user_type ON verification_tokens (user_id, token_type);

-- 25. Table: system_config
CREATE TABLE IF NOT EXISTS system_config (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    config_key VARCHAR(255) NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID,
    CONSTRAINT pk_system_config PRIMARY KEY (id),
    CONSTRAINT uq_system_config_config_key UNIQUE (config_key),
    CONSTRAINT fk_system_config_updated_by FOREIGN KEY (updated_by) REFERENCES "USER" (id)
);
CREATE INDEX IF NOT EXISTS ix_system_config_updated_by ON system_config (updated_by);

-- 26. Database View: v_bake_lines
CREATE OR REPLACE VIEW v_bake_lines AS
SELECT
    i.id AS order_item_id,
    o.id AS order_id,
    o.order_code,
    o.provider_id,
    b.id AS order_batch_id,
    b.delivery_date,
    (b.delivery_date - INTERVAL '1 day')::date AS bake_date,
    i.variant_id,
    i.product_name,
    i.variant_name,
    i.quantity,
    i.bake_quantity,
    o.order_status
FROM order_item i
JOIN order_batch b ON b.id = i.order_batch_id
JOIN "ORDER" o ON o.id = b.order_id
WHERE o.order_status IN ('CONFIRMED', 'DEPOSITED', 'BAKING_QUEUED', 'DELIVERING', 'COMPLETED')
  AND i.bake_quantity > 0;
