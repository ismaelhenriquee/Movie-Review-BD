import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT NOW()');
        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { nome, email } = await request.json();

        if (!nome || !email) {
            return NextResponse.json(
                { success: false, message: 'Nome e email são obrigatórios' },
                { status: 400 }
            );
        }

        const result = await query(
            'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *',
            [nome, email]
        );

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }
}