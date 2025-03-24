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
        nome: string;
        ano: number;
        id_filme: number;
        duracao: number;
        Tags: { TAG: string }[];
        genero: string;
        sinopse: string;
        diretor: string;
        idioma: string;
        nota_agregada: string;
        imagem: string;
        IsWatched: boolean;
        IsFavorite: boolean;
        IsWatchlist: boolean;
    };
    avaliacoes: {
        username: string;
        nota: number;
        descricao: string;
        data_review: string;
    }[];
    membros: {
        nome: string;
        CARGO: string;
    }[];
    userAvaliacion: {
        username: string;
        nota: number;
        descricao: string;
        data_review: string;
    };
}

export function FilmeDetails() {
    const { user } = useAuth();
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
        console.log(data)
        return data;
    }

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['filme', id],
        queryFn: fetchFilme,
        enabled: !!id,
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
            const key = `Is${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof fetchFilmeResponse['filme'];
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
        username: string;
        nota: number;
        descricao: string;
    }) => {
        await axios.post(
            `/api/filmes/${id}/avaliacoes`,
            {
                ...avaliacao,
                id_filme: Number(id),
                username: user?.username
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
        id_filme: number;
        username: string;
        nota: number;
        descricao: string;
    }) => {
        try {
            submitAvaliacao({
                username: user?.username || '',
                nota: avaliacao.nota,
                descricao: avaliacao.descricao
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
                            src={data?.filme?.imagem}
                            alt={data?.filme?.nome}
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <AvatarFallback>{data?.filme.nome}</AvatarFallback>
                    </Avatar>

                           
                       {user && !user.isAdmin && ( 
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
 )}
                        {user && !user.isAdmin && ( 

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

                    )}
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Informações</h3>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm text-gray-500">
                                    diretor
                                </dt>
                                <dd>{data?.filme.diretor}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">ano</dt>
                                <dd>{data?.filme.ano}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">
                                    Duração
                                </dt>
                                <dd>
                                    {Math.floor(
                                        (data?.filme.duracao || 0) / 60
                                    )}
                                    h {(data?.filme.duracao || 0) % 60}min
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">
                                    idioma
                                </dt>
                                <dd>{data?.filme.idioma}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">
                                    Gênero
                                </dt>
                                <dd>{data?.filme.genero}</dd>
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
                                {data?.filme.nome}
                            </h1>
                            <div className="flex items-center mt-1">
                                <div className="flex items-center mr-4">
                                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                                    <span className="font-bold text-lg">
                                        {data?.filme.nota_agregada}
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

                       
                    </div>

                    <p className="text-gray-700 mb-6">{data?.filme.sinopse}</p>

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
                            {user && !user?.isAdmin &&(
                                <>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">
                                            Sua avaliação
                                        </h3>
                                        <AvaliacaoForm
                                            filmeId={Number(id)}
                                            avaliacao={{
                                                id_filme: Number(id),
                                                username: user?.username,
                                                nota:
                                                    data?.userAvaliacion?.nota ||
                                                    0,
                                                descricao:
                                                    (data?.userAvaliacion?
                                                        .descricao || '')
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
                                            key={avaliacao.username}
                                            className="p-4"
                                        >
                                            <div className="flex justify-between mb-2">
                                                <div className="font-semibold">
                                                    {avaliacao.username}
                                                </div>
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                    <span>
                                                        {avaliacao.nota}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700">
                                                {avaliacao.descricao}
                                            </p>
                                            <div className="text-gray-500 text-sm mt-2">
                                                {new Date(
                                                    avaliacao.data_review
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
                                                    {data?.filme.diretor
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="font-semibold text-center">
                                                {data?.filme.diretor}
                                            </div>
                                            <div className="text-gray-500 text-sm text-center">
                                                diretor
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
                                                    key={`${membro.nome}-${membro.CARGO}`}
                                                    className="p-4 flex flex-col items-center"
                                                >
                                                    <Avatar className="w-20 h-20 rounded-full bg-gray-200 mb-2">
                                                        <AvatarImage
                                                            src={`/api/placeholder/80/80?text=${encodeURIComponent(membro.nome[0])}`}
                                                            alt={membro.nome}
                                                            className="w-full h-full object-cover rounded-full"
                                                        />
                                                        <AvatarFallback>
                                                            {membro.nome
                                                                .substring(0, 2)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-semibold text-center">
                                                        {membro.nome}
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
