
const express = require('express');
const appAdmin = express.Router();

const db = require('../banco/database');
const upload = require('../util/imagens');

// ==========================
// PAINEL ADMIN E-COMMERCE
// ==========================

appAdmin.get('/', (req, res) => {
    res.render('admin/index-admin');
});

appAdmin.get('/index', (req, res) => {
    res.redirect('/admin');
});

// ==========================
// LOGIN HITCHCOCK
// ==========================

appAdmin.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).send(
            'Preencha usuário e senha.'
        );
    }

    // Redirecionamento provisório.
    // Implementar autenticação futuramente.
    return res.redirect('/roteiros');
});

// ==========================
// CATEGORIAS / FORMATOS
// ==========================

appAdmin.get('/categorias', (req, res) => {
    db.all(
        'SELECT * FROM categorias ORDER BY nome',
        [],
        (erro, categorias) => {
            if (erro) {
                console.log(erro.message);
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

appAdmin.get('/categorias/form-cadastrar', (req, res) => {
    res.render('admin/categorias/cadastro');
});

appAdmin.post('/categorias/cadastrar', (req, res) => {
    const nome = req.body.nome;
    const descricao = req.body.descricao;

    if (!nome || !nome.trim()) {
        return res.status(400).send(
            'Informe o nome do formato.'
        );
    }

    db.run(
        `INSERT INTO categorias (nome, descricao)
         VALUES (?, ?)`,
        [nome.trim(), descricao || ''],
        function (erro) {
            if (erro) {
                console.log(erro.message);
                return res.status(500).send(
                    'Erro ao cadastrar formato.'
                );
            }

            return res.redirect('/admin/categorias');
        }
    );
});

// ==========================
// PRODUTOS / ROTEIROS
// ==========================

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
                console.log(erro.message);
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

appAdmin.get('/produtos/form-cadastrar', (req, res) => {
    db.all(
        'SELECT * FROM categorias ORDER BY nome',
        [],
        (erro, categorias) => {
            if (erro) {
                console.log(erro.message);
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

appAdmin.post(
    '/produtos/cadastrar',
    upload.single('imagem'),
    (req, res) => {
        const {
            nome,
            categoria,
            valor,
            estoque,
            descricao,
            genero
        } = req.body;

        const imagem = req.file
            ? req.file.filename
            : null;

        if (!nome || !nome.trim()) {
            return res.status(400).send(
                'Informe o nome do roteiro.'
            );
        }

        db.run(
            `INSERT INTO produtos
             (nome, categoria, valor, estoque,
              descricao, imagem, genero)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nome.trim(),
                categoria || '',
                Number(valor) || 0,
                Number(estoque) || 0,
                descricao || '',
                imagem,
                genero || ''
            ],
            function (erro) {
                if (erro) {
                    console.log(erro.message);
                    return res.status(500).send(
                        'Erro ao cadastrar roteiro.'
                    );
                }

                return res.redirect('/admin/produtos');
            }
        );
    }
);

/* ==================================
   EDITAR PRODUTOS / ROTEIROS
================================== */

// Abrir formulário de edição
appAdmin.get('/produtos/editar/:id', (req, res) => {
    const id = req.params.id;

    db.get(
        'SELECT * FROM produtos WHERE id = ?',
        [id],
        (erro, produto) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send('Erro ao buscar roteiro.');
            }

            if (!produto) {
                return res.status(404).send('Roteiro não encontrado.');
            }

            db.all(
                'SELECT * FROM categorias ORDER BY nome',
                [],
                (erro, categorias) => {
                    if (erro) {
                        console.error(erro.message);
                        return res.status(500).send('Erro ao buscar categorias.');
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

// Salvar edição
appAdmin.post(
    '/produtos/editar/:id',
    upload.single('imagem'),
    (req, res) => {
        const id = req.params.id;
        const {
            nome,
            categoria,
            valor,
            estoque,
            descricao,
            genero
        } = req.body;

        if (!nome || !nome.trim()) {
            return res.status(400).send('Informe o nome do roteiro.');
        }

        db.get(
            'SELECT * FROM produtos WHERE id = ?',
            [id],
            (erro, produto) => {
                if (erro) {
                    console.error(erro.message);
                    return res.status(500).send('Erro ao consultar roteiro.');
                }

                if (!produto) {
                    return res.status(404).send('Roteiro não encontrado.');
                }

                const imagem = req.file
                    ? req.file.filename
                    : produto.imagem;

                db.run(
                    `UPDATE produtos SET
                        nome = ?,
                        categoria = ?,
                        valor = ?,
                        estoque = ?,
                        descricao = ?,
                        imagem = ?,
                        genero = ?
                     WHERE id = ?`,
                    [
                        nome.trim(),
                        categoria || '',
                        Number(valor) || 0,
                        Number(estoque) || 0,
                        descricao || '',
                        imagem,
                        genero || '',
                        id
                    ],
                    function (erro) {
                        if (erro) {
                            console.error(erro.message);
                            return res.status(500).send('Erro ao editar roteiro.');
                        }

                        res.redirect('/admin/produtos');
                    }
                );
            }
        );
    }
);

/* ==================================
   EXCLUIR PRODUTOS / ROTEIROS
================================== */

appAdmin.post('/produtos/excluir/:id', (req, res) => {
    const id = req.params.id;

    db.run(
        'DELETE FROM produtos WHERE id = ?',
        [id],
        function (erro) {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send('Erro ao excluir roteiro.');
            }

            if (this.changes === 0) {
                return res.status(404).send('Roteiro não encontrado.');
            }

            res.redirect('/admin/produtos');
        }
    );
});

/* ==================================
   EDITAR CATEGORIAS
================================== */

// Abrir formulário
appAdmin.get('/categorias/editar/:id', (req, res) => {
    db.get(
        'SELECT * FROM categorias WHERE id = ?',
        [req.params.id],
        (erro, categoria) => {
            if (erro) {
                console.error(erro.message);
                return res.status(500).send('Erro ao buscar categoria.');
            }

            if (!categoria) {
                return res.status(404).send('Categoria não encontrada.');
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
        return res.status(400).send('Informe o nome da categoria.');
    }

    db.get(
        'SELECT * FROM categorias WHERE id = ?',
        [req.params.id],
        (erro, categoria) => {
            if (erro) {
                return res.status(500).send('Erro ao buscar categoria.');
            }

            if (!categoria) {
                return res.status(404).send('Categoria não encontrada.');
            }

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run(
                    `UPDATE categorias SET nome = ?, descricao = ?
                     WHERE id = ?`,
                    [nome.trim(), descricao || '', req.params.id],
                    function (erro) {
                        if (erro) {
                            db.run('ROLLBACK');
                            return res.status(500).send('Erro ao editar categoria.');
                        }

                        // Atualiza também os roteiros dessa categoria
                        db.run(
                            `UPDATE produtos SET categoria = ?
                             WHERE categoria = ?`,
                            [nome.trim(), categoria.nome],
                            function (erro) {
                                if (erro) {
                                    db.run('ROLLBACK');
                                    return res.status(500).send('Erro ao atualizar roteiros.');
                                }

                                db.run('COMMIT', (erro) => {
                                    if (erro) {
                                        return res.status(500).send('Erro ao salvar alterações.');
                                    }

                                    res.redirect('/admin/categorias');
                                });
                            }
                        );
                    }
                );
            });
        }
    );
});

/* ==================================
   EXCLUIR CATEGORIAS
================================== */

appAdmin.post('/categorias/excluir/:id', (req, res) => {
    const id = req.params.id;

    db.get(
        'SELECT * FROM categorias WHERE id = ?',
        [id],
        (erro, categoria) => {
            if (erro) {
                return res.status(500).send('Erro ao buscar categoria.');
            }

            if (!categoria) {
                return res.status(404).send('Categoria não encontrada.');
            }

            // Impede apagar categorias utilizadas por roteiros
            db.get(
                'SELECT COUNT(*) AS total FROM produtos WHERE categoria = ?',
                [categoria.nome],
                (erro, resultado) => {
                    if (erro) {
                        return res.status(500).send('Erro ao verificar roteiros.');
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
                                return res.status(500).send('Erro ao excluir categoria.');
                            }

                            res.redirect('/admin/categorias');
                        }
                    );
                }
            );
        }
    );
});

module.exports = appAdmin;
