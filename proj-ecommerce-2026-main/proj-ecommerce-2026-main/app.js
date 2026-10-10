
const express = require('express');
const path = require('path');

const app = express();
const admin = require('./rotas/admin');

// Configurações do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Leitura dos formulários
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Arquivos públicos: CSS, JavaScript e imagens
app.use(express.static(path.join(__dirname, 'public')));

// Redireciona a página inicial para o login
app.get('/', (req, res) => {
    res.redirect('/admin');
});

// Rotas administrativas
app.use('/admin', admin);

// Inicialização do servidor
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Takes disponível em http://localhost:${PORT}`);
});
