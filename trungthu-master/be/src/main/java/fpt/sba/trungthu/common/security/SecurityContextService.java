package fpt.sba.trungthu.common.security;

import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;

import java.util.UUID;

/**
 * Interface cung cấp ngữ cảnh xác thực và thông tin tài khoản người dùng đang đăng nhập.
 * Cho phép các tầng Controller và Service gọi qua interface thống nhất thay vì truy cập trực tiếp SecurityContextHolder.
 */
public interface SecurityContextService {

    /**
     * Lấy thực thể User đầy đủ từ DB tương ứng với người dùng đang đăng nhập.
     */
    User getCurrentUser();

    /**
     * Lấy UUID định danh của người dùng đang đăng nhập.
     */
    UUID getCurrentUserId();

    /**
     * Lấy email của người dùng đang đăng nhập.
     */
    String getCurrentUserEmail();

    /**
     * Kiểm tra xem người dùng có vai trò cụ thể hay không.
     */
    boolean hasRole(UserRole role);

    /**
     * Kiểm tra xem người dùng đăng nhập có phải là chủ sở hữu (owner) của tài nguyên này không.
     * Thường dùng cho các kiểm tra quyền như list.isOwner, order.isOwner.
     */
    boolean isOwner(UUID resourceOwnerId);
}
