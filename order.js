(() => {
  const WHATSAPP_NUMBER = '529812085566';
  const cart = [];
  const cards = [...document.querySelectorAll('.product-card')];
  const itemContainer = document.querySelector('[data-cart-items]');
  const emptyState = document.querySelector('[data-cart-empty]');
  const countNodes = document.querySelectorAll('[data-cart-count]');
  const cartPanel = document.getElementById('cart-panel');
  const backdrop = document.querySelector('.cart-backdrop');
  const toast = document.querySelector('[data-toast]');
  const form = document.getElementById('order-form');
  const addressField = document.querySelector('[data-address-field]');

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

  document.querySelectorAll('[data-cart-open]').forEach((button) => button.addEventListener('click', openCart));
  document.querySelectorAll('[data-cart-close]').forEach((button) => button.addEventListener('click', closeCart));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeCart(); });

  const renderCart = () => {
    const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
    countNodes.forEach((node) => { node.textContent = totalUnits; });
    emptyState.hidden = cart.length > 0;
    itemContainer.innerHTML = '';

    cart.forEach((item, index) => {
      const row = document.createElement('article');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item__info">
          <h3>${escapeHtml(item.name)}</h3>
          ${item.size ? `<span>Tamaño: ${escapeHtml(item.size)}</span>` : '<span>Precio por confirmar</span>'}
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

  const addItem = (card) => {
    const name = card.dataset.name;
    const size = card.querySelector('.product-size')?.value || '';
    const existing = cart.find((item) => item.name === name && item.size === size);
    if (existing) existing.quantity += 1;
    else cart.push({ name, size, quantity: 1 });
    renderCart();
    showToast(`${name} agregado`);
  };

  cards.forEach((card) => {
    card.querySelector('.add-product')?.addEventListener('click', () => addItem(card));
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
      return `• ${item.quantity} x ${item.name}${detail}`;
    });

    const message = [
      'Hola Pizzas Claaudiss 🍕',
      'Quisiera realizar el siguiente pedido:',
      '',
      ...lines,
      '',
      `Servicio: ${service}`,
      customer ? `Nombre: ${customer}` : '',
      service === 'Entrega a domicilio' && address ? `Dirección/referencia: ${address}` : '',
      notes ? `Notas: ${notes}` : '',
      '',
      '¿Me pueden confirmar disponibilidad, precio total y tiempo aproximado?'
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  });

  renderCart();
})();
