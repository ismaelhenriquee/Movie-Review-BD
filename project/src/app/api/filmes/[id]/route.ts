import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyJwtToken } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        const userAuth = token ? await verifyJwtToken(token) : null;
        const username = userAuth?.username;

        const filmeId = parseInt(params.id);

        const filme = await pool.query(
            `
      SELECT f.*, 
        CASE WHEN aw.USERNAME IS NOT NULL THEN true ELSE false END AS "IsWatchlist",
        CASE WHEN f2.USERNAME IS NOT NULL THEN true ELSE false END AS "IsFavorite",
        CASE WHEN a.USERNAME IS NOT NULL THEN true ELSE false END AS "IsWatched"
      FROM Filme f
      LEFT JOIN Assistira aw ON f.ID_FILME = aw.ID_FILME AND aw.USERNAME = $1
      LEFT JOIN Favoritou f2 ON f.ID_FILME = f2.ID_FILME AND f2.USERNAME = $1
      LEFT JOIN Assistiu a ON f.ID_FILME = a.ID_FILME AND a.USERNAME = $1
      WHERE f.ID_FILME = $2
    `,
            [username, filmeId]
        );

        if (!filme.rows.length) {
            return NextResponse.json(
                { error: 'Filme não encontrado' },
                { status: 404 }
            );
        }

        const tags = await pool.query(
            `
      SELECT TAG FROM Tags WHERE ID_FILME = $1
    `,
            [filmeId]
        );

        filme.rows[0].Tags = tags.rows;

        const avaliacoes = await pool.query(
            `
      SELECT a.USERNAME, a.NOTA, a.DESCRICAO, a.DATA_REVIEW
      FROM Avaliacao a
      WHERE a.ID_FILME = $1
      ORDER BY a.DATA_REVIEW DESC
    `,
            [filmeId]
        );

        const userAvaliacao = username
            ? await pool.query(
                  `
      SELECT USERNAME, NOTA, DESCRICAO, DATA_REVIEW
      FROM Avaliacao
      WHERE ID_FILME = $1 AND USERNAME = $2
    `,
                  [filmeId, username]
              )
            : { rows: [] };

        const membros = await pool.query(
            `
      SELECT m.NOME, p.CARGO
      FROM Participou p
      JOIN Membro m ON p.NOME = m.NOME
      WHERE p.ID_FILME = $1
    `,
            [filmeId]
        );

        return NextResponse.json({
            filme: {
                ...filme.rows[0],
                Tags: tags.rows
            },
            avaliacoes: avaliacoes.rows,
            membros: membros.rows,
            userAvaliacion: userAvaliacao.rows[0] || null
        });
    } catch (error) {
        console.error('Error fetching filme details:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
