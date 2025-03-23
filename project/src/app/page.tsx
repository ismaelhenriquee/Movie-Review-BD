import { FilmeGrid } from '@/components/filmes/filme-grid';

export default function WelcomeScreen() {
    return (
        <FilmeGrid
            user={{
                username: 'Lucas',
                email: 'f@gmail.com',
                ID_USUARIO: 1,
                senha: '123456'
            }}
        />
    );
}
