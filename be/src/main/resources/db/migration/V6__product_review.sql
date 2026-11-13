CREATE TABLE IF NOT EXISTS product_review (
    id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    product_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    order_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    comment VARCHAR(2000),
    CONSTRAINT pk_product_review PRIMARY KEY (id),
    CONSTRAINT fk_product_review_product_id FOREIGN KEY (product_id) REFERENCES product (id),
    CONSTRAINT fk_product_review_customer_id FOREIGN KEY (customer_id) REFERENCES "USER" (id),
    CONSTRAINT fk_product_review_order_id FOREIGN KEY (order_id) REFERENCES "ORDER" (id),
    CONSTRAINT uq_product_review_order_product UNIQUE (order_id, product_id),
    CONSTRAINT ck_product_review_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX IF NOT EXISTS ix_product_review_product_id ON product_review (product_id);
CREATE INDEX IF NOT EXISTS ix_product_review_customer_id ON product_review (customer_id);
