import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { search, genero, anoMin, anoMax, notaMin, idioma, diretor } =
            req.query;

        let query = `
      SELECT 
        f.ID_FILME, f.NOME, f.ANO, f.DURACAO, f.GENERO, f.SINOPSE, 
        f.DIRETOR, f.IDIOMA, f.NOTA_AGREGADA, 
        COALESCE(f.IMAGEM, 'https://placeholder.com/movie') as IMAGEM
      FROM Filme f
      WHERE 1=1
    `;

        const queryParams: unknown[] = [];
        let paramIndex = 1;

        if (search && typeof search === 'string' && search.trim() !== '') {
            query += ` AND (f.NOME ILIKE $${paramIndex} OR f.DIRETOR ILIKE $${paramIndex} OR f.SINOPSE ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        if (genero && typeof genero === 'string' && genero.trim() !== '') {
            query += ` AND f.GENERO = $${paramIndex}`;
            queryParams.push(genero);
            paramIndex++;
        }

        if (anoMin && !isNaN(Number(anoMin))) {
            query += ` AND f.ANO >= $${paramIndex}`;
            queryParams.push(Number(anoMin));
            paramIndex++;
        }

        if (anoMax && !isNaN(Number(anoMax))) {
            query += ` AND f.ANO <= $${paramIndex}`;
            queryParams.push(Number(anoMax));
            paramIndex++;
        }

        if (notaMin && !isNaN(Number(notaMin))) {
            query += ` AND f.NOTA_AGREGADA >= $${paramIndex}`;
            queryParams.push(Number(notaMin));
            paramIndex++;
        }

        if (idioma && typeof idioma === 'string' && idioma.trim() !== '') {
            query += ` AND f.IDIOMA = $${paramIndex}`;
            queryParams.push(idioma);
            paramIndex++;
        }

        if (diretor && typeof diretor === 'string' && diretor.trim() !== '') {
            query += ` AND f.DIRETOR ILIKE $${paramIndex}`;
            queryParams.push(`%${diretor}%`);
            paramIndex++;
        }

        query += ` ORDER BY f.NOME ASC`;

        const filmsResult = await pool.query(query, queryParams);
        const films = filmsResult.rows;

        const filmsWithTags = await Promise.all(
            films.map(async (film) => {
                const tagsResult = await pool.query(
                    'SELECT TAG FROM Tags WHERE ID_FILME = $1',
                    [film.ID_FILME]
                );

                 const userName =
                     req.query.userName ||
                     (req.headers.authorization
                         ? getUserFromToken(
                               req.headers.authorization.split(' ')[1]
                           )?.username
                         : null);

                let isWatched = false;
                let isFavorite = false;
                let isWatchlist = false;

                if (userName) {
                    const watchedResult = await pool.query(
                        'SELECT 1 FROM Assistiu WHERE ID_FILME = $1 AND USERNAME = $2',
                        [film.ID_FILME, userName]
                    );
                    isWatched = (watchedResult.rowCount||0) > 0;

                    const favoriteResult = await pool.query(
                        'SELECT 1 FROM Favoritou WHERE ID_FILME = $1 AND USERNAME = $2',
                        [film.ID_FILME, userName]
                    );
                    isFavorite = (favoriteResult.rowCount||0) > 0;

                    const watchlistResult = await pool.query(
                        'SELECT 1 FROM Assistira WHERE ID_FILME = $1 AND USERNAME = $2',
                        [film.ID_FILME, userName]
                    );
                    isWatchlist = (watchlistResult.rowCount||0) > 0;
                }

                return {
                    ...film,
                    Tags: tagsResult.rows,
                    IsWatched: isWatched,
                    IsFavorite: isFavorite,
                    IsWatchlist: isWatchlist
                };
            })
        );

        return res.status(200).json({ data: filmsWithTags });
    } catch (error) {
        console.error('Error fetching films:', error);
        return res
            .status(500)
            .json({ message: 'Internal server error', error: String(error) });
    }
}
