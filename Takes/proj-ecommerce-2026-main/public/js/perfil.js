
document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEY = 'takes_perfil_demo_v1';

    const campos = {
        usuario: document.getElementById('usuario'),
        nome: document.getElementById('nome'),
        email: document.getElementById('email'),
        bio: document.getElementById('bio'),
        instagram: document.getElementById('instagram'),
        youtube: document.getElementById('youtube')
    };

    const foto = document.getElementById('foto');
    const form = document.getElementById('profileForm');
    const mensagem = document.getElementById('mensagemPerfil');

    const imagemPadrao = '/uploads/Hitchcock.jpg';

    const perfilPadrao = {
        usuario: 'Buddy12',
        nome: 'João Silva',
        email: 'joao@email.com',
        bio: 'Diretor em formação. Aqui compartilho meus roteiros e ideias sobre cinema.',
        instagram: '',
        youtube: '',
        avatar: imagemPadrao
    };

    let perfilSalvo = { ...perfilPadrao };
    let avatarAtual = imagemPadrao;

    function lerPerfil() {
        try {
            const salvo = localStorage.getItem(STORAGE_KEY);

            if (!salvo) return { ...perfilPadrao };

            return {
                ...perfilPadrao,
                ...JSON.parse(salvo)
            };
        } catch (erro) {
            console.error('Erro ao carregar perfil:', erro);
            return { ...perfilPadrao };
        }
    }

    function preencherFormulario(perfil) {
        Object.keys(campos).forEach(chave => {
            campos[chave].value = perfil[chave] || '';
        });

        avatarAtual = perfil.avatar || imagemPadrao;
        foto.value = '';

        atualizarPreview();
    }

    function atualizarImagem() {
        ['avatarPreview', 'previewAvatar', 'miniAvatar']
            .forEach(id => {
                const imagem = document.getElementById(id);
                if (imagem) imagem.src = avatarAtual;
            });
    }

    function urlSegura(valor) {
        if (!valor.trim()) return '';

        try {
            const url = new URL(valor.trim());

            if (
                url.protocol !== 'https:' &&
                url.protocol !== 'http:'
            ) {
                return '';
            }

            return url.href;
        } catch {
            return '';
        }
    }

    function atualizarLink(id, valor) {
        const link = document.getElementById(id);
        const url = urlSegura(valor);

        link.hidden = !url;

        if (url) {
            link.href = url;
        } else {
            link.removeAttribute('href');
        }
    }

    function atualizarPreview() {
        const usuario = campos.usuario.value.trim();
        const bio = campos.bio.value;

        document.getElementById('previewUser')
            .textContent = usuario || 'Usuário';

        document.getElementById('previewHandle')
            .textContent = '@' + (
                usuario || 'usuario'
            ).toLowerCase().replace(/\s+/g, '');

        document.getElementById('miniUsername')
            .textContent = usuario || 'Usuário';

        document.getElementById('previewBio')
            .textContent = bio.trim() || 'Sem biografia.';

        document.getElementById('bioCount')
            .textContent = bio.length;

        atualizarLink(
            'previewInstagram',
            campos.instagram.value
        );

        atualizarLink(
            'previewYoutube',
            campos.youtube.value
        );

        atualizarImagem();
    }

    Object.values(campos).forEach(campo => {
        campo.addEventListener('input', () => {
            mensagem.textContent = '';
            atualizarPreview();
        });
    });

    // ALTERAR FOTO
    foto.addEventListener('change', () => {
        const arquivo = foto.files[0];
        if (!arquivo) return;

        const tiposPermitidos = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!tiposPermitidos.includes(arquivo.type)) {
            mensagem.textContent =
                'Escolha uma imagem JPG, PNG ou WEBP.';
            foto.value = '';
            return;
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            mensagem.textContent =
                'A imagem deve ter no máximo 5 MB.';
            foto.value = '';
            return;
        }

        // Reduz a foto para caber no armazenamento local
        const leitor = new FileReader();

        leitor.onload = () => {
            const imagem = new Image();

            imagem.onload = () => {
                const canvas = document.createElement('canvas');
                const tamanho = 400;

                canvas.width = tamanho;
                canvas.height = tamanho;

                const contexto = canvas.getContext('2d');

                const lado = Math.min(
                    imagem.width,
                    imagem.height
                );

                const x = (imagem.width - lado) / 2;
                const y = (imagem.height - lado) / 2;

                contexto.drawImage(
                    imagem,
                    x, y, lado, lado,
                    0, 0, tamanho, tamanho
                );

                avatarAtual = canvas.toDataURL(
                    'image/jpeg',
                    0.8
                );

                atualizarPreview();
                mensagem.textContent = '';
            };

            imagem.onerror = () => {
                mensagem.textContent =
                    'Não foi possível abrir essa imagem.';
            };

            imagem.src = leitor.result;
        };

        leitor.readAsDataURL(arquivo);
    });

    // SALVAR PERFIL
    form.addEventListener('submit', event => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const instagram = campos.instagram.value.trim();
        const youtube = campos.youtube.value.trim();

        if (
            (instagram && !urlSegura(instagram)) ||
            (youtube && !urlSegura(youtube))
        ) {
            mensagem.textContent =
                'Confira os links informados.';
            return;
        }

        const novoPerfil = {
            usuario: campos.usuario.value.trim(),
            nome: campos.nome.value.trim(),
            email: campos.email.value.trim(),
            bio: campos.bio.value.trim(),
            instagram,
            youtube,
            avatar: avatarAtual
        };

        if (!novoPerfil.usuario || !novoPerfil.nome) {
            mensagem.textContent =
                'Preencha os campos obrigatórios.';
            return;
        }

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(novoPerfil)
            );

            perfilSalvo = { ...novoPerfil };

            mensagem.style.color = '#80d49b';
            mensagem.textContent =
                'Alterações salvas neste navegador!';

            atualizarPreview();
        } catch (erro) {
            mensagem.style.color = '#ff9999';
            mensagem.textContent =
                'Não foi possível salvar. Verifique o armazenamento do navegador.';
        }
    });

    // CANCELAR EDIÇÃO
    document.getElementById('cancelar')
        .addEventListener('click', () => {
            preencherFormulario(perfilSalvo);

            mensagem.style.color = '#aaa';
            mensagem.textContent =
                'Alterações não salvas descartadas.';
        });

    // CONFIGURAÇÕES AINDA NÃO INTEGRADAS AO SERVIDOR
    document.querySelectorAll('[data-setting]')
        .forEach(botao => {
            botao.addEventListener('click', () => {
                const texto = botao.textContent.trim();

                document.getElementById(
                    'mensagemConfiguracao'
                ).textContent =
                    texto + ': disponível após integrar as contas ao servidor.';
            });
        });

    document.getElementById('notificacoes')
        .addEventListener('click', () => {
            document.getElementById(
                'mensagemConfiguracao'
            ).textContent =
                'As notificações ainda não estão configuradas.';
        });

    // CARREGAMENTO INICIAL
    perfilSalvo = lerPerfil();
    preencherFormulario(perfilSalvo);
});
