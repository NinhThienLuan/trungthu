package fpt.sba.trungthu.common.data;

import fpt.sba.trungthu.dto.request.ProductImageRequest;
import fpt.sba.trungthu.dto.request.ProductImagesRequest;
import org.springframework.core.io.ClassPathResource;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

final class DemoAlbum {

    private DemoAlbum() {
    }

    static ProductImagesRequest of(String... files) {
        List<ProductImageRequest> images = new ArrayList<>();
        for (int index = 0; index < files.length; index++) {
            images.add(image(files[index], index == 0, index));
        }
        return ProductImagesRequest.builder().images(images).build();
    }

    private static ProductImageRequest image(String file, boolean primary, int order) {
        try {
            byte[] bytes = new ClassPathResource("demo/" + file).getContentAsByteArray();
            String mime = file.endsWith(".png") ? "image/png" : "image/jpeg";
            return ProductImageRequest.builder()
                    .imageUrl("data:" + mime + ";base64," + Base64.getEncoder().encodeToString(bytes))
                    .isPrimary(primary)
                    .displayOrder(order)
                    .build();
        } catch (Exception exception) {
            throw new IllegalStateException("Cannot read demo image " + file, exception);
        }
    }
}
