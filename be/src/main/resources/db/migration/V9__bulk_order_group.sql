CREATE TABLE IF NOT EXISTS bulk_order_group (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    request_id UUID NOT NULL UNIQUE REFERENCES bulk_request(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    gross_amount NUMERIC(18,2) NOT NULL,
    discount_amount NUMERIC(18,2) NOT NULL,
    total_amount NUMERIC(18,2) NOT NULL,
    deposit_amount NUMERIC(18,2) NOT NULL
);
ALTER TABLE bulk_order ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES bulk_order_group(id);
CREATE INDEX IF NOT EXISTS ix_bulk_order_group_id ON bulk_order(group_id);
