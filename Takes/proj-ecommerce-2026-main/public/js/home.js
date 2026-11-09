
/* ==========================================
   TAKES - INTERAÇÕES DA HOME
========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ======================================
    // CRIAR JANELA DE INTERAÇÃO
    // ======================================

    const janela = document.createElement('dialog');
    janela.className = 'home-modal';

    janela.innerHTML = `
        <div class="home-modal-content">

            <button
                type="button"
                class="home-modal-close"
                aria-label="Fechar">
                &times;
            </button>

            <span class="home-modal-label">
                TAKES | FAÇA ARTE
            </span>

            <h2 id="home-modal-titulo"></h2>

            <p id="home-modal-descricao"></p>

            <form id="home-modal-pesquisa" hidden>
                <input
                    type="search"
                    id="home-campo-pesquisa"
                    placeholder="Título, gênero ou palavra-chave..."
                    aria-label="Pesquisar roteiros"
                    required>

                <button type="submit">
                    <i class="bi bi-search"></i>
                    Buscar
                </button>
            </form>

            <a
                href="/roteiros"
                class="home-modal-action"
                id="home-modal-acao"
                hidden>
                Explorar roteiros
                <i class="bi bi-arrow-right"></i>
            </a>

        </div>
    `;

    document.body.appendChild(janela);

    // ======================================
    // ESTILO DA JANELA
    // ======================================

    const estilo = document.createElement('style');

    estilo.textContent = `
        .home-modal {
            width: min(450px, calc(100% - 30px));
            padding: 0;
            border: 1px solid #303747;
            border-radius: 20px;
            background: #11141e;
            color: #fff;
            font-family: Inter, Arial, sans-serif;
            box-shadow: 0 25px 80px #0008;
        }

        .home-modal::backdrop {
            background: rgba(0, 0, 0, .75);
            backdrop-filter: blur(5px);
        }

        .home-modal-content {
            position: relative;
            padding: 38px 30px;
        }

        .home-modal-close {
            position: absolute;
            top: 15px;
            right: 18px;
            padding: 4px;
            background: transparent;
            border: none;
            color: #b7bdc9;
            font-size: 29px;
            cursor: pointer;
        }

        .home-modal-close:hover {
            color: #fff;
        }

        .home-modal-label {
            color: #7da6ff;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .home-modal h2 {
            margin: 15px 0;
            font-size: 31px;
            font-weight: 500;
            letter-spacing: -1px;
        }

        .home-modal p {
            color: #aeb4c0;
            font-size: 14px;
            line-height: 1.7;
        }

        #home-modal-pesquisa {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 25px;
        }

        #home-modal-pesquisa[hidden] {
            display: none;
        }

        #home-modal-pesquisa input {
            width: 100%;
            padding: 15px;
            border: 1px solid #3a4153;
            border-radius: 10px;
            outline: none;
            background: #1b2030;
            color: #fff;
            font-size: 13px;
        }

        #home-modal-pesquisa input:focus {
            border-color: #7da6ff;
        }

        #home-modal-pesquisa button,
        .home-modal-action {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            padding: 14px;
            border: none;
            border-radius: 10px;
            background: #7da6ff;
            color: #10131d !important;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
        }

        .home-modal-action {
            margin-top: 22px;
        }

        .home-modal-action[hidden] {
            display: none;
        }

        #home-modal-pesquisa button:hover,
        .home-modal-action:hover {
            background: #a6c1ff;
        }

        .home-social span {
            cursor: pointer;
            transition: transform .2s, background .2s;
        }

        .home-social span:hover {
            transform: translateY(-3px);
            background: #46527a;
        }
    `;

    document.head.appendChild(estilo);

    const titulo = document.getElementById('home-modal-titulo');
    const descricao = document.getElementById('home-modal-descricao');
    const formulario = document.getElementById('home-modal-pesquisa');
    const campo = document.getElementById('home-campo-pesquisa');
    const acao = document.getElementById('home-modal-acao');

    // ======================================
    // ABRIR JANELA
    // ======================================

    function abrirJanela(tipo) {

        formulario.hidden = true;
        acao.hidden = true;

        if (tipo === 'pesquisa') {

            titulo.textContent = 'Encontre sua próxima história.';

            descricao.textContent =
                'Pesquise os roteiros disponíveis no TAKES por título, gênero ou palavra-chave.';

            formulario.hidden = false;
        }

        if (tipo === 'precos') {

            titulo.textContent = 'Preços e planos';

            descricao.textContent =
                'Os planos ainda não estão disponíveis nesta versão do TAKES. Você já pode conhecer os roteiros publicados.';

            acao.hidden = false;
        }

        if (tipo === 'cadastro') {

            titulo.textContent = 'Faça parte do TAKES.';

            descricao.textContent =
                'O cadastro de novos usuários ainda está em desenvolvimento. Enquanto isso, explore os roteiros disponíveis.';

            acao.hidden = false;
        }

        if (tipo === 'redes') {

            titulo.textContent = 'Acompanhe o TAKES.';

            descricao.textContent =
                'Os links das nossas redes sociais serão adicionados em breve.';

            acao.hidden = false;
        }

        janela.showModal();

        if (tipo === 'pesquisa') {
            campo.value = '';
            campo.focus();
        }
    }

    // ======================================
    // FECHAR JANELA
    // ======================================

    janela.querySelector('.home-modal-close')
        .addEventListener('click', () => {
            janela.close();
        });

    janela.addEventListener('click', evento => {
        if (evento.target === janela) {
            janela.close();
        }
    });

    // ======================================
    // BOTÃO PREÇOS
    // ======================================

    document.querySelectorAll('a[href="#recursos"]')
        .forEach(botao => {

            botao.addEventListener('click', evento => {
                evento.preventDefault();
                abrirJanela('precos');
            });

        });

    // ======================================
    // BUSCAR UM CRIADOR / ROTEIRO
    // ======================================

    const botaoPesquisar = document.querySelector(
        '.home-nav-search'
    );

    if (botaoPesquisar) {

        botaoPesquisar.addEventListener('click', evento => {
            evento.preventDefault();
            abrirJanela('pesquisa');
        });

    }

    // ======================================
    // ENVIAR PESQUISA
    // ======================================

    formulario.addEventListener('submit', evento => {

        evento.preventDefault();

        const termo = campo.value.trim();

        if (termo === '') {
            campo.focus();
            return;
        }

        window.location.href =
            '/roteiros?q=' + encodeURIComponent(termo);

    });

    // ======================================
    // BOTÃO REGISTRAR
    // ======================================

    const botaoRegistrar = document.querySelector(
        '.home-nav-pill--white'
    );

    if (botaoRegistrar) {

        botaoRegistrar.addEventListener('click', evento => {
            evento.preventDefault();
            abrirJanela('cadastro');
        });

    }

    // ======================================
    // BOTÕES CRIAR CONTA GRÁTIS
    // ======================================

    document.querySelectorAll('.home-dark-button')
        .forEach(botao => {

            botao.addEventListener('click', evento => {
                evento.preventDefault();
                abrirJanela('cadastro');
            });

        });

    // ======================================
    // LINKS INTERNOS - ROLAGEM SUAVE
    // ======================================

    document.querySelectorAll('a[href^="#"]')
        .forEach(link => {

            if (link.getAttribute('href') === '#recursos') {
                return;
            }

            link.addEventListener('click', evento => {

                const destino = link.getAttribute('href');

                if (!destino || destino === '#') {
                    return;
                }

                const secao = document.querySelector(destino);

                if (secao) {

                    evento.preventDefault();

                    secao.scrollIntoView({
                        behavior: window.matchMedia(
                            '(prefers-reduced-motion: reduce)'
                        ).matches ? 'auto' : 'smooth',
                        block: 'start'
                    });

                }

            });

        });

    // ======================================
    // REDES SOCIAIS
    // ======================================

    document.querySelectorAll('.home-social span')
        .forEach(botao => {

            botao.setAttribute('role', 'button');
            botao.setAttribute('tabindex', '0');

            botao.addEventListener('click', () => {
                abrirJanela('redes');
            });

            botao.addEventListener('keydown', evento => {

                if (
                    evento.key === 'Enter' ||
                    evento.key === ' '
                ) {
                    evento.preventDefault();
                    abrirJanela('redes');
                }

            });

        });

    // ======================================
    // BOTÕES QUE ABREM OUTRAS PÁGINAS
    // ======================================

    // Log in:
    // href="/login"

    // Ver todos:
    // href="/roteiros"

    // Explorar roteiros:
    // href="/roteiros"

    // Logo TAKES:
    // href="/"

    // Esses links já funcionam pelo HTML.
    // Não precisam de eventos adicionais.

    // ======================================
    // ANIMAÇÃO DE ENTRADA DAS SEÇÕES
    // ======================================

    if ('IntersectionObserver' in window) {

        const elementos = document.querySelectorAll(
            '.home-benefit, .home-feature-card, .home-cta-inner'
        );

        elementos.forEach(elemento => {
            elemento.style.opacity = '0';
            elemento.style.transform = 'translateY(25px)';
            elemento.style.transition =
                'opacity .6s ease, transform .6s ease';
        });

        const observador = new IntersectionObserver(
            entradas => {

                entradas.forEach(entrada => {

                    if (entrada.isIntersecting) {

                        entrada.target.style.opacity = '1';
                        entrada.target.style.transform = 'translateY(0)';

                        observador.unobserve(entrada.target);

                    }

                });

            },
            { threshold: 0.12 }
        );

        elementos.forEach(elemento => {
            observador.observe(elemento);
        });

    }

});
