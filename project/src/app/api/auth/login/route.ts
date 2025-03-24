import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { pool } from '@/lib/db';

const loginSchema = z.object({
    username: z.string().min(1),
    senha: z.string().min(1)
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validationResult = loginSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: 'Dados de login inválidos',
                    errors: validationResult.error.format()
                },
                { status: 400 }
            );
        }

        const { username, senha } = validationResult.data;

        const userQuery = 'SELECT * FROM Pessoa WHERE USERNAME = $1';
        const userResult = await pool.query(userQuery, [username]);

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { message: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        const user = userResult.rows[0];

        const passwordMatch = await compare(senha, user.senha);

        if (!passwordMatch) {
            return NextResponse.json(
                { message: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        const adminQuery = 'SELECT * FROM U_Admin WHERE USERNAME = $1';
        const adminResult = await pool.query(adminQuery, [username]);
        const isAdmin = adminResult.rows.length > 0;

        let userInfo = {};

        if (isAdmin) {
            userInfo = {
                nome: adminResult.rows[0].nome,
                codigo: adminResult.rows[0].codigo
            };
        }

        const token = jwt.sign(
            {
                username: user.username,
                email: user.email,
                isAdmin: isAdmin
            },
            process.env.JWT_SECRET || 'default_secret_change_in_production',
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            message: 'Login realizado com sucesso',
            user: {
                username: user.username,
                email: user.email,
                isAdmin: isAdmin,
                ...userInfo
            },
            token
        });
    } catch (error) {
        console.error('Erro ao processar login:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
