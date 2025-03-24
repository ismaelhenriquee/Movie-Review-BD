import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

const toggleReaction = async (
    filmeId: number,
    username: string,
    type: string,
    active: boolean
) => {
    let query: string;
    let values: unknown[];

    if (type === 'watched') {
        query = active
            ? 'DELETE FROM Assistiu WHERE ID_FILME = $1 AND USERNAME = $2'
            : 'INSERT INTO Assistiu (ID_FILME, USERNAME) VALUES ($1, $2) ON CONFLICT DO NOTHING';
        values = [filmeId, username];
    } else if (type === 'favorite') {
        query = active
            ? 'DELETE FROM Favoritou WHERE ID_FILME = $1 AND USERNAME = $2'
            : 'INSERT INTO Favoritou (ID_FILME, USERNAME) VALUES ($1, $2) ON CONFLICT DO NOTHING';
        values = [filmeId, username];
    } else if (type === 'watchlist') {
        query = active
            ? 'DELETE FROM Assistira WHERE ID_FILME = $1 AND USERNAME = $2'
            : 'INSERT INTO Assistira (ID_FILME, USERNAME) VALUES ($1, $2) ON CONFLICT DO NOTHING';
        values = [filmeId, username];
    } else {
        return { status: 400, message: 'Invalid reaction type' };
    }

    try {
        await pool.query(query, values);
        return { status: 200, message: 'Reaction updated successfully' };
    } catch (error) {
        console.error('Error toggling reaction:', error);
        return { status: 500, message: 'Internal server error' };
    }
};

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { filmeId, username, type, active } = req.body;

        if (!filmeId || !username || !type || active === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const result = await toggleReaction(filmeId, username, type, active);

        return res.status(result.status).json({ message: result.message });
    } catch (error) {
        console.error('Error processing the request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
