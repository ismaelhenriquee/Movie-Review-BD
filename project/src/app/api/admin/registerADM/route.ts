import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export  async function GET(req: NextRequest) {
    if (req.method === 'GET') {
        const { username, email, senha, nome, codigo } = {
            username: 'lucas',
            email: 'lucas@gmail.com',
            senha: '123456789',
            nome: 'Lucas',
            codigo: '123456'
        };

        try {
            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                const hashedSenha = await bcrypt.hash(senha, 10);

                await client.query(
                    'INSERT INTO Pessoa (USERNAME, EMAIL, SENHA) VALUES ($1, $2, $3)',
                    [username, email, hashedSenha]
                );

                await client.query(
                    'INSERT INTO U_Admin (USERNAME, NOME, CODIGO) VALUES ($1, $2, $3)',
                    [username, nome, codigo]
                );

                await client.query('COMMIT');

                return NextResponse.json(
                    { message: 'Administrador criado com sucesso' },
                    { status: 201 }
                );
            } catch (error) {
                await client.query('ROLLBACK');

                if (
                    error instanceof Error &&
                    'code' in error &&
                    error.code === '23505'
                ) {
                    return NextResponse.json(
                        { message: 'Usuário já existe' },
                        { status: 409 }
                    );
                }

                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Erro ao criar administrador:', error);
            return NextResponse.json(
                { message: 'Erro ao criar administrador' },
                { status: 500 }
            );
        }
    }

    return NextResponse.json(
        { message: 'Método não permitido' },
        { status: 405 }
    );
}
