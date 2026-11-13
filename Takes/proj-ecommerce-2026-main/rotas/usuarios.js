
const express = require('express');
const crypto = require('crypto');
const { promisify } = require('util');
const db = require('../banco/database');

const router = express.Router();
const scrypt = promisify(crypto.scrypt);

// CRIAR TABELA DE USUÁRIOS

const tabelaPronta = new Promise((resolve, reject) => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios_takes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL COLLATE NOCASE UNIQUE,
            usuario TEXT NOT NULL COLLATE NOCASE UNIQUE,
            tipo TEXT NOT NULL CHECK (
                tipo IN ('roteirista', 'empresa')
            ),
            senha_hash TEXT NOT NULL,
            criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `, (erro) => erro ? reject(erro) : resolve());
});

// EXIBIR FORMULÁRIO COM MENSAGEM DE ERRO

function mostrarFormulario(res, erro = '', dados = {}, status = 200) {
    return res.status(status).render('cadastro', {
        erro,
        sucesso: false,
        dados
    });
}

// ABRIR PÁGINA DE CADASTRO

router.get('/cadastro', (req, res) => {
    res.render('cadastro', {
        erro: '',
        sucesso: req.query.sucesso === '1',
        dados: {}
    });
});

// CADASTRAR USUÁRIO

router.post('/cadastro', async (req, res) => {

    const dados = {
        nome: String(req.body.nome || '').trim(),
        email: String(req.body.email || '').trim().toLowerCase(),
        usuario: String(req.body.usuario || '').trim(),
        tipo: String(req.body.tipo || '').trim()
    };

    const senha = String(req.body.senha || '');
    const confirmar = String(req.body.confirmar || '');

    // VALIDAÇÕES

    if (dados.nome.length < 3 || dados.nome.length > 100) {
        return mostrarFormulario(
            res,
            'Informe um nome entre 3 e 100 caracteres.',
            dados,
            400
        );
    }

    if (
        dados.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)
    ) {
        return mostrarFormulario(
            res,
            'Informe um e-mail válido.',
            dados,
            400
        );
    }

    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(dados.usuario)) {
        return mostrarFormulario(
            res,
            'Nome de usuário inválido. Use de 3 a 30 caracteres.',
            dados,
            400
        );
    }

    if (!['roteirista', 'empresa'].includes(dados.tipo)) {
        return mostrarFormulario(
            res,
            'Selecione Roteirista ou Empresa.',
            dados,
            400
        );
    }

    if (senha.length < 8 || senha.length > 128) {
        return mostrarFormulario(
            res,
            'A senha deve ter entre 8 e 128 caracteres.',
            dados,
            400
        );
    }

    if (senha !== confirmar) {
        return mostrarFormulario(
            res,
            'As senhas não coincidem.',
            dados,
            400
        );
    }

    try {
        await tabelaPronta;

        // PROTEGER A SENHA

        const salt = crypto.randomBytes(16).toString('hex');

        const hash = (
            await scrypt(senha, salt, 64)
        ).toString('hex');

        const senhaHash = `scrypt$${salt}$${hash}`;

        // SALVAR NO SQLITE

        db.run(`
            INSERT INTO usuarios_takes
                (nome, email, usuario, tipo, senha_hash)
            VALUES (?, ?, ?, ?, ?)
        `, [
            dados.nome,
            dados.email,
            dados.usuario,
            dados.tipo,
            senhaHash
        ], (erro) => {

            if (erro) {

                if (erro.code === 'SQLITE_CONSTRAINT') {
                    return mostrarFormulario(
                        res,
                        'Este e-mail ou nome de usuário já está cadastrado.',
                        dados,
                        409
                    );
                }

                console.error(erro);

                return mostrarFormulario(
                    res,
                    'Erro ao salvar o cadastro.',
                    dados,
                    500
                );
            }

            res.redirect('/cadastro?sucesso=1');
        });

    } catch (erro) {
        console.error(erro);

        return mostrarFormulario(
            res,
            'Não foi possível conectar ao banco de dados.',
            dados,
            500
        );
    }

});

module.exports = router;
