// Dữ liệu mẫu lấy nguyên từ bản thiết kế Stitch (tên, giá, giá sỉ, ảnh, xưởng, đánh giá).
// Dùng khi USE_MOCK.products = true. Ảnh host trên lh3.googleusercontent.com.
import type { Product } from '../types/product'

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "nguyet-tru-dung-nham",
    providerId: "p-dong-phuong",
    storeName: "Đông Phương Cầu Đất",
    name: "Nguyệt Trụ Dung Nham Hoàng Kim",
    description: "Nhân trứng muối nghiền chảy quyện cùng hạt sen Tây Hồ, vỏ bánh nướng nước đường thắng 3 năm thơm ngào ngạt.",
    productType: "BOX_SHELL",
    status: 'ACTIVE',
    createdAt: '2026-10-14T05:00:00',
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuATgsN02dqGufqxcmFC95JJgCQOxGcpq9zAlaaONH3A04vjQT5Iny096_zZ1MAsGrype4h9qdTUu7dQBRYdqK66fdIprN_xHNPXft8HCP1mvxFbt5HFP8nslghvnH_PDnZuSE1siBCDAjyqppyv0GqgU_Q8glAmd7gNbANR13shCiBQWO99cShtEANnVXMHMrci170zR9w7i-dGiNuK9lxJbd_zefr8BeFgWa5YdLHm1DkdWCBqzOtq",
    imageAlt: "Close-up luxury shot of golden baked Vietnamese Mooncake with molten lava salted egg flowing gently out, sliced on a dark slate tray with tea steam in warm ambient cinematic lighting, golden highlights, culinary commercial editorial style",
    variants: [
      { id: "nguyet-tru-dung-nham-v1", variantName: "Hộp 4 Bánh Ngự Thiện", sku: "NVD-NGUYET-TRU-DUNG-NHAM-V1", price: 750000, stockQuantity: 48, weightGram: 880, boxCapacity: null, status: 'ACTIVE' },
      { id: "nguyet-tru-dung-nham-v2", variantName: "Hộp 6 Bánh", sku: "NVD-NGUYET-TRU-DUNG-NHAM-V2", price: 1090000, stockQuantity: 24, weightGram: null, boxCapacity: null, status: 'ACTIVE' },
      { id: "nguyet-tru-dung-nham-v3", variantName: "Hộp 8 Bánh", sku: "NVD-NGUYET-TRU-DUNG-NHAM-V3", price: 1420000, stockQuantity: 16, weightGram: null, boxCapacity: null, status: 'ACTIVE' },
    ],
    display: {"badgeIcon": "schedule", "badgeLabel": "Mới ra lò 05:00", "rating": "4.9", "reviews": "(184)", "packLabel": "Hộp 4 Bánh Ngự Thiện", "weightLabel": "Trọng lượng 880g", "oldPrice": 820000, "unit": "/hộp", "wholesaleLabel": "Sỉ >100: 600.000 đ", "discountLabel": "Chiết khấu 20%", "tiers": ["1-49 hộp: 750k", "50-99: 675k (-10%)", ">500: 487k (-35%)"], "configs": [{"variantId": "nguyet-tru-dung-nham-v1", "label": "Quy Cách Chuẩn", "title": "Hộp 4 Bánh Ngự Thiện", "sub": "Kèm Trà Cổ Thụ"}, {"variantId": "nguyet-tru-dung-nham-v2", "label": "Song Thịnh Vượng", "title": "Hộp 6 Bánh", "sub": "Hộp Gỗ Dạ Nguyệt"}, {"variantId": "nguyet-tru-dung-nham-v3", "label": "Đại Đoàn Viên", "title": "Hộp 8 Bánh", "sub": "Kèm 2 Hũ Ngự Trà"}]},
  },
  {
    id: "thap-cam-bat-buu",
    providerId: "p-bao-phuong",
    storeName: "Bảo Phương Thụy Khuê",
    name: "Thập Cẩm Bát Bửu Thụy Khuê",
    description: "Gà quay vi cá, lạp xưởng Mai Quế Lộ, hạt dưa hoa sen cùng lá chanh bánh chưng thái sợi chỉ tơ chuẩn vị đất kinh kỳ.",
    productType: "BOX_SHELL",
    status: 'ACTIVE',
    createdAt: '2026-10-13T05:00:00',
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIzLIPzYCEIxfw_VBNur7U9xpAV4hHG5O-ftvMRDsstbCYPBbK_efi1UeAfOJO-vkBgQ7U2l4sdFJg_oc7yCv59q9Bsx1thVNEXPkfzpCxJbXTomoTPxewh6a8MwdhHRdmrpfAXsLbKzaDk32GEXjC-qpuL2AFf4YoS6hBcf9eCrcicIkjRH1zEo8pdKNkcaPM7swuPpcPq-GE_zWKwZkDP7ViqsKbLPy0-ndwTXIHyqQl3rnZVGDZ",
    imageAlt: "Traditional luxury square Vietnamese Mooncake with ornate imperial floral carved embossing, cut half showing rich savory mixed nuts, candied pork fat, lotus seeds, and double golden yolks, dark teal and rich gold setting",
    variants: [
      { id: "thap-cam-bat-buu-v1", variantName: "Hộp Gỗ Sơn Mài 4 Bánh", sku: "NVD-THAP-CAM-BAT-BUU-V1", price: 890000, stockQuantity: 60, weightGram: 1000, boxCapacity: null, status: 'ACTIVE' },
      { id: "thap-cam-bat-buu-v2", variantName: "Hộp 6 Bánh", sku: "NVD-THAP-CAM-BAT-BUU-V2", price: 1290000, stockQuantity: 30, weightGram: null, boxCapacity: null, status: 'ACTIVE' },
      { id: "thap-cam-bat-buu-v3", variantName: "Hộp 8 Bánh", sku: "NVD-THAP-CAM-BAT-BUU-V3", price: 1690000, stockQuantity: 20, weightGram: null, boxCapacity: null, status: 'ACTIVE' },
    ],
    display: {"badgeIcon": "verified", "badgeLabel": "Cổ Truyền Trăm Năm", "rating": "5.0", "reviews": "(412)", "packLabel": "Hộp Gỗ Sơn Mài 4 Bánh", "weightLabel": "Trọng lượng 1.000g", "oldPrice": 950000, "unit": "/hộp", "wholesaleLabel": "Sỉ >100: 712.000 đ", "discountLabel": "Chiết khấu 20%", "tiers": ["1-49 hộp: 890k", "50-99: 801k (-10%)", ">500: 578k (-35%)"], "configs": [{"variantId": "thap-cam-bat-buu-v1", "label": "Quy Cách Chuẩn", "title": "Hộp Gỗ Sơn Mài 4 Bánh", "sub": "Kèm Trà Cổ Thụ"}, {"variantId": "thap-cam-bat-buu-v2", "label": "Song Thịnh Vượng", "title": "Hộp 6 Bánh", "sub": "Hộp Gỗ Dạ Nguyệt"}, {"variantId": "thap-cam-bat-buu-v3", "label": "Đại Đoàn Viên", "title": "Hộp 8 Bánh", "sub": "Kèm 2 Hũ Ngự Trà"}]},
  },
  {
    id: "da-yen-hoang-trieu",
    providerId: "p-nguyet-vien-dai",
    storeName: "Đại Sàn Nguyệt Viên Đài",
    name: "Dạ Yến Hoàng Triều Bào Ngư XO",
    description: "Bào ngư thượng hải sốt XO đậm đà, kết hợp nấm truffle đen và tổ yến đảo ngự dược. Tặng kèm hũ Trà Cổ Thụ Suối Giàng.",
    productType: "BOX_SHELL",
    status: 'ACTIVE',
    createdAt: '2026-10-12T05:00:00',
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNEB9akwX9e9_D1Ev9lcRQcABLaKBcjZisBBNnTTkERvJtI_B6Q-L_fWaOLoaHqUglnf5tSw7Y3EWgct1cg3JhYvnoYvkvunH8h9AOyuZ0t7N-PYoSrCdSs1wwHiYxqp542dyUDVc7zV_WiOVl5dJCbY-FJR_sBMGbwJNS5-EVZYcQ_qWr9QB13KcS6QiXxXvKgRktreDt-7D1UHo_q8YY0oq0IcKBAVF81OB0aafjTGn3r3mvNe2U",
    imageAlt: "Editorial luxury styling of deep jade green and gold packaging box with an open lacquer chest displaying six glistening gourmet mooncakes and a porcelain teacup filled with imperial golden tea",
    variants: [
      { id: "da-yen-hoang-trieu-v1", variantName: "Rương Gỗ 8 Bánh + Trà Sen", sku: "NVD-DA-YEN-HOANG-TRIEU-V1", price: 2450000, stockQuantity: 12, weightGram: 2200, boxCapacity: null, status: 'ACTIVE' },
      { id: "da-yen-hoang-trieu-v2", variantName: "Hộp 6 Bánh", sku: "NVD-DA-YEN-HOANG-TRIEU-V2", price: 3550000, stockQuantity: 6, weightGram: null, boxCapacity: null, status: 'ACTIVE' },
      { id: "da-yen-hoang-trieu-v3", variantName: "Hộp 8 Bánh", sku: "NVD-DA-YEN-HOANG-TRIEU-V3", price: 4660000, stockQuantity: 4, weightGram: null, boxCapacity: null, status: 'ACTIVE' },
    ],
    display: {"badgeIcon": "diamond", "badgeLabel": "Rương VIP Sơn Mài", "rating": "4.95", "reviews": "(89)", "packLabel": "Rương Gỗ 8 Bánh + Trà Sen", "weightLabel": "Trọng lượng 2.200g", "oldPrice": 2800000, "unit": "/rương", "wholesaleLabel": "Sỉ >50: 1.960.000 đ", "discountLabel": "Chiết khấu 20%", "tiers": ["1-19 rương: 2.450k", "20-49: 2.205k (-10%)", ">100: 1.592k (-35%)"], "configs": [{"variantId": "da-yen-hoang-trieu-v1", "label": "Quy Cách Chuẩn", "title": "Rương Gỗ 8 Bánh + Trà Sen", "sub": "Kèm Trà Cổ Thụ"}, {"variantId": "da-yen-hoang-trieu-v2", "label": "Song Thịnh Vượng", "title": "Hộp 6 Bánh", "sub": "Hộp Gỗ Dạ Nguyệt"}, {"variantId": "da-yen-hoang-trieu-v3", "label": "Đại Đoàn Viên", "title": "Hộp 8 Bánh", "sub": "Kèm 2 Hũ Ngự Trà"}]},
  },
  {
    id: "bach-hoa-sen-trang",
    providerId: "p-vinh-hung",
    storeName: "Vĩnh Hưng Hội An",
    name: "Bách Hoa Sen Trắng Uji Matcha",
    description: "Hạt sen tịnh khiết ủ cùng tinh chất bột trà Uji Kyoto thượng hạng, vị ngọt dịu thanh tao không béo gắt.",
    productType: "BOX_SHELL",
    status: 'ACTIVE',
    createdAt: '2026-10-11T05:00:00',
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPW0Mh7gDqn9w_E9oZDjLGozIrhBFK3LD5ibGRMjGuL_8v4wUF_9Ik_IJE8ahOblwqZMYSEQiWegT2qYZ99HlqHljE6tHq7c6JOt6KPqJNPe_KKee5qnQNw8oUNgpEDR553JrHl6vZ5cIrauxykFXXyUxg763XT6P9PPvnoU53yv_ikfQryh8A8k63OpygPYycNRhHTYeSmK68DboLpTJ7SOUHDMDbLJtMtkn6QVeWwyOKtszwOQbY",
    imageAlt: "Refined green matcha dusted mooncake cut in quarters showing creamy emerald matcha core and soft white lotus seed paste, Japanese tea set and bamboo mat in soft natural studio light",
    variants: [
      { id: "bach-hoa-sen-trang-v1", variantName: "Hộp Ngọc Thạch 6 Bánh", sku: "NVD-BACH-HOA-SEN-TRANG-V1", price: 1050000, stockQuantity: 35, weightGram: 1200, boxCapacity: null, status: 'ACTIVE' },
      { id: "bach-hoa-sen-trang-v2", variantName: "Hộp 6 Bánh", sku: "NVD-BACH-HOA-SEN-TRANG-V2", price: 1520000, stockQuantity: 17, weightGram: null, boxCapacity: null, status: 'ACTIVE' },
      { id: "bach-hoa-sen-trang-v3", variantName: "Hộp 8 Bánh", sku: "NVD-BACH-HOA-SEN-TRANG-V3", price: 2000000, stockQuantity: 11, weightGram: null, boxCapacity: null, status: 'ACTIVE' },
    ],
    display: {"badgeIcon": "schedule", "badgeLabel": "Mới nướng 06:30", "rating": "4.88", "reviews": "(128)", "packLabel": "Hộp Ngọc Thạch 6 Bánh", "weightLabel": "Trọng lượng 1.200g", "oldPrice": 1150000, "unit": "/hộp", "wholesaleLabel": "Sỉ >100: 840.000 đ", "discountLabel": "Chiết khấu 20%", "tiers": ["1-49 hộp: 1.050k", "50-99: 945k (-10%)", ">500: 682k (-35%)"], "configs": [{"variantId": "bach-hoa-sen-trang-v1", "label": "Quy Cách Chuẩn", "title": "Hộp Ngọc Thạch 6 Bánh", "sub": "Kèm Trà Cổ Thụ"}, {"variantId": "bach-hoa-sen-trang-v2", "label": "Song Thịnh Vượng", "title": "Hộp 6 Bánh", "sub": "Hộp Gỗ Dạ Nguyệt"}, {"variantId": "bach-hoa-sen-trang-v3", "label": "Đại Đoàn Viên", "title": "Hộp 8 Bánh", "sub": "Kèm 2 Hũ Ngự Trà"}]},
  },
  {
    id: "yen-sao-dat-vang",
    providerId: "p-nhu-lan",
    storeName: "Như Lan Sài Gòn",
    name: "Yến Sào Khánh Hòa Dát Vàng",
    description: "Sợi yến đảo thiên nhiên nguyên chất chưng cất cùng mật ong hoa nhãn và nhụy hoa nghệ tây Saffron Iran cao cấp.",
    productType: "BOX_SHELL",
    status: 'ACTIVE',
    createdAt: '2026-10-10T05:00:00',
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpBepRAaxvTCxs0hLP2CtSO5kVfKS_mlCLT4a975Qk706baZ-BNALGCPyxhnmmhoFbKU-qRDuHENHK822gEPIXJA85l_RJ6wmQpSgNIhWaRRkPfCgTrtd4gFBKUic3DNcxvWi4ni6xa4E5TyavEfSlTQ41e7lZpF-Orle6QKlbIpb3cj0KiQ_i92rdq2PDoPLfdYLt6oksm6fPj681ZfRArtejR-s9C4CgrAX5FdOoWPV9AIP0ewOz",
    imageAlt: "Delicate bird nest mooncake garnished with edible 24k gold leaf foil flakes, placed on a white porcelain pedestal with dried lotus seeds around, luxurious warm golden lighting",
    variants: [
      { id: "yen-sao-dat-vang-v1", variantName: "Hộp Quà Hoàng Kim 4 Bánh", sku: "NVD-YEN-SAO-DAT-VANG-V1", price: 1220000, stockQuantity: 24, weightGram: 900, boxCapacity: null, status: 'ACTIVE' },
      { id: "yen-sao-dat-vang-v2", variantName: "Hộp 6 Bánh", sku: "NVD-YEN-SAO-DAT-VANG-V2", price: 1770000, stockQuantity: 12, weightGram: null, boxCapacity: null, status: 'ACTIVE' },
      { id: "yen-sao-dat-vang-v3", variantName: "Hộp 8 Bánh", sku: "NVD-YEN-SAO-DAT-VANG-V3", price: 2320000, stockQuantity: 8, weightGram: null, boxCapacity: null, status: 'ACTIVE' },
    ],
    display: {"badgeIcon": "local_fire_department", "badgeLabel": "Vàng Lá 24K", "rating": "4.92", "reviews": "(230)", "packLabel": "Hộp Quà Hoàng Kim 4 Bánh", "weightLabel": "Trọng lượng 900g", "oldPrice": 1350000, "unit": "/hộp", "wholesaleLabel": "Sỉ >100: 976.000 đ", "discountLabel": "Chiết khấu 20%", "tiers": ["1-49 hộp: 1.220k", "50-99: 1.098k (-10%)", ">500: 793k (-35%)"], "configs": [{"variantId": "yen-sao-dat-vang-v1", "label": "Quy Cách Chuẩn", "title": "Hộp Quà Hoàng Kim 4 Bánh", "sub": "Kèm Trà Cổ Thụ"}, {"variantId": "yen-sao-dat-vang-v2", "label": "Song Thịnh Vượng", "title": "Hộp 6 Bánh", "sub": "Hộp Gỗ Dạ Nguyệt"}, {"variantId": "yen-sao-dat-vang-v3", "label": "Đại Đoàn Viên", "title": "Hộp 8 Bánh", "sub": "Kèm 2 Hũ Ngự Trà"}]},
  },
  {
    id: "banh-deo-hat-sen",
    providerId: "p-ba-dan",
    storeName: "Bà Dần Phố Cổ",
    name: "Bánh Dẻo Hạt Sen Hạnh Nhân Cổ Truyền",
    description: "Vỏ bánh dẻo làm từ nếp cái hoa vàng giã tay ướp hương hoa bưởi tươi tháng Tám, nhân nhuyễn hạt sen thơm dịu.",
    productType: "LOOSE_CAKE",
    status: 'ACTIVE',
    createdAt: '2026-10-09T05:00:00',
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEKhSMTFFMYRwqyqwB_me1SdxGxgX1eD1IJDK4UjxqlBNhBlB7iX5atzlOXlnkg7Ets5pv6KiuewK3ymdW1IMiwQv9iFsvyNnZS2l6cREAqdZrHm6_ZQmvrLfpRnVReoxQcIzasvSMjBZojEwmFL3-vi55054bQcjL5wc3pz95i10mqKntLNP5dDUL-TNEpRe8a3yoOFCHEOWxdUjVOzVusfSWKwiLnD1SxlH6lC7BEvaGTYrkil0r",
    imageAlt: "Single artisanal square mooncake presented on a celadon porcelain dish with a tiny bamboo cutter knife and fragrant jasmine tea pot, artistic bakery editorial photography",
    variants: [
      { id: "banh-deo-hat-sen-v1", variantName: "Bánh Lẻ Thưởng Trà", sku: "NVD-BANH-DEO-HAT-SEN-V1", price: 145000, stockQuantity: 180, weightGram: 200, boxCapacity: null, status: 'ACTIVE' },
    ],
    display: {"badgeIcon": "local_cafe", "badgeLabel": "Thưởng Trà Lẻ", "rating": "4.85", "reviews": "(310)", "packLabel": "Bánh Lẻ Thưởng Trà", "weightLabel": "Trọng lượng 200g", "oldPrice": 160000, "unit": "/chiếc", "wholesaleLabel": "Sỉ >200: 116.000 đ", "discountLabel": "Chiết khấu 20%", "tiers": ["1-99 chiếc: 145k", "100-199: 130k (-10%)", ">500: 94k (-35%)"], "configs": [{"variantId": "banh-deo-hat-sen-v1", "label": "Quy Cách Chuẩn", "title": "Bánh Lẻ Thưởng Trà", "sub": "Trọng lượng 200g"}]},
  },
]

/** Bộ ảnh trang chi tiết Stitch (ảnh thực tế, hộp, hũ trà, chứng nhận) — dùng làm thư viện ảnh phụ */
export const DETAIL_GALLERY: string[] = ["https://lh3.googleusercontent.com/aida-public/AB6AXuC7QY1S6TCPlqpR7eUd7e_YWiN4EF2XE30qD_AGOGAW6ZFKlZvPcw3oCQXxCLwTV2qtY29FyhT1gEUNKOSyGzw8iSBqlSKjZQlL0v2Cn5RKQV7jkWs6R9WjGU8QYUdTMZI0stiDnT9fD9CTkNfGlGt_UrOmST6pZ3OnbraB5qhAKQ43FcnlYcP5fhlYqKn_576W4-pBR8AHIg_Nd236vaThG5sGMGjaxpzQfYCB1mfWD8FtRqrQQLex", "https://lh3.googleusercontent.com/aida-public/AB6AXuCR6e9yuOzQ7dYh6pKDqv5AFltaZINsCz_t9TxhIq5SLiYK0p5m8n110dtR1fuZR00n8eQx40ZlLL64bBVW51fi4xA31cVBi1c7ZrzMrJyY3BT8rHOzxv_wZwwnYAms_g9FxvfT7__aAVqVCZY3qhsSlMYgysb7A87Gf59oIO6-D0hO78le6QUzuJXsQBRPkBhln3zrP2e8XMxXgRSO9O1EKG2TVCbaGHmoiYyIzky3jPCdT89Wz90z", "https://lh3.googleusercontent.com/aida-public/AB6AXuDCa7iPMk8zwLAuxVUH_8-CKGlJr-v2e630sS-QONTwvW6mO1KL-LGvpJrttYt-w231O7BJKu-9Qp0C7lXn_rQU14KdErak-RJmEZpaeXiPdJv8kF6tpQtfgk8mWo8OoHrSq7PGZ3ttjwqy-KeROwMRnlt6MpdAKDJ4w0SQBbQOEkvugqwoZUUTF1p2jWcUAwhPoTeJPxXR3E7J4NlQPc-0q1wJh58lcVXp-DQt5e611voTura-L8JQ", "https://lh3.googleusercontent.com/aida-public/AB6AXuCLTdnCSaVsGjRXGk_LWU85rosmesQGhcBAq75pRqHnAG0Eo3aE9GYiY_wsBQQwvEDrzv_1TVW4xOo45jfoWzxZK8GkfnSuH7Fkw0l2jx35rdnwLEOzazGfkSWQFAEWK2Uj2QdEJkUZRinU9Fk6fB4UOovofnP4aqHKw56L4fSMprC9IILz9NxNgtvgjFbJr_zEytBgTJjkw0JNn2NHk5kY0DTxQksACLIO44lS1EV4Da-mADLOApbr", "https://lh3.googleusercontent.com/aida-public/AB6AXuDRTn8TCQ0b7wZ4kglcY-WZTajyIPzHHbbhkUL2NhkLpYRl67MAaeP8OgVOqAYE14JU0Oif8EVBdbtBMdgIF2tgme2RTiC4VFxXUeUKoflQ8KwEZT2AP2fZvEoSxUIgJtRNy9h-IAaIuWVeVd6dI5f-0yXpf5NdaYhhe_49r8sBu47yXrt4EZmu6R4RgMUnf8kvN-qPIbnAYMBQX1SoAXAtZJ3-JhsoJdLVLvYqsgytj5rV0UbUDdZg"]
export const ARTISAN_PORTRAIT = "https://lh3.googleusercontent.com/aida-public/AB6AXuBLWd3HF_DYoy_d4sYRXAZJjJIzJrQrvln4xojEit9j1gXPvxziQLA4-cfsfS8xbw1fa3Huq0Q4-jHqRu6DX_D0Oa8PEKc_eN7wA7QZCPzgB5lbPEoaptfUjdTCZYtJ9sPXpggeDkCs5APR6W-GwfILz_l_51EUmC2u5Vka-Zf2soL0H_dTYiPTiXO1SKrllqCwg-5xO4qagauNDJVnV-4dyuiNxCKg41cpEbnL6aDQnIspUDDP3W8M"


/** Đánh giá mẫu cho trang chi tiết (thay bằng API đánh giá khi BE có) */
export interface MockReview {
  id: string
  author: string
  rating: number
  date: string // yyyy-MM-dd
  variant: string
  content: string
}
export const MOCK_REVIEWS: MockReview[] = [
  { id: 'r1', author: 'Minh Anh', rating: 5, date: '2026-10-02', variant: 'Quy cách chuẩn', content: 'Bánh thơm, nhân mềm, hộp chắc chắn. Giao đúng ngày đã chọn.' },
  { id: 'r2', author: 'Quốc Bảo', rating: 5, date: '2026-09-28', variant: 'Hộp 6 bánh', content: 'Đặt làm quà cho đối tác, ai cũng khen hộp đẹp. Sẽ đặt lại.' },
  { id: 'r3', author: 'Thu Hà', rating: 4, date: '2026-09-25', variant: 'Quy cách chuẩn', content: 'Vị ngon, hơi ngọt so với mình. Đóng gói cẩn thận.' },
  { id: 'r4', author: 'Gia Huy', rating: 5, date: '2026-09-20', variant: 'Hộp 8 bánh', content: 'Bánh mới ra lò, vỏ mỏng, nhân đầy. Trà kèm theo rất thơm.' },
]
