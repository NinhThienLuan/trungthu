package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @EntityGraph(attributePaths = "provider")
    @Query("""
            SELECT o FROM Order o
            WHERE o.customer.id = :customerId
              AND (:status IS NULL OR o.orderStatus = :status)
              AND EXISTS (SELECT b.id FROM OrderBatch b WHERE b.order = o
                  AND (:from IS NULL OR b.deliveryDate >= :from)
                  AND (:to IS NULL OR b.deliveryDate <= :to))
            """)
    Page<Order> findCustomerOrders(@Param("customerId") UUID customerId, @Param("status") OrderStatus status,
            @Param("from") LocalDate from, @Param("to") LocalDate to, Pageable pageable);

    @EntityGraph(attributePaths = "provider")
    @Query("""
            SELECT o FROM Order o
            WHERE o.provider.id = :providerId
              AND (:status IS NULL OR o.orderStatus = :status)
              AND EXISTS (SELECT b.id FROM OrderBatch b WHERE b.order = o
                  AND (:from IS NULL OR b.deliveryDate >= :from)
                  AND (:to IS NULL OR b.deliveryDate <= :to))
            """)
    Page<Order> findProviderOrders(@Param("providerId") UUID providerId, @Param("status") OrderStatus status,
            @Param("from") LocalDate from, @Param("to") LocalDate to, Pageable pageable);

    @EntityGraph(attributePaths = "provider")
    @Query("SELECT o FROM Order o WHERE o.id = :orderId AND (o.customer.id = :userId OR o.provider.id = :userId)")
    Optional<Order> findOwnedOrder(@Param("orderId") UUID orderId, @Param("userId") UUID userId);

    boolean existsByProviderIdAndPaymentMethodAndOrderStatus(UUID providerId, PaymentMethod paymentMethod,
            OrderStatus orderStatus);

    List<Order> findByCheckoutIdOrderByOrderCodeAsc(UUID checkoutId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Transactional(propagation = Propagation.MANDATORY)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") UUID id);

    default Optional<Order> findForUpdateById(UUID id) {
        return findByIdForUpdate(id);
    }

    @Query("""
            SELECT o FROM Order o
            WHERE o.orderStatus = fpt.sba.trungthu.entity.enumeration.OrderStatus.PENDING_DEPOSIT
              AND o.holdExpiresAt <= :deadline ORDER BY o.holdExpiresAt, o.id
            """)
    List<Order> findExpiredPendingDeposits(@Param("deadline") Instant deadline, Pageable pageable);
}
