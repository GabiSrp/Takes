
/* ==========================================
   TAKES - PÁGINA DO CARRINHO
========================================== */

(function () {
    'use strict';

    const $ = seletor => document.querySelector(seletor);

    const loja = window.TakesCarrinho;

    const lista = $('#lista-carrinho');
    const template = $('#modelo-roteiro-carrinho');
    const vazio = $('#carrinho-vazio');

    const prosseguir = $('#prosseguir-licenciamento');
    const dialogo = $('#dialogo-licenciamento');

    const formatoBRL = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    let produtos = [];
    let itensAtuais = [];

    // ======================================
    // RECEBER DADOS DO SQLITE
    // ======================================

    try {
        const elemento = $('#dados-roteiros');

        produtos = JSON.parse(
            elemento.textContent || '[]'
        );

    } catch (erro) {
        console.error(
            'Erro ao carregar roteiros:',
            erro
        );
    }

    const produtosPorId = new Map(
        produtos.map(produto => [
            String(produto.id),
            produto
        ])
    );

    // ======================================
    // TRATAMENTO DE TEXTO
    // ======================================

    function texto(valor, padrao = 'Não informado') {

        if (
            valor === null ||
            valor === undefined ||
            String(valor).trim() === ''
        ) {
            return padrao;
        }

        return String(valor);
    }

    // ======================================
    // PREÇO
    // ======================================

    function precoNumerico(valor) {

        if (typeof valor === 'number') {
            return Number.isFinite(valor) && valor > 0
                ? valor
                : null;
        }

        if (
            valor === null ||
            valor === undefined ||
            String(valor).trim() === ''
        ) {
            return null;
        }

        let numero = String(valor).replace(
            /[^\d,.\-]/g,
            ''
        );

        if (numero.includes(',')) {
            numero = numero
                .replace(/\./g, '')
                .replace(',', '.');
        }

        numero = Number(numero);

        return Number.isFinite(numero) && numero > 0
            ? numero
            : null;
    }

    // ======================================
    // CAMINHO DA IMAGEM
    // ======================================

    function caminhoImagem(imagem) {

        if (!imagem) {
            return null;
        }

        const src = String(imagem)
            .trim()
            .replace(/\\/g, '/');

        if (/^https?:\/\//i.test(src)) {
            return src;
        }

        if (src.startsWith('/')) {
            return src;
        }

        if (src.startsWith('public/')) {
            return '/' + src.slice(7);
        }

        if (src.startsWith('uploads/')) {
            return '/' + src;
        }

        return '/uploads/' + encodeURIComponent(src);
    }

    // ======================================
    // CRIAR CARD DO ROTEIRO
    // ======================================

    function criarItem(produto) {

        const fragmento = template.content.cloneNode(true);

        const card = fragmento.querySelector(
            '.cart-product'
        );

        card.dataset.id = String(produto.id);

        // CAPA
        const imagem = fragmento.querySelector(
            '.cart-poster-img'
        );

        const fallback = fragmento.querySelector(
            '.cart-poster-fallback'
        );

        const urlImagem = caminhoImagem(
            produto.imagem
        );

        if (urlImagem) {

            imagem.src = urlImagem;

            imagem.alt = 'Capa de ' + texto(
                produto.nome,
                'roteiro'
            );

            imagem.addEventListener('error', () => {
                imagem.hidden = true;
                fallback.hidden = false;
            }, { once: true });

        } else {

            imagem.hidden = true;
            fallback.hidden = false;

        }

        // TÍTULO
        fragmento.querySelector(
            '.cart-product-title'
        ).textContent = texto(
            produto.nome,
            'Roteiro'
        );

        // AUTOR
        fragmento.querySelector(
            '.cart-product-author'
        ).textContent = texto(
            produto.autores ||
            produto.autor ||
            produto.nome_autor ||
            produto.criador,
            'Roteiro disponível no TAKES'
        );

        // DESCRIÇÃO
        const descricao = texto(
            produto.descricao,
            'Conheça os detalhes deste roteiro.'
        );

        fragmento.querySelector(
            '.cart-product-description'
        ).textContent = descricao.length > 140
            ? descricao.slice(0, 137) + '...'
            : descricao;

        // FORMATO
        fragmento.querySelector(
            '.cart-product-format'
        ).textContent = texto(
            produto.nome_categoria ||
            produto.formato ||
            produto.categoria
        );

        // GÊNERO
        fragmento.querySelector(
            '.cart-product-genre'
        ).textContent = texto(
            produto.genero
        );

        // DURAÇÃO
        fragmento.querySelector(
            '.cart-product-duration'
        ).textContent = texto(
            produto.duracao ||
            produto.duracao_estimada,
            'Não informada'
        );

        // PREÇO
        const valor = precoNumerico(
            produto.valor
        );

        fragmento.querySelector(
            '.cart-product-price'
        ).textContent = valor === null
            ? 'Sob consulta'
            : formatoBRL.format(valor);

        // VER DETALHES
        fragmento.querySelector(
            '.cart-detail-link'
        ).href = '/roteiros/' + encodeURIComponent(
            String(produto.id)
        );

        // REMOVER
        fragmento.querySelector(
            '.cart-remove-button'
        ).addEventListener('click', function () {

            loja.remover(produto.id);

        });

        return fragmento;
    }

    // ======================================
    // RENDERIZAR CARRINHO
    // ======================================

    function renderizar() {

        if (!loja || !lista) {
            return;
        }

        const ids = loja.ler();

        itensAtuais = ids
            .map(id => produtosPorId.get(id))
            .filter(Boolean);

        lista.replaceChildren();

        itensAtuais.forEach(produto => {

            lista.appendChild(
                criarItem(produto)
            );

        });

        const quantidade = itensAtuais.length;

        // CONTADOR
        $('#contagem-roteiros').textContent =
            quantidade + ' ' +
            (quantidade === 1
                ? 'roteiro'
                : 'roteiros');

        // RESUMO
        $('#resumo-quantidade').textContent =
            String(quantidade);

        // CARRINHO VAZIO
        vazio.hidden = quantidade > 0;

        // BOTÃO DE LICENCIAMENTO
        prosseguir.disabled = quantidade === 0;

        // CONTADOR DO MENU
        const badge = $('#badge-menu');

        badge.hidden = quantidade === 0;

        badge.textContent = String(quantidade);

        // ==================================
        // CALCULAR TOTAL
        // ==================================

        const valores = itensAtuais.map(
            produto => precoNumerico(produto.valor)
        );

        const todosComPreco =
            quantidade > 0 &&
            valores.every(valor => valor !== null);

        let total = 'A definir';

        if (todosComPreco) {

            const soma = valores.reduce(
                (acumulado, valor) => acumulado + valor,
                0
            );

            total = formatoBRL.format(soma);

        }

        $('#resumo-licenca').textContent = total;

        $('#resumo-total').textContent = total;

        $('#aviso-valor').textContent = todosComPreco
            ? 'Valor de referência dos roteiros selecionados. As condições de licenciamento serão formalizadas posteriormente.'
            : 'O valor final depende do escopo e das condições de licenciamento acordadas com os autores.';

    }

    // ======================================
    // ABRIR LICENCIAMENTO
    // ======================================

    prosseguir.addEventListener('click', () => {

        if (itensAtuais.length === 0) {
            return;
        }

        $('#licenca-feedback').textContent = '';

        if (typeof dialogo.showModal === 'function') {
            dialogo.showModal();
        } else {
            dialogo.setAttribute('open', '');
        }

    });

    // ======================================
    // FECHAR LICENCIAMENTO
    // ======================================

    $('#fechar-licenciamento').addEventListener(
        'click',
        () => {

            if (typeof dialogo.close === 'function') {
                dialogo.close();
            } else {
                dialogo.removeAttribute('open');
            }

        }
    );

    dialogo.addEventListener('click', event => {

        if (event.target === dialogo) {
            dialogo.close();
        }

    });

    // ======================================
    // COPIAR SOLICITAÇÃO
    // ======================================

    $('#copiar-solicitacao').addEventListener(
        'click',
        async () => {

            const nome = $('#licenca-nome').value.trim();
            const email = $('#licenca-email').value.trim();
            const objetivo = $('#licenca-objetivo').value.trim();

            const linhas = [

                'TAKES - Solicitação de licenciamento',

                'Nome/empresa: ' + (nome || 'Não informado'),

                'E-mail: ' + (email || 'Não informado'),

                'Uso pretendido: ' + (objetivo || 'Não informado'),

                '',

                'Roteiros selecionados:',

                ...itensAtuais.map(produto => {

                    const preco = precoNumerico(
                        produto.valor
                    );

                    const valor = preco === null
                        ? 'Sob consulta'
                        : formatoBRL.format(preco);

                    return '- ' + texto(produto.nome) +
                        ' (ID ' + produto.id + ')' +
                        ' - ' + valor;

                }),

                '',

                'Solicitação de negociação, sem pagamento ou transferência de direitos.'

            ];

            const resumo = linhas.join('\n');

            const feedback = $('#licenca-feedback');

            try {

                await navigator.clipboard.writeText(
                    resumo
                );

                feedback.textContent =
                    'Resumo copiado! Você pode encaminhá-lo aos responsáveis.';

            } catch (erro) {

                console.error(erro);

                feedback.textContent =
                    'Não foi possível copiar. Verifique a permissão do navegador.';

            }

        }
    );

    // ======================================
    // ATUALIZAR AUTOMATICAMENTE
    // ======================================

    window.addEventListener(
        'takes:carrinho-alterado',
        renderizar
    );

    window.addEventListener('storage', event => {

        if (event.key === 'takes_carrinho_v1') {
            renderizar();
        }

    });

    // INICIAR
    renderizar();

})();
