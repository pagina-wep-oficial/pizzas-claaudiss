(() => {
  const WHATSAPP_NUMBER = '529812085566';
  const cart = [];
  const cards = [...document.querySelectorAll('.product-card')];
  const itemContainer = document.querySelector('[data-cart-items]');
  const emptyState = document.querySelector('[data-cart-empty]');
  const countNodes = document.querySelectorAll('[data-cart-count]');
  const totalNode = document.querySelector('[data-cart-total]');
  const cartPanel = document.getElementById('cart-panel');
  const backdrop = document.querySelector('.cart-backdrop');
  const cartFloating = document.getElementById('cartFloating');
  const toast = document.querySelector('[data-toast]');
  const form = document.getElementById('order-form');
  const addressField = document.querySelector('[data-address-field]');
  const addressTextarea = form?.querySelector('textarea[name="address"]');
  const locateBtn = document.getElementById('locate-btn');
  const locationTag = document.getElementById('location-tag');
  const locTagLink = document.getElementById('loc-tag-link');
  const locTagRemove = document.getElementById('loc-tag-remove');
  let userLocationUrl = '';
  const productModal = document.querySelector('[data-product-modal]');
  const modalImage = document.querySelector('[data-modal-image]');
  const modalEmoji = document.querySelector('[data-modal-emoji]');
  const modalName = document.querySelector('[data-modal-name]');
  const modalDescription = document.querySelector('[data-modal-description]');
  const modalSizeField = document.querySelector('[data-modal-size-field]');
  const modalSize = document.querySelector('[data-modal-size]');
  const modalQuantityNode = document.querySelector('[data-modal-quantity]');
  const modalNote = document.querySelector('[data-modal-note]');
  const modalNoteCount = document.querySelector('[data-modal-note-count]');
  const modalPriceLabel = document.querySelector('[data-modal-price-label]');
  const modalPrice = document.querySelector('[data-modal-price]');
  const modalAddTotal = document.querySelector('[data-modal-add-total]');
  let activeCard = null;
  let modalQuantity = 1;
  let modalReturnFocus = null;
  const priceFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  });

  const formatPrice = (value) => priceFormatter.format(Number(value) || 0);

  const getCardPrice = (card, sizeControl = card.querySelector('.product-size')) => {
    const selectedPrice = sizeControl?.selectedOptions[0]?.dataset.price;
    return Number(selectedPrice || card.dataset.price || 0);
  };

  const updateCardPrice = (card) => {
    const priceNode = card.querySelector('[data-product-price]');
    if (priceNode) priceNode.textContent = formatPrice(getCardPrice(card));
  };

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
  };

  const openCart = () => {
    cartPanel?.classList.add('is-open');
    backdrop?.classList.add('is-visible');
    document.body.classList.add('cart-open');
  };

  const closeCart = () => {
    cartPanel?.classList.remove('is-open');
    backdrop?.classList.remove('is-visible');
    document.body.classList.remove('cart-open');
  };

  const toggleCart = () => {
    if (cartPanel?.classList.contains('is-open')) closeCart();
    else openCart();
  };

  const updateModalSummary = () => {
    if (!activeCard) return;
    const sizeControl = modalSizeField?.hidden ? null : modalSize;
    const unitPrice = getCardPrice(activeCard, sizeControl);
    const subtotal = unitPrice * modalQuantity;
    if (modalQuantityNode) modalQuantityNode.textContent = modalQuantity;
    if (modalPriceLabel) modalPriceLabel.textContent = modalQuantity > 1 ? 'Subtotal' : 'Precio';
    if (modalPrice) modalPrice.textContent = formatPrice(subtotal);
    if (modalAddTotal) modalAddTotal.textContent = formatPrice(subtotal);
  };

  const openProductModal = (card, trigger) => {
    if (!productModal) return;
    activeCard = card;
    modalReturnFocus = trigger || document.activeElement;
    modalQuantity = 1;

    const sourceImage = card.querySelector('.product-card__image img');
    const sourceEmoji = card.querySelector('.product-card__emoji');
    if (sourceImage && modalImage && modalEmoji) {
      modalImage.src = sourceImage.currentSrc || sourceImage.src;
      modalImage.alt = sourceImage.alt || card.dataset.name;
      modalImage.hidden = false;
      modalEmoji.hidden = true;
      modalEmoji.textContent = '';
    } else if (modalImage && modalEmoji) {
      modalImage.hidden = true;
      modalImage.removeAttribute('src');
      modalEmoji.textContent = sourceEmoji?.textContent?.trim() || '🍽️';
      modalEmoji.setAttribute('aria-label', card.dataset.name);
      modalEmoji.hidden = false;
    }

    if (modalName) modalName.textContent = card.dataset.name;
    if (modalDescription) {
      modalDescription.textContent = card.querySelector('.product-card__body > p')?.textContent?.trim() || '';
    }

    const cardSize = card.querySelector('.product-size');
    if (modalSize && modalSizeField) {
      modalSize.innerHTML = '';
      modalSizeField.hidden = !cardSize;
      if (cardSize) {
        [...cardSize.options].forEach((option) => modalSize.appendChild(option.cloneNode(true)));
        modalSize.value = cardSize.value;
      }
    }

    if (modalNote) modalNote.value = '';
    if (modalNoteCount) modalNoteCount.textContent = '0';
    updateModalSummary();
    productModal.hidden = false;
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => {
      productModal.classList.add('is-open');
      productModal.querySelector('.product-modal__close')?.focus();
    });
  };

  const closeProductModal = () => {
    if (!productModal || productModal.hidden) return;
    productModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    window.setTimeout(() => {
      if (!productModal.classList.contains('is-open')) productModal.hidden = true;
    }, 220);
    modalReturnFocus?.focus?.();
    activeCard = null;
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-cart-open]')) toggleCart();
    if (event.target.closest('[data-cart-close]')) closeCart();
    if (event.target.closest('[data-product-modal-close]')) closeProductModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (productModal?.classList.contains('is-open')) closeProductModal();
      else closeCart();
    }

    if (event.key === 'Tab' && productModal?.classList.contains('is-open')) {
      const focusable = [...productModal.querySelectorAll('button, select, textarea, [href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.disabled && !element.hidden && element.tabIndex >= 0 && element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  const renderCart = () => {
    const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    countNodes.forEach((node) => { node.textContent = totalUnits; });
    if (totalNode) totalNode.textContent = `${formatPrice(totalPrice)} MXN`;
    if (cartFloating) {
      const floatingTotal = cartFloating.querySelector('[data-cart-total]');
      if (floatingTotal) floatingTotal.textContent = formatPrice(totalPrice);
    }
    emptyState.hidden = cart.length > 0;
    itemContainer.innerHTML = '';

    cart.forEach((item, index) => {
      const row = document.createElement('article');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item__info">
          <h3>${escapeHtml(item.name)}</h3>
          <span>${item.size ? `Tamaño: ${escapeHtml(item.size)}` : 'Precio unitario'} · ${formatPrice(item.price)}</span>
          ${item.note ? `<span class="cart-item__note">Nota: ${escapeHtml(item.note)}</span>` : ''}
          <strong class="cart-item__subtotal">${formatPrice(item.price * item.quantity)}</strong>
        </div>
        <div class="cart-item__actions">
          <button type="button" aria-label="Quitar una unidad" data-action="minus" data-index="${index}">−</button>
          <strong>${item.quantity}</strong>
          <button type="button" aria-label="Agregar una unidad" data-action="plus" data-index="${index}">+</button>
          <button class="cart-item__remove" type="button" aria-label="Eliminar producto" data-action="remove" data-index="${index}">×</button>
        </div>`;
      itemContainer.appendChild(row);
    });
  };

  const addConfiguredItem = (card, { size = '', price, note = '', quantity = 1 }) => {
    const name = card.dataset.name;
    const cleanNote = note.trim();
    const existing = cart.find((item) => (
      item.name === name
      && item.size === size
      && item.price === price
      && item.note === cleanNote
    ));
    if (existing) existing.quantity += quantity;
    else cart.push({ name, size, price, note: cleanNote, quantity });
    renderCart();
    showToast(`${quantity} × ${name} agregado`);
  };

  cards.forEach((card) => {
    updateCardPrice(card);
    card.querySelector('.product-size')?.addEventListener('change', () => updateCardPrice(card));
    const addButton = card.querySelector('.add-product');
    if (addButton) {
      addButton.textContent = 'Elegir y agregar';
      addButton.addEventListener('click', () => openProductModal(card, addButton));
    }
  });

  modalSize?.addEventListener('change', updateModalSummary);
  modalNote?.addEventListener('input', () => {
    if (modalNoteCount) modalNoteCount.textContent = modalNote.value.length;
  });
  productModal?.querySelector('.product-modal__quantity')?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-modal-action]');
    if (!button) return;
    if (button.dataset.modalAction === 'plus') modalQuantity = Math.min(20, modalQuantity + 1);
    if (button.dataset.modalAction === 'minus') modalQuantity = Math.max(1, modalQuantity - 1);
    updateModalSummary();
  });
  productModal?.querySelector('[data-modal-add]')?.addEventListener('click', () => {
    if (!activeCard) return;
    const hasSize = !modalSizeField?.hidden;
    const size = hasSize ? modalSize.value : '';
    const price = getCardPrice(activeCard, hasSize ? modalSize : null);
    const card = activeCard;
    addConfiguredItem(card, {
      size,
      price,
      note: modalNote?.value || '',
      quantity: modalQuantity
    });
    if (hasSize) {
      const cardSize = card.querySelector('.product-size');
      if (cardSize) {
        cardSize.value = size;
        updateCardPrice(card);
      }
    }
    closeProductModal();
  });

  itemContainer?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const index = Number(button.dataset.index);
    const item = cart[index];
    if (!item) return;

    if (button.dataset.action === 'plus') item.quantity += 1;
    if (button.dataset.action === 'minus') item.quantity -= 1;
    if (button.dataset.action === 'remove' || item.quantity <= 0) cart.splice(index, 1);
    renderCart();
  });

  document.querySelectorAll('.category-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-tab').forEach((item) => item.classList.remove('is-active'));
      tab.classList.add('is-active');
      const filter = tab.dataset.filter;
      cards.forEach((card) => {
        const visible = filter === 'all' || card.dataset.category === filter;
        card.hidden = !visible;
      });
    });
  });

  form?.querySelectorAll('input[name="service"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const delivery = form.elements.service.value === 'Entrega a domicilio';
      addressField.hidden = !delivery;
    });
  });

  locateBtn?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Tu navegador no soporta geolocalización.');
      return;
    }
    locateBtn.disabled = true;
    locateBtn.textContent = 'Obteniendo ubicación…';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        userLocationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        if (locTagLink) locTagLink.textContent = userLocationUrl;
        if (locationTag) locationTag.hidden = false;
        locateBtn.disabled = false;
        locateBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg> Compartir mi ubicación';
        showToast('¡Ubicación lista!');
      },
      (error) => {
        locateBtn.disabled = false;
        locateBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg> Compartir mi ubicación';
        showToast('No se pudo obtener la ubicación. Escribe tu dirección manualmente.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

  locTagRemove?.addEventListener('click', () => {
    userLocationUrl = '';
    if (locationTag) locationTag.hidden = true;
    if (locTagLink) locTagLink.textContent = '';
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!cart.length) {
      showToast('Agrega al menos un producto');
      if (window.innerWidth < 1080) closeCart();
      document.querySelector('.product-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const data = new FormData(form);
    const service = String(data.get('service') || 'Por confirmar');
    const customer = String(data.get('customer') || '').trim();
    const address = String(data.get('address') || '').trim();
    const notes = String(data.get('notes') || '').trim();

    const lines = cart.map((item) => {
      const detail = item.size ? ` — ${item.size}` : '';
      const productLine = `• ${item.quantity} x ${item.name}${detail} — ${formatPrice(item.price)} c/u = ${formatPrice(item.price * item.quantity)}`;
      return item.note ? `${productLine}\n  Nota: ${item.note}` : productLine;
    });
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const message = [
      'Hola Pizzas Claaudiss',
      'Quisiera realizar el siguiente pedido:',
      '',
      ...lines,
      `Total estimado: ${formatPrice(totalPrice)} MXN`,
      '',
      `Servicio: ${service}`,
      customer ? `Nombre: ${customer}` : '',
      service === 'Entrega a domicilio' && address ? `Referencia: ${address}` : '',
      service === 'Entrega a domicilio' && userLocationUrl ? `Ubicación: ${userLocationUrl}` : '',
      notes ? `Notas: ${notes}` : '',
      '',
      '¿Me pueden confirmar disponibilidad y tiempo aproximado?'
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  });

  renderCart();
})();
