import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    const userToken = req.headers.get('authorization')?.split(' ')[1];
    const isAdmin = userToken ? getUserFromToken(userToken)?.isAdmin : null;

    if (req.method === 'GET') {
        try {
            const usersQuery = `
        SELECT 
          p.USERNAME, 
          p.EMAIL, 
          CASE 
            WHEN up.USERNAME IS NOT NULL THEN 'Público'
            WHEN ua.USERNAME IS NOT NULL THEN 'Admin'
            ELSE 'Sem Papel'
          END AS ROLE
        FROM Pessoa p
        LEFT JOIN U_Publico up ON p.USERNAME = up.USERNAME
        LEFT JOIN U_Admin ua ON p.USERNAME = ua.USERNAME
      `;

            const users = await pool.query(usersQuery);

            return NextResponse.json(
                {
                    data: users.rows,
                    message: 'Usuários listados com sucesso'
                },
                {
                    status: 200
                }
            );
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return NextResponse.json(
                { message: 'Erro interno do servidor' },
                {
                    status: 500
                }
            );
        }
    }
    return NextResponse.json(
        { message: 'Método não permitido' },
        { status: 405 }
    );

}
export async function DELETE(req: NextRequest) {
    const userToken = req.headers.get('authorization')?.split(' ')[1];
    const isAdmin = userToken ? getUserFromToken(userToken)?.isAdmin : null;
    if (!isAdmin) {
        return NextResponse.json(
            {
                message:
                    'Acesso negado. Apenas administradores podem listar usuários.'
            },
            { status: 403 }
        );
    }

    if (req.method === 'DELETE') {
        const url = new URL(req.url);
        const username = url.searchParams.get('username');

        if (!username) {
            return NextResponse.json(
                { message: 'Username não fornecido' },
                { status: 400 }
            );
        }

        try {
            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                await client.query(
                    'DELETE FROM U_Publico WHERE USERNAME = $1',
                    [username]
                );
                await client.query('DELETE FROM U_Admin WHERE USERNAME = $1', [
                    username
                ]);
                await client.query('DELETE FROM Pessoa WHERE USERNAME = $1', [
                    username
                ]);

                await client.query('COMMIT');

                return NextResponse.json(
                    { message: 'Usuário excluído com sucesso' },
                    { status: 200 }
                );
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            return NextResponse.json(
                { message: 'Erro ao excluir usuário' },
                { status: 500 }
            );
        }
    }

    return NextResponse.json(
        { message: 'Método não permitido' },
        { status: 405 }
    );
}
