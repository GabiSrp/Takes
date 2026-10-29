
const express = require('express');
const path = require('path');

const app = express();
const admin = require('./rotas/admin');
const db = require('./banco/database');

// Configurações do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Formulários e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Página inicial
app.get('/', (req, res) => {
    res.render('Home');
});

// Login Hitchcock
app.get('/login', (req, res) => {
    res.render('admin/login');
});

// Lista de roteiros do banco de dados
app.get('/roteiros', (req, res) => {
    const sql = `
        SELECT produtos.*,
               categorias.nome AS nome_categoria
        FROM produtos
        LEFT JOIN categorias
        ON produtos.categoria = categorias.nome
        ORDER BY produtos.id DESC
    `;

    db.all(sql, [], (erro, produtos) => {
        if (erro) {
            console.error(erro.message);
            return res.status(500).send(
                'Erro ao carregar os roteiros.'
            );
        }

        res.render('roteiros', { produtos });
    });
});


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

// Visualizar um roteiro
app.get('/roteiros/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(404).send(
            'Roteiro não encontrado.'
        );
    }

    db.get(
        `SELECT produtos.*,
                categorias.nome AS nome_categoria
         FROM produtos
         LEFT JOIN categorias
         ON produtos.categoria = categorias.nome
         WHERE produtos.id = ?`,
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

            res.render('ver-roteiro', { produto });
        }
    );
});

// Personalização do perfil
app.get('/perfil', (req, res) => {
    res.render('perfil');
});

// Admin E-commerce
app.use('/admin', admin);

// Página não encontrada
app.use((req, res) => {
    res.status(404).send('Página não encontrada.');
});

// Iniciar servidor
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`TAKES disponível em http://localhost:${PORT}`);
});
