import React, { useState } from 'react';
import { useActiveSection } from '../hooks/useActiveSection.js';
import { useToast } from '../hooks/useToast.js';
import { Header } from '../components/Header.jsx';
import { Hero } from '../components/Hero.jsx';
import { Collections } from '../components/Collections.jsx';
import { B2BCorporateSection } from '../components/B2BCorporateSection.jsx';
import { CustomBoxBuilder } from '../components/CustomBoxBuilder.jsx';
import { HeritageSection } from '../components/HeritageSection.jsx';
import { TastingSalonSection } from '../components/TastingSalonSection.jsx';
import { ProductDetailModal } from '../components/ProductDetailModal.jsx';
import { CartDrawer } from '../components/CartDrawer.jsx';
import { RFQModal } from '../components/RFQModal.jsx';
import { QuoteDownloadModal } from '../components/QuoteDownloadModal.jsx';
import { OrderSuccessModal } from '../components/OrderSuccessModal.jsx';
import { SearchModal } from '../components/SearchModal.jsx';
import { WishlistModal } from '../components/WishlistModal.jsx';
import { Footer } from '../components/Footer.jsx';

import { PRODUCT_BOXES, findProductBox, getWishlistProducts } from '../services/catalogService.js';
import { Sparkles } from 'lucide-react';

export function HomePage() {
  // Navigation & Preferences
  const { activeSection, navigateTo: handleNavigate } = useActiveSection();
  const [language, setLanguage] = useState('vi');
  const [currency, setCurrency] = useState('VND');

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRFQOpen, setIsRFQOpen] = useState(false);
  const [rfqPrefill, setRfqPrefill] = useState(undefined);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quotePreviewData, setQuotePreviewData] = useState(null);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // Cart State (initialized with 1 featured gift set for instant visual richness)
  const [cartItems, setCartItems] = useState([
    {
      id: 'init-item-1',
      productId: PRODUCT_BOXES[0].id,
      productName: PRODUCT_BOXES[0].name,
      productImage: PRODUCT_BOXES[0].images[0],
      boxType: PRODUCT_BOXES[0].boxType,
      price: PRODUCT_BOXES[0].price,
      quantity: 1,
      selectedFlavors: PRODUCT_BOXES[0].flavors,
      selectedTea: PRODUCT_BOXES[0].teaName,
    }
  ]);

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState([
    PRODUCT_BOXES[0].id,
    PRODUCT_BOXES[1].id
  ]);

  const { toastMessage, showToast } = useToast();

  // Cart Helpers
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAddToCart = (product, quantity = 1, ribbonMessage) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id && item.customCardMessage === ribbonMessage);
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random()}`,
          productId: product.id,
          productName: product.name,
          productImage: product.images[0],
          boxType: product.boxType,
          price: product.price,
          quantity,
          selectedFlavors: product.flavors,
          selectedTea: product.teaName,
          customCardMessage: ribbonMessage,
        }
      ];
    });

    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleAddCustomBoxToCart = (customItem) => {
    setCartItems((prev) => [...prev, customItem]);
    showToast(`Đã thêm hộp tự phối vào giỏ hàng!`);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveCartItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
  };

  // Wishlist Helpers
  const handleToggleWishlist = (product) => {
    setWishlistIds((prev) => {
      const isSaved = prev.includes(product.id);
      if (isSaved) {
        showToast(`Đã bỏ lưu "${product.name}"`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Đã lưu "${product.name}" vào danh sách yêu thích!`);
        return [...prev, product.id];
      }
    });
  };

  const wishlistProducts = getWishlistProducts(wishlistIds);

  return (
    <div className="min-h-screen bg-canvas text-text selection:bg-gold selection:text-ink-on-gold font-sans antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface-raised border border-gold text-xs font-semibold text-gold-light shadow-[0_8px_30px_color-mix(in_srgb,var(--color-gold)_30%,transparent)] animate-bounce">
          <Sparkles className="w-4 h-4 text-gold shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlistIds.length}
        language={language}
        currency={currency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenRFQ={() => {
          setRfqPrefill(undefined);
          setIsRFQOpen(true);
        }}
        onToggleLanguage={setLanguage}
        onToggleCurrency={setCurrency}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Page Flow */}
      <main id="hero">
        {/* 1. Hero Showcase */}
        <Hero
          language={language}
          currency={currency}
          onExploreCollections={() => handleNavigate('collections')}
          onGoToB2B={() => handleNavigate('b2b-corporate')}
          onGoToCustomBox={() => handleNavigate('custom-box')}
          onSelectBox={(boxId) => {
            const found = findProductBox(boxId);
            if (found) setSelectedProduct(found);
          }}
        />

        {/* 2. Collections & Flavors Catalog */}
        <Collections
          currency={currency}
          language={language}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={setSelectedProduct}
          onAddToCart={(product) => handleAddToCart(product, 1)}
          onSelectSingleCake={(cake) => {
            showToast(`Bạn đã chọn vị: ${cake.name}. Hãy vào mục "Tự Phối Hộp Quà" để ghép thành hộp hoàn chỉnh!`);
            handleNavigate('custom-box');
          }}
          onOpenRFQ={() => {
            setRfqPrefill(undefined);
            setIsRFQOpen(true);
          }}
        />

        {/* 3. B2B Corporate Gifting Hub (Tier Matrix & Interactive Calculator) */}
        <B2BCorporateSection
          currency={currency}
          language={language}
          onOpenRFQ={(prefilled) => {
            setRfqPrefill(prefilled);
            setIsRFQOpen(true);
          }}
          onOpenQuotePreview={(quoteData) => {
            setQuotePreviewData(quoteData);
          }}
        />

        {/* 4. Bespoke Custom Box Builder */}
        <CustomBoxBuilder
          currency={currency}
          language={language}
          onAddToCart={handleAddCustomBoxToCart}
        />

        {/* 5. Heritage & 30-Year Artisanal Story */}
        <HeritageSection
          language={language}
          onExploreCollections={() => handleNavigate('collections')}
        />

        {/* 6. Boutiques & VIP Tasting Salon Booking */}
        <TastingSalonSection
          language={language}
        />
      </main>

      {/* Global Footer */}
      <Footer
        language={language}
        onNavigate={handleNavigate}
        onOpenRFQ={() => {
          setRfqPrefill(undefined);
          setIsRFQOpen(true);
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        currency={currency}
        language={language}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        onOpenRFQ={() => {
          if (selectedProduct) {
            setRfqPrefill({ boxId: selectedProduct.id, quantity: 50, budget: selectedProduct.price * 50 });
          }
          setIsRFQOpen(true);
        }}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        currency={currency}
        language={language}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutSuccess={(orderData) => {
          setIsCartOpen(false);
          setCartItems([]);
          setOrderSuccessData(orderData);
        }}
      />

      {/* Corporate RFQ Modal */}
      <RFQModal
        isOpen={isRFQOpen}
        prefilled={rfqPrefill}
        onClose={() => setIsRFQOpen(false)}
        onSubmitSuccess={(submission) => {
          showToast(`Đã gửi yêu cầu báo giá ${submission.id} thành công!`);
        }}
      />

      {/* Printable B2B Quote Sheet Modal */}
      <QuoteDownloadModal
        quoteData={quotePreviewData}
        currency={currency}
        onClose={() => setQuotePreviewData(null)}
        onProceedToRFQ={() => {
          if (quotePreviewData) {
            setRfqPrefill({
              boxId: quotePreviewData.box.id,
              quantity: quotePreviewData.quantity,
              budget: quotePreviewData.totalBudget,
            });
          }
          setIsRFQOpen(true);
        }}
      />

      {/* Order Confirmation Receipt Modal */}
      <OrderSuccessModal
        orderData={orderSuccessData}
        currency={currency}
        onClose={() => setOrderSuccessData(null)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        currency={currency}
        language={language}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(box) => setSelectedProduct(box)}
        onSelectCake={(cake) => {
          showToast(`Vị: ${cake.name}`);
          handleNavigate('custom-box');
        }}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        wishlistProducts={wishlistProducts}
        currency={currency}
        language={language}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(box) => handleAddToCart(box, 1)}
        onViewProduct={(box) => setSelectedProduct(box)}
      />

    </div>
  );
}
