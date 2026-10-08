package fpt.sba.trungthu.common.security;

import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private JwtProperties jwtProperties;

    @BeforeEach
    void setUp() {
        jwtProperties = new JwtProperties(
                "dHJ1bmd0aHUtc2Fhcy1wbGF0Zm9ybS1zZWNyZXQta2V5LTIwMjYtbW9vbmNha2Utc2VjdXJpdHkta2V5Cg==",
                15,
                7
        );
        jwtService = new JwtService(jwtProperties);
    }

    @Test
    void testGenerateAndParseAccessToken() {
        User user = User.builder()
                .id(1L)
                .email("buyer@test.com")
                .fullName("Test Buyer")
                .role(UserRole.BUYER)
                .build();

        String token = jwtService.generateAccessToken(user);
        assertNotNull(token);

        Claims claims = jwtService.parseClaims(token);
        assertEquals("buyer@test.com", claims.getSubject());
        assertEquals("1", claims.get("uid"));
        assertEquals("ROLE_BUYER", claims.get("role"));
        assertEquals("access", claims.get("typ"));
        assertTrue(jwtService.validateToken(token));
    }

    @Test
    void testGenerateRefreshToken() {
        User user = User.builder()
                .id(2L)
                .email("seller@test.com")
                .fullName("Test Seller")
                .role(UserRole.SELLER)
                .build();

        String token = jwtService.generateRefreshToken(user);
        assertNotNull(token);

        Claims claims = jwtService.parseClaims(token);
        assertEquals("seller@test.com", claims.getSubject());
        assertEquals("refresh", claims.get("typ"));
        assertNotNull(claims.getId());
    }
}
