import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    if (req.method !== 'GET') {
        return NextResponse.json(
            { message: 'Method not allowed' },
            { status: 405 }
        );
    }

    try {
        const searchParams = req.nextUrl.searchParams;
        const search = searchParams.get('search');
        const genero = searchParams.get('genero');
        const anoMin = searchParams.get('anoMin');
        const anoMax = searchParams.get('anoMax');
        const notaMin = searchParams.get('notaMin');
        const idioma = searchParams.get('idioma');
        const diretor = searchParams.get('diretor');
        const queryUserName = searchParams.get('userName');

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
                    queryUserName ||
                    (req.headers.get('authorization')
                        ? getUserFromToken(
                              (req.headers.get('authorization') || '').split(
                                  ' '
                              )[1]
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
                    isWatched = (watchedResult.rowCount || 0) > 0;

                    const favoriteResult = await pool.query(
                        'SELECT 1 FROM Favoritou WHERE ID_FILME = $1 AND USERNAME = $2',
                        [film.ID_FILME, userName]
                    );
                    isFavorite = (favoriteResult.rowCount || 0) > 0;

                    const watchlistResult = await pool.query(
                        'SELECT 1 FROM Assistira WHERE ID_FILME = $1 AND USERNAME = $2',
                        [film.ID_FILME, userName]
                    );
                    isWatchlist = (watchlistResult.rowCount || 0) > 0;
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

        return NextResponse.json({ data: filmsWithTags }, { status: 200 });
    } catch (error) {
        console.error('Error fetching films:', error);
        return NextResponse.json(
            {
                message: 'Internal server error',
                error: String(error)
            },
            { status: 500 }
        );
    }
}
export async function POST(req: NextRequest) {
    if (req.method !== 'POST') {
        return NextResponse.json(
            { message: 'Method not allowed' },
            { status: 405 }
        );
    }

    try {
        const {
            NOME,
            ANO,
            DURACAO,
            GENERO,
            SINOPSE,
            DIRETOR,
            IDIOMA,
            IMAGEM,
            TAGS,
            USERNAME
        } = await req.json();

        if (
            !NOME ||
            !ANO ||
            !DURACAO ||
            !GENERO ||
            !SINOPSE ||
            !DIRETOR ||
            !IDIOMA
        ) {
            return NextResponse.json(
                { message: 'Dados obrigatórios faltando' },
                { status: 400 }
            );
        }

        const userToken = req.headers.get('authorization')?.split(' ')[1];
        const tokenUsername = userToken
            ? getUserFromToken(userToken)?.username
            : null;
        const finalUsername = USERNAME || tokenUsername;

        if (finalUsername) {
            const adminCheck = await pool.query(
                'SELECT 1 FROM U_Admin WHERE USERNAME = $1',
                [finalUsername]
            );

            if (adminCheck.rowCount === 0) {
                return NextResponse.json(
                    {
                        message:
                            'Apenas administradores podem criar filmes diretamente'
                    },
                    { status: 403 }
                );
            }
        } else {
            return NextResponse.json(
                { message: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        await pool.query('BEGIN');

        const idResult = await pool.query(
            'SELECT MAX(ID_FILME) + 1 as next_id FROM Filme'
        );
        const nextId = idResult.rows[0].next_id || 1;

        const result = await pool.query(
            `INSERT INTO Filme (ID_FILME, NOME, ANO, DURACAO, GENERO, SINOPSE, DIRETOR, IDIOMA, IMAGEM)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ID_FILME`,
            [
                nextId,
                NOME,
                ANO,
                DURACAO,
                GENERO,
                SINOPSE,
                DIRETOR,
                IDIOMA,
                IMAGEM || 'https://placeholder.com/movie'
            ]
        );

        const idFilme = result.rows[0].ID_FILME;

        if (TAGS && Array.isArray(TAGS) && TAGS.length > 0) {
            for (const tag of TAGS) {
                await pool.query(
                    `INSERT INTO Tags (ID_FILME, TAG) VALUES ($1, $2)`,
                    [idFilme, tag]
                );
            }
        }

        await pool.query('COMMIT');

        return NextResponse.json(
            {
                message: 'Filme criado com sucesso',
                idFilme
            },
            { status: 201 }
        );
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Erro ao criar filme:', error);
        return NextResponse.json(
            {
                message: 'Erro ao criar filme',
                error: String(error)
            },
            { status: 500 }
        );
    }
}
