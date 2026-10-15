<?php
require_once __DIR__ . '/../conexao.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $pdo->query(
        'SELECT m.*, u.numero AS numero_unidade, u.bloco AS bloco_unidade,
                c.nome AS nome_condominio
         FROM moradores m
         LEFT JOIN unidades u ON u.id = m.unidade_id
         LEFT JOIN condominios c ON c.id = u.condominio_id
         ORDER BY m.id DESC'
    );
    responder($stmt->fetchAll());
}

if ($metodo === 'POST') {
    $d = receberJson();
    $nome = trim((string)($d['nome'] ?? ''));
    $unidadeId = filter_var($d['unidade_id'] ?? null, FILTER_VALIDATE_INT);
    if (!$unidadeId) $unidadeId = null;

    if ($nome === '') {
        responder(['erro' => 'Informe o nome completo do morador.'], 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO moradores (unidade_id, nome, cpf, telefone, perfil)
         VALUES (:unidade_id, :nome, :cpf, :telefone, :perfil)'
    );
    $stmt->execute([
        ':unidade_id' => $unidadeId,
        ':nome' => $nome,
        ':cpf' => trim((string)($d['cpf'] ?? '')) ?: null,
        ':telefone' => trim((string)($d['telefone'] ?? '')) ?: null,
        ':perfil' => trim((string)($d['perfil'] ?? 'Morador')) ?: 'Morador'
    ]);

    responder(['mensagem' => 'Morador cadastrado com sucesso.', 'id' => (int)$pdo->lastInsertId()], 201);
}

if ($metodo === 'DELETE') {
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) responder(['erro' => 'ID inválido.'], 422);
    $stmt = $pdo->prepare('DELETE FROM moradores WHERE id = ?');
    $stmt->execute([$id]);
    responder(['mensagem' => 'Morador excluído.']);
}

header('Allow: GET, POST, DELETE');
responder(['erro' => 'Método não permitido.'], 405);
