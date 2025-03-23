import { FilmeDetails } from '@/components/filmes/filme-details';

export default function DetalhesPage() {
    return <FilmeDetails 
    user={{
        username: 'Lucas',
        email: 'dd@gmail.com',
        ID_USUARIO: 1,
        senha: '123456',
        isAdmin: true
    }}
    />;
}
