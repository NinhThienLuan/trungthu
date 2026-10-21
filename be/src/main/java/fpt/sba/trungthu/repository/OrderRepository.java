package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.OrderBatch;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    boolean existsByProviderIdAndPaymentMethodAndOrderStatus(UUID providerId, PaymentMethod paymentMethod,
            OrderStatus orderStatus);

    default Page<Order> findCustomerOrders(UUID customerId, OrderStatus status,
            LocalDate from, LocalDate to, Pageable pageable) {
        return findAll(forOwner("customer", customerId, status, from, to), pageable);
    }

    default Page<Order> findProviderOrders(UUID providerId, OrderStatus status,
            LocalDate from, LocalDate to, Pageable pageable) {
        return findAll(forOwner("provider", providerId, status, from, to), pageable);
    }

    private static Specification<Order> forOwner(String ownerField, UUID ownerId, OrderStatus status,
            LocalDate from, LocalDate to) {
        return (root, query, criteria) -> {
            var owner = criteria.equal(root.get(ownerField).get("id"), ownerId);
            var state = status == null ? criteria.conjunction()
                    : criteria.equal(root.get("orderStatus"), status);
            var batchQuery = query.subquery(UUID.class);
            var batch = batchQuery.from(OrderBatch.class);
            var delivery = criteria.conjunction();
            if (from != null) delivery = criteria.and(delivery,
                    criteria.greaterThanOrEqualTo(batch.get("deliveryDate"), from));
            if (to != null) delivery = criteria.and(delivery,
                    criteria.lessThanOrEqualTo(batch.get("deliveryDate"), to));
            batchQuery.select(batch.get("id")).where(criteria.and(
                    criteria.equal(batch.get("order").get("id"), root.get("id")), delivery));
            return criteria.and(owner, state, criteria.exists(batchQuery));
        };
    }

    @EntityGraph(attributePaths = "provider")
    Optional<Order> findByIdAndCustomerIdOrIdAndProviderId(UUID customerOrderId, UUID customerId,
            UUID providerOrderId, UUID providerId);

    default Optional<Order> findOwnedOrder(UUID orderId, UUID userId) {
        return findByIdAndCustomerIdOrIdAndProviderId(orderId, userId, orderId, userId);
    }

    List<Order> findByCheckoutIdOrderByOrderCodeAsc(UUID checkoutId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Transactional(propagation = Propagation.MANDATORY)
    Optional<Order> findForUpdateById(UUID id);

    List<Order> findByOrderStatusAndHoldExpiresAtLessThanEqualOrderByHoldExpiresAtAscIdAsc(
            OrderStatus status, Instant deadline, Pageable pageable);

    default List<Order> findExpiredPendingDeposits(Instant deadline, Pageable pageable) {
        return findByOrderStatusAndHoldExpiresAtLessThanEqualOrderByHoldExpiresAtAscIdAsc(
                OrderStatus.PENDING_DEPOSIT, deadline, pageable);
    }
}
