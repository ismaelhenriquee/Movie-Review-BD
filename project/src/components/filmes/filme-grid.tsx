'use client';
import { useState } from 'react';
import axios from 'axios';
import { FilmeCard } from './filme-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { FilmeEditModal } from './filme-edit-modal';

export function FilmeGrid() {
    const { user } = useAuth();

    async function getMovies(): Promise<{
        data: {
            nome: string;
            ano: number;
            id_filme: number;
            duracao: number;
            Tags: { TAG: string }[];
            genero: string;
            sinopse: string;
            DIRETOR: string;
            IDIOMA: string;
            nota_agregada: number;
            imagem: string;
            IsWatched: boolean;
            IsFavorite: boolean;
            IsWatchlist: boolean;
        }[];
    }> {
        const { data } = await axios.get('/api/filmes', {
            params: {
                search: searchTerm,
                genero: filters.genero,
                anoMin: filters.anoMin,
                anoMax: filters.anoMax,
                notaMin: filters.notaMin,
                idioma: filters.idioma,
                diretor: filters.diretor
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return data;
    }

    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);

    const [filters, setFilters] = useState({
        genero: '',
        anoMin: '',
        anoMax: '',
        notaMin: 0,
        idioma: '',
        diretor: ''
    });

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['filmes', searchTerm],
        queryFn: getMovies
    });

    if (isError) {
        toast({
            description: 'Ocorreu um erro ao carregar filmes.',
            variant: 'destructive'
        });
    }
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleFilterChange = (
        key: string,
        value: string | number | boolean
    ) => {
        if (key === 'anoMin' || key === 'anoMax') {
            value = parseInt(value as string, 10);
        }
        if (key === 'notaMin') {
            value = parseFloat(value as string);
        }
        if (key === 'genero' || key === 'idioma') {
            if (value === 'Todos os gêneros' || value === 'Todos os idiomas') {
                value = '';
            }
        }
        setFilters((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const limparFiltros = () => {
        setFilters({
            genero: '',
            anoMin: '',
            anoMax: '',
            notaMin: 0,
            idioma: '',
            diretor: ''
        });
        setSearchTerm('');
    };

    const generos = [
        'Ação',
        'Aventura',
        'Animação',
        'Comédia',
        'Crime',
        'Documentário',
        'Drama',
        'Fantasia',
        'Ficção Científica',
        'Guerra',
        'Mistério',
        'Musical',
        'Romance',
        'Suspense',
        'Terror'
    ];

    const idiomas = [
        'Português',
        'Inglês',
        'Espanhol',
        'Francês',
        'Japonês',
        'Coreano',
        'Alemão',
        'Italiano'
    ];

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <form
                    onSubmit={handleSearch}
                    className="flex-1 flex gap-2"
                >
                    <Input
                        placeholder="Buscar filmes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit">
                        <Search className="mr-2 h-4 w-4" />
                        Buscar
                    </Button>
                </form>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtros
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-80">
                        <SheetHeader>
                            <SheetTitle>Filtros</SheetTitle>
                        </SheetHeader>
                        <div className="py-4 space-y-6">
                            <div className="space-y-2">
                                <Label>Gênero</Label>
                                <Select
                                    value={filters.genero}
                                    onValueChange={(value) =>
                                        handleFilterChange('genero', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos os gêneros" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Todos os gêneros">
                                            Todos os gêneros
                                        </SelectItem>
                                        {generos.map((genero) => (
                                            <SelectItem
                                                key={genero}
                                                value={genero}
                                            >
                                                {genero}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Ano (mínimo)</Label>
                                    <Input
                                        type="number"
                                        placeholder="1900"
                                        value={filters.anoMin}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'anoMin',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ano (máximo)</Label>
                                    <Input
                                        type="number"
                                        placeholder="2025"
                                        value={filters.anoMax}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'anoMax',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Nota mínima: {filters.notaMin}</Label>
                                <Input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={filters.notaMin}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'notaMin',
                                            parseFloat(e.target.value)
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Idioma</Label>
                                <Select
                                    value={filters.idioma}
                                    onValueChange={(value) =>
                                        handleFilterChange('idioma', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos os idiomas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={'Todos os idiomas'}>
                                            Todos os idiomas
                                        </SelectItem>
                                        {idiomas.map((idioma) => (
                                            <SelectItem
                                                key={idioma}
                                                value={idioma}
                                            >
                                                {idioma}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Diretor</Label>
                                <Input
                                    placeholder="Nome do diretor"
                                    value={filters.diretor}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'diretor',
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <Button
                                onClick={limparFiltros}
                                variant="outline"
                                className="w-full"
                            >
                                Limpar filtros
                            </Button>
                            <Button
                                onClick={() => refetch()}
                                variant="outline"
                                className="w-full"
                            >
                                Buscar
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
                {!user?.isAdmin && (
                    <Button
                        variant="outline"
                        onClick={() => setOpen(true)}
                    >
                        Solicitar Filme
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-2 text-gray-500">
                            Carregando filmes...
                        </p>
                    </div>
                </div>
            ) : false ? (
                <div className="text-center text-red-500 p-8">
                    <p>Erro ao carregar filmes: {'error'}</p>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="mt-4"
                    >
                        Tentar novamente
                    </Button>
                </div>
            ) : data?.data.length === 0 ? (
                <div className="text-center p-8">
                    <p className="text-gray-500 mb-4">
                        Nenhum filme encontrado.
                    </p>
                    <Button
                        variant="outline"
                        onClick={limparFiltros}
                    >
                        Limpar filtros
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {data?.data.map((filme) => (
                            <FilmeCard
                                key={filme.id_filme}
                                filme={filme}
                                refetch={refetch}
                                user={{
                                    email: user?.email,
                                    username: user?.username,
                                    isAdmin: user?.isAdmin
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
            <FilmeEditModal
                open={open}
                onOpenChange={setOpen}
            />
        </div>
    );
}
