package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadComplianceDocRequest {
    private String documentType; // Accepted as string from API, parsed in service layer
    
    @NotNull
    private MultipartFile file;
}
