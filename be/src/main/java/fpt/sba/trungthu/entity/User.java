package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

@Entity
@Table(name = "`USER`", uniqueConstraints = @UniqueConstraint(name = "UQ_USER_email", columnNames = "email"))
@Check(name = "CK_USER_role", constraints = "role IN ('CUSTOMER', 'PROVIDER', 'PLATFORM_ADMIN')")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private UserRole role;

    @Column(name = "store_name", length = 255)
    private String storeName;

    @Column(name = "address", length = 100000)
    private String address;

    @Builder.Default
    @Column(name = "is_compliance_approved", nullable = false)
    private Boolean isComplianceApproved = false;

    @Builder.Default
    @Column(name = "is_season_active", nullable = false)
    private Boolean isSeasonActive = true;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private UserStatus status = UserStatus.ACTIVE;
}
