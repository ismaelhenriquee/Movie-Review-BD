'use client';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Heart, Eye } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export function FilmeCard({
    filme,
    user,
    refetch
}: {
    filme: {
        nome: string;
        ano: number;
        id_filme: number;
        duracao: number;
        Tags: { TAG: string }[];
        genero: string;
        sinopse: string;
        DIRETOR: string;
        IDIOMA: string;
        nota_agregada: string;
        imagem: string;
        IsWatched: boolean;
        IsFavorite: boolean;
        IsWatchlist: boolean;
    };
    user: {
        username?: string;
        email?: string;
        isAdmin?: boolean;
    };
    refetch?: () => void;
}) {
    const router = useRouter();

    const formatarNota = (nota: number) => {
        return nota
    };

    const getNotaColor = (nota: string) => {
        const notaNumber = parseFloat(nota);
        if (notaNumber >= 7.5) return 'text-green-500';
        if (notaNumber >= 5) return 'text-yellow-500';
        return 'text-red-500';
    };
    async function toggleReaction(
        active: boolean,
        type: 'watchlist' | 'favorite' | 'watched'
    ): Promise<void> {
        await axios.post(
            `/api/filmes/reactions`,
            {
                type: type,
                username: user.username,
                filmeId: Number(filme.id_filme),
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
            return toggleReaction(active, type); // Chama sua função com os dois parâmetros
        },
        onSuccess: () => {
            toast({
                description: 'Reação do filme atualizada com sucesso!',
                variant: 'default'
            });
            if (refetch) {
                refetch();
            }
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
                `Is${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof filme;
            const isActive = filme[key];
            await toogleMutation.mutateAsync({
                active: !isActive,
                type: type
            });
        } catch (error) {
            console.error('Erro ao atualizar a reação do filme:', error);
        }
    };

    const handleCardClick = () => {
        router.push(`/filmes/${filme.id_filme}`);
    };

    return (
        <Card
            className="w-64 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleCardClick}
        >
            <CardHeader className="p-4 pb-0">
                <div className="relative w-full h-40 bg-gray-200 rounded-md mb-2">
                    <img
                        src={filme.imagem}
                        alt={filme.nome}
                        className="w-full h-full object-cover rounded-md"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span
                            className={`text-sm font-bold ${getNotaColor(filme.nota_agregada)}`}
                        >
                            {(filme?.nota_agregada || 0)}
                        </span>
                    </div>
                </div>
                <h3
                    className="font-bold text-lg truncate"
                    title={filme.nome}
                >
                    {filme.nome}
                </h3>
                <div className="flex items-center text-gray-500 text-sm">
                    <span>{filme.ano}</span>
                    <span className="mx-2">•</span>
                    <span>
                        {Math.floor(filme.duracao / 60)}h {filme.duracao % 60}
                        min
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary">{filme.genero}</Badge>
                    {filme.Tags &&
                        filme.Tags.slice(0, 2).map((tag) => (
                            <Badge
                                key={tag.TAG}
                                variant="outline"
                            >
                                {tag.TAG}
                            </Badge>
                        ))}
                    {filme.Tags && filme.Tags.length > 2 && (
                        <Badge variant="outline">
                            +{filme.Tags.length - 2}
                        </Badge>
                    )}
                </div>
                <p
                    className="text-sm text-gray-600 line-clamp-2"
                    title={filme.sinopse}
                >
                    {filme.sinopse}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    filme.IsWatchlist ? 'default' : 'outline'
                                }
                                size="icon"
                                onClick={(e) => toggleEvent(e, 'watchlist')}
                            >
                                <Clock className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {filme.IsWatchlist
                                    ? 'Remover da watchlist'
                                    : 'Adicionar à watchlist'}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    filme.IsFavorite ? 'default' : 'outline'
                                }
                                size="icon"
                                onClick={(e) => toggleEvent(e, 'favorite')}
                            >
                                <Heart className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {filme.IsFavorite
                                    ? 'Remover dos favoritos'
                                    : 'Adicionar aos favoritos'}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    filme.IsWatched ? 'default' : 'outline'
                                }
                                size="icon"
                                onClick={(e) => toggleEvent(e, 'watched')}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {filme.IsWatched
                                    ? 'Remover dos assistidos'
                                    : 'Marcar como assistido'}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardFooter>
        </Card>
    );
}
