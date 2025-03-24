'use client';
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
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Avatar, AvatarImage } from '../ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import { FilmeEditModal } from './filme-edit-modal';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface fetchFilmeResponse {
    filme: {
        NOME: string;
        ANO: number;
        ID_FILME: number;
        DURACAO: number;
        Tags: { TAG: string }[];
        GENERO: string;
        SINOPSE: string;
        DIRETOR: string;
        IDIOMA: string;
        NOTA_AGREGADA: number;
        IMAGEM: string;
        IsWatched: boolean;
        IsFavorite: boolean;
        IsWatchlist: boolean;
    };
    avaliacoes: {
        USERNAME: string;
        NOTA: number;
        DESCRICAO: string;
        DATA_REVIEW: string;
    }[];
    membros: {
        NOME: string;
        CARGO: string;
    }[];
    userAvaliacion: {
        USERNAME: string;
        NOTA: number;
        DESCRICAO: string;
        DATA_REVIEW: string;
    };
}

export function FilmeDetails() {
    const {user} = useAuth();
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    async function fetchFilme(): Promise<fetchFilmeResponse> {
        const { data } = await axios.get(`/api/filmes/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return data;
    }

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['filme', id],
        queryFn: fetchFilme,
        initialData: {
            filme: {
                NOME: 'A Cidade Perdida',
                ANO: 2023,
                IMAGEM: 'https://www.themoviedb.org/t/p/w500/7q5Z1X0s6j8K5K4t3fK5fG2x1Vd.jpg',
                ID_FILME: 1,
                DURACAO: 112,
                Tags: [{ TAG: 'Aventura' }, { TAG: 'Comédia' }],
                GENERO: 'Aventura',
                SINOPSE:
                    'Uma romancista de aventura é sequestrada por um bilionário excêntrico enquanto promovia seu novo livro, e um modelo de capa de livro se vê obrigado a resgatá-la.',
                DIRETOR: 'Aaron Nee',
                IDIOMA: 'Inglês',
                NOTA_AGREGADA: 7.5,
                IsWatched: false,
                IsFavorite: false,
                IsWatchlist: false
            },
            avaliacoes: [
                {
                    USERNAME: 'Lucas',
                    NOTA: 8,
                    DESCRICAO: 'Ótimo filme!',
                    DATA_REVIEW: '2023-10-01'
                }
            ],
            membros: [
                {
                    NOME: 'Sandra Bullock',
                    CARGO: 'Atriz Principal'
                },
                {
                    NOME: 'Channing Tatum',
                    CARGO: 'Ator Principal'
                }
            ],
            userAvaliacion: {
                USERNAME: 'Lucas',
                NOTA: 8,
                DESCRICAO: 'Ótimo filme!',
                DATA_REVIEW: '2023-10-01'
            }
        }
    });
    async function toggleReaction(
        active: boolean,
        type: 'watchlist' | 'favorite' | 'watched'
    ): Promise<void> {
        await axios.post(
            `/api/filmes/reactions`,
            {
                type: type,
                username: user?.username,
                filmeId: Number(id),
                active: active
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
    }

    const toogleMutation = useMutation({
        mutationFn: ({
            active,
            type
        }: {
            active: boolean;
            type: 'watchlist' | 'favorite' | 'watched';
        }) => {
            return toggleReaction(active, type);
        },
        onSuccess: () => {
            toast({
                description: 'Reação do filme atualizada com sucesso!',
                variant: 'default'
            });
            refetch();
        },
        onError: () => {
            toast({
                description: 'Ocorreu um erro ao atualizar a reação do filme.',
                variant: 'destructive'
            });
        }
    });

    const toggleEvent = async (
        e: React.MouseEvent<HTMLButtonElement>,
        type: 'watchlist' | 'favorite' | 'watched'
    ) => {
        e.stopPropagation();
        if (!user) {
            router.push('/auth/login');
            return;
        }
        try {
            const key =
                `Is${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof data.filme;
            const isActive = data?.filme[key];
            await toogleMutation.mutateAsync({
                active: !isActive,
                type: type
            });
        } catch (error) {
            console.error('Erro ao atualizar a reação do filme:', error);
        }
    };

    const mutateAvaliacao = async (avaliacao: {
        USERNAME: string;
        NOTA: number;
        DESCRICAO: string;
    }) => {
        await axios.post(
            `/api/filmes/${id}/avaliacoes`,
            {
                ...avaliacao,
                ID_FILME: Number(id),
                USERNAME: user?.username
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
    };

    const { mutate: submitAvaliacao } = useMutation({
        mutationFn: mutateAvaliacao,
        onSuccess: () => {
            toast({
                description: 'Avaliação salva com sucesso!',
                variant: 'default'
            });
            refetch();
        },
        onError: () => {
            toast({
                description: 'Erro ao salvar a avaliação.',
                variant: 'destructive'
            });
        }
    });

    const handleSubmitAvaliacao = async (avaliacao: {
        ID_FILME: number;
        USERNAME: string;
        NOTA: number;
        DESCRICAO: string;
    }) => {
        try {
            submitAvaliacao({
                USERNAME: user?.username || '',
                NOTA: avaliacao.NOTA,
                DESCRICAO: avaliacao.DESCRICAO
            });
        } catch (err) {
            console.error('Erro ao salvar a avaliação:', err);
            toast({
                description: `Não foi possível salvar a avaliação:`,
                variant: 'destructive'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                Carregando...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">
                    Ocorreu um erro ao carregar os detalhes do filme.
                </p>
                <Button onClick={() => router.push('/home')}>
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
                onClick={() => router.push('/home')}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para filmes
            </Button>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="col-span-1">
                    <Avatar className="bg-gray-200 w-full h-96 rounded-lg mb-4">
                        <AvatarImage
                            src={data?.filme?.IMAGEM}
                            alt={data?.filme?.NOME}
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <AvatarFallback>{data?.filme.NOME}</AvatarFallback>
                    </Avatar>

                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={
                                data?.filme?.IsWatched ? 'default' : 'outline'
                            }
                            className="flex-1"
                            onClick={(e) => toggleEvent(e, 'watchlist')}
                        >
                            <Clock className="mr-2 h-4 w-4" />
                            {data?.filme?.IsWatchlist
                                ? 'Na watchlist'
                                : 'Watchlist'}
                        </Button>

                        <Button
                            variant={
                                data?.filme?.IsFavorite ? 'default' : 'outline'
                            }
                            className="flex-1"
                            onClick={(e) => toggleEvent(e, 'favorite')}
                        >
                            <Heart className="mr-2 h-4 w-4" />
                            {data?.filme?.IsFavorite ? 'Favorito' : 'Favoritar'}
                        </Button>
                    </div>

                    <Button
                        variant={data?.filme?.IsWatched ? 'default' : 'outline'}
                        className="w-full mb-6"
                        onClick={(e) => toggleEvent(e, 'watched')}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {data?.filme?.IsWatched
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
                                <dd>{data?.filme.DIRETOR}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Ano</dt>
                                <dd>{data?.filme.ANO}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">
                                    Duração
                                </dt>
                                <dd>
                                    {Math.floor(
                                        (data?.filme.DURACAO || 0) / 60
                                    )}
                                    h {(data?.filme.DURACAO || 0) % 60}min
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">
                                    Idioma
                                </dt>
                                <dd>{data?.filme.IDIOMA}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">
                                    Gênero
                                </dt>
                                <dd>{data?.filme.GENERO}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Tags</dt>
                                <dd className="flex flex-wrap gap-1 mt-1">
                                    {data?.filme.Tags &&
                                        data?.filme.Tags.map((tag) => (
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
                            <h1 className="text-3xl font-bold">
                                {data?.filme.NOME}
                            </h1>
                            <div className="flex items-center mt-1">
                                <div className="flex items-center mr-4">
                                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                                    <span className="font-bold text-lg">
                                        {data?.filme.NOTA_AGREGADA.toFixed(1)}
                                    </span>
                                    <span className="text-gray-500 ml-1">
                                        / 10
                                    </span>
                                </div>
                                <div className="text-gray-500">
                                    {data?.avaliacoes.length}{' '}
                                    {data?.avaliacoes.length === 1
                                        ? 'avaliação'
                                        : 'avaliações'}
                                </div>
                            </div>
                        </div>

                        {user && user.isAdmin && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOpen(true)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar filme
                            </Button>
                        )}
                    </div>

                    <p className="text-gray-700 mb-6">{data?.filme.SINOPSE}</p>

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
                                            avaliacao={{
                                                ID_FILME: Number(id),
                                                USERNAME: user?.username,
                                                NOTA:
                                                    data?.userAvaliacion.NOTA ||
                                                    0,
                                                DESCRICAO:
                                                    data?.userAvaliacion
                                                        .DESCRICAO || ''
                                            }}
                                            onSubmit={handleSubmitAvaliacao}
                                        />
                                    </div>
                                    <Separator className="my-6" />
                                </>
                            )}

                            <h3 className="text-lg font-semibold mb-2">
                                Avaliações dos usuários
                            </h3>
                            {data?.avaliacoes.length === 0 ? (
                                <p className="text-gray-500">
                                    Ainda não há avaliações para este filme.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {data?.avaliacoes.map((avaliacao) => (
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
                                            <Avatar className="w-20 h-20 rounded-full bg-gray-200 mb-2">
                                                <AvatarFallback>
                                                    {data?.filme.DIRETOR.substring(
                                                        0,
                                                        2
                                                    ).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="font-semibold text-center">
                                                {data?.filme.DIRETOR}
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
                                    {data?.membros.length === 0 ? (
                                        <p className="text-gray-500">
                                            Não há informações sobre o elenco e
                                            equipe.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {data?.membros.map((membro) => (
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
            <FilmeEditModal
                filmeId={Number(id)}
                open={open}
                onOpenChange={setOpen}
            />
        </div>
    );
}
