     CREATE TABLE Pessoa(
    USERNAME varchar(255) PRIMARY KEY,
    EMAIL varchar(255) NOT NULL UNIQUE,
    SENHA varchar(255) NOT NULL
);

CREATE TABLE U_Publico(
    USERNAME varchar(255) primary key references Pessoa(USERNAME)
);

CREATE TABLE U_Admin( 
    USERNAME varchar(255) primary key references Pessoa(USERNAME),
    NOME varchar(255) NOT NULL,
    CODIGO integer NOT NULL
);

CREATE TABLE Filme(
    NOME varchar(255) NOT NULL,
    ANO integer NOT NULL,
    ID_FILME integer PRIMARY KEY,
    DURACAO integer NOT NULL,
    GENERO varchar(255) NOT NULL,
    SINOPSE varchar(255) NOT NULL,
    IMAGEM varchar(255) NOT NULL,
    DIRETOR varchar(255) NOT NULL,
    IDIOMA varchar(255) NOT NULL,
    NOTA_AGREGADA numeric(3,1) DEFAULT 0.0 CHECK (NOTA_AGREGADA>=0 AND NOTA_AGREGADA <=10) 
);

CREATE TABLE Tags(
    ID_FILME integer REFERENCES Filme(ID_FILME),
    TAG varchar(255) NOT NULL,
    PRIMARY KEY(ID_FILME, TAG)
);

CREATE TABLE Avaliacao(
    ID_FILME integer REFERENCES Filme(ID_FILME),
    USERNAME varchar(255) REFERENCES U_Publico(USERNAME),
    NOTA numeric(3,1) NOT NULL CHECK (NOTA>=0 AND NOTA<=10),
    DESCRICAO varchar(4096) DEFAULT '',
    DATA_REVIEW date DEFAULT CURRENT_DATE,
    PRIMARY KEY(ID_FILME, USERNAME)
);

-- Função para atualizar a média da nota agregada
CREATE OR REPLACE FUNCTION update_nota_agregada_function()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,1);
BEGIN
    -- Calcular a média das notas para o filme
    SELECT AVG(NOTA) INTO avg_rating
    FROM Avaliacao
    WHERE ID_FILME = COALESCE(NEW.ID_FILME, OLD.ID_FILME);
    
    -- Atualizar a coluna nota_agregada na tabela Filme
    UPDATE Filme
    SET NOTA_AGREGADA = COALESCE(avg_rating, 0)
    WHERE ID_FILME = COALESCE(NEW.ID_FILME, OLD.ID_FILME);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nota_agregada_after_insert
AFTER INSERT ON Avaliacao
FOR EACH ROW
EXECUTE FUNCTION update_nota_agregada_function();

CREATE TRIGGER update_nota_agregada_after_update
AFTER UPDATE ON Avaliacao
FOR EACH ROW
EXECUTE FUNCTION update_nota_agregada_function();

CREATE TRIGGER update_nota_agregada_after_delete
AFTER DELETE ON Avaliacao
FOR EACH ROW
EXECUTE FUNCTION update_nota_agregada_function();

CREATE TABLE Membro( 
    NOME varchar(255) PRIMARY KEY,
    PAIS varchar(255) NOT NULL,
    DATA_NASCIMENTO date NOT NULL,
    DATA_FALECIMENTO date
);

CREATE TABLE Solicitacao_Filme(
    NOME varchar(255) NOT NULL,
    ANO integer NOT NULL,
    ID_SOLICITACAO integer PRIMARY KEY,
    DURACAO integer NOT NULL,
    GENERO varchar(255) NOT NULL,
    SINOPSE varchar(255) NOT NULL,
    IMAGEM varchar(255) NOT NULL,
    DIRETOR varchar(255) NOT NULL,
    IDIOMA varchar(255) NOT NULL
);

CREATE TABLE Tags_Solicitacao(
    ID_SOLICITACAO integer REFERENCES Solicitacao_Filme(ID_SOLICITACAO),
    TAG varchar(255) NOT NULL,
    PRIMARY KEY(ID_SOLICITACAO, TAG)
);

CREATE TABLE Escreve(
    ID_FILME integer REFERENCES Filme(ID_FILME),
    USERNAME varchar(255) REFERENCES U_Publico(USERNAME),
    PRIMARY KEY(ID_FILME, USERNAME)
);

CREATE TABLE Classificado(
    ID_FILME integer REFERENCES Filme(ID_FILME),
    USERNAME varchar(255) REFERENCES U_Publico(USERNAME),
    PRIMARY KEY(ID_FILME, USERNAME)
);

CREATE TABLE Solicita(
    ID_SOLICITACAO integer REFERENCES Solicitacao_Filme(ID_SOLICITACAO),
    USERNAME varchar(255) REFERENCES U_Publico(USERNAME),
    PRIMARY KEY(ID_SOLICITACAO, USERNAME)
);

CREATE TABLE Aprova(
    ID_SOLICITACAO integer REFERENCES Solicitacao_Filme(ID_SOLICITACAO),
    USERNAME varchar(255) REFERENCES U_Admin(USERNAME),
    PRIMARY KEY(ID_SOLICITACAO, USERNAME)
);

CREATE TABLE Assistira(
    ID_FILME integer REFERENCES Filme(ID_FILME),
    USERNAME varchar(255) REFERENCES U_Publico(USERNAME),
    PRIMARY KEY(ID_FILME, USERNAME)
);

CREATE TABLE Participou(
    ID_FILME integer REFERENCES Filme(ID_FILME),
    NOME varchar(255) REFERENCES Membro(NOME),
    CARGO varchar(255) NOT NULL,
    PRIMARY KEY(ID_FILME, NOME)
);

CREATE TABLE Assistiu(
    ID_FILME integer REFERENCES Filme(ID_FILME),
    USERNAME varchar(255) REFERENCES U_Publico(USERNAME),
    PRIMARY KEY(ID_FILME, USERNAME)
);

CREATE TABLE Favoritou(
    ID_FILME integer REFERENCES Filme(ID_FILME),
    USERNAME varchar(255) REFERENCES U_Publico(USERNAME),
    PRIMARY KEY(ID_FILME, USERNAME)
);
