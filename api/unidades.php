<?php
require_once __DIR__ . '/../conexao.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $pdo->query(
        'SELECT u.*, c.nome AS nome_condominio
         FROM unidades u
         INNER JOIN condominios c ON c.id = u.condominio_id
         ORDER BY u.id DESC'
    );
    responder($stmt->fetchAll());
}

if ($metodo === 'POST') {
    $d = receberJson();
    $condominioId = filter_var($d['condominio_id'] ?? null, FILTER_VALIDATE_INT);
    $numero = trim((string)($d['numero'] ?? ''));

    if (!$condominioId || $numero === '') {
        responder(['erro' => 'Selecione o condomínio e informe o número da unidade.'], 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO unidades (condominio_id, bloco, numero, tipo, proprietario)
         VALUES (:condominio_id, :bloco, :numero, :tipo, :proprietario)'
    );
    $stmt->execute([
        ':condominio_id' => $condominioId,
        ':bloco' => trim((string)($d['bloco'] ?? '')) ?: null,
        ':numero' => $numero,
        ':tipo' => trim((string)($d['tipo'] ?? 'Apartamento')) ?: 'Apartamento',
        ':proprietario' => trim((string)($d['proprietario'] ?? '')) ?: null
    ]);

    responder(['mensagem' => 'Unidade cadastrada com sucesso.', 'id' => (int)$pdo->lastInsertId()], 201);
}

if ($metodo === 'DELETE') {
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) responder(['erro' => 'ID inválido.'], 422);
    $stmt = $pdo->prepare('DELETE FROM unidades WHERE id = ?');
    $stmt->execute([$id]);
    responder(['mensagem' => 'Unidade excluída.']);
}

header('Allow: GET, POST, DELETE');
responder(['erro' => 'Método não permitido.'], 405);
