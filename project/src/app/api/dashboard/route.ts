import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const filmesResult = await pool.query(
            'SELECT COUNT(*) AS count FROM Filme'
        );
        const totalFilmes = filmesResult.rows[0].count;

        const usuariosResult = await pool.query(
            'SELECT COUNT(*) AS count FROM Pessoa'
        );
        const totalUsuarios = usuariosResult.rows[0].count;

        const avaliacoesResult = await pool.query(
            'SELECT COUNT(*) AS count FROM Avaliacao'
        );
        const totalAvaliacoes = avaliacoesResult.rows[0].count;

        const solicitacoesResult = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM Solicitacao_Filme sf
      WHERE NOT EXISTS (
        SELECT 1 FROM Aprova a WHERE a.ID_SOLICITACAO = sf.ID_SOLICITACAO
      )
    `);
        const totalSolicitacoes = solicitacoesResult.rows[0].count;

        return NextResponse.json({
            totalFilmes,
            totalUsuarios,
            totalAvaliacoes,
            totalSolicitacoes
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}
