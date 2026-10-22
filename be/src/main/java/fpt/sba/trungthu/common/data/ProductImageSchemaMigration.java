//package fpt.sba.trungthu.common.data;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.ObjectProvider;
//import org.springframework.beans.factory.config.BeanPostProcessor;
//import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
//import org.springframework.stereotype.Component;
//
//import javax.sql.DataSource;
//import java.sql.Connection;
//import java.sql.PreparedStatement;
//import java.sql.ResultSet;
//import java.sql.SQLException;
//import java.sql.Statement;
//
///**
// * Chạy trước khi Hibernate cập nhật schema: chuyển ảnh từ variant sang product
// * và đổi các giá trị status cũ sang enum mới. Không xóa đơn hàng.
// */
//@Slf4j
//@Component
//@RequiredArgsConstructor
//public class ProductImageSchemaMigration implements BeanPostProcessor {
//
//    private final ObjectProvider<DataSource> dataSource;
//    private boolean migrated;
//
//    @Override
//    public Object postProcessBeforeInitialization(Object bean, String beanName) {
//        if (!migrated && bean instanceof LocalContainerEntityManagerFactoryBean) {
//            migrated = true;
//            DataSource source = dataSource.getIfAvailable();
//            if (source != null) {
//                migrate(source);
//            }
//        }
//        return bean;
//    }
//
//    private void migrate(DataSource source) {
//        try (Connection connection = source.getConnection(); Statement statement = connection.createStatement()) {
//            String database = connection.getMetaData().getDatabaseProductName();
//            if (hasColumn(connection, "PRODUCT_IMAGE", "VARIANT_ID")) {
//                if ("Microsoft SQL Server".equals(database)) {
//                    migrateSqlServer(statement);
//                } else if ("H2".equals(database)) {
//                    migrateH2(statement);
//                }
//                log.info("Moved PRODUCT_IMAGE from variant_id to product_id");
//            }
//            remapLegacyStatuses(connection, statement);
//        } catch (SQLException exception) {
//            throw new IllegalStateException("Cannot move PRODUCT_IMAGE onto product_id", exception);
//        }
//    }
//
//    private void migrateSqlServer(Statement statement) throws SQLException {
//        statement.execute("""
//                IF COL_LENGTH('PRODUCT_IMAGE', 'product_id') IS NULL
//                    ALTER TABLE PRODUCT_IMAGE ADD product_id uniqueidentifier NULL
//                """);
//        statement.execute("""
//                UPDATE i
//                SET product_id = v.product_id
//                FROM PRODUCT_IMAGE i
//                INNER JOIN PRODUCT_VARIANT v ON v.id = i.variant_id
//                WHERE i.product_id IS NULL
//                """);
//        statement.execute("DELETE FROM PRODUCT_IMAGE WHERE product_id IS NULL");
//        statement.execute("""
//                DECLARE @drop nvarchar(max) = N'';
//                SELECT @drop = @drop + N'ALTER TABLE PRODUCT_IMAGE DROP CONSTRAINT ' + QUOTENAME(fk.name) + N';'
//                FROM sys.foreign_keys fk
//                JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
//                JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
//                WHERE fk.parent_object_id = OBJECT_ID('PRODUCT_IMAGE') AND c.name = 'variant_id';
//                IF @drop <> N'' EXEC sp_executesql @drop;
//                """);
//        statement.execute("""
//                IF EXISTS (SELECT 1 FROM sys.indexes
//                           WHERE name = 'IX_PRODUCT_IMAGE_variant_id' AND object_id = OBJECT_ID('PRODUCT_IMAGE'))
//                    DROP INDEX IX_PRODUCT_IMAGE_variant_id ON PRODUCT_IMAGE
//                """);
//        statement.execute("ALTER TABLE PRODUCT_IMAGE DROP COLUMN variant_id");
//        statement.execute("""
//                ;WITH ranked AS (
//                    SELECT id, ROW_NUMBER() OVER (
//                        PARTITION BY product_id
//                        ORDER BY CASE WHEN is_primary = 1 THEN 0 ELSE 1 END, display_order, created_at, id
//                    ) AS rn
//                    FROM PRODUCT_IMAGE
//                )
//                UPDATE image
//                SET is_primary = CASE WHEN ranked.rn = 1 THEN 1 ELSE 0 END
//                FROM PRODUCT_IMAGE image
//                INNER JOIN ranked ON ranked.id = image.id
//                """);
//    }
//
//    private void migrateH2(Statement statement) throws SQLException {
//        statement.execute("ALTER TABLE PRODUCT_IMAGE ADD COLUMN IF NOT EXISTS product_id UUID");
//        statement.execute("""
//                UPDATE PRODUCT_IMAGE
//                SET product_id = (SELECT product_id FROM PRODUCT_VARIANT v WHERE v.id = PRODUCT_IMAGE.variant_id)
//                WHERE product_id IS NULL
//                """);
//        statement.execute("DELETE FROM PRODUCT_IMAGE WHERE product_id IS NULL");
//        dropH2VariantConstraints(statement);
//        statement.execute("ALTER TABLE PRODUCT_IMAGE DROP COLUMN IF EXISTS variant_id");
//    }
//
//    private void dropH2VariantConstraints(Statement statement) throws SQLException {
//        try (ResultSet keys = statement.executeQuery("""
//                SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
//                WHERE UPPER(TABLE_NAME) = 'PRODUCT_IMAGE' AND UPPER(COLUMN_NAME) = 'VARIANT_ID'
//                """)) {
//            while (keys.next()) {
//                String name = keys.getString(1);
//                try (Statement drop = statement.getConnection().createStatement()) {
//                    drop.execute("ALTER TABLE PRODUCT_IMAGE DROP CONSTRAINT IF EXISTS " + name);
//                }
//            }
//        }
//        statement.execute("DROP INDEX IF EXISTS IX_PRODUCT_IMAGE_VARIANT_ID");
//        statement.execute("DROP INDEX IF EXISTS IX_PRODUCT_IMAGE_variant_id");
//    }
//
//    private void remapLegacyStatuses(Connection connection, Statement statement) throws SQLException {
//        if (!hasColumn(connection, "PRODUCT", "STATUS")) {
//            return;
//        }
//        statement.execute("UPDATE PRODUCT SET status = 'DRAFT' WHERE status IN ('HIDDEN', 'OUT_OF_STOCK', 'INACTIVE')");
//        if (!hasColumn(connection, "PRODUCT_VARIANT", "STATUS")) {
//            return;
//        }
//        statement.execute("UPDATE PRODUCT_VARIANT SET status = 'DISCONTINUED' WHERE status = 'HIDDEN'");
//        statement.execute("""
//                UPDATE PRODUCT_VARIANT SET status = 'IN_STOCK'
//                WHERE status IN ('ACTIVE', 'AVAILABLE') AND stock_quantity > 0
//                """);
//        statement.execute("""
//                UPDATE PRODUCT_VARIANT SET status = 'TEMPORARILY_OUT_OF_STOCK'
//                WHERE status IN ('ACTIVE', 'AVAILABLE', 'OUT_OF_STOCK')
//                """);
//    }
//
//    private boolean hasColumn(Connection connection, String table, String column) throws SQLException {
//        try (PreparedStatement query = connection.prepareStatement("""
//                SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
//                WHERE UPPER(TABLE_NAME) = ? AND UPPER(COLUMN_NAME) = ?
//                """)) {
//            query.setString(1, table);
//            query.setString(2, column);
//            try (ResultSet result = query.executeQuery()) {
//                return result.next() && result.getInt(1) > 0;
//            }
//        }
//    }
//}
