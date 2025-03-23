import { SolicitationDetails } from '@/components/solicitações/filme-details';

export default function DetalhesPage() {
    return <SolicitationDetails 
    user={{
        username: 'Lucas',
        email: 'dd@gmail.com',
        ID_USUARIO: 1,
        senha: '123456',
        isAdmin: true
    }}
    />;
}
