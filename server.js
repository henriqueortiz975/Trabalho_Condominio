
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

app.listen(porta, function() {
    console.log("Aura Residence: http://localhost:" + porta);
});
