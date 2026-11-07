ALTER TABLE payment_transaction ADD COLUMN IF NOT EXISTS checkout_url VARCHAR(512);
ALTER TABLE payment_transaction ADD COLUMN IF NOT EXISTS qr_payload VARCHAR(1024);
