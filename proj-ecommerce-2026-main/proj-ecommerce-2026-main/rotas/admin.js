
const express = require('express');
const appAdmin = express();

const db = require('../banco/database');
const upload = require('../util/imagens');

// ==========================
// INÍCIO E LOGIN
// ==========================

appAdmin.get('/index', (req, res) => {
    res.render('admin/index-admin');
});

appAdmin.get('/', (req, res) => {
    res.render('admin/login');
});

appAdmin.post('/login', (req, res) => {
    // A autenticação ainda não está implementada.
    res.redirect('/admin/index');
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

            res.redirect('/admin/categorias');
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

                res.redirect('/admin/produtos');
            }
        );
    }
);

module.exports = appAdmin;
