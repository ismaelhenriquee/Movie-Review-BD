import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyJwtToken } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { error: 'Token não fornecido' },
                { status: 401 }
            );
        }
        const userAuth = await verifyJwtToken(token);

        if (!userAuth) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const { USERNAME, NOTA, DESCRICAO, ID_FILME } = await request.json();
        const filmeId = parseInt(params.id);

        if (ID_FILME !== filmeId) {
            return NextResponse.json(
                {
                    error: 'ID do filme na URL não corresponde ao ID no corpo da requisição'
                },
                { status: 400 }
            );
        }

        if (USERNAME !== userAuth.username) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 403 }
            );
        }

        if (NOTA < 0 || NOTA > 10) {
            return NextResponse.json(
                { error: 'A nota deve estar entre 0 e 10' },
                { status: 400 }
            );
        }

        const existingReview = await pool.query(
            `
      SELECT * FROM Avaliacao
      WHERE ID_FILME = $1 AND USERNAME = $2
    `,
            [filmeId, USERNAME]
        );

        if (existingReview.rows.length > 0) {
            await pool.query(
                `
        UPDATE Avaliacao
        SET NOTA = $1, DESCRICAO = $2
        WHERE ID_FILME = $3 AND USERNAME = $4
      `,
                [NOTA, DESCRICAO, filmeId, USERNAME]
            );
        } else {
            await pool.query(
                `
        INSERT INTO Avaliacao (ID_FILME, USERNAME, NOTA, DESCRICAO)
        VALUES ($1, $2, $3, $4)
      `,
                [filmeId, USERNAME, NOTA, DESCRICAO]
            );

            await pool.query(
                `
        INSERT INTO Assistiu (ID_FILME, USERNAME)
        VALUES ($1, $2)
        ON CONFLICT (ID_FILME, USERNAME) DO NOTHING
      `,
                [filmeId, USERNAME]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving review:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
