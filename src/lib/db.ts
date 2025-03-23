import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl:
        process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false
});

 async function query(text: string, params?: unknown[]) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('executed query', {
            text,
            duration,
            rows: result.rowCount
        });
        return result;
    } catch (err) {
        const duration = Date.now() - start;
        console.error('error executing query', { text, duration, err });
        throw err;
    }
}

export { query };