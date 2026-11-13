ALTER TABLE store_compliance_doc ADD COLUMN IF NOT EXISTS file_hash VARCHAR(64);
CREATE INDEX IF NOT EXISTS ix_store_compliance_doc_file_hash ON store_compliance_doc (file_hash);
