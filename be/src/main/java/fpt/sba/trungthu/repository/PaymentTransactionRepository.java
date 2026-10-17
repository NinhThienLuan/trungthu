package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
    List<PaymentTransaction> findByOrderIdOrderByCreatedAtAsc(UUID orderId);

    List<PaymentTransaction> findBySubscriptionIdOrderByCreatedAtAsc(UUID subscriptionId);

    interface OrderPaymentTotal {
        UUID getOrderId();
        BigDecimal getPaidAmount();
    }

    @Query("""
            SELECT t.order.id AS orderId, SUM(t.amount) AS paidAmount FROM PaymentTransaction t
            WHERE t.order.id IN :orderIds
              AND t.paymentStatus = fpt.sba.trungthu.entity.enumeration.TransactionStatus.SUCCESS
            GROUP BY t.order.id
            """)
    List<OrderPaymentTotal> sumSuccessfulAmountsByOrderIds(@Param("orderIds") Collection<UUID> orderIds);

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0) FROM PaymentTransaction t
            WHERE t.order.id = :orderId
              AND t.paymentStatus = fpt.sba.trungthu.entity.enumeration.TransactionStatus.SUCCESS
            """)
    BigDecimal sumSuccessfulAmountByOrderId(@Param("orderId") UUID orderId);
}
