"use client"
import { useState, useEffect } from 'react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';

export function FilmeGrid({
    user
}: {
    user: {
        username: string;
        email: string;
        ID_USUARIO: number;
        senha: string;
    };
}) {
    const [filmes, setFilmes] = useState<
        {
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
        }[]
    >([
        {
            ID_FILME: 1,
            NOME: 'Exemplo de Filme',
            ANO: 2023,
            GENERO: 'Ação',
            NOTA_AGREGADA: 8.5,
            IDIOMA: 'Inglês',
            DIRETOR: 'John Doe',
            DURACAO: 120,
            SINOPSE: 'Sinopse do filme',
            Tags: [{ TAG: 'Tag1' }, { TAG: 'Tag2' }]
            
        }
    ]);
    const [loading, setLoading] = useState(false);
    //const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        genero: '',
        anoMin: '',
        anoMax: '',
        notaMin: 0,
        idioma: '',
        diretor: '',
        mostrarApenas: {
            assistidos: false,
            watchlist: false,
            favoritos: false
        }
    });

    // useEffect(() => {
    //     const fetchFilmes = async () => {
    //         setLoading(true);
    //       //  setError(null);

    //         try {
    //             // Construir URL com todos os parâmetros de filtro
    //             let url = `/api/filmes?page=${page}&limit=12`;

    //             if (searchTerm) {
    //                 url += `&search=${encodeURIComponent(searchTerm)}`;
    //             }

    //             if (filters.genero) {
    //                 url += `&genero=${encodeURIComponent(filters.genero)}`;
    //             }

    //             if (filters.anoMin) {
    //                 url += `&anoMin=${filters.anoMin}`;
    //             }

    //             if (filters.anoMax) {
    //                 url += `&anoMax=${filters.anoMax}`;
    //             }

    //             if (filters.notaMin > 0) {
    //                 url += `&notaMin=${filters.notaMin}`;
    //             }

    //             if (filters.idioma) {
    //                 url += `&idioma=${encodeURIComponent(filters.idioma)}`;
    //             }

    //             if (filters.diretor) {
    //                 url += `&diretor=${encodeURIComponent(filters.diretor)}`;
    //             }

    //             // Adicionar filtros de usuário se estiver logado
    //             if (user) {
    //                 if (filters.mostrarApenas.assistidos) {
    //                     url += '&assistidos=true';
    //                 }

    //                 if (filters.mostrarApenas.watchlist) {
    //                     url += '&watchlist=true';
    //                 }

    //                 if (filters.mostrarApenas.favoritos) {
    //                     url += '&favoritos=true';
    //                 }
    //             }

    //             // Fazer a requisição
    //             const headers = user
    //                 ? {
    //                       Authorization: `Bearer ${localStorage.getItem('token')}`
    //                   }
    //                 : {};

    //             // const response = await fetch(url, { headers });

    //             // if (!response.ok) {
    //             //     throw new Error('Falha ao buscar filmes');
    //             // }

    //             // const data = await response.json();

    //             setFilmes([
    //                 {
    //                     ID_FILME: 1,
    //                     TITULO: 'Exemplo de Filme',
    //                     ANO: 2023,
    //                     GENERO: 'Ação',
    //                     NOTA: 8.5,
    //                     IDIOMA: 'Inglês',
    //                     DIRETOR: 'John Doe',
    //                     ASSISTIDO: false
    //                 },
    //                 {
    //                     ID_FILME: 2,
    //                     TITULO: 'Outro Filme',
    //                     ANO: 2022,
    //                     GENERO: 'Comédia',
    //                     NOTA: 7.0,
    //                     IDIOMA: 'Espanhol',
    //                     DIRETOR: 'Jane Doe',
    //                     ASSISTIDO: true
    //                 }
    //             ]);
    //             setTotalPages(5);
    //         } catch (err) {
    //            // setError(err?.message);
    //            console.log(err);
    //             setFilmes([]);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchFilmes();
    // }, [page, searchTerm, filters, user]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset para a primeira página ao buscar
    };

    const handleFilterChange = (
        key: string,
        value: string | number | boolean
    ) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value
        }));
        setPage(1); // Reset para a primeira página ao filtrar
    };

    const handleMostrarApenasChange = (
        key: keyof typeof filters.mostrarApenas,
        checked: boolean
    ) => {
        setFilters((prev) => ({
            ...prev,
            mostrarApenas: {
                ...prev.mostrarApenas,
                [key]: checked
            }
        }));
        setPage(1); // Reset para a primeira página ao filtrar
    };

    const limparFiltros = () => {
        setFilters({
            genero: '',
            anoMin: '',
            anoMax: '',
            notaMin: 0,
            idioma: '',
            diretor: '',
            mostrarApenas: {
                assistidos: false,
                watchlist: false,
                favoritos: false
            }
        });
        setSearchTerm('');
        setPage(1);
    };

    // Lista de gêneros para o filtro
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

    // Lista de idiomas para o filtro
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
                                        <SelectItem value="">
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
                                        <SelectItem value="">
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

                            {user && (
                                <div className="space-y-2">
                                    <Label className="text-base">
                                        Mostrar apenas
                                    </Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="assistidos"
                                                checked={
                                                    filters.mostrarApenas
                                                        .assistidos
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleMostrarApenasChange(
                                                        'assistidos',
                                                        !!checked
                                                    )
                                                }
                                            />
                                            <Label htmlFor="assistidos">
                                                Filmes assistidos
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="watchlist"
                                                checked={
                                                    filters.mostrarApenas
                                                        .watchlist
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleMostrarApenasChange(
                                                        'watchlist',
                                                        !!checked
                                                    )
                                                }
                                            />
                                            <Label htmlFor="watchlist">
                                                Minha watchlist
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="favoritos"
                                                checked={
                                                    filters.mostrarApenas
                                                        .favoritos
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleMostrarApenasChange(
                                                        'favoritos',
                                                        !!checked
                                                    )
                                                }
                                            />
                                            <Label htmlFor="favoritos">
                                                Meus favoritos
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={limparFiltros}
                                variant="outline"
                                className="w-full"
                            >
                                Limpar filtros
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {loading ? (
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
            ) : filmes.length === 0 ? (
                <div className="text-center p-8">
                    <p className="text-gray-500 mb-4">
                        Nenhum filme encontrado para os filtros selecionados.
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
                        {filmes.map((filme) => (
                            <FilmeCard
                                key={filme.ID_FILME}
                                filme={filme}
                                user={user}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            setPage((page) =>
                                                Math.max(page - 1, 1)
                                            )
                                        }
                                    />
                                </PaginationItem>

                                {Array.from(
                                    { length: Math.min(totalPages, 5) },
                                    (_, i) => {
                                        // Mostrar no máximo 5 páginas, centralizadas na página atual
                                        let pageToShow;
                                        if (totalPages <= 5) {
                                            pageToShow = i + 1;
                                        } else if (page <= 3) {
                                            pageToShow = i + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageToShow = totalPages - 4 + i;
                                        } else {
                                            pageToShow = page - 2 + i;
                                        }

                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    isActive={
                                                        pageToShow === page
                                                    }
                                                    onClick={() =>
                                                        setPage(pageToShow)
                                                    }
                                                >
                                                    {pageToShow}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            setPage((page) =>
                                                Math.min(page + 1, totalPages)
                                            )
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}
        </div>
    );
}
