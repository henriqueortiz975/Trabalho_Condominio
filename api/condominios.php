<?php
require_once __DIR__ . '/../conexao.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $pdo->query('SELECT * FROM condominios ORDER BY id DESC');
    responder($stmt->fetchAll());
}

if ($metodo === 'POST') {
    $d = receberJson();
    $nome = trim((string)($d['nome'] ?? ''));
    $endereco = trim((string)($d['endereco'] ?? ''));

    if ($nome === '' || $endereco === '') {
        responder(['erro' => 'Preencha o nome e o endereço do condomínio.'], 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO condominios
        (nome, cnpj, telefone, endereco, bairro, cidade, estado, blocos, quantidade_unidades, sindico)
        VALUES (:nome, :cnpj, :telefone, :endereco, :bairro, :cidade, :estado, :blocos, :quantidade_unidades, :sindico)'
    );
    $stmt->execute([
        ':nome' => $nome,
        ':cnpj' => trim((string)($d['cnpj'] ?? '')) ?: null,
        ':telefone' => trim((string)($d['telefone'] ?? '')) ?: null,
        ':endereco' => $endereco,
        ':bairro' => trim((string)($d['bairro'] ?? '')) ?: null,
        ':cidade' => trim((string)($d['cidade'] ?? '')) ?: null,
        ':estado' => strtoupper(trim((string)($d['estado'] ?? ''))) ?: null,
        ':blocos' => max(0, (int)($d['blocos'] ?? 0)),
        ':quantidade_unidades' => max(0, (int)($d['quantidadeUnidades'] ?? 0)),
        ':sindico' => trim((string)($d['sindico'] ?? '')) ?: null
    ]);

    responder(['mensagem' => 'Condomínio cadastrado com sucesso.', 'id' => (int)$pdo->lastInsertId()], 201);
}

if ($metodo === 'DELETE') {
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) responder(['erro' => 'ID inválido.'], 422);
    $stmt = $pdo->prepare('DELETE FROM condominios WHERE id = ?');
    $stmt->execute([$id]);
    responder(['mensagem' => 'Condomínio excluído.']);
}

header('Allow: GET, POST, DELETE');
responder(['erro' => 'Método não permitido.'], 405);
