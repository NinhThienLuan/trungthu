ALTER TABLE bulk_request ADD COLUMN IF NOT EXISTS cakes_per_box INTEGER NOT NULL DEFAULT 1;
ALTER TABLE bulk_request ADD CONSTRAINT ck_bulk_request_cakes_per_box CHECK (cakes_per_box BETWEEN 1 AND 100);
