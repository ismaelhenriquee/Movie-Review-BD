import { NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { pool, query } from '@/lib/db';
import { hash } from 'bcryptjs';

const registerSchema = z.object({
    username: z.string().min(3).max(255),
    email: z.string().email().max(255),
    senha: z.string().min(6).max(255),
    isAdmin: z.boolean().default(false),
    nome: z.string().max(255).optional(),
    codigo: z.number().optional()
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validationResult = registerSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: 'Dados de registro inválidos',
                    errors: validationResult.error.format()
                },
                { status: 400 }
            );
        }

        const { username, email, senha, isAdmin, nome, codigo } =
            validationResult.data;

        const userExistsQuery =
            'SELECT * FROM Pessoa WHERE USERNAME = $1 OR EMAIL = $2';
        const userExistsResult = await query(userExistsQuery, [
            username,
            email
        ]);

        if (userExistsResult.rows.length > 0) {
            return NextResponse.json(
                { message: 'Nome de usuário ou email já está em uso' },
                { status: 409 }
            );
        }

        if (isAdmin) {
            if (!nome || !codigo) {
                return NextResponse.json(
                    {
                        message:
                            'Nome e código são obrigatórios para contas de administrador'
                    },
                    { status: 400 }
                );
            }
        }

        const hashedPassword = await hash(senha, 12);

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const insertPersonQuery =
                'INSERT INTO Pessoa(USERNAME, EMAIL, SENHA) VALUES($1, $2, $3) RETURNING *';
            await client.query(insertPersonQuery, [
                username,
                email,
                hashedPassword
            ]);

            if (isAdmin) {
                const insertAdminQuery =
                    'INSERT INTO U_Admin(USERNAME, NOME, CODIGO) VALUES($1, $2, $3)';
                await client.query(insertAdminQuery, [username, nome, codigo]);
            } else {
                const insertPublicQuery =
                    'INSERT INTO U_Publico(USERNAME) VALUES($1)';
                await client.query(insertPublicQuery, [username]);
                console.log('Usuário registrado como público com sucesso');
            }

            await client.query('COMMIT');

            const token = jwt.sign(
                {
                    username: username,
                    email: email,
                    isAdmin: isAdmin
                },
                process.env.JWT_SECRET || 'hgkhjgkffg',
                { expiresIn: '7d' }
            );
            return NextResponse.json(
                {
                    message: 'Usuário registrado com sucesso',
                    user: {
                        username,
                        email,
                        isAdmin
                    },
                    token
                },
                { status: 201 }
            );
        } catch (transactionError) {
            await client.query('ROLLBACK');
            console.error('Erro na transação:', transactionError);

            return NextResponse.json(
                { message: 'Erro ao registrar usuário no banco de dados' },
                { status: 500 }
            );
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Erro ao processar registro:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
