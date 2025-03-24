import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function GET() {
    try {
        const result = await initializeDatabase();

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: result.message
            });
        } else {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error initializing database:', error);
        return NextResponse.json(
            { success: false, message: error },
            { status: 500 }
        );
    }
}
