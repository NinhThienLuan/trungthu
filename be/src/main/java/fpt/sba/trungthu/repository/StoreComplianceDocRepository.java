package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.StoreComplianceDoc;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoreComplianceDocRepository extends JpaRepository<StoreComplianceDoc, UUID> {

    /**
     * Tìm tất cả tài liệu của Provider
     */
    List<StoreComplianceDoc> findByProviderIdOrderBySubmittedAtDesc(UUID providerId);

    /**
     * Tìm tài liệu theo Provider và loại tài liệu
     */
    Optional<StoreComplianceDoc> findByProviderIdAndDocumentType(UUID providerId, ComplianceDocType documentType);

    /**
     * Tìm tất cả tài liệu chờ duyệt (cho Admin)
     */
    List<StoreComplianceDoc> findByVerificationStatusOrderBySubmittedAtAsc(ComplianceDocStatus status);

    /**
     * Tìm tài liệu với pessimistic lock (để update trạng thái)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<StoreComplianceDoc> findForUpdateById(UUID id);

    default Optional<StoreComplianceDoc> findByIdWithLock(UUID id) {
        return findForUpdateById(id);
    }

    /**
     * Kiểm tra Provider đã có tài liệu APPROVED chưa
     */
    boolean existsByProviderIdAndVerificationStatus(UUID providerId, ComplianceDocStatus status);

    default boolean hasApprovedDocument(UUID providerId) {
        return existsByProviderIdAndVerificationStatus(providerId, ComplianceDocStatus.APPROVED);
    }

    /**
     * Đếm số tài liệu APPROVED của Provider
     */
    long countByProviderIdAndVerificationStatus(UUID providerId, ComplianceDocStatus status);
}
