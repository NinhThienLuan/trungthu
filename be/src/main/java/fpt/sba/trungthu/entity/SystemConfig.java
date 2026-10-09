package fpt.sba.trungthu.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;
import java.time.LocalDateTime;
import org.hibernate.annotations.FractionalSeconds;
import java.time.ZoneOffset;

@Entity
@Table(name = "SYSTEM_CONFIG", indexes = {@Index(name = "IX_SYSTEM_CONFIG_updated_by", columnList = "updated_by")}, uniqueConstraints = {@UniqueConstraint(name = "UQ_SYSTEM_CONFIG_config_key", columnNames = {"config_key"})})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "config_id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "updated_by", nullable = true, foreignKey = @ForeignKey(name = "FK_SYSTEM_CONFIG_updated_by"))
    private User updatedBy;

    @Column(name = "config_key", nullable = false, length = 255)
    private String configKey;

    @Column(name = "config_value", nullable = false, length = 100000)
    private String configValue;

    @Column(name = "description", length = 100000)
    private String description;

    @Column(name = "updated_at", nullable = false)
    @FractionalSeconds(0)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void touch() {
        updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }
}
