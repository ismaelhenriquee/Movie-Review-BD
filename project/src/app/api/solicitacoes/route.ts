import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const query = `
            SELECT sf.*, s.USERNAME
            FROM Solicitacao_Filme sf
            JOIN Solicita s ON sf.ID_SOLICITACAO = s.ID_SOLICITACAO
            WHERE NOT EXISTS (
                SELECT 1 FROM Aprova a WHERE a.ID_SOLICITACAO = sf.ID_SOLICITACAO
            )
            ORDER BY sf.ID_SOLICITACAO DESC
        `;

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM Solicitacao_Filme sf
            WHERE NOT EXISTS (
                SELECT 1 FROM Aprova a WHERE a.ID_SOLICITACAO = sf.ID_SOLICITACAO
            )
        `;

        const solicitacoes = await pool.query(query);
        const countResult = await pool.query(countQuery);

        return NextResponse.json({
            solicitacoes: solicitacoes.rows,
            total: countResult.rows[0].total
        });
    } catch (error) {
        console.error('Error fetching recent requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recent requests' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    if (req.method !== 'POST') {
        return NextResponse.json(
            { message: 'Método não permitido' },
            { status: 405 }
        );
    }

    const { NOME, ANO, DURACAO, GENERO, SINOPSE, DIRETOR, IDIOMA } =
        await req.json();

    if (
        !NOME ||
        !ANO ||
        !DURACAO ||
        !GENERO ||
        !SINOPSE ||
        !DIRETOR ||
        !IDIOMA
    ) {
        return NextResponse.json(
            { message: 'Dados faltando na solicitação de filme' },
            { status: 400 }
        );
    }

    try {
        const result = await pool.query(
            `INSERT INTO Solicitacao_Filme (NOME, ANO, DURACAO, GENERO, SINOPSE, DIRETOR, IDIOMA)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ID_SOLICITACAO`,
            [NOME, ANO, DURACAO, GENERO, SINOPSE, DIRETOR, IDIOMA]
        );

        const idSolicitacao = result.rows[0].ID_SOLICITACAO;

        return NextResponse.json(
            {
                message: 'Solicitação de filme criada com sucesso',
                idSolicitacao
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Erro ao criar solicitação de filme:', error);
        return NextResponse.json(
            {
                message: 'Erro ao criar solicitação de filme',
                error: String(error)
            },
            { status: 500 }
        );
    }
}
