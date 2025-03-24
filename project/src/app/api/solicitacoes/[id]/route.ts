import { pool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const solicitacaoResult = await pool.query(
            'SELECT sf.*, s.USERNAME FROM Solicitacao_Filme sf JOIN Solicita s ON sf.ID_SOLICITACAO = s.ID_SOLICITACAO WHERE sf.ID_SOLICITACAO = $1',
            [id]
        );

        if (solicitacaoResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Solicitação não encontrada' },
                { status: 404 }
            );
        }

        const tagsResult = await pool.query(
            'SELECT TAG FROM Tags_Solicitacao WHERE ID_SOLICITACAO = $1',
            [id]
        );

        const aprovacaoResult = await pool.query(
            'SELECT a.USERNAME FROM Aprova a WHERE a.ID_SOLICITACAO = $1',
            [id]
        );

        return NextResponse.json({
            ...solicitacaoResult.rows[0],
            Tags: tagsResult.rows,
            isApproved: aprovacaoResult.rows.length > 0,
            approvedBy:
                aprovacaoResult.rows.length > 0
                    ? aprovacaoResult.rows[0].USERNAME
                    : null
        });
    } catch (error) {
        console.error('Erro ao buscar solicitação:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar solicitação de filme' },
            { status: 500 }
        );
    }
}
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const { adminUsername } = await request.json();

    try {
        const solicitacaoResult = await pool.query(
            'SELECT * FROM Solicitacao_Filme WHERE ID_SOLICITACAO = $1',
            [id]
        );

        if (solicitacaoResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Solicitação não encontrada' },
                { status: 404 }
            );
        }

        const adminResult = await pool.query(
            'SELECT * FROM U_Admin WHERE USERNAME = $1',
            [adminUsername]
        );

        if (adminResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Administrador não encontrado' },
                { status: 404 }
            );
        }

        await pool.query('BEGIN');

        try {
            const filmeResult = await pool.query(
                'INSERT INTO Filme(NOME, ANO, DURACAO, GENERO, SINOPSE, DIRETOR, IDIOMA) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ID_FILME',
                [
                    solicitacaoResult.rows[0].nome,
                    solicitacaoResult.rows[0].ano,
                    solicitacaoResult.rows[0].duracao,
                    solicitacaoResult.rows[0].genero,
                    solicitacaoResult.rows[0].sinopse,
                    solicitacaoResult.rows[0].diretor,
                    solicitacaoResult.rows[0].idioma
                ]
            );
            const filmId = filmeResult.rows[0].id_filme;

            const tagsResult = await pool.query(
                'SELECT TAG FROM Tags_Solicitacao WHERE ID_SOLICITACAO = $1',
                [id]
            );

            for (const tag of tagsResult.rows) {
                await pool.query(
                    'INSERT INTO Tags(ID_FILME, TAG) VALUES ($1, $2)',
                    [filmId, tag.TAG]
                );
            }

            await pool.query(
                'INSERT INTO Aprova(ID_SOLICITACAO, USERNAME) VALUES ($1, $2)',
                [id, adminUsername]
            );

            await pool.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Solicitação aprovada com sucesso',
                filmId
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Erro ao aprovar a solicitação:', error);
        return NextResponse.json(
            { error: 'Erro ao aprovar solicitação de filme' },
            { status: 500 }
        );
    }
}
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const solicitacaoResult = await pool.query(
            'SELECT * FROM Solicitacao_Filme WHERE ID_SOLICITACAO = $1',
            [id]
        );

        if (solicitacaoResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Solicitação não encontrada' },
                { status: 404 }
            );
        }

        await pool.query('BEGIN');

        try {
            await pool.query(
                'DELETE FROM Tags_Solicitacao WHERE ID_SOLICITACAO = $1',
                [id]
            );

            await pool.query('DELETE FROM Solicita WHERE ID_SOLICITACAO = $1', [
                id
            ]);

            await pool.query('DELETE FROM Aprova WHERE ID_SOLICITACAO = $1', [
                id
            ]);

            await pool.query(
                'DELETE FROM Solicitacao_Filme WHERE ID_SOLICITACAO = $1',
                [id]
            );

            await pool.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Solicitação rejeitada e excluída com sucesso'
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Erro ao rejeitar a solicitação:', error);
        return NextResponse.json(
            { error: 'Erro ao rejeitar solicitação de filme' },
            { status: 500 }
        );
    }
}
