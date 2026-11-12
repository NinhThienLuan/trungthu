CREATE TABLE IF NOT EXISTS store_review (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    order_id UUID NOT NULL UNIQUE REFERENCES "ORDER"(id),
    provider_id UUID NOT NULL REFERENCES "USER"(id),
    customer_id UUID NOT NULL REFERENCES "USER"(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(2000)
);
CREATE INDEX IF NOT EXISTS ix_store_review_provider_id ON store_review(provider_id);
