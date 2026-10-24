import React, { useState } from 'react';
import { Layers, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { BOX_STYLES, CAKE_FLAVORS, TEAS } from '../services/catalogService.js';
import { formatCurrency } from '../utils/formatters.js';

export const CustomBoxBuilder = ({
  currency,
  language,
  onAddToCart,
}) => {
  // Step 1: Box Style
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(0);
  const selectedBox = BOX_STYLES[selectedBoxIndex];

  // Step 2: Selected Cakes (array of CakeFlavor objects, max capacity)
  const [selectedCakes, setSelectedCakes] = useState([
    CAKE_FLAVORS[0], // Thập Cẩm Bát Bửu Vi Cá
    CAKE_FLAVORS[1], // Lava Hoàng Kim
    CAKE_FLAVORS[2], // Sen Nhuyễn Cốm Non
    CAKE_FLAVORS[3], // Hạt Sen Macca Dừa Sáp
  ]);

  // Step 3: Selected Tea
  const [selectedTeaId, setSelectedTeaId] = useState('tea-1');
  const selectedTea = TEAS.find((t) => t.id === selectedTeaId) || null;

  // Step 4: Card & Ribbon
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [greetingMessage, setGreetingMessage] = useState('Kính chúc Quý Tri Kỷ một mùa trăng rằm Đoàn Viên, An Khang và Thịnh Vượng.');
  const [waxSealColor, setWaxSealColor] = useState('gold');

  // Calculate pricing
  const cakesTotal = selectedCakes.reduce((sum, cake) => sum + cake.singlePrice, 0);
  const teaPrice = selectedTea ? selectedTea.price : 0;
  const totalPrice = selectedBox.basePrice + cakesTotal + teaPrice;

  const handleSelectCake = (cake) => {
    if (selectedCakes.length >= selectedBox.capacity) {
      alert(`Hộp ${selectedBox.name} chứa tối đa ${selectedBox.capacity} bánh. Hãy bấm xóa bớt một vị để đổi!`);
      return;
    }
    setSelectedCakes([...selectedCakes, cake]);
  };

  const handleRemoveCake = (index) => {
    const updated = [...selectedCakes];
    updated.splice(index, 1);
    setSelectedCakes(updated);
  };

  const handleAddCustomBoxToCart = () => {
    if (selectedCakes.length < selectedBox.capacity) {
      alert(`Vui lòng chọn đủ ${selectedBox.capacity} bánh (hiện đã chọn ${selectedCakes.length}/${selectedBox.capacity} bánh).`);
      return;
    }

    const item = {
      id: `custom-box-${Date.now()}`,
      isCustomBox: true,
      productName: `Hộp Tự Phối: ${selectedBox.name}`,
      productImage: selectedBox.image,
      boxType: selectedBox.name,
      price: totalPrice,
      quantity: 1,
      selectedFlavors: selectedCakes.map((c) => c.name),
      selectedTea: selectedTea ? selectedTea.name : undefined,
      customCardMessage: greetingMessage 
        ? `[Gửi: ${recipientName || 'Người nhận'}] ${greetingMessage} - [Từ: ${senderName || 'Người gửi'}]` 
        : undefined,
    };

    onAddToCart(item);
  };

  return (
    <section id="custom-box" className="section-spacing-loose bg-canvas-soft border-b border-border">
      <div className="page-container">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-hover border border-gold/40 text-xs text-gold-light font-semibold mb-3">
            <Layers className="w-3.5 h-3.5 text-gold-light" />
            <span>{language === 'vi' ? 'TRẢI NGHIỆM ĐỘC BẢN' : 'BESPOKE EXPERIENCE'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-text tracking-tight">
            {language === 'vi' ? 'Tự Phối Hộp Quà Hoàng Kim' : 'Craft Your Bespoke Gift Box'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed">
            {language === 'vi'
              ? 'Tùy ý tuyển chọn mẫu hộp thủ công, phối hợp từng phong vị bánh yêu thích, kèm trà cổ thụ thượng hạng và lời chúc thiệp thư pháp niêm phong dấu sáp hoàng gia.'
              : 'Select your preferred lacquer case, mix twelve culinary flavors, pair with high-mountain tea, and personalize your imperial wax-sealed greetings.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive 4 Steps */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Chọn Kiểu Hộp */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-gold-gradient text-ink-on-gold text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                  Chọn Chất Liệu & Mẫu Hộp Quà
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {BOX_STYLES.map((box, idx) => (
                  <div
                    key={box.id}
                    onClick={() => {
                      setSelectedBoxIndex(idx);
                      // Adjust selected cakes if capacity changes
                      if (selectedCakes.length > box.capacity) {
                        setSelectedCakes(selectedCakes.slice(0, box.capacity));
                      }
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                      selectedBoxIndex === idx
                        ? 'bg-surface-hover border-gold ring-1 ring-gold'
                        : 'bg-surface-raised border-border hover:border-border-accent'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={box.image}
                        alt={box.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border-strong"
                      />
                      <div>
                        <div className="text-xs font-bold text-text line-clamp-1">{box.name}</div>
                        <div className="text-[11px] text-gold-light font-semibold mt-0.5">
                          Sức chứa: {box.capacity} bánh
                        </div>
                        <div className="text-[10px] text-text-muted line-clamp-2 mt-1">
                          {box.material}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-text-muted">Đơn giá hộp:</span>
                      <span className="font-serif font-bold text-gold-gradient">
                        {formatCurrency(box.basePrice, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Chọn Vị Bánh Vào Hộp */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gold-gradient text-ink-on-gold text-xs font-bold flex items-center justify-center">2</span>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                    Tuyển Chọn {selectedBox.capacity} Vị Bánh Hoàng Gia
                  </h3>
                </div>
                <div className="text-xs font-bold px-2.5 py-1 rounded bg-surface-hover border border-gold/40 text-gold-light">
                  Đã chọn: {selectedCakes.length}/{selectedBox.capacity} bánh
                </div>
              </div>

              {/* Flavors Grid to pick from */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CAKE_FLAVORS.map((cake) => {
                  const countInBox = selectedCakes.filter((c) => c.id === cake.id).length;
                  return (
                    <div
                      key={cake.id}
                      className="p-2.5 rounded-xl bg-surface-raised border border-border flex flex-col justify-between hover:border-border-accent transition-all"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-2 border border-border">
                        <img src={cake.image} alt={cake.name} className="w-full h-full object-cover" />
                        {countInBox > 0 && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gold text-ink-on-gold text-[10px] font-bold flex items-center justify-center shadow">
                            {countInBox}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-text line-clamp-1">{cake.name}</div>
                        <div className="text-[10px] text-gold-gradient font-semibold">
                          {formatCurrency(cake.singlePrice, currency)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectCake(cake)}
                        disabled={selectedCakes.length >= selectedBox.capacity}
                        className={`mt-2 w-full py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          selectedCakes.length >= selectedBox.capacity
                            ? 'bg-surface-raised text-text-faint cursor-not-allowed'
                            : 'bg-surface-hover hover:bg-gold-gradient hover:text-ink-on-gold text-gold-light border border-border-strong'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Chọn Trà Thượng Phẩm Đi Kèm */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-gold-gradient text-ink-on-gold text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                  Chọn Hũ Trà Cổ Thụ Đi Kèm (Tùy Chọn)
                </h3>
              </div>

              <div className="space-y-2.5">
                {TEAS.map((tea) => (
                  <div
                    key={tea.id}
                    onClick={() => setSelectedTeaId(tea.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      selectedTeaId === tea.id
                        ? 'bg-surface-hover border-gold ring-1 ring-gold'
                        : 'bg-surface-raised border-border hover:border-border-accent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={tea.image} alt={tea.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border-strong" />
                      <div>
                        <div className="text-xs font-bold text-text">{tea.name}</div>
                        <div className="text-[11px] text-text-muted line-clamp-1">{tea.desc}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-serif font-bold text-gold-gradient">
                        +{formatCurrency(tea.price, currency)}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setSelectedTeaId('')}
                  className={`w-full py-2 text-xs rounded-lg border text-center transition-colors cursor-pointer ${
                    selectedTeaId === ''
                      ? 'bg-surface-hover border-gold text-gold-light'
                      : 'bg-surface-raised border-border text-text-faint hover:text-text'
                  }`}
                >
                  Không kèm hũ trà (Chỉ lấy hộp bánh)
                </button>
              </div>
            </div>

            {/* Step 4: Lời Chúc Thiệp & Niêm Phong Sáp Hoàng Gia */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-gold-gradient text-ink-on-gold text-xs font-bold flex items-center justify-center">4</span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-text">
                  Thiệp Thư Pháp & Niêm Phong Sáp Hoàng Kim
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gold-light font-semibold mb-1">Tên Người Nhận Quà:</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="VD: Gia đình Bác Hoàng Minh / Đối tác VIP..."
                      className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-gold-light font-semibold mb-1">Người Gửi Tặng:</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="VD: Cháu Tuấn & Gia Đình..."
                      className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gold-light font-semibold mb-1">Nội Dung Lời Chúc Mùa Trăng:</label>
                  <textarea
                    rows={2}
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-text focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-gold-light font-semibold mb-1.5">Màu Sáp Niêm Phong Hoàng Gia:</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-text-soft">
                      <input
                        type="radio"
                        name="waxSeal"
                        checked={waxSealColor === 'gold'}
                        onChange={() => setWaxSealColor('gold')}
                        className="accent-gold"
                      />
                      <span>Ánh Vàng Hoàng Kim (Gold)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-text-soft">
                      <input
                        type="radio"
                        name="waxSeal"
                        checked={waxSealColor === 'ruby'}
                        onChange={() => setWaxSealColor('ruby')}
                        className="accent-danger"
                      />
                      <span>Đỏ Ruby Cung Đình (Ruby Red)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Box Summary & Real-time Slots Preview */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-surface-raised to-surface border border-gold/60 shadow-2xl">
              
              <div className="border-b border-border-strong pb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-text-muted uppercase font-semibold">Bản Xem Trước Hộp Quà</div>
                  <h4 className="text-lg font-serif font-bold text-text mt-0.5">{selectedBox.name}</h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-surface-hover text-gold-light border border-border-accent">
                  {selectedCakes.length}/{selectedBox.capacity} bánh
                </span>
              </div>

              {/* Visual Box Layout Display */}
              <div className="py-4">
                <div className="text-xs text-text-soft font-semibold mb-2">Các Vị Bánh Trong Hộp:</div>
                <div className={`grid gap-2.5 ${selectedBox.capacity === 6 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {[...Array(selectedBox.capacity)].map((_, i) => {
                    const cake = selectedCakes[i];
                    return (
                      <div
                        key={i}
                        className={`relative aspect-square rounded-xl border p-2 flex flex-col justify-between transition-all ${
                          cake
                            ? 'bg-surface-hover border-gold/60 shadow-sm'
                            : 'bg-surface border-dashed border-border-strong items-center justify-center text-center'
                        }`}
                      >
                        {cake ? (
                          <>
                            <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-border-strong">
                              <img src={cake.image} alt={cake.name} className="w-full h-full object-cover" />
                              <button
                                onClick={() => handleRemoveCake(i)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-overlay/80 text-danger-light hover:text-paper cursor-pointer"
                                title="Xóa bánh khỏi ô này"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[10px] font-bold text-text truncate mt-1">
                              {cake.name}
                            </div>
                          </>
                        ) : (
                          <div className="text-text-faint text-xs">
                            <Plus className="w-5 h-5 mx-auto mb-1" />
                            <span>Ô {i + 1} trống</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Extra Items Breakdown */}
              <div className="space-y-2 border-t border-border-strong pt-3 text-xs text-text-soft">
                <div className="flex justify-between">
                  <span>Hộp đựng:</span>
                  <span className="font-mono">{formatCurrency(selectedBox.basePrice, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng tiền {selectedCakes.length} bánh:</span>
                  <span className="font-mono">{formatCurrency(cakesTotal, currency)}</span>
                </div>
                {selectedTea && (
                  <div className="flex justify-between">
                    <span>Hũ trà ({selectedTea.name}):</span>
                    <span className="font-mono">+{formatCurrency(selectedTea.price, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-success-soft">
                  <span>Thiệp chúc mừng & Dấu sáp:</span>
                  <span>Miễn phí</span>
                </div>
              </div>

              {/* Total Price */}
              <div className="pt-4 border-t border-border-strong flex items-center justify-between">
                <div>
                  <div className="text-xs text-text-muted">TỔNG GIÁ TRỊ HỘP:</div>
                  <div className="text-2xl font-serif font-bold text-gold-gradient">
                    {formatCurrency(totalPrice, currency)}
                  </div>
                </div>

                <button
                  onClick={handleAddCustomBoxToCart}
                  disabled={selectedCakes.length < selectedBox.capacity}
                  className={`py-3 px-5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg ${
                    selectedCakes.length < selectedBox.capacity
                      ? 'bg-surface-hover text-text-faint cursor-not-allowed'
                      : 'bg-gold-gradient text-ink-on-gold hover:brightness-110'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {selectedCakes.length < selectedBox.capacity
                      ? `Chọn thêm ${selectedBox.capacity - selectedCakes.length} bánh`
                      : 'Thêm Vào Giỏ Hàng'}
                  </span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
