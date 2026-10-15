<?php
declare(strict_types=1);

/*
 * Configuração do banco para XAMPP.
 * Padrão local: usuário root e senha vazia.
 */
$host = 'localhost';
$banco = 'condomanager';
$usuario = 'root';
$senha = '';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$banco};charset=utf8mb4",
        $usuario,
        $senha,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $erro) {
    http_response_code(500);
    echo json_encode([
        'erro' => 'Não foi possível conectar ao banco. Confira o XAMPP e os dados em conexao.php.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function responder($dados, int $status = 200): void {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

function receberJson(): array {
    $conteudo = file_get_contents('php://input');
    $dados = json_decode($conteudo ?: '{}', true);
    return is_array($dados) ? $dados : [];
}
