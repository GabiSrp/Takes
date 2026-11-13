
const express = require('express');
const path = require('path');

const app = express();
const admin = require('./rotas/admin');
const db = require('./banco/database');

// ==========================================
// CONFIGURAÇÕES DO EJS
// ==========================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Formulários e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./rotas/usuarios'));

// ==========================================
// PÁGINA INICIAL
// ==========================================

app.get('/', (req, res) => {
    res.render('Home');
});

// ==========================================
// LOGIN
// ==========================================

app.get('/login', (req, res) => {
    res.render('admin/login');
});

// ==========================================
// LISTA DE ROTEIROS
// ==========================================

app.get('/roteiros', (req, res) => {

    const sql = `
        SELECT
            produtos.*,
            categorias.nome AS nome_categoria
        FROM produtos
        LEFT JOIN categorias
            ON produtos.categoria = categorias.nome
        ORDER BY produtos.id DESC
    `;

    db.all(sql, [], (erro, produtos) => {

        if (erro) {
            console.error(
                'Erro ao carregar roteiros:',
                erro.message
            );

            return res.status(500).send(
                'Erro ao carregar os roteiros.'
            );
        }

        res.render('roteiros', { produtos });

    });

});

// ==========================================
// FAVORITOS
// ==========================================

app.get('/favoritos', (req, res) => {

    const sql = `
        SELECT
            produtos.*,
            categorias.nome AS nome_categoria
        FROM produtos
        LEFT JOIN categorias
            ON produtos.categoria = categorias.nome
        ORDER BY produtos.id DESC
    `;

    db.all(sql, [], (erro, produtos) => {

        if (erro) {
            console.error(
                'Erro ao buscar favoritos:',
                erro.message
            );

            return res.status(500).send(
                'Erro ao carregar os favoritos.'
            );
        }

        res.render('favoritos', { produtos });

    });

});

// ==========================================
// CARRINHO DE COMPRAS
// ==========================================

app.get('/carrinho', (req, res) => {

    const sql = `
        SELECT
            produtos.*,
            categorias.nome AS nome_categoria
        FROM produtos
        LEFT JOIN categorias
            ON produtos.categoria = categorias.nome
        ORDER BY produtos.id DESC
    `;

    db.all(sql, [], (erro, produtos) => {

        if (erro) {
            console.error(
                'Erro ao carregar carrinho:',
                erro.message
            );

            return res.status(500).send(
                'Erro ao carregar o carrinho.'
            );
        }

        res.render('carrinho', {
            produtos: produtos
        });

    });

});

// ==========================================
// VISUALIZAR UM ROTEIRO
// ==========================================

app.get('/roteiros/:id', (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(404).send(
            'Roteiro não encontrado.'
        );
    }

    const sql = `
        SELECT
            produtos.*,
            categorias.nome AS nome_categoria
        FROM produtos
        LEFT JOIN categorias
            ON produtos.categoria = categorias.nome
        WHERE produtos.id = ?
    `;

    db.get(sql, [id], (erro, produto) => {

        if (erro) {
            console.error(
                'Erro ao buscar roteiro:',
                erro.message
            );

            return res.status(500).send(
                'Erro ao buscar roteiro.'
            );
        }

        if (!produto) {
            return res.status(404).send(
                'Roteiro não encontrado.'
            );
        }

        res.render('ver-roteiro', {
            produto: produto
        });

    });

});

// ==========================================
// PERFIL
// ==========================================

app.get('/perfil', (req, res) => {
    res.render('perfil');
});

// ==========================================
// ADMIN E-COMMERCE
// ==========================================

app.use('/admin', admin);

// ==========================================
// PÁGINA NÃO ENCONTRADA
// ==========================================

app.use((req, res) => {
    res.status(404).send(
        'Página não encontrada.'
    );
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

const PORT = 3000;

app.listen(PORT, () => {
    console.log(
        `TAKES disponível em http://localhost:${PORT}`
    );
});
