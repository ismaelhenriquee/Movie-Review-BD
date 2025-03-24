import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl:
        process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false
});

async function query(text: string, params?: unknown[]) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('executed query', {
            text,
            duration,
            rows: result.rowCount
        });
        return result;
    } catch (err) {
        const duration = Date.now() - start;
        console.error('error executing query', { text, duration, err });
        throw err;
    }
}
async function initializeDatabase() {
    let client;
    try {
        client = await pool.connect();

        await client.query(`
       CREATE TABLE Pessoa(
    USERNAME varchar(255) PRIMARY KEY,
    EMAIL varchar(255) NOT NULL,
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
    IMAGEM varchar(255)  NOT NULL,
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


CREATE OR REPLACE FUNCTION update_nota_agregada_function()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,1);
BEGIN
    -- Calculate the average rating for the movie
    SELECT AVG(NOTA) INTO avg_rating
    FROM Avaliacao
    WHERE ID_FILME = COALESCE(NEW.ID_FILME, OLD.ID_FILME);
    
    -- Update the nota_agregada column in the Filme table
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
    IMAGEM varchar(255)  NOT NULL,
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
    `);

        console.log('Banco de dados inicializado com sucesso!');
        return { success: true, message: 'Banco de dados inicializado' };
    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        return { success: false, message: error };
    } finally {
        if (client) client.release();
    }
}
async function destroyDatabase() {
    let client;
    try {
        client = await pool.connect();

        await client.query(`
            DROP TABLE IF EXISTS Assistiu, Favoritou, Assistira, Escreve, 
            Solicitacao_Filme, Tags_Solicitacao, Membro, Participou, 
            Aprova, Solicita, Classificado, Filme, Tags, Avaliacao, U_Admin, 
            U_Publico, Pessoa CASCADE;
        `);

        console.log('Banco de dados destruído com sucesso!');
        return { success: true, message: 'Banco de dados destruido' };
    } catch (error) {
        console.error('Erro ao destruir banco de dados:', error);
        return { success: false, message: error };
    } finally {
        if (client) client.release();
    }
}

export { query, pool, initializeDatabase,destroyDatabase };
