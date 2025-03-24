import jwt from 'jsonwebtoken';

type DecodedToken = {
    username: string;
    email: string;
    isAdmin: boolean;
    iat: number;
    exp: number;
};

export async function verifyJwtToken(token: string): Promise<DecodedToken> {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'default_secret_change_in_production'
        ) as DecodedToken;

        return decoded;
    } catch (error) {
        console.error('Erro ao verificar token JWT:', error);
        throw new Error('Token inválido ou expirado');
    }
}

export function getUserFromToken(token: string): DecodedToken | null {
    try {
        const decoded = jwt.decode(token) as DecodedToken;
        return decoded;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    try {
        const decoded = jwt.decode(token) as DecodedToken;
        if (!decoded || !decoded.exp) return true;

        return decoded.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}
