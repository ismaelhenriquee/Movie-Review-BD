import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const triggerSQL = `
        -- Primeiro remova triggers existentes se houver
        DROP TRIGGER IF EXISTS update_nota_agregada_after_insert ON Avaliacao;
        DROP TRIGGER IF EXISTS update_nota_agregada_after_update ON Avaliacao;
        DROP TRIGGER IF EXISTS update_nota_agregada_after_delete ON Avaliacao;
        DROP FUNCTION IF EXISTS update_nota_agregada_function();
        
        -- Crie a função que será usada pelos triggers
        CREATE OR REPLACE FUNCTION update_nota_agregada_function()
        RETURNS TRIGGER AS $$
        DECLARE
            avg_rating DECIMAL(3,1);
        BEGIN
            -- Calcule a nota média para o filme
            SELECT AVG(NOTA) INTO avg_rating
            FROM Avaliacao
            WHERE ID_FILME = COALESCE(NEW.ID_FILME, OLD.ID_FILME);
            
            -- Atualize a coluna nota_agregada na tabela Filme
            UPDATE Filme
            SET NOTA_AGREGADA = COALESCE(avg_rating, 0)
            WHERE ID_FILME = COALESCE(NEW.ID_FILME, OLD.ID_FILME);
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Crie os triggers
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
      `;

        await pool.query(triggerSQL);

        return res.status(200).json({
            message: 'Configuração do banco de dados concluída com sucesso'
        });
    } catch (error) {
        console.error('Erro na configuração do banco de dados:', error);
        return res.status(500).json({
            message: 'Erro interno do servidor',
            error: String(error)
        });
    }
}
