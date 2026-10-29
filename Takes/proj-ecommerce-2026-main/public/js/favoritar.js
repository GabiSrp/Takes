
document.addEventListener('DOMContentLoaded', () => {

    const CHAVE = 'takes_favoritos_v1';

    function ler() {
        try {
            return JSON.parse(
                localStorage.getItem(CHAVE) || '{}'
            ) || {};
        } catch {
            return {};
        }
    }

    function atualizarEstrelas() {
        const favoritos = ler();

        document.querySelectorAll('.botao-favorito')
            .forEach(botao => {
                const id = botao.dataset.favoriteId;
                const ativo = Boolean(favoritos[id]);

                botao.classList.toggle('favoritado', ativo);
                botao.setAttribute('aria-pressed', String(ativo));

                botao.setAttribute(
                    'aria-label',
                    ativo
                        ? 'Remover dos favoritos'
                        : 'Adicionar aos favoritos'
                );

                botao.title = ativo
                    ? 'Remover dos favoritos'
                    : 'Adicionar aos favoritos';

                botao.innerHTML = ativo
                    ? '<i class="bi bi-star-fill"></i>'
                    : '<i class="bi bi-star"></i>';
            });
    }

    document.querySelectorAll('.botao-favorito')
        .forEach(botao => {
            botao.addEventListener('click', () => {
                const id = botao.dataset.favoriteId;
                const favoritos = ler();

                if (favoritos[id]) {
                    delete favoritos[id];
                } else {
                    favoritos[id] = Date.now();
                }

                localStorage.setItem(
                    CHAVE,
                    JSON.stringify(favoritos)
                );

                atualizarEstrelas();
            });
        });

    window.addEventListener('storage', atualizarEstrelas);

    atualizarEstrelas();
});
