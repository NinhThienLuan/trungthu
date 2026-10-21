-- One-time SQL Server adjustment for databases created before PAYOS was added.
-- Hibernate ddl-auto=update adds new columns/tables but does not replace existing CHECK constraints.
IF OBJECT_ID(N'dbo.[ORDER]', N'U') IS NOT NULL
BEGIN
    IF EXISTS (SELECT 1 FROM sys.check_constraints
               WHERE name = N'CK_ORDER_hold_state' AND parent_object_id = OBJECT_ID(N'dbo.[ORDER]'))
        ALTER TABLE dbo.[ORDER] DROP CONSTRAINT [CK_ORDER_hold_state];

    ALTER TABLE dbo.[ORDER] ADD CONSTRAINT [CK_ORDER_hold_state]
        CHECK (([order_status] = 'PENDING_DEPOSIT'
                AND [payment_method] IN ('VIETQR', 'PAYOS')
                AND [hold_expires_at] IS NOT NULL)
            OR ([order_status] <> 'PENDING_DEPOSIT' AND [hold_expires_at] IS NULL));
END;

-- SQL Server UNIQUE constraints permit only one NULL. Filter out non-PayOS transactions.
IF EXISTS (SELECT 1 FROM sys.key_constraints
           WHERE name = N'UQ_PAYMENT_TRANSACTION_payos_order_code'
             AND parent_object_id = OBJECT_ID(N'dbo.PAYMENT_TRANSACTION'))
    ALTER TABLE dbo.[PAYMENT_TRANSACTION] DROP CONSTRAINT [UQ_PAYMENT_TRANSACTION_payos_order_code];

IF COL_LENGTH(N'dbo.PAYMENT_TRANSACTION', N'payos_order_code') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes
                   WHERE name = N'UX_PAYMENT_TRANSACTION_payos_code'
                     AND object_id = OBJECT_ID(N'dbo.PAYMENT_TRANSACTION'))
    CREATE UNIQUE INDEX [UX_PAYMENT_TRANSACTION_payos_code]
        ON dbo.[PAYMENT_TRANSACTION] ([payos_order_code])
        WHERE [payos_order_code] IS NOT NULL;
