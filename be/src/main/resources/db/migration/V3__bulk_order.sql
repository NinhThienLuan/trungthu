ALTER TABLE provider_quotation ADD COLUMN IF NOT EXISTS cakes_per_box INTEGER NOT NULL DEFAULT 1;
ALTER TABLE provider_quotation ADD CONSTRAINT ck_provider_quotation_cakes_per_box CHECK (cakes_per_box > 0);

CREATE TABLE IF NOT EXISTS bulk_order (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    quote_id UUID NOT NULL REFERENCES provider_quotation(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    cakes_per_box INTEGER NOT NULL CHECK (cakes_per_box > 0),
    unit_price NUMERIC(18,2) NOT NULL,
    gross_amount NUMERIC(18,2) NOT NULL,
    discount_amount NUMERIC(18,2) NOT NULL,
    total_amount NUMERIC(18,2) NOT NULL,
    deposit_amount NUMERIC(18,2) NOT NULL,
    delivery_date DATE NOT NULL,
    deposit_deadline TIMESTAMP NOT NULL,
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(20),
    delivery_address VARCHAR(1000),
    status VARCHAR(30) NOT NULL,
    CONSTRAINT uq_bulk_order_quote UNIQUE (quote_id)
);

CREATE TABLE IF NOT EXISTS bulk_order_day (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    order_id UUID NOT NULL REFERENCES bulk_order(id),
    capacity_id UUID NOT NULL REFERENCES daily_capacity(id),
    production_date DATE NOT NULL,
    planned_cakes INTEGER NOT NULL CHECK (planned_cakes > 0),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_bulk_order_day_date UNIQUE (order_id, production_date)
);
