'use client';
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash, Eye, Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchFilmes = async (
  
): Promise<
    {
        ID_FILME: number;
        NOME: string;
        ANO: number;
        DIRETOR: string;
        GENERO: string;
        NOTA_AGREGADA: number;
        IMAGEM: string;
        IsWatched: boolean;
        IsFavorite: boolean;
        IsWatchlist: boolean;
    }[]
> => {
    const response = await axios.get(
        `/api/admin/filmes?genero=${genero}&search=${search}`
    );
    if (!response) {
        throw new Error('Failed to fetch filmes');
    }
    return response.data;
};

const fetchGeneros = async (): Promise<string[]> => {
    const response = await axios.get('/api/admin/filmes/generos');
    if (!response) {
        throw new Error('Failed to fetch generos');
    }
    return response.data;
};

export default function FilmesManagement() {
    const router = useRouter();
    const [generoFilter, setGeneroFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data: filmes,
        isLoading: filmesLoading,
        error: filmesError,
        refetch
    } = useQuery({
        queryKey: ['filmes', generoFilter, searchTerm],
        queryFn: () => fetchFilmes(generoFilter, searchTerm)
    });

    const {
        data: generos,
        isLoading: generosLoading,
        error: generosError
    } = useQuery({
        queryKey: ['generos'],
        queryFn: fetchGeneros
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        refetch();
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este filme?')) {
            try {
                await axios.delete(`/api/admin/filmes/${id}`);
                refetch();
            } catch (error) {
                console.error('Erro ao excluir filme:', error);
            }
        }
    };

    const isLoading = filmesLoading || generosLoading;
    const error = filmesError || generosError;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-gray-500">Carregando filmes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <div
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                >
                    <p className="font-bold">Erro</p>
                    <p className="block sm:inline">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Gerenciamento de Filmes</h1>
                <Button onClick={() => router.push('/admin/filmes/novo')}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Filme
                </Button>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Filtros e Busca</CardTitle>
                    <CardDescription>
                        Filtre e busque por filmes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/3">
                            <Select
                                value={generoFilter}
                                onValueChange={setGeneroFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Gênero" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos os Gêneros
                                    </SelectItem>
                                    {generos &&
                                        generos.map((genero) => (
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
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-1 gap-2"
                        >
                            <Input
                                placeholder="Buscar por título ou diretor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit">
                                <Search className="h-4 w-4 mr-2" />
                                Buscar
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Filmes</CardTitle>
                    <CardDescription>
                        Visualize e gerencie os filmes do catálogo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Ano</TableHead>
                                <TableHead>Diretor</TableHead>
                                <TableHead>Gênero</TableHead>
                                <TableHead>Nota</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filmes && filmes.length > 0 ? (
                                filmes.map((filme) => (
                                    <TableRow key={filme.ID_FILME}>
                                        <TableCell className="font-medium">
                                            {filme.ID_FILME}
                                        </TableCell>
                                        <TableCell>{filme.NOME}</TableCell>
                                        <TableCell>{filme.ANO}</TableCell>
                                        <TableCell>{filme.DIRETOR}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {filme.GENERO}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-10 text-center rounded-md font-medium ${
                                                        filme.NOTA_AGREGADA >= 7
                                                            ? 'bg-green-100 text-green-800'
                                                            : filme.NOTA_AGREGADA >=
                                                                5
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {filme.NOTA_AGREGADA.toFixed(
                                                        1
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/filmes/${filme.ID_FILME}`
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/filmes/${filme.ID_FILME}/editar`
                                                        )
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(
                                                            filme.ID_FILME
                                                        )
                                                    }
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-4 text-gray-500"
                                    >
                                        Nenhum filme encontrado
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
