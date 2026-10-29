
const CHAVE_FAVORITOS = 'takes_favoritos_v1';

function obterFavoritos() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_FAVORITOS) || '{}'
        );

        if (!dados || typeof dados !== 'object' ||
            Array.isArray(dados)) {
            return {};
        }

        return dados;
    } catch {
        return {};
    }
}

function salvarFavoritos(dados) {
    localStorage.setItem(
        CHAVE_FAVORITOS,
        JSON.stringify(dados)
    );
}

function alternarFavorito(id) {
    const favoritos = obterFavoritos();

    if (favoritos[id]) {
        delete favoritos[id];
    } else {
        favoritos[id] = Date.now();
    }

    salvarFavoritos(favoritos);

    window.dispatchEvent(new Event('takes:favoritos'));
}

function normalizar(texto) {
    return String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function formatarData(timestamp) {
    const dias = Math.floor(
        (Date.now() - Number(timestamp)) / 86400000
    );

    if (dias <= 0) return 'Salvo hoje';
    if (dias === 1) return 'Salvo ontem';
    if (dias < 7) return `Salvo há ${dias} dias`;
    if (dias < 14) return 'Salvo há 1 semana';

    return `Salvo em ${
        new Date(Number(timestamp)).toLocaleDateString('pt-BR')
    }`;
}

document.addEventListener('DOMContentLoaded', () => {

    const cards = [
        ...document.querySelectorAll('.favorite-card')
    ];

    const grid = document.getElementById('favoritesGrid');
    const filtros = document.querySelectorAll('.filter-btn');
    const pesquisa = document.getElementById('pesquisaFavoritos');
    const ordenacao = document.getElementById('ordenacao');

    const vazio = document.getElementById('emptyState');
    const mensagem = document.getElementById('emptyMessage');
    const total = document.getElementById('totalFavoritos');
    const resultados = document.getElementById('resultsCount');

    let filtroAtual = 'todos';

    function classificarFormato(texto) {
        const formato = normalizar(texto);

        if (formato.includes('longa')) return 'longa';
        if (formato.includes('curta')) return 'curta';

        return 'outros';
    }

    function atualizarPagina() {
        const favoritos = obterFavoritos();
        const termo = normalizar(pesquisa.value.trim());

        let quantidadeVisivel = 0;
        let quantidadeFavoritos = 0;

        cards.forEach(card => {
            const id = card.dataset.id;
            const data = favoritos[id];

            const estaSalvo = Boolean(data);
            const formato = classificarFormato(
                card.dataset.formato
            );

            if (estaSalvo) quantidadeFavoritos++;

            const correspondeFiltro =
                filtroAtual === 'todos' ||
                formato === filtroAtual;

            const correspondePesquisa =
                normalizar(card.textContent).includes(termo);

            const mostrar =
                estaSalvo &&
                correspondeFiltro &&
                correspondePesquisa;

            card.hidden = !mostrar;

            if (mostrar) quantidadeVisivel++;

            if (estaSalvo) {
                card.querySelector('[data-saved-date]')
                    .textContent = formatarData(data);
            }
        });

        total.textContent = quantidadeFavoritos;
        resultados.textContent =
            `${quantidadeVisivel} roteiro(s) nos favoritos`;

        const criterio = ordenacao.value;

        const ordenados = [...cards].sort((a, b) => {
            if (criterio === 'titulo') {
                return a.dataset.titulo.localeCompare(
                    b.dataset.titulo,
                    'pt-BR'
                );
            }

            const dataA = favoritos[a.dataset.id] || 0;
            const dataB = favoritos[b.dataset.id] || 0;

            return criterio === 'antigos'
                ? dataA - dataB
                : dataB - dataA;
        });

        ordenados.forEach(card => grid.appendChild(card));

        vazio.hidden = quantidadeVisivel > 0;

        if (quantidadeFavoritos === 0) {
            mensagem.textContent =
                'Você ainda não salvou nenhum roteiro. ' +
                'Explore o catálogo e clique na estrela.';
        } else {
            mensagem.textContent =
                'Nenhum roteiro corresponde aos filtros selecionados.';
        }
    }

    // FILTROS
    filtros.forEach(botao => {
        botao.addEventListener('click', () => {
            filtros.forEach(item => {
                item.classList.remove('active');
            });

            botao.classList.add('active');
            filtroAtual = botao.dataset.filter;

            atualizarPagina();
        });
    });

    // PESQUISA E ORDENAÇÃO
    pesquisa.addEventListener('input', atualizarPagina);
    ordenacao.addEventListener('change', atualizarPagina);

    // REMOVER FAVORITO
    document.querySelectorAll('.favorite-star')
        .forEach(botao => {
            botao.addEventListener('click', () => {
                const id = botao.dataset.favoriteId;
                alternarFavorito(id);
            });
        });

    window.addEventListener(
        'takes:favoritos',
        atualizarPagina
    );

    window.addEventListener('storage', atualizarPagina);

    // CARRINHO AINDA NÃO IMPLEMENTADO
    document.getElementById('menuCarrinho')
        .addEventListener('click', evento => {
            evento.preventDefault();
            alert('O carrinho ainda está em desenvolvimento.');
        });

    atualizarPagina();
});
