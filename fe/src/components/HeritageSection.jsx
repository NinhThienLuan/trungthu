import React from 'react';
import { Sparkles, Award, Compass, Heart, ShieldCheck } from 'lucide-react';

export const HeritageSection = ({
  language,
  onExploreCollections,
}) => {
  return (
    <section id="heritage" className="section-spacing-loose bg-canvas border-b border-border relative">
      <div className="page-container">
        
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-hover border border-gold/40 text-xs text-gold-light font-semibold mb-3">
            <Award className="w-3.5 h-3.5 text-gold-light" />
            <span>{language === 'vi' ? 'DI SẢN & TÂM HUYẾT' : 'LEGACY OF CRAFTSMANSHIP'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-text tracking-tight">
            {language === 'vi' ? '30 Năm Gìn Giữ Hồn Trăng Hoàng Tộc' : 'Thirty Years of Imperial Moon Mastery'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed">
            {language === 'vi'
              ? 'Mỗi chiếc bánh trung thu Nguyệt Viên Đài không chỉ là thức quà đoàn viên, mà là kết tinh của thời gian, đôi bàn tay nghệ nhân và lòng tôn kính dành cho di sản ẩm thực nước Việt.'
              : 'Every mooncake is a symphony of heritage recipes, handcrafted devotion, and reverence for traditional Mid-Autumn elegance.'}
          </p>
        </div>

        {/* Story Grid with Artisan Photo & Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Artisan Photo & Quote */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-gold/50 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80"
                alt="Nghệ nhân Nguyệt Viên Đài"
                className="w-full h-96 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 text-xs text-text bg-surface-raised/90 backdrop-blur-md p-4 rounded-xl border border-border-accent">
                <p className="italic text-gold-light font-serif text-sm">
                  "Làm bánh trung thu như giữ trọn đạo nghĩa. Vỏ bánh phải mỏng mịn như lụa, nhân bánh phải đượm vị chân phương mà thanh khiết, để người thưởng thức cảm nhận được cái ấm nồng của đêm rằm."
                </p>
                <div className="mt-2 text-[11px] text-text-muted">
                  — <strong className="text-text">Nghệ nhân Đặng Văn Toàn</strong>, Giám đốc Nghệ thuật Ẩm thực Nguyệt Viên Đài
                </div>
              </div>
            </div>
          </div>

          {/* 4 Core Pillars */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-hover text-gold-light flex items-center justify-center shrink-0 border border-border-strong">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-text">
                  1. Nguyên Liệu Tuyển Chọn Khắt Khe
                </h4>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  Yến sào thiên nhiên đảo Khánh Hòa, vi cá thượng hạng, hạt sen hồ Tịnh Tâm xứ Huế, cốm non làng Vòng và trứng muối thảo mộc ủ chum đất nung theo bí quyết gia truyền.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-hover text-gold-light flex items-center justify-center shrink-0 border border-border-strong">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-text">
                  2. Công Thức Thanh Ngọt - Giảm 30% Độ Đường
                </h4>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  Tiên phong sử dụng đường Isomalt tự nhiên chiết xuất từ củ cải đường, giữ nguyên hương vị bùi béo tự nhiên của các loại hạt mà không gây ngọt gắt, an toàn tuyệt đối cho người lớn tuổi.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-hover text-gold-light flex items-center justify-center shrink-0 border border-border-strong">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-text">
                  3. Nghệ Thuật Sơn Mài Hạ Thái Thếp Vàng 18K
                </h4>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  Mỗi hộp quà sơn mài trải qua hơn 45 ngày mài nhẵn, phủ bóng 12 lớp mủ cây sơn tự nhiên, cẩn ốc xà cừ biển sâu và dát vàng 18K, tạo nên một tác phẩm nghệ thuật trường tồn.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-hover text-gold-light flex items-center justify-center shrink-0 border border-border-strong">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-text">
                  4. Tiêu Chuẩn Vệ Sinh An Toàn ISO 22000 & HACCP
                </h4>
                <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                  Quy trình sản xuất phòng sạch chuẩn vô trùng, hoàn toàn không chất bảo quản công nghiệp, không phẩm màu hóa học, đảm bảo trọn vẹn sự tươi mới cho từng mẻ bánh.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
