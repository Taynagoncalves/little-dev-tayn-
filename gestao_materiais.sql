CREATE DATABASE gestao_materiais CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE gestao_materiais;
CREATE TABLE pessoas (
    id_pessoa INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL
);

CREATE TABLE categorias (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nome_categoria ENUM('Tecnologia','Automotiva','Construção Civil') NOT NULL
);

CREATE TABLE equipamentos (
    id_equipamento INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    valor_agregado ENUM('Alto','Baixo') NOT NULL,
    disponibilidade ENUM('Disponível','Emprestado','Atrasado') DEFAULT 'Disponível',
    id_categoria INT NOT NULL,
    tipo_mine VARCHAR(50) NOT NULL,
    dados LONGBLOB NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE emprestimos (
    id_emprestimo INT PRIMARY KEY AUTO_INCREMENT,
    id_pessoa INT NOT NULL,
    id_equipamento INT NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao DATE,
    status ENUM('Emprestado','Devolvido','Atrasado') DEFAULT 'Emprestado',
    FOREIGN KEY (id_pessoa) REFERENCES pessoas(id_pessoa),
    FOREIGN KEY (id_equipamento) REFERENCES equipamentos(id_equipamento)
);

CREATE TABLE reservas (
    id_reserva INT PRIMARY KEY AUTO_INCREMENT,
    id_pessoa INT NOT NULL,
    id_equipamento INT NOT NULL,
    data_reserva DATE NOT NULL,
    status ENUM('Ativo','Concluído') DEFAULT 'Ativo',
    FOREIGN KEY (id_pessoa) REFERENCES pessoas(id_pessoa),
    FOREIGN KEY (id_equipamento) REFERENCES equipamentos(id_equipamento)
);

CREATE TABLE devolucoes (
    id_devolucao INT AUTO_INCREMENT PRIMARY KEY,
    nome_pessoa VARCHAR(100) NOT NULL,
    item_devolvido VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    data_devolucao DATE NOT NULL,
    estado_fisico ENUM('Bom', 'Danificado') NOT NULL,
    funcionalidade ENUM('Funciona', 'Não Funciona') NOT NULL,
    condicoes ENUM('Intacto', 'Riscado') NOT NULL,
    observacoes TEXT
);


