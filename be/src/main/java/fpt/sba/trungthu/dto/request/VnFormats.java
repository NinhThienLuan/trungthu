package fpt.sba.trungthu.dto.request;

/** Định dạng giấy tờ / liên hệ Việt Nam dùng chung cho RFQ và hoá đơn VAT. FE: schemas/index.ts `taxCode`, `phone` */
public final class VnFormats {
    private VnFormats() {}

    /** Mã số thuế doanh nghiệp: 10 số, hoặc 10 số + "-" + 3 số (đơn vị phụ thuộc / chi nhánh) */
    public static final String TAX_CODE = "^\\d{10}(-\\d{3})?$";
    public static final String TAX_CODE_MESSAGE = "Mã số thuế gồm 10 số hoặc dạng 10 số-3 số (chi nhánh)";

    /** Giống RegisterRequest: 0[35789] + 8 số, hoặc 84 + 8 số */
    public static final String PHONE = "^(84|0[35789])\\d{8}$";
    public static final String PHONE_MESSAGE = "Số điện thoại không hợp lệ";
}
