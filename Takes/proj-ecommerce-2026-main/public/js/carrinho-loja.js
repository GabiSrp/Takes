
/* ==========================================
   TAKES - CARRINHO COMPARTILHADO
========================================== */

(function () {
    'use strict';

    // EVITAR CARREGAMENTO DUPLICADO
    if (window.TakesCarrinho) {
        return;
    }

    const CHAVE = 'takes_carrinho_v1';

    // ======================================
    // LER CARRINHO
    // ======================================

    function ler() {
        try {
            const salvo = JSON.parse(
                localStorage.getItem(CHAVE) || '[]'
            );

            if (!Array.isArray(salvo)) {
                return [];
            }

            return [
                ...new Set(
                    salvo
                        .map(String)
                        .filter(id => /^[1-9]\d*$/.test(id))
                )
            ];

        } catch (erro) {
            console.error(
                'TAKES: erro ao ler o carrinho:',
                erro
            );

            return [];
        }
    }

    // ======================================
    // SALVAR CARRINHO
    // ======================================

    function salvar(ids) {
        try {
            const limpos = [
                ...new Set(
                    ids
                        .map(String)
                        .filter(id => /^[1-9]\d*$/.test(id))
                )
            ];

            localStorage.setItem(
                CHAVE,
                JSON.stringify(limpos)
            );

            window.dispatchEvent(
                new Event('takes:carrinho-alterado')
            );

            return true;

        } catch (erro) {
            console.error(
                'TAKES: erro ao salvar carrinho:',
                erro
            );

            return false;
        }
    }

    // ======================================
    // ADICIONAR ROTEIRO
    // ======================================

    function adicionar(id) {
        id = String(id ?? '').trim();

        if (!/^[1-9]\d*$/.test(id)) {
            return false;
        }

        const itens = ler();

        if (itens.includes(id)) {
            return true;
        }

        itens.push(id);

        return salvar(itens);
    }

    // ======================================
    // REMOVER ROTEIRO
    // ======================================

    function remover(id) {
        const itens = ler().filter(
            item => item !== String(id)
        );

        return salvar(itens);
    }

    // ======================================
    // ATUALIZAR BOTÕES
    // ======================================

    function atualizarBotoes() {
        const itens = ler();

        document.querySelectorAll(
            'button[data-cart-id]'
        ).forEach(botao => {

            const id = String(
                botao.dataset.cartId || ''
            );

            const adicionado = itens.includes(id);

            botao.classList.toggle(
                'is-in-cart',
                adicionado
            );

            botao.setAttribute(
                'aria-label',
                adicionado
                    ? 'Ver carrinho'
                    : 'Adicionar ao carrinho'
            );

            const legenda = botao.querySelector(
                '.cart-label'
            );

            if (legenda) {
                legenda.textContent = adicionado
                    ? 'Ver carrinho'
                    : 'Adicionar ao carrinho';
            }

            const icone = botao.querySelector('i');

            if (icone) {
                icone.className = adicionado
                    ? 'bi bi-bag-check'
                    : 'bi bi-cart-plus';
            }
        });
    }

    // ======================================
    // API USADA PELO CARRINHO.JS
    // ======================================

    window.TakesCarrinho = {
        ler,
        salvar,
        adicionar,
        remover,
        quantidade: () => ler().length
    };

    // ======================================
    // CLIQUE EM ADICIONAR AO CARRINHO
    // ======================================

    document.addEventListener('click', function (evento) {
        const botao = evento.target.closest(
            'button[data-cart-id]'
        );

        if (!botao) {
            return;
        }

        evento.preventDefault();

        const id = String(
            botao.dataset.cartId ?? ''
        ).trim();

        if (!/^[1-9]\d*$/.test(id)) {
            alert('Não foi possível identificar este roteiro.');
            return;
        }

        // SALVAR O ROTEIRO
        const sucesso = adicionar(id);

        // VERIFICAR SE REALMENTE FOI SALVO
        if (!sucesso || !ler().includes(id)) {
            alert(
                'Não foi possível salvar o roteiro no carrinho.'
            );
            return;
        }

        console.log(
            'Roteiro adicionado ao carrinho:',
            id
        );

        // ABRIR CARRINHO NO PRIMEIRO CLIQUE
        window.location.assign('/carrinho');
    });

    // ======================================
    // ATUALIZAR QUANDO O CARRINHO MUDAR
    // ======================================

    window.addEventListener(
        'takes:carrinho-alterado',
        atualizarBotoes
    );

    window.addEventListener('storage', function (evento) {
        if (evento.key === CHAVE) {
            atualizarBotoes();
        }
    });

    // ======================================
    // INICIAR
    // ======================================

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            atualizarBotoes
        );
    } else {
        atualizarBotoes();
    }

})();
