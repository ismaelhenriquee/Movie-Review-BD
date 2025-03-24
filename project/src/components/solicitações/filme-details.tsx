'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Clock, Heart, Eye, Edit, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function SolicitationDetails({
    user
}: {
    user: {
        username: string;
        email: string;
        ID_USUARIO: number;
        senha: string;
        isAdmin: boolean;
    };
}) {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [solicitation, setSolicitation] = useState({
        NOME: '',
        ANO: 0,
        ID_Solicitation: 0,
        DURACAO: 0,
        Tags: [{ TAG: 'Amor' }] as { TAG: string }[],
        GENERO: 'Romance',
        SINOPSE:
            'O filme é sobre um amor proibido entre dois jovens de mundos diferentes.O filme é sobre um amor proibido entre dois jovens de mundos diferentes.',
        DIRETOR: 'Eduardo',
        IDIOMA: 'Ingles',
        NOTA_AGREGADA: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [membros, setMembros] = useState([
        {
            NOME: 'hh',
            CARGO: 'hkjbkj'
        }
    ]);
    const [userStatus, setUserStatus] = useState<{
        assistido: boolean;
        watchlist: boolean;
        favorito: boolean;
        avaliacao:
            | {
                  ID_AVALIACAO: number;
                  ID_Solicitation: number;
                  ID_USUARIO: number;
                  NOTA: number;
                  DESCRICAO: string;
              }
            | undefined;
    }>({
        assistido: false,
        watchlist: false,
        favorito: false,
        avaliacao: undefined
    });

    // useEffect(() => {
    //     const fetchSolicitation = async () => {
    //         try {
    //             // Buscar detalhes do Solicitation
    //             const SolicitationRes = await fetch(`/api/Solicitations/${id}`);
    //             if (!SolicitationRes.ok) throw new Error('Solicitation não encontrado');
    //             const SolicitationData = await SolicitationRes.json();

    //             // Buscar avaliações
    //             const solicitationRes = await fetch(
    //                 `/api/Solicitations/${id}/solicitation`
    //             );
    //             const solicitationData = await solicitationRes.json();

    //             // Buscar membros do elenco e equipe
    //             const membrosRes = await fetch(`/api/Solicitations/${id}/membros`);
    //             const membrosData = await membrosRes.json();

    //             // Se o usuário estiver logado, buscar seu status em relação ao Solicitation
    //             if (user) {
    //                 const statusRes = await fetch(`/api/Solicitations/${id}/status`, {
    //                     headers: {
    //                         Authorization: `Bearer ${localStorage.getItem('token')}`
    //                     }
    //                 });
    //                 const statusData = await statusRes.json();
    //                 setUserStatus(statusData);
    //             }

    //             setSolicitation(SolicitationData);
    //             setsolicitation(solicitationData);
    //             setMembros(membrosData);
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchSolicitation();
    // }, [id, user]);



    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                Carregando...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => router.push('/admin')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="col-span-1">
                    <div className="bg-gray-200 w-full h-96 rounded-lg mb-4">
                        <img
                            src={`/api/placeholder/400/600?text=${encodeURIComponent(solicitation.NOME)}`}
                            alt={solicitation.NOME}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <dt className="text-sm text-gray-500">Sinopse</dt>
                        <dd>{solicitation.SINOPSE}</dd>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="flex items-start justify-between mb-2 flex-col gap-2">
                        {user && user.isAdmin && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto "
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Solicitação
                            </Button>
                        )}
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex items-center mt-1 flex-col w-full">
                                <h3 className="text-lg font-semibold mb-2">
                                    Informações do Usuário
                                </h3>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div>
                                        <dt className="text-sm text-gray-500">
                                            Nome
                                        </dt>
                                        <dd>{user.username}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">
                                            Email
                                        </dt>
                                        <dd>{user.email}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <Tabs
                        defaultValue="solicitation"
                        className="w-full"
                    >
                        <h3 className="text-lg font-semibold ml-auto mr-auto my-4 text-center">
                            Informações do Filme
                        </h3>
                        <TabsList className="mb-4">
                            <TabsTrigger value="solicitation">
                                Solicitação
                            </TabsTrigger>
                            <TabsTrigger value="elenco">
                                Elenco e Equipe
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="solicitation"
                            className="space-y-6"
                        >
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        Nome
                                    </dt>
                                    <dd>{solicitation.NOME}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        Diretor
                                    </dt>
                                    <dd>{solicitation.DIRETOR}</dd>
                                </div>

                                <div>
                                    <dt className="text-sm text-gray-500">
                                        Ano
                                    </dt>
                                    <dd>{solicitation.ANO}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        Duração
                                    </dt>
                                    <dd>
                                        {Math.floor(solicitation.DURACAO / 60)}h{' '}
                                        {solicitation.DURACAO % 60}min
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        Idioma
                                    </dt>
                                    <dd>{solicitation.IDIOMA}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        Gênero
                                    </dt>
                                    <dd>{solicitation.GENERO}</dd>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <dt className="text-sm text-gray-500">
                                        Tags
                                    </dt>
                                    <dd className="flex flex-wrap gap-1 mt-1">
                                        {solicitation.Tags &&
                                            solicitation.Tags.map((tag) => (
                                                <Badge
                                                    key={tag.TAG}
                                                    variant="outline"
                                                >
                                                    {tag.TAG}
                                                </Badge>
                                            ))}
                                    </dd>
                                </div>
                            </dl>
                        </TabsContent>

                        <TabsContent value="elenco">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        Direção
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <Card className="p-4 flex flex-col items-center">
                                            <Avatar className="w-20 h-20 rounded-full bg-gray-200 mb-2">
                                                <AvatarImage
                                                    src={`/api/placeholder/80/80?text=${encodeURIComponent(solicitation.DIRETOR[0])}`}
                                                    alt={solicitation.DIRETOR}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                                <AvatarFallback>
                                                    {solicitation.DIRETOR.substring(
                                                        0,
                                                        2
                                                    ).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="font-semibold text-center">
                                                {solicitation.DIRETOR}
                                            </div>
                                            <div className="text-gray-500 text-sm text-center">
                                                Diretor
                                            </div>
                                        </Card>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        Elenco e Equipe
                                    </h3>
                                    {membros.length === 0 ? (
                                        <p className="text-gray-500">
                                            Não há informações sobre o elenco e
                                            equipe.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {membros.map((membro) => (
                                                <Card
                                                    key={`${membro.NOME}-${membro.CARGO}`}
                                                    className="p-4 flex flex-col items-center"
                                                >
                                                    <Avatar className="w-20 h-20 rounded-full bg-gray-200 mb-2">
                                                        <AvatarImage
                                                            src={`/api/placeholder/80/80?text=${encodeURIComponent(membro.NOME[0])}`}
                                                            alt={membro.NOME}
                                                            className="w-full h-full object-cover rounded-full"
                                                        />
                                                        <AvatarFallback>
                                                            {membro.NOME.substring(
                                                                0,
                                                                2
                                                            ).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-semibold text-center">
                                                        {membro.NOME}
                                                    </div>
                                                    <div className="text-gray-500 text-sm text-center">
                                                        {membro.CARGO}
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
