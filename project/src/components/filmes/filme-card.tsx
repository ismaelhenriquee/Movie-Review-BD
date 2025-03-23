'use client';
import { useState } from 'react';
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

export function FilmeCard({
    filme,
    user
}: {
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
    };
    user: {
        username: string;
        email: string;
        ID_USUARIO: number;
        senha: string;
    };
}) {
    const router = useRouter();

    const [isWatchlist, setIsWatchlist] = useState(false);
    const [isFavorito, setIsFavorito] = useState(false);
    const [isAssistido, setIsAssistido] = useState(false);

    // Função para formatar a nota como X.X
    const formatarNota = (nota: number) => {
        return nota.toFixed(1);
    };

    // Cores baseadas na nota do filme
    const getNotaColor = (nota: number) => {
        if (nota >= 7.5) return 'text-green-500';
        if (nota >= 5) return 'text-yellow-500';
        return 'text-red-500';
    };

    const toggleWatchlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            // Chamada para a API para adicionar/remover da watchlist
            const endpoint = isWatchlist
                ? `/api/filmes/${filme.ID_FILME}/watchlist/remover`
                : `/api/filmes/${filme.ID_FILME}/watchlist/adicionar`;

            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setIsWatchlist(!isWatchlist);
        } catch (error) {
            console.error('Erro ao atualizar watchlist:', error);
        }
    };

    const toggleFavorito = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            // Chamada para a API para adicionar/remover dos favoritos
            const endpoint = isFavorito
                ? `/api/filmes/${filme.ID_FILME}/favoritos/remover`
                : `/api/filmes/${filme.ID_FILME}/favoritos/adicionar`;

            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setIsFavorito(!isFavorito);
        } catch (error) {
            console.error('Erro ao atualizar favoritos:', error);
        }
    };

    const toggleAssistido = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            // Chamada para a API para adicionar/remover dos assistidos
            const endpoint = isAssistido
                ? `/api/filmes/${filme.ID_FILME}/assistidos/remover`
                : `/api/filmes/${filme.ID_FILME}/assistidos/adicionar`;

            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setIsAssistido(!isAssistido);
        } catch (error) {
            console.error('Erro ao atualizar assistidos:', error);
        }
    };

    const handleCardClick = () => {
        router.push(`/filmes/${filme.ID_FILME}`);
    };

    return (
        <Card
            className="w-64 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleCardClick}
        >
            <CardHeader className="p-4 pb-0">
                <div className="relative w-full h-40 bg-gray-200 rounded-md mb-2">
                    <img
                        src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSktqj-xOwVJNFfDLnVyBaO1m-1N4CkmpvYaw&s`}
                        alt={filme.NOME}
                        className="w-full h-full object-cover rounded-md"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span
                            className={`text-sm font-bold ${getNotaColor(filme.NOTA_AGREGADA)}`}
                        >
                            {formatarNota(filme.NOTA_AGREGADA)}
                        </span>
                    </div>
                </div>
                <h3
                    className="font-bold text-lg truncate"
                    title={filme.NOME}
                >
                    {filme.NOME}
                </h3>
                <div className="flex items-center text-gray-500 text-sm">
                    <span>{filme.ANO}</span>
                    <span className="mx-2">•</span>
                    <span>
                        {Math.floor(filme.DURACAO / 60)}h {filme.DURACAO % 60}
                        min
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary">{filme.GENERO}</Badge>
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
                    title={filme.SINOPSE}
                >
                    {filme.SINOPSE}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={isWatchlist ? 'default' : 'outline'}
                                size="icon"
                                onClick={toggleWatchlist}
                            >
                                <Clock className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {isWatchlist
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
                                variant={isFavorito ? 'default' : 'outline'}
                                size="icon"
                                onClick={toggleFavorito}
                            >
                                <Heart className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {isFavorito
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
                                variant={isAssistido ? 'default' : 'outline'}
                                size="icon"
                                onClick={toggleAssistido}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {isAssistido
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
