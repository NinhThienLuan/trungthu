package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    List<OrderItem> findByOrderBatchOrderId(UUID orderId);

    boolean existsByVariantId(UUID variantId);

    boolean existsBySourceSetId(UUID sourceSetId);

    @Query("SELECT DISTINCT i.variant.id FROM OrderItem i WHERE i.variant.id IN :variantIds")
    List<UUID> findVariantIdsWithOrders(@Param("variantIds") Collection<UUID> variantIds);

    @Query("""
            SELECT i FROM OrderItem i
            JOIN FETCH i.orderBatch b
            JOIN FETCH b.order o
            LEFT JOIN FETCH b.capacity
            WHERE i.variant.id = :variantId
            """)
    List<OrderItem> findForTerminate(@Param("variantId") UUID variantId);

    @Query("""
            SELECT i FROM OrderItem i
            JOIN FETCH i.orderBatch b
            LEFT JOIN FETCH b.capacity
            WHERE b.order.id IN :orderIds
            """)
    List<OrderItem> findAllForOrders(@Param("orderIds") Collection<UUID> orderIds);

    @Query("""
            SELECT COALESCE(SUM(i.quantity), 0) FROM OrderItem i
            WHERE i.variant.id = :variantId
              AND i.orderBatch.order.orderStatus <> :cancelled
            """)
    long sumOrderedQuantity(@Param("variantId") UUID variantId, @Param("cancelled") OrderStatus cancelled);

    @Query("""
            SELECT COALESCE(SUM(i.quantity), 0) FROM OrderItem i
            WHERE i.variant.id = :variantId
              AND i.orderBatch.order.orderStatus IN :statuses
            """)
    long sumQuantityByStatuses(@Param("variantId") UUID variantId,
            @Param("statuses") Collection<OrderStatus> statuses);

    @Query("""
            SELECT COALESCE(SUM(i.quantity), 0) FROM OrderItem i
            WHERE i.sourceSet.id = :setId
              AND i.variant.product.productType = fpt.sba.trungthu.entity.enumeration.ProductType.BOX_SHELL
              AND i.orderBatch.order.orderStatus IN :statuses
            """)
    long sumSetQuantityByStatuses(@Param("setId") UUID setId, @Param("statuses") Collection<OrderStatus> statuses);

    @Query("""
            SELECT i FROM OrderItem i
            JOIN FETCH i.orderBatch b
            JOIN FETCH b.order o
            LEFT JOIN FETCH b.capacity
            WHERE i.sourceSet.id = :setId
            """)
    List<OrderItem> findForSet(@Param("setId") UUID setId);

    @Query("""
            SELECT COUNT(i) FROM OrderItem i
            WHERE i.variant.product.id = :productId
              AND i.sourceSet IS NULL
              AND i.orderBatch.order.orderStatus NOT IN :done
            """)
    long countOpenOrders(@Param("productId") UUID productId, @Param("done") Collection<OrderStatus> done);

    @Query("""
            SELECT COUNT(i) FROM OrderItem i
            WHERE i.sourceSet.id = :setId
              AND i.orderBatch.order.orderStatus NOT IN :done
            """)
    long countOpenSetOrders(@Param("setId") UUID setId, @Param("done") Collection<OrderStatus> done);

    @Query("""
            SELECT i FROM OrderItem i
            JOIN FETCH i.orderBatch b
            JOIN FETCH b.order o
            JOIN FETCH o.customer
            WHERE i.variant.id = :variantId
            """)
    List<OrderItem> findWithOrderByVariantId(@Param("variantId") UUID variantId);

    @Query("""
            SELECT i FROM OrderItem i
            JOIN FETCH i.orderBatch b
            JOIN FETCH b.order o
            JOIN FETCH o.customer
            JOIN FETCH i.variant v
            JOIN FETCH v.product
            WHERE o.provider.id = :providerId
            """)
    List<OrderItem> findWithOrderByProviderId(@Param("providerId") UUID providerId);
}
