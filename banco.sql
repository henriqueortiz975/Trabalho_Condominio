CREATE DATABASE IF NOT EXISTS condomanager
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE condomanager;

CREATE TABLE IF NOT EXISTS condominios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(30) NULL,
    telefone VARCHAR(30) NULL,
    endereco VARCHAR(200) NOT NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NULL,
    estado CHAR(2) NULL,
    blocos INT UNSIGNED NOT NULL DEFAULT 0,
    quantidade_unidades INT UNSIGNED NOT NULL DEFAULT 0,
    sindico VARCHAR(150) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unidades (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    condominio_id INT UNSIGNED NOT NULL,
    bloco VARCHAR(50) NULL,
    numero VARCHAR(50) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'Apartamento',
    proprietario VARCHAR(150) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_unidades_condominio
        FOREIGN KEY (condominio_id) REFERENCES condominios(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS moradores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    unidade_id INT UNSIGNED NULL,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(20) NULL,
    telefone VARCHAR(30) NULL,
    perfil VARCHAR(50) NOT NULL DEFAULT 'Morador',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_moradores_unidade
        FOREIGN KEY (unidade_id) REFERENCES unidades(id)
        ON DELETE SET NULL
);
