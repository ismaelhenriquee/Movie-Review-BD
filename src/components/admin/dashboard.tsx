'use client';
import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Film,
    Users,
    Star,
    Clock,
    Heart,
    FileText,
    Plus,
    ChevronRight
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';

export function AdminDashboard() {
    const [stats, setStats] = useState({
        totalFilmes: 0,
        totalUsuarios: 0,
        totalAvaliacoes: 0,
        totalSolicitacoes: 0
    });
    const [recenteSolicitacoes, setRecenteSolicitacoes] = useState<
        {
            ID_SOLICITACAO: number;
            NOME: string;
            ANO: number;
            GENERO: string;
            USERNAME: string;
        }[]
    >([{
        ID_SOLICITACAO: 1,
        NOME: 'Exemplo de Filme',
        ANO: 2023,
        GENERO: 'Ação',
        USERNAME: 'usuario_exemplo'
        
    }]);
    const [recenteFilmes, setRecenteFilmes] = useState<
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
    const [error, setError] = useState(null);

    const router = useRouter();
    // useEffect(() => {
    //     const fetchDashboardData = async () => {
    //         setLoading(true);
    //         setError(null);

    //         try {
    //             // Buscar estatísticas
    //             const statsResponse = await fetch('/api/admin/stats', {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem('token')}`
    //                 }
    //             });

    //             if (!statsResponse.ok) {
    //                 throw new Error(
    //                     'Não foi possível carregar as estatísticas'
    //                 );
    //             }

    //             const statsData = await statsResponse.json();
    //             setStats(statsData);

    //             // Buscar solicitações recentes
    //             const solicitacoesResponse = await fetch(
    //                 '/api/admin/solicitacoes/recentes',
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${localStorage.getItem('token')}`
    //                     }
    //                 }
    //             );

    //             if (!solicitacoesResponse.ok) {
    //                 throw new Error(
    //                     'Não foi possível carregar as solicitações recentes'
    //                 );
    //             }

    //             const solicitacoesData = await solicitacoesResponse.json();
    //             setRecenteSolicitacoes(solicitacoesData);

    //             // Buscar filmes recentes
    //             const filmesResponse = await fetch(
    //                 '/api/admin/filmes/recentes',
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${localStorage.getItem('token')}`
    //                     }
    //                 }
    //             );

    //             if (!filmesResponse.ok) {
    //                 throw new Error(
    //                     'Não foi possível carregar os filmes recentes'
    //                 );
    //             }

    //             const filmesData = await filmesResponse.json();
    //             setRecenteFilmes(filmesData);
    //         } catch (err) {
    //             setError((err as Error).message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchDashboardData();
    // }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-gray-500">
                        Carregando dashboard...
                    </p>
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
                    <p className="block sm:inline">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard Admin</h1>
                <Button onClick={() => router.push('/admin/filmes/novo')}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Filme
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">
                            Total de Filmes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <Film className="h-8 w-8 text-primary mr-3" />
                            <span className="text-3xl font-bold">
                                {stats.totalFilmes}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">
                            Total de Usuários
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-primary mr-3" />
                            <span className="text-3xl font-bold">
                                {stats.totalUsuarios}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">
                            Total de Avaliações
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <Star className="h-8 w-8 text-primary mr-3" />
                            <span className="text-3xl font-bold">
                                {stats.totalAvaliacoes}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">
                            Solicitações Pendentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center">
                            <FileText className="h-8 w-8 text-primary mr-3" />
                            <span className="text-3xl font-bold">
                                {stats.totalSolicitacoes}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs
                defaultValue="solicitacoes"
                className="mb-8"
            >
                <TabsList className="mb-4">
                    <TabsTrigger value="solicitacoes">
                        Solicitações Recentes
                    </TabsTrigger>
                    <TabsTrigger value="filmes">Filmes Recentes</TabsTrigger>
                </TabsList>

                <TabsContent value="solicitacoes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Solicitações de Filmes</CardTitle>
                            <CardDescription>
                                Solicitações mais recentes feitas pelos usuários
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Ano</TableHead>
                                        <TableHead>Gênero</TableHead>
                                        <TableHead>Solicitante</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recenteSolicitacoes.length > 0 ? (
                                        recenteSolicitacoes.map(
                                            (solicitacao) => (
                                                <TableRow
                                                    key={
                                                        solicitacao.ID_SOLICITACAO
                                                    }
                                                >
                                                    <TableCell className="font-medium">
                                                        {
                                                            solicitacao.ID_SOLICITACAO
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {solicitacao.NOME}
                                                    </TableCell>
                                                    <TableCell>
                                                        {solicitacao.ANO}
                                                    </TableCell>
                                                    <TableCell>
                                                        {solicitacao.GENERO}
                                                    </TableCell>
                                                    <TableCell>
                                                        {solicitacao.USERNAME}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/admin/solicitacoes/${solicitacao.ID_SOLICITACAO}`
                                                                )
                                                            }
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-4 text-gray-500"
                                            >
                                                Nenhuma solicitação encontrada
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <div className="mt-4 flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.push('/admin/solicitacoes')
                                    }
                                >
                                    Ver Todas
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="filmes">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Filmes Adicionados Recentemente
                            </CardTitle>
                            <CardDescription>
                                Últimos filmes adicionados ao sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Ano</TableHead>
                                        <TableHead>Gênero</TableHead>
                                        <TableHead>Nota</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recenteFilmes.length > 0 ? (
                                        recenteFilmes.map((filme) => (
                                            <TableRow key={filme.ID_FILME}>
                                                <TableCell className="font-medium">
                                                    {filme.ID_FILME}
                                                </TableCell>
                                                <TableCell>
                                                    {filme.NOME}
                                                </TableCell>
                                                <TableCell>
                                                    {filme.ANO}
                                                </TableCell>
                                                <TableCell>
                                                    {filme.GENERO}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                                        {filme.NOTA_AGREGADA.toFixed(
                                                            1
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.push(
                                                                `/admin/filmes/${filme.ID_FILME}`
                                                            )
                                                        }
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-4 text-gray-500"
                                            >
                                                Nenhum filme encontrado
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <div className="mt-4 flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/admin/filmes')}
                                >
                                    Ver Todos
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Ações Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() =>
                                    router.push('/admin/solicitacoes')
                                }
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Gerenciar Solicitações
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push('/admin/filmes')}
                            >
                                <Film className="mr-2 h-4 w-4" />
                                Gerenciar Filmes
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push('/admin/usuarios')}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Gerenciar Usuários
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push('/admin/avaliacoes')}
                            >
                                <Star className="mr-2 h-4 w-4" />
                                Estatísticas de Filmes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
