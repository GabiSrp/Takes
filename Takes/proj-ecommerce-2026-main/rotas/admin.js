
const express = require('express');
const appAdmin = express.Router();

const db = require('../banco/database');
const upload = require('../util/imagens');

// ==========================================
// TAKES - PAINEL ADMINISTRATIVO
// ==========================================

// Página principal do Admin
appAdmin.get('/', (req, res) => {
    res.render('admin/index-admin');
});

appAdmin.get('/index', (req, res) => {
    res.redirect('/admin');
});

// ==========================================
// LOGIN HITCHCOCK
// ==========================================

appAdmin.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).send(
            'Preencha usuário e senha.'
        );
    }

    // Login provisório, ainda sem autenticação real.
    return res.redirect('/roteiros');
});

// ==========================================
// CATEGORIAS / FORMATOS
// ==========================================

// Listar categorias
appAdmin.get('/categorias', (req, res) => {
    db.all(
        'SELECT * FROM categorias ORDER BY nome',
        [],
        (erro, categorias) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send(
                    'Erro ao consultar formatos.'
                );
            }

            res.render('admin/categorias/lista', {
                categorias
            });
        }
    );
});

// Abrir cadastro de categoria
appAdmin.get('/categorias/form-cadastrar', (req, res) => {
    res.render('admin/categorias/cadastro');
});

// Salvar categoria
appAdmin.post('/categorias/cadastrar', (req, res) => {
    const { nome, descricao } = req.body;

    if (!nome || !nome.trim()) {
        return res.status(400).send(
            'Informe o nome do formato.'
        );
    }

    db.run(
        `INSERT INTO categorias (nome, descricao)
         VALUES (?, ?)`,
        [
            nome.trim(),
            descricao || ''
        ],
        function (erro) {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send(
                    'Erro ao cadastrar formato.'
                );
            }

            res.redirect('/admin/categorias');
        }
    );
});

// ==========================================
// ROTEIROS - LISTAGEM
// ==========================================

appAdmin.get('/produtos', (req, res) => {
    db.all(
        `SELECT produtos.*,
                categorias.nome AS nome_categoria
         FROM produtos
         LEFT JOIN categorias
             ON produtos.categoria = categorias.nome
         ORDER BY produtos.id DESC`,
        [],
        (erro, produtos) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send(
                    'Erro ao consultar roteiros.'
                );
            }

            res.render('admin/produtos/lista', {
                produtos
            });
        }
    );
});

// ==========================================
// ROTEIROS - CADASTRO
// ==========================================

// Abrir formulário
appAdmin.get('/produtos/form-cadastrar', (req, res) => {
    db.all(
        'SELECT * FROM categorias ORDER BY nome',
        [],
        (erro, categorias) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send(
                    'Erro ao consultar formatos.'
                );
            }

            res.render('admin/produtos/cadastro', {
                categorias
            });
        }
    );
});

// Cadastrar roteiro
appAdmin.post(
    '/produtos/cadastrar',
    upload.single('imagem'),
    (req, res) => {
        const {
            nome,
            categoria,
            valor,
            descricao,
            genero
        } = req.body;

        const imagem = req.file
            ? req.file.filename
            : null;

        // Validação do título
        if (!nome || !nome.trim()) {
            return res.status(400).send(
                'Informe o nome do roteiro.'
            );
        }

        // Validação do formato
        if (!categoria || !categoria.trim()) {
            return res.status(400).send(
                'Selecione o formato do roteiro.'
            );
        }

        // Validação do gênero
        if (!genero || !genero.trim()) {
            return res.status(400).send(
                'Selecione o gênero do roteiro.'
            );
        }

        // Validação da descrição
        if (!descricao || !descricao.trim()) {
            return res.status(400).send(
                'Informe a sinopse do roteiro.'
            );
        }

        // Validação do preço
        const preco = Number(valor);

        if (
            valor === undefined ||
            valor === null ||
            String(valor).trim() === '' ||
            !Number.isFinite(preco) ||
            preco < 0
        ) {
            return res.status(400).send(
                'Informe um preço válido.'
            );
        }

        // Não existe mais campo de estoque.
        // O SQLite utiliza o DEFAULT 0 da coluna
        // estoque, caso ela ainda exista no banco.

        db.run(
            `INSERT INTO produtos (
                nome,
                categoria,
                valor,
                descricao,
                imagem,
                genero
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nome.trim(),
                categoria.trim(),
                preco,
                descricao.trim(),
                imagem,
                genero.trim()
            ],
            function (erro) {
                if (erro) {
                    console.error(
                        'Erro ao cadastrar roteiro:',
                        erro.message
                    );

                    return res.status(500).send(
                        'Erro ao cadastrar roteiro.'
                    );
                }

                return res.redirect('/admin/produtos');
            }
        );
    }
);

// ==========================================
// ROTEIROS - EDITAR
// ==========================================

// Abrir formulário de edição
appAdmin.get('/produtos/editar/:id', (req, res) => {
    const id = req.params.id;

    db.get(
        'SELECT * FROM produtos WHERE id = ?',
        [id],
        (erro, produto) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send(
                    'Erro ao buscar roteiro.'
                );
            }

            if (!produto) {
                return res.status(404).send(
                    'Roteiro não encontrado.'
                );
            }

            db.all(
                'SELECT * FROM categorias ORDER BY nome',
                [],
                (erro, categorias) => {
                    if (erro) {
                        console.error(erro.message);
                        return res.status(500).send(
                            'Erro ao buscar categorias.'
                        );
                    }

                    res.render('admin/produtos/editar', {
                        produto,
                        categorias
                    });
                }
            );
        }
    );
});

// Salvar alterações
appAdmin.post(
    '/produtos/editar/:id',
    upload.single('imagem'),
    (req, res) => {
        const id = req.params.id;

        const {
            nome,
            categoria,
            valor,
            descricao,
            genero
        } = req.body;

        if (!nome || !nome.trim()) {
            return res.status(400).send(
                'Informe o nome do roteiro.'
            );
        }

        if (!categoria || !categoria.trim()) {
            return res.status(400).send(
                'Selecione o formato do roteiro.'
            );
        }

        if (!genero || !genero.trim()) {
            return res.status(400).send(
                'Selecione o gênero do roteiro.'
            );
        }

        if (!descricao || !descricao.trim()) {
            return res.status(400).send(
                'Informe a sinopse do roteiro.'
            );
        }

        const preco = Number(valor);

        if (
            valor === undefined ||
            valor === null ||
            String(valor).trim() === '' ||
            !Number.isFinite(preco) ||
            preco < 0
        ) {
            return res.status(400).send(
                'Informe um preço válido.'
            );
        }

        db.get(
            'SELECT * FROM produtos WHERE id = ?',
            [id],
            (erro, produto) => {
                if (erro) {
                    console.error(erro.message);
                    return res.status(500).send(
                        'Erro ao consultar roteiro.'
                    );
                }

                if (!produto) {
                    return res.status(404).send(
                        'Roteiro não encontrado.'
                    );
                }

                // Mantém a capa anterior
                // quando nenhuma nova imagem é enviada.
                const imagem = req.file
                    ? req.file.filename
                    : produto.imagem;

                db.run(
                    `UPDATE produtos SET
                        nome = ?,
                        categoria = ?,
                        valor = ?,
                        descricao = ?,
                        imagem = ?,
                        genero = ?
                    WHERE id = ?`,
                    [
                        nome.trim(),
                        categoria.trim(),
                        preco,
                        descricao.trim(),
                        imagem,
                        genero.trim(),
                        id
                    ],
                    function (erro) {
                        if (erro) {
                            console.error(
                                'Erro ao editar roteiro:',
                                erro.message
                            );

                            return res.status(500).send(
                                'Erro ao editar roteiro.'
                            );
                        }

                        return res.redirect('/admin/produtos');
                    }
                );
            }
        );
    }
);

// ==========================================
// ROTEIROS - EXCLUIR
// ==========================================

appAdmin.post('/produtos/excluir/:id', (req, res) => {
    const id = req.params.id;

    db.run(
        'DELETE FROM produtos WHERE id = ?',
        [id],
        function (erro) {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send(
                    'Erro ao excluir roteiro.'
                );
            }

            if (this.changes === 0) {
                return res.status(404).send(
                    'Roteiro não encontrado.'
                );
            }

            return res.redirect('/admin/produtos');
        }
    );
});

// ==========================================
// CATEGORIAS - EDITAR
// ==========================================

// Abrir formulário de edição
appAdmin.get('/categorias/editar/:id', (req, res) => {
    db.get(
        'SELECT * FROM categorias WHERE id = ?',
        [req.params.id],
        (erro, categoria) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send(
                    'Erro ao buscar categoria.'
                );
            }

            if (!categoria) {
                return res.status(404).send(
                    'Categoria não encontrada.'
                );
            }

            res.render('admin/categorias/editar', {
                categoria
            });
        }
    );
});

// Salvar edição de categoria
appAdmin.post('/categorias/editar/:id', (req, res) => {
    const { nome, descricao } = req.body;

    if (!nome || !nome.trim()) {
        return res.status(400).send(
            'Informe o nome da categoria.'
        );
    }

    db.get(
        'SELECT * FROM categorias WHERE id = ?',
        [req.params.id],
        (erro, categoria) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send(
                    'Erro ao buscar categoria.'
                );
            }

            if (!categoria) {
                return res.status(404).send(
                    'Categoria não encontrada.'
                );
            }

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run(
                    `UPDATE categorias
                     SET nome = ?, descricao = ?
                     WHERE id = ?`,
                    [
                        nome.trim(),
                        descricao || '',
                        req.params.id
                    ],
                    function (erro) {
                        if (erro) {
                            db.run('ROLLBACK');
                            console.error(erro.message);

                            return res.status(500).send(
                                'Erro ao editar categoria.'
                            );
                        }

                        // Atualiza também os roteiros
                        // vinculados ao nome antigo.
                        db.run(
                            `UPDATE produtos
                             SET categoria = ?
                             WHERE categoria = ?`,
                            [
                                nome.trim(),
                                categoria.nome
                            ],
                            function (erro) {
                                if (erro) {
                                    db.run('ROLLBACK');
                                    console.error(erro.message);

                                    return res.status(500).send(
                                        'Erro ao atualizar roteiros.'
                                    );
                                }

                                db.run('COMMIT', erro => {
                                    if (erro) {
                                        console.error(erro.message);

                                        return res.status(500).send(
                                            'Erro ao salvar alterações.'
                                        );
                                    }

                                    return res.redirect(
                                        '/admin/categorias'
                                    );
                                });
                            }
                        );
                    }
                );
            });
        }
    );
});

// ==========================================
// CATEGORIAS - EXCLUIR
// ==========================================

appAdmin.post('/categorias/excluir/:id', (req, res) => {
    const id = req.params.id;

    db.get(
        'SELECT * FROM categorias WHERE id = ?',
        [id],
        (erro, categoria) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send(
                    'Erro ao buscar categoria.'
                );
            }

            if (!categoria) {
                return res.status(404).send(
                    'Categoria não encontrada.'
                );
            }

            // Impede a exclusão de categorias
            // que ainda possuem roteiros vinculados.
            db.get(
                `SELECT COUNT(*) AS total
                 FROM produtos
                 WHERE categoria = ?`,
                [categoria.nome],
                (erro, resultado) => {
                    if (erro) {
                        console.error(erro.message);

                        return res.status(500).send(
                            'Erro ao verificar roteiros.'
                        );
                    }

                    if (resultado.total > 0) {
                        return res.status(409).send(
                            'Esta categoria possui roteiros vinculados. ' +
                            'Altere a categoria dos roteiros antes de excluí-la.'
                        );
                    }

                    db.run(
                        'DELETE FROM categorias WHERE id = ?',
                        [id],
                        function (erro) {
                            if (erro) {
                                console.error(erro.message);

                                return res.status(500).send(
                                    'Erro ao excluir categoria.'
                                );
                            }

                            return res.redirect(
                                '/admin/categorias'
                            );
                        }
                    );
                }
            );
        }
    );
});

// ==========================================
// EXPORTAR ROTAS
// ==========================================

module.exports = appAdmin;
