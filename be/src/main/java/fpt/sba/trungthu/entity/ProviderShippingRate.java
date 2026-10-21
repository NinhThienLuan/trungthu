package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;

@Entity
@Table(name = "PROVIDER_SHIPPING_RATE", uniqueConstraints =
        @UniqueConstraint(name = "UQ_SHIPPING_PROVIDER_ZONE", columnNames = {"provider_id", "province", "district"}))
@Check(name = "CK_SHIPPING_FEE", constraints = "fee >= 0")
@Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
public class ProviderShippingRate extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @Column(name = "province", nullable = false, length = 100)
    private String province;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "fee", nullable = false, precision = 18, scale = 2)
    private BigDecimal fee;
}
