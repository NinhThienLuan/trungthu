package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.PaymentTransaction;
import fpt.sba.trungthu.entity.enumeration.TransactionStatus;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
    List<PaymentTransaction> findByOrderIdOrderByCreatedAtAsc(UUID orderId);

    List<PaymentTransaction> findBySubscriptionIdOrderByCreatedAtAsc(UUID subscriptionId);

    @Query("select p.subscription.id from PaymentTransaction p where p.transactionCode = :transactionCode")
    Optional<UUID> findSubscriptionIdByTransactionCode(String transactionCode);

    Optional<PaymentTransaction> findBySubscriptionIdAndPaymentMethod(UUID subscriptionId, PaymentMethod paymentMethod);

    List<PaymentTransaction> findBySubscriptionIdInAndPaymentMethod(Collection<UUID> subscriptionIds, PaymentMethod paymentMethod);

    List<PaymentTransaction> findByOrderIdInAndPaymentStatus(java.util.Collection<UUID> orderIds,
            TransactionStatus paymentStatus);

    List<PaymentTransaction> findByOrderIdAndPaymentStatus(UUID orderId, TransactionStatus paymentStatus);

    default BigDecimal sumSuccessfulAmountByOrderId(UUID orderId) {
        return findByOrderIdAndPaymentStatus(orderId, TransactionStatus.SUCCESS).stream()
                .map(PaymentTransaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
