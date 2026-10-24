package fpt.sba.trungthu.dto.request;

/** Quy tắc mật khẩu mới (README 3.2 step 3): dùng cho đặt lại và đổi mật khẩu. FE: schemas/index.ts `strongPassword` */
public final class PasswordPolicy {
    private PasswordPolicy() {}

    /** 8–50 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt @$!%*?&# */
    public static final String REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#]).{8,50}$";

    public static final String MESSAGE =
            "Mật khẩu 8–50 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&#)";
}
