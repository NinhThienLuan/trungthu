package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

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

    @Nationalized
    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private UserRole role;

    @Nationalized
    @Column(name = "store_name", length = 255)
    private String storeName;

    @Nationalized
    @Column(name = "address", length = 100000)
    private String address;

    @Column(name = "bank_code", length = 20)
    private String bankCode;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Nationalized
    @Column(name = "bank_account_name", length = 150)
    private String bankAccountName;

    @Builder.Default
    @Column(name = "is_compliance_approved", nullable = false)
    private Boolean isComplianceApproved = false;

    @Builder.Default
    @Column(name = "is_season_active", nullable = false)
    private Boolean isSeasonActive = true;

    /** Đăng ký nhận mật khẩu tạm qua email -> phải đổi mật khẩu ở lần đăng nhập đầu */
    @Builder.Default
    @ColumnDefault("0")
    @Column(name = "require_password_change", nullable = false)
    private Boolean requirePasswordChange = false;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private UserStatus status = UserStatus.ACTIVE;
}
