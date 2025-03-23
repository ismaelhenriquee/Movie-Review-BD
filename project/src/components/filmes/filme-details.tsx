'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Clock, Heart, Eye, Edit, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AvaliacaoForm } from './avaliacao-form';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export function FilmeDetails({
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
    const [filme, setFilme] = useState({
        NOME: '',
        ANO: 0,
        ID_FILME: 0,
        DURACAO: 0,
        Tags: [] as { TAG: string }[],
        GENERO: '',
        SINOPSE: '',
        DIRETOR: '',
        IDIOMA: '',
        NOTA_AGREGADA: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [avaliacoes, setAvaliacoes] = useState([
        {
            USERNAME: '',
            NOTA: 0,
            DESCRICAO: '',
            DATA_REVIEW: ''
        },
        {
            USERNAME: '',
            NOTA: 0,
            DESCRICAO: '',
            DATA_REVIEW: ''
        }
    ]);
    const [membros, setMembros] = useState([
        {
            NOME: '',
            CARGO: ''
        }
    ]);
    const [userStatus, setUserStatus] = useState<{
        assistido: boolean;
        watchlist: boolean;
        favorito: boolean;
        avaliacao: { 
            ID_AVALIACAO: number;
            ID_FILME: number;
            ID_USUARIO: number;
            NOTA: number;
            DESCRICAO: string;
        } | undefined;
    }>({
        assistido: false,
        watchlist: false,
        favorito: false,
        avaliacao: undefined
    });

    // useEffect(() => {
    //     const fetchFilme = async () => {
    //         try {
    //             // Buscar detalhes do filme
    //             const filmeRes = await fetch(`/api/filmes/${id}`);
    //             if (!filmeRes.ok) throw new Error('Filme não encontrado');
    //             const filmeData = await filmeRes.json();

    //             // Buscar avaliações
    //             const avaliacoesRes = await fetch(
    //                 `/api/filmes/${id}/avaliacoes`
    //             );
    //             const avaliacoesData = await avaliacoesRes.json();

    //             // Buscar membros do elenco e equipe
    //             const membrosRes = await fetch(`/api/filmes/${id}/membros`);
    //             const membrosData = await membrosRes.json();

    //             // Se o usuário estiver logado, buscar seu status em relação ao filme
    //             if (user) {
    //                 const statusRes = await fetch(`/api/filmes/${id}/status`, {
    //                     headers: {
    //                         Authorization: `Bearer ${localStorage.getItem('token')}`
    //                     }
    //                 });
    //                 const statusData = await statusRes.json();
    //                 setUserStatus(statusData);
    //             }

    //             setFilme(filmeData);
    //             setAvaliacoes(avaliacoesData);
    //             setMembros(membrosData);
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchFilme();
    // }, [id, user]);

    const handleToggleStatus = async (type: keyof typeof userStatus) => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            const status = userStatus[type];
            const action = status ? 'remover' : 'adicionar';

            await fetch(`/api/filmes/${id}/${type}/${action}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setUserStatus((prev) => ({
                ...prev,
                [type]: !status
            }));

            toast({
                title: `${status ? 'Removido' : 'Adicionado'} ${
                    type === 'watchlist'
                        ? 'da watchlist'
                        : type === 'favorito'
                          ? 'dos favoritos'
                          : 'dos assistidos'
                }`
            });
        } catch (err) {
            toast({
                title: 'Erro',
                description: `Não foi possível atualizar:`, // ${err.message}`,
                variant: 'destructive'
            });
        }
    };

    const handleSubmitAvaliacao = async (avaliacao: {
        ID_AVALIACAO: number;
        ID_FILME: number;
        ID_USUARIO: number;
        NOTA: number;
        DESCRICAO: string;
    }) => {
        try {
            const method = userStatus.avaliacao ? 'PUT' : 'POST';

            await fetch(`/api/filmes/${id}/avaliacoes`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(avaliacao)
            });

            // Atualizar a avaliação do usuário no estado
            setUserStatus((prev) => ({
                ...prev,
                avaliacao
            }));

            // Recarregar todas as avaliações
            const avaliacoesRes = await fetch(`/api/filmes/${id}/avaliacoes`);
            const avaliacoesData = await avaliacoesRes.json();
            setAvaliacoes(avaliacoesData);

            toast({
                title: userStatus.avaliacao
                    ? 'Avaliação atualizada'
                    : 'Avaliação adicionada'
            });
        } catch (err) {
            toast({
                title: 'Erro',
                description: `Não foi possível salvar a avaliação:`, // ${err.message}`,
                variant: 'destructive'
            });
        }
    };

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
                <Button onClick={() => router.push('/filmes')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para filmes
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                onClick={() => router.push('/filmes')}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para filmes
            </Button>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="col-span-1">
                    <div className="bg-gray-200 w-full h-96 rounded-lg mb-4">
                        <img
                            src={`/api/placeholder/400/600?text=${encodeURIComponent(filme.NOME)}`}
                            alt={filme.NOME}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>

                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={
                                userStatus.watchlist ? 'default' : 'outline'
                            }
                            className="flex-1"
                            onClick={() => handleToggleStatus('watchlist')}
                        >
                            <Clock className="mr-2 h-4 w-4" />
                            {userStatus.watchlist
                                ? 'Na watchlist'
                                : 'Watchlist'}
                        </Button>

                        <Button
                            variant={
                                userStatus.favorito ? 'default' : 'outline'
                            }
                            className="flex-1"
                            onClick={() => handleToggleStatus('favorito')}
                        >
                            <Heart className="mr-2 h-4 w-4" />
                            {userStatus.favorito ? 'Favorito' : 'Favoritar'}
                        </Button>
                    </div>

                    <Button
                        variant={userStatus.assistido ? 'default' : 'outline'}
                        className="w-full mb-6"
                        onClick={() => handleToggleStatus('assistido')}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {userStatus.assistido
                            ? 'Assistido'
                            : 'Marcar como assistido'}
                    </Button>

                    <div className="bg-gray-100 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Informações</h3>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm text-gray-500">
                                    Diretor
                                </dt>
                                <dd>{filme.DIRETOR}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Ano</dt>
                                <dd>{filme.ANO}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">
                                    Duração
                                </dt>
                                <dd>
                                    {Math.floor(filme.DURACAO / 60)}h{' '}
                                    {filme.DURACAO % 60}min
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">
                                    Idioma
                                </dt>
                                <dd>{filme.IDIOMA}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">
                                    Gênero
                                </dt>
                                <dd>{filme.GENERO}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Tags</dt>
                                <dd className="flex flex-wrap gap-1 mt-1">
                                    {filme.Tags &&
                                        filme.Tags.map((tag) => (
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
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h1 className="text-3xl font-bold">{filme.NOME}</h1>
                            <div className="flex items-center mt-1">
                                <div className="flex items-center mr-4">
                                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                                    <span className="font-bold text-lg">
                                        {filme.NOTA_AGREGADA.toFixed(1)}
                                    </span>
                                    <span className="text-gray-500 ml-1">
                                        / 10
                                    </span>
                                </div>
                                <div className="text-gray-500">
                                    {avaliacoes.length}{' '}
                                    {avaliacoes.length === 1
                                        ? 'avaliação'
                                        : 'avaliações'}
                                </div>
                            </div>
                        </div>

                        {user && user.isAdmin && (
                            <Button
                                variant="outline"
                                size="sm"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar filme
                            </Button>
                        )}
                    </div>

                    <p className="text-gray-700 mb-6">{filme.SINOPSE}</p>

                    <Tabs
                        defaultValue="avaliacoes"
                        className="w-full"
                    >
                        <TabsList className="mb-4">
                            <TabsTrigger value="avaliacoes">
                                Avaliações
                            </TabsTrigger>
                            <TabsTrigger value="elenco">
                                Elenco e Equipe
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="avaliacoes"
                            className="space-y-6"
                        >
                            {user && (
                                <>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">
                                            Sua avaliação
                                        </h3>
                                        <AvaliacaoForm
                                            filmeId={Number(id)}
                                            avaliacao={userStatus.avaliacao}
                                            onSubmit={handleSubmitAvaliacao}
                                        />
                                    </div>
                                    <Separator className="my-6" />
                                </>
                            )}

                            <h3 className="text-lg font-semibold mb-2">
                                Avaliações dos usuários
                            </h3>
                            {avaliacoes.length === 0 ? (
                                <p className="text-gray-500">
                                    Ainda não há avaliações para este filme.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {avaliacoes.map((avaliacao) => (
                                        <Card
                                            key={avaliacao.USERNAME}
                                            className="p-4"
                                        >
                                            <div className="flex justify-between mb-2">
                                                <div className="font-semibold">
                                                    {avaliacao.USERNAME}
                                                </div>
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                    <span>
                                                        {avaliacao.NOTA.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700">
                                                {avaliacao.DESCRICAO}
                                            </p>
                                            <div className="text-gray-500 text-sm mt-2">
                                                {new Date(
                                                    avaliacao.DATA_REVIEW
                                                ).toLocaleDateString()}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="elenco">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        Direção
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <Card className="p-4 flex flex-col items-center">
                                            <div className="w-20 h-20 rounded-full bg-gray-200 mb-2">
                                                <img
                                                    src={`/api/placeholder/80/80?text=${encodeURIComponent(filme.DIRETOR[0])}`}
                                                    alt={filme.DIRETOR}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            </div>
                                            <div className="font-semibold text-center">
                                                {filme.DIRETOR}
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
                                                    <div className="w-20 h-20 rounded-full bg-gray-200 mb-2">
                                                        <img
                                                            src={`/api/placeholder/80/80?text=${encodeURIComponent(membro.NOME[0])}`}
                                                            alt={membro.NOME}
                                                            className="w-full h-full object-cover rounded-full"
                                                        />
                                                    </div>
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
