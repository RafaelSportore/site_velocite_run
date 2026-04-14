document.addEventListener('DOMContentLoaded', () => {

    // --- LOGICA DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('user-email').value;
            const pass = document.getElementById('user-pass').value;

            if (email === 'teste@teste' && pass === 'teste') {
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('main-app').classList.remove('is-hidden');
                document.body.style.overflow = 'initial';
                window.scrollTo(0, 0);
            } else {
                const errorP = document.getElementById('login-error');
                if (errorP) errorP.innerText = "Usuário ou senha incorretos!";
            }
        });
    }

    if (document.getElementById('main-app') && document.getElementById('main-app').classList.contains('is-hidden')) {
        document.body.style.overflow = 'hidden';
    }

    // --- LOGOUT ---
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('main-app').classList.add('is-hidden');
            document.getElementById('login-screen').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            loginForm.reset();
            window.scrollTo(0, 0);
        });
    }

    // --- FORMULÁRIO DE CONTATO (COM TODAS AS VALIDAÇÕES) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nomeInput = document.getElementById('nome');
            const mensagemInput = document.getElementById('mensagem');
            const cpfInput = document.getElementById('cpf');

            const nome = nomeInput.value.trim();
            const mensagem = mensagemInput.value.trim();
            const cpfRaw = cpfInput.value;

            // 1. Validação de Nome Vazio
            if (nome === "") {
                Swal.fire("Atenção", "O campo Nome não pode estar vazio.", "warning");
                nomeInput.focus();
                return;
            }

            // 2. Validação de Mensagem Vazia
            if (mensagem === "") {
                Swal.fire("Atenção", "O campo Mensagem não pode estar vazio.", "warning");
                mensagemInput.focus();
                return;
            }

            // 3. Validação de CPF 
            let cpf = cpfRaw.trim().replace(/[-.]/g, '').split('').map((x) => parseInt(x));

            if (cpf.length !== 11 || cpf.every(c => c === cpf[0])) {
                Swal.fire("Erro", "CPF inválido (formato incorreto).", "error");
                cpfInput.focus();
                return;
            }

            // --- INÍCIO DA LÓGICA CPF ---
            let soma = 0;
            for (let i = 0; i < 9; ++i) {
                soma += (i + 1) * cpf[i];
            }

            soma %= 11;
            if (soma === 10) soma = 0;

            if (soma === cpf[9]) {
                soma = 0;
                for (let i = 0; i < 9; ++i) {
                    soma += (9 - i) * cpf[i];
                }

                soma %= 11;
                if (soma === 10) soma = 0;

                if (soma === cpf[10]) {
                    
                    Swal.fire({
                        title: "Enviado!",
                        text: `Obrigado ${nome}, sua mensagem foi enviada com sucesso.`,
                        icon: "success"
                    });
                    contactForm.reset();
                } else {
                    Swal.fire("Erro", "CPF inválido.", "error");
                    cpfInput.focus();
                }
            } else {
                Swal.fire("Erro", "CPF inválido.", "error");
                cpfInput.focus();
            }

        });
    }

    // Máscara visual de CPF
    const cpfInputEl = document.getElementById('cpf');
    if (cpfInputEl) {
        cpfInputEl.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }

});

// --- MÁSCARAS DE CARTÃO DE CRÉDITO ---
const inputCardNumber = document.getElementById('new-card-number');
const inputExpiry = document.getElementById('new-card-expiry');

if (inputCardNumber) {
    inputCardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value;
    });
}

if (inputExpiry) {
    inputExpiry.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
}


// --- SISTEMA DE CARRINHO ---


let cart = [];

function toggleCart() {
    const sidebar = document.getElementById('cart-modal');
    if (sidebar) {
        sidebar.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'initial';
    }
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    updateCartUI();
    Swal.fire({ icon: 'success', title: 'Adicionado!', text: name, timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
}

function updateQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const summaryArea = document.getElementById('cart-checkout-section');
    const footerActions = document.getElementById('cart-sticky-footer');
    const cartCount = document.getElementById('cart-count');

    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    if (cartCount) cartCount.innerText = totalItems;

    if (cart.length === 0) {
        if (itemsContainer) itemsContainer.innerHTML = `<div class="empty-cart-state"><i class="fas fa-cart-plus"></i><p>Sua sacola está vazia.</p></div>`;
        if (summaryArea) summaryArea.classList.add('is-hidden');
        if (footerActions) footerActions.classList.add('is-hidden');
        return;
    }

    if (summaryArea) summaryArea.classList.remove('is-hidden');
    if (footerActions) footerActions.classList.remove('is-hidden');
    if (itemsContainer) {
        itemsContainer.innerHTML = '';
        let subtotal = 0;
        cart.forEach((item, index) => {
            subtotal += (item.price * item.qty);
            itemsContainer.innerHTML += `
                <div class="cart-item">
                    <div class="item-main-info">
                        <h4>${item.name}</h4>
                        <p class="item-price-tag">R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div class="item-controls">
                        <div class="qty-selector">
                            <button class="btn-qty" onclick="updateQty(${index}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button class="btn-qty" onclick="updateQty(${index}, 1)">+</button>
                        </div>
                        <button class="btn-remove-item" onclick="removeFromCart(${index})">Remover</button>
                    </div>
                </div>
            `;
        });
        document.getElementById('cart-subtotal-value').innerText = `R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    updatePaymentUI();
}

function updatePaymentUI() {
    if (cart.length === 0) return;
    const methodInput = document.querySelector('input[name="payment-method"]:checked');
    if (!methodInput) return;

    const method = methodInput.value;
    const pixArea = document.getElementById('pix-details-area');
    const cardArea = document.getElementById('card-details-area');
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    if (method === 'pix') {
        if (pixArea) pixArea.classList.remove('is-hidden');
        if (cardArea) cardArea.classList.add('is-hidden');
        const totalPix = subtotal * 0.95;
        document.getElementById('cart-pix-total').innerText = `R$ ${totalPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    } else {
        if (pixArea) pixArea.classList.add('is-hidden');
        if (cardArea) cardArea.classList.remove('is-hidden');
        updateInstallments();
    }
}

function updateInstallments() {
    const installmentsSelect = document.getElementById('installments-select');
    const cardSelected = document.getElementById('saved-cards-select').value;
    if (!installmentsSelect) return;

    installmentsSelect.innerHTML = '';
    if (!cardSelected) {
        installmentsSelect.innerHTML = '<option value="">Selecione um cartão</option>';
        installmentsSelect.disabled = true;
        return;
    }
    installmentsSelect.disabled = false;
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    for (let i = 1; i <= 10; i++) {
        let v = subtotal / i;
        let t = (i === 1) ? `À vista - R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `${i}x de R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros`;
        installmentsSelect.innerHTML += `<option value="${i}">${t}</option>`;
    }
}

function openAddCardModal() { document.getElementById('add-card-modal').classList.remove('is-hidden'); }
function closeAddCardModal() { document.getElementById('add-card-modal').classList.add('is-hidden'); }

function saveNewCard(e) {
    e.preventDefault();
    const input = document.getElementById('new-card-number');
    const last4 = input.value.replace(/\D/g, '').slice(-4);
    if (last4.length < 4) {
        Swal.fire("Erro", "Número de cartão inválido.", "error");
        return;
    }
    const select = document.getElementById('saved-cards-select');
    const option = document.createElement('option');
    option.value = `new-${Date.now()}`;
    option.text = `Novo Cartão •••• ${last4}`;
    option.selected = true;
    select.add(option);
    Swal.fire({ icon: 'success', title: 'Cartão Salvo!', timer: 1500, showConfirmButton: false });
    closeAddCardModal();
    updateInstallments();
}

function openPixModal() { document.getElementById('pix-final-modal').classList.remove('is-hidden'); }
function closePixModal() {
    document.getElementById('pix-final-modal').classList.add('is-hidden');
    cart = [];
    updateCartUI();
}

function copyPixCode() {
    const input = document.getElementById("pix-code-input");
    input.select();
    navigator.clipboard.writeText(input.value);
    Swal.fire({ icon: 'success', title: 'Copiado!', timer: 1500, showConfirmButton: false, toast: true, position: 'bottom' });
}

function processCheckout() {
    const methodInput = document.querySelector('input[name="payment-method"]:checked');
    if (!methodInput) return;
    const method = methodInput.value;

    if (method === 'pix') {
        toggleCart();
        openPixModal();
    } else {
        if (!document.getElementById('saved-cards-select').value) {
            Swal.fire("Atenção", "Selecione um cartão.", "warning");
            return;
        }
        Swal.fire({ title: 'Processando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        setTimeout(() => {
            Swal.close();
            Swal.fire({ icon: 'success', title: 'Pedido Confirmado!' });
            toggleCart();
            cart = [];
            updateCartUI();
        }, 2000);
    }
}

function flipCard(element) {
    const card = element.closest('.product-card');
    if (card) card.classList.toggle('is-flipped');
}
