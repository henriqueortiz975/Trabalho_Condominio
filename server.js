
const express = require("express");
const mysql = require("mysql2");
const caminho = require("path");

const app = express();
const porta = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "condominio"
});

const db = conexao.promise();

conexao.connect(function(erro) {
    if (erro) {
        console.log("Erro ao conectar ao MySQL:", erro.message);
        return;
    }

    console.log("Conectado ao banco condominio!");
});

app.get("/", function(req, res) {
    res.sendFile(caminho.join(__dirname, "index.html"));
});

// LISTAR CONDOMÍNIOS
app.get("/api/condominios", async function(req, res) {
    try {
        const [dados] = await db.query(
            "SELECT * FROM condominios ORDER BY id DESC"
        );

        res.json(dados);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar condomínios." });
    }
});

// CADASTRAR CONDOMÍNIO
app.post("/api/condominios", async function(req, res) {
    try {
        const c = req.body;

        if (!c.nome || !c.endereco) {
            return res.status(400).json({
                erro: "Nome e endereço são obrigatórios."
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO condominios
            (nome, cnpj, telefone, endereco, bairro, cidade, estado,
            blocos, quantidadeUnidades, sindico)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                c.nome, c.cnpj, c.telefone, c.endereco,
                c.bairro, c.cidade, c.estado,
                Number(c.blocos) || 0,
                Number(c.quantidadeUnidades) || 0,
                c.sindico
            ]
        );

        res.status(201).json({
            id: resultado.insertId,
            mensagem: "Condomínio cadastrado!"
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao cadastrar condomínio." });
    }
});

// EXCLUIR CONDOMÍNIO
app.delete("/api/condominios/:id", async function(req, res) {
    try {
        const id = Number(req.params.id);

        const [unidades] = await db.query(
            "SELECT id FROM unidades WHERE condominio_id = ? LIMIT 1",
            [id]
        );

        if (unidades.length > 0) {
            return res.status(409).json({
                erro: "Exclua as unidades desse condomínio primeiro."
            });
        }

        const [resultado] = await db.query(
            "DELETE FROM condominios WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Condomínio não encontrado." });
        }

        res.json({ mensagem: "Condomínio excluído!" });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao excluir condomínio." });
    }
});

// LISTAR UNIDADES
app.get("/api/unidades", async function(req, res) {
    try {
        const [dados] = await db.query(
            "SELECT * FROM unidades ORDER BY id DESC"
        );

        res.json(dados);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar unidades." });
    }
});

// CADASTRAR UNIDADE
app.post("/api/unidades", async function(req, res) {
    try {
        const u = req.body;

        if (!u.condominioId || !u.numero) {
            return res.status(400).json({
                erro: "Selecione um condomínio e informe o número da unidade."
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO unidades
            (condominio_id, bloco, numero, tipo, proprietario)
            VALUES (?, ?, ?, ?, ?)`,
            [
                Number(u.condominioId),
                u.bloco,
                u.numero,
                u.tipo,
                u.proprietario
            ]
        );

        res.status(201).json({
            id: resultado.insertId,
            mensagem: "Unidade cadastrada!"
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao cadastrar unidade." });
    }
});

// EXCLUIR UNIDADE
app.delete("/api/unidades/:id", async function(req, res) {
    try {
        const id = Number(req.params.id);

        const [moradores] = await db.query(
            "SELECT id FROM moradores WHERE unidade_id = ? LIMIT 1",
            [id]
        );

        if (moradores.length > 0) {
            return res.status(409).json({
                erro: "Desvincule os moradores desta unidade primeiro."
            });
        }

        const [resultado] = await db.query(
            "DELETE FROM unidades WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Unidade não encontrada." });
        }

        res.json({ mensagem: "Unidade excluída!" });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao excluir unidade." });
    }
});

// LISTAR MORADORES
app.get("/api/moradores", async function(req, res) {
    try {
        const [dados] = await db.query(
            "SELECT * FROM moradores ORDER BY id DESC"
        );

        res.json(dados);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar moradores." });
    }
});

// CADASTRAR MORADOR
app.post("/api/moradores", async function(req, res) {
    try {
        const m = req.body;
        const unidadeId = m.unidadeId ? Number(m.unidadeId) : null;

        if (!m.nome) {
            return res.status(400).json({ erro: "Informe o nome do morador." });
        }

        const [resultado] = await db.query(
            `INSERT INTO moradores
            (unidade_id, nome, cpf, telefone, perfil)
            VALUES (?, ?, ?, ?, ?)`,
            [unidadeId, m.nome, m.cpf, m.telefone, m.perfil]
        );

        res.status(201).json({
            id: resultado.insertId,
            mensagem: "Morador cadastrado!"
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao cadastrar morador." });
    }
});

// EXCLUIR MORADOR
app.delete("/api/moradores/:id", async function(req, res) {
    try {
        const [resultado] = await db.query(
            "DELETE FROM moradores WHERE id = ?",
            [Number(req.params.id)]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Morador não encontrado." });
        }

        res.json({ mensagem: "Morador excluído!" });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao excluir morador." });
    }
});

app.listen(porta, function() {
    console.log("Aura Residence: http://localhost:" + porta);
});
