package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.JwtService;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductImage;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.ProductImageRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Base64;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
        "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc
class ProductImageApiTests {

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository users;
    @Autowired private ProductRepository products;
    @Autowired private ProductImageRepository images;
    @MockitoBean private JavaMailSender mailSender;

    private static final byte[] PIXEL = {(byte) 0x89, 'P', 'N', 'G', 1, 2, 3};
    private static final String DATA_URL = "data:image/png;base64," + Base64.getEncoder().encodeToString(PIXEL);

    @Test
    void base64AlbumIsServedAsShortCachedLinkAndSurvivesResubmit() throws Exception {
        User seller = users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@shop.test").password("hash")
                .fullName("Baker").storeName("Oven").role(UserRole.PROVIDER).status(UserStatus.ACTIVE).build());
        Product product = products.saveAndFlush(Product.builder().provider(seller).name("Card")
                .productType(ProductType.GREETING_CARD).status(ProductStatus.DRAFT).build());
        ProductImage image = images.saveAndFlush(ProductImage.builder().product(product).imageUrl(DATA_URL)
                .isPrimary(true).displayOrder(0).build());
        String shortUrl = "/api/products/images/" + image.getId();

        mvc.perform(get(shortUrl))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("max-age")))
                .andExpect(content().bytes(PIXEL));

        // Seller gửi lại đúng album nhận được (link ngắn) -> ảnh gốc vẫn còn, có id mới
        mvc.perform(put("/api/provider/products/{id}/images", product.getId())
                        .header("Authorization", "Bearer " + jwtService.generateAccessToken(seller))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"images\":[{\"imageUrl\":\"%s\",\"isPrimary\":true,\"displayOrder\":0}]}"
                                .formatted(shortUrl)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.images[0].imageUrl").value(org.hamcrest.Matchers.startsWith("/api/products/images/")))
                .andExpect(jsonPath("$.data.primaryImageUrl").value(org.hamcrest.Matchers.not(shortUrl)));

        assertThat(images.findAll()).filteredOn(i -> i.getProduct().getId().equals(product.getId()))
                .singleElement().returns(DATA_URL, ProductImage::getImageUrl);
    }

    @Test
    void nonImageDataUrlIsNotServed() throws Exception {
        User seller = users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@shop.test").password("hash")
                .fullName("Baker").storeName("Oven").role(UserRole.PROVIDER).status(UserStatus.ACTIVE).build());
        Product product = products.saveAndFlush(Product.builder().provider(seller).name("Card")
                .productType(ProductType.GREETING_CARD).status(ProductStatus.DRAFT).build());
        ProductImage html = images.saveAndFlush(ProductImage.builder().product(product)
                .imageUrl("data:text/html;base64,PHNjcmlwdD4=").isPrimary(true).displayOrder(0).build());

        mvc.perform(get("/api/products/images/" + html.getId())).andExpect(status().isNotFound());
        mvc.perform(get("/api/products/images/" + UUID.randomUUID())).andExpect(status().isNotFound());
    }
}
