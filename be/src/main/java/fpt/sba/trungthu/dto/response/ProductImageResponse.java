package fpt.sba.trungthu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageResponse {
    private UUID id;
    private String imageUrl;
    private Boolean isPrimary;
    private Integer displayOrder;
}
