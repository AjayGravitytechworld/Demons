/*=============================================================
  FLORABLOOM - MODERN FLORAL STORE JS ENGINE
  Interactive, Cart Drawer, Wishlist, Filter, Modals & Toast
=============================================================*/

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation & Mobile Drawer
  const bar = document.querySelector("#bar");
  const nav = document.querySelector(".navbar");
  const header = document.querySelector("header");

  // Create & Inject Nav Overlay if not present
  let navOverlay = document.querySelector(".nav-overlay");
  if (!navOverlay) {
    navOverlay = document.createElement("div");
    navOverlay.className = "nav-overlay";
    document.body.appendChild(navOverlay);
  }

  // Toggle Mobile Menu
  if (bar && nav) {
    bar.addEventListener("click", () => {
      bar.classList.toggle("fa-times");
      nav.classList.toggle("active");
      navOverlay.classList.toggle("active");
      document.body.style.overflow = nav.classList.contains("active") ? "hidden" : "";
    });

    // Close on overlay click
    navOverlay.addEventListener("click", () => {
      bar.classList.remove("fa-times");
      nav.classList.remove("active");
      navOverlay.classList.remove("active");
      document.body.style.overflow = "";
      closeCart();
      closeWishlist();
      closeModal();
    });

    // Close on nav link click
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        bar.classList.remove("fa-times");
        nav.classList.remove("active");
        navOverlay.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }

  // Header Scroll Effect & Active Page Link
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }

    // Scroll to Top visibility
    const scrollTopBtn = document.querySelector(".scroll-top-btn");
    if (scrollTopBtn) {
      if (window.scrollY > 350) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    }
  });

  // Active Link Highlighter based on current filename
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar a").forEach(link => {
    const linkPath = link.getAttribute("href");
    if (linkPath === currentPath || (currentPath === "" && linkPath === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // 2. Toast Notification System
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  window.showToast = function(message, icon = "fa-check-circle") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  // 3. State: Cart & Wishlist (LocalStorage)
  let cart = JSON.parse(localStorage.getItem("floraBloomCart")) || [
    {
      id: "p1",
      name: "Blushing Rose Bouquet",
      price: 24.99,
      image: "images/img-1.png",
      qty: 1
    }
  ];

  let rawWishlist = JSON.parse(localStorage.getItem("floraBloomWishlist")) || [];
  // Normalize wishlist if stored as plain strings
  let wishlist = [];
  if (Array.isArray(rawWishlist)) {
    wishlist = rawWishlist.filter(item => typeof item === "object" && item !== null && item.id);
  }

  function updateBadges() {
    const cartCountEls = document.querySelectorAll(".cart-count");
    const wishCountEls = document.querySelectorAll(".wish-count, .wish-count-val");

    const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEls.forEach(el => el.textContent = totalCartItems);
    wishCountEls.forEach(el => el.textContent = wishlist.length);

    localStorage.setItem("floraBloomCart", JSON.stringify(cart));
    localStorage.setItem("floraBloomWishlist", JSON.stringify(wishlist));

    syncWishlistHeartButtons();
  }

  // Synchronize heart button active states across all products on the page
  function syncWishlistHeartButtons() {
    document.querySelectorAll(".product-card").forEach(card => {
      const id = card.getAttribute("data-id");
      const wishBtn = card.querySelector(".wish-btn");
      if (wishBtn && id) {
        const isFav = wishlist.some(item => item.id === id);
        if (isFav) {
          wishBtn.classList.add("active-wish");
        } else {
          wishBtn.classList.remove("active-wish");
        }
      }
    });
  }

  // 4. Shopping Cart Drawer System
  const cartDrawer = document.querySelector(".cart-drawer");
  const closeCartBtn = document.querySelector(".close-cart-btn");
  const openCartBtns = document.querySelectorAll(".open-cart-btn");
  const cartItemsContainer = document.querySelector(".cart-items-body");
  const cartSubtotalEl = document.querySelector(".cart-subtotal-val");

  window.openCart = function() {
    closeWishlist();
    if (cartDrawer) {
      renderCart();
      cartDrawer.classList.add("active");
      navOverlay?.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };

  window.closeCart = function() {
    if (cartDrawer) {
      cartDrawer.classList.remove("active");
      if (!nav?.classList.contains("active") && !document.querySelector(".wishlist-drawer.active") && !document.querySelector(".modal-overlay.active")) {
        navOverlay?.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  };

  openCartBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openCart();
    });
  });

  closeCartBtn?.addEventListener("click", closeCart);

  function renderCart() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-message">
          <i class="fas fa-shopping-basket"></i>
          <h4>Your basket is empty</h4>
          <p>Explore our fresh blooms to fill your cart!</p>
          <a href="product.html" class="btn" style="margin-top: 1.5rem;" onclick="closeCart()">Shop Blooms</a>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = "$0.00";
      return;
    }

    let subtotal = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;
      return `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-qty">
              <button class="qty-btn dec-qty" onclick="changeQty('${item.id}', -1)" title="Decrease"><i class="fas fa-minus"></i></button>
              <span>${item.qty}</span>
              <button class="qty-btn inc-qty" onclick="changeQty('${item.id}', 1)" title="Increase"><i class="fas fa-plus"></i></button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
    }).join("");

    if (cartSubtotalEl) {
      cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    }
  }

  window.addToCart = function(id, name, price, image) {
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price: parseFloat(price), image, qty: 1 });
    }
    updateBadges();
    renderCart();
    showToast(`"${name}" added to basket! 🌸`, "fa-shopping-cart");
  };

  window.changeQty = function(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    updateBadges();
    renderCart();
  };

  window.removeFromCart = function(id) {
    const item = cart.find(i => i.id === id);
    cart = cart.filter(i => i.id !== id);
    updateBadges();
    renderCart();
    if (item) {
      showToast(`Removed "${item.name}" from basket`, "fa-trash-alt");
    }
  };

  // Add to Cart buttons on cards
  document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const card = btn.closest(".product-card");
      if (!card) return;
      const id = card.getAttribute("data-id") || `p-${Date.now()}`;
      const name = card.querySelector(".pro-title")?.innerText.trim() || "Fresh Bloom";
      const priceStr = card.querySelector(".current-price")?.innerText.replace("$", "").trim() || "19.99";
      const image = card.querySelector("img")?.getAttribute("src") || "images/img-1.png";

      addToCart(id, name, priceStr, image);
    });
  });

  // 5. Wishlist / Favourites System & Drawer
  const wishDrawer = document.querySelector(".wishlist-drawer");
  const closeWishBtn = document.querySelector(".close-wish-btn");
  const openWishBtns = document.querySelectorAll(".open-wish-btn, .wish-btn-trigger");
  const wishItemsContainer = document.querySelector(".wishlist-items-body");

  window.openWishlist = function() {
    closeCart();
    if (wishDrawer) {
      renderWishlist();
      wishDrawer.classList.add("active");
      navOverlay?.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };

  window.closeWishlist = function() {
    if (wishDrawer) {
      wishDrawer.classList.remove("active");
      if (!nav?.classList.contains("active") && !document.querySelector(".cart-drawer.active") && !document.querySelector(".modal-overlay.active")) {
        navOverlay?.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  };

  openWishBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openWishlist();
    });
  });

  closeWishBtn?.addEventListener("click", closeWishlist);

  function renderWishlist() {
    if (!wishItemsContainer) return;

    if (wishlist.length === 0) {
      wishItemsContainer.innerHTML = `
        <div class="wishlist-empty-message">
          <i class="far fa-heart"></i>
          <h4>Your Favourites is Empty</h4>
          <p>Tap the heart icon on any flower bouquet to save your favourites here!</p>
          <a href="product.html" class="btn" style="margin-top: 1.5rem;" onclick="closeWishlist()">Explore Blooms</a>
        </div>
      `;
      return;
    }

    wishItemsContainer.innerHTML = wishlist.map(item => {
      return `
        <div class="wishlist-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}">
          <div class="wishlist-item-details">
            <h4 class="wishlist-item-title">${item.name}</h4>
            <div class="wishlist-item-price">$${parseFloat(item.price).toFixed(2)}</div>
            <div class="wishlist-item-actions">
              <button class="wishlist-move-cart-btn" onclick="moveWishlistToCart('${item.id}')">
                <i class="fas fa-shopping-bag"></i> Move to Basket
              </button>
              <button class="wishlist-item-remove" onclick="removeWishlistItem('${item.id}')" title="Remove from favourites">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Toggle Favourite on Product Heart Click (Delegated Event Handler)
  document.addEventListener("click", (e) => {
    const wishBtn = e.target.closest(".wish-btn");
    if (!wishBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const card = wishBtn.closest(".product-card") || wishBtn.closest(".card--des");
    if (!card) return;

    const id = card.getAttribute("data-id") || `p-${Date.now()}`;
    const name = card.querySelector(".pro-title, h3")?.innerText.trim() || "Fresh Bloom";
    const priceStr = card.querySelector(".current-price, .price")?.innerText.replace("$", "").trim() || "24.99";
    const price = parseFloat(priceStr) || 24.99;
    const image = card.querySelector("img")?.getAttribute("src") || "images/img-1.png";
    const category = card.querySelector(".pro-category, .card-tag")?.innerText.trim() || "Fresh Flowers";

    toggleWishlistItem({ id, name, price, image, category });
  });

  function toggleWishlistItem(item) {
    const exists = wishlist.some(w => w.id === item.id);
    if (exists) {
      wishlist = wishlist.filter(w => w.id !== item.id);
      showToast(`Removed "${item.name}" from favourites`, "fa-heart-broken");
    } else {
      wishlist.push(item);
      showToast(`Added "${item.name}" to favourites! ❤️`, "fa-heart");
    }
    updateBadges();
    if (wishDrawer?.classList.contains("active")) {
      renderWishlist();
    }
  }

  window.removeWishlistItem = function(id) {
    const item = wishlist.find(w => w.id === id);
    wishlist = wishlist.filter(w => w.id !== id);
    updateBadges();
    renderWishlist();
    if (item) {
      showToast(`Removed "${item.name}" from favourites`, "fa-heart-broken");
    }
  };

  window.moveWishlistToCart = function(id) {
    const item = wishlist.find(w => w.id === id);
    if (item) {
      addToCart(item.id, item.name, item.price, item.image);
      removeWishlistItem(id);
    }
  };

  window.moveAllWishlistToCart = function() {
    if (wishlist.length === 0) {
      showToast("No favourite flowers to move!", "fa-info-circle");
      return;
    }
    wishlist.forEach(item => {
      addToCart(item.id, item.name, item.price, item.image);
    });
    wishlist = [];
    updateBadges();
    renderWishlist();
    showToast("All favourites moved to your basket! 🌸", "fa-shopping-bag");
  };

  // 6. Quick View Modal System (Prominent & Clear Cancel Button)
  const modalOverlay = document.querySelector(".modal-overlay");
  const closeModalBtn = document.querySelector(".close-modal-btn");

  window.openQuickView = function(name, price, img, category = "Fresh Flowers", desc = "Hand-selected fresh botanicals arranged with sustainable floral care and timeless beauty.") {
    if (!modalOverlay) return;

    modalOverlay.querySelector(".modal-pro-title").textContent = name;
    modalOverlay.querySelector(".modal-price").textContent = `$${parseFloat(price).toFixed(2)}`;
    modalOverlay.querySelector(".modal-img").src = img;
    modalOverlay.querySelector(".modal-category").textContent = category;
    modalOverlay.querySelector(".modal-desc").textContent = desc;

    const modalAddBtn = modalOverlay.querySelector(".modal-add-cart");
    if (modalAddBtn) {
      modalAddBtn.onclick = () => {
        addToCart(`qv-${Date.now()}`, name, price, img);
        closeModal();
      };
    }

    modalOverlay.classList.add("active");
    navOverlay?.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  window.closeModal = function() {
    if (modalOverlay) {
      modalOverlay.classList.remove("active");
      if (!nav?.classList.contains("active") && !cartDrawer?.classList.contains("active") && !wishDrawer?.classList.contains("active")) {
        navOverlay?.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  };

  closeModalBtn?.addEventListener("click", closeModal);

  // Click on background overlay outside modal card closes modal
  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // ESC key closes all active modals & drawers
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeCart();
      closeWishlist();
      if (bar && nav?.classList.contains("active")) {
        bar.classList.remove("fa-times");
        nav.classList.remove("active");
        navOverlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  });

  // Attach Quick View trigger to eye buttons
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const card = btn.closest(".product-card");
      if (!card) return;
      const name = card.querySelector(".pro-title")?.innerText.trim() || "Velvet Rose Bouquet";
      const price = card.querySelector(".current-price")?.innerText.replace("$", "").trim() || "24.99";
      const img = card.querySelector("img")?.getAttribute("src") || "images/img-1.png";
      const category = card.querySelector(".pro-category")?.innerText.trim() || "Fresh Flowers";

      openQuickView(name, price, img, category);
    });
  });

  // 7. Category Filter on Products Page
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productCards = document.querySelectorAll(".product-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");

      productCards.forEach(card => {
        const cardCategory = card.getAttribute("data-category");
        if (filterValue === "all" || cardCategory === filterValue) {
          card.style.display = "flex";
          card.style.animation = "fadeIn 0.4s ease";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // 8. Product Search Filter
  const searchInput = document.querySelector("#productSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      productCards.forEach(card => {
        const title = card.querySelector(".pro-title")?.innerText.toLowerCase() || "";
        const category = card.querySelector(".pro-category")?.innerText.toLowerCase() || "";

        if (title.includes(query) || category.includes(query)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  }

  // 9. FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    question?.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      faqItems.forEach(i => {
        i.classList.remove("active");
        const ans = i.querySelector(".faq-answer");
        if (ans) ans.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add("active");
        const answer = item.querySelector(".faq-answer");
        if (answer) answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // 10. Forms: Newsletter & Contact Submissions
  document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const emailVal = emailInput ? emailInput.value.trim() : "";

      if (form.closest(".newsletter-form") || form.closest(".footer-newsletter")) {
        if (emailVal) {
          showToast("Thank you for subscribing! 🌸 Use code BLOOM15 for 15% off.", "fa-envelope-open-text");
          form.reset();
        } else {
          showToast("Please enter a valid email address.", "fa-exclamation-circle");
        }
      } else if (form.closest(".form--des") || form.closest(".contact")) {
        showToast("Your message has been sent successfully! We'll reply soon. 🌿", "fa-paper-plane");
        form.reset();
      } else if (form.closest(".review-form")) {
        showToast("Thank you for your review! It will be published shortly.", "fa-star");
        form.reset();
      } else {
        showToast("Form submitted successfully!", "fa-check");
        form.reset();
      }
    });
  });

  // 11. Scroll To Top Button
  const scrollTopBtn = document.querySelector(".scroll-top-btn");
  scrollTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Initial State & Badges Render
  updateBadges();
});
