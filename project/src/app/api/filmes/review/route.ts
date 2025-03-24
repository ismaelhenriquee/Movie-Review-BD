// pages/api/filmes/review.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const { filmeId } = req.query;

            if (!filmeId) {
                return res.status(400).json({ message: 'Missing film ID' });
            }

            const reviewsResult = await pool.query(
                `SELECT a.USERNAME, a.NOTA, a.DESCRICAO, a.DATA_REVIEW 
         FROM Avaliacao a
         WHERE a.ID_FILME = $1
         ORDER BY a.DATA_REVIEW DESC`,
                [filmeId]
            );

            return res.status(200).json({ data: reviewsResult.rows });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: String(error)
            });
        }
    } else if (req.method === 'POST') {
        try {
            const { filmeId, username, nota, descricao } = req.body;

            if (!filmeId || !username || nota === undefined) {
                return res
                    .status(400)
                    .json({ message: 'Missing required fields' });
            }

            const rating = parseFloat(nota);
            if (isNaN(rating) || rating < 0 || rating > 10) {
                return res
                    .status(400)
                    .json({ message: 'Rating must be between 0 and 10' });
            }

            await pool.query(
                `INSERT INTO Avaliacao (ID_FILME, USERNAME, NOTA, DESCRICAO) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (ID_FILME, USERNAME) 
         DO UPDATE SET NOTA = $3, DESCRICAO = $4, DATA_REVIEW = CURRENT_DATE`,
                [filmeId, username, rating, descricao || '']
            );

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error submitting review:', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: String(error)
            });
        }
    }

    else if (req.method === 'DELETE') {
        try {
            const { filmeId, username } = req.body;

            if (!filmeId || !username) {
                return res
                    .status(400)
                    .json({ message: 'Missing required fields' });
            }

            await pool.query(
                'DELETE FROM Avaliacao WHERE ID_FILME = $1 AND USERNAME = $2',
                [filmeId, username]
            );


            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error deleting review:', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: String(error)
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
