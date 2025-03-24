'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Users, Star, FileText, Plus, ChevronRight } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchDashboardStats = async (): Promise<{
    totalFilmes: number;
    totalUsuarios: number;
    totalAvaliacoes: number;
    totalSolicitacoes: number;
}> => {
    const response = await axios.get('/api/admin/dashboard');
    if (!response) {
        throw new Error('Failed to fetch dashboard stats');
    }
    return response.data;
};

const fetchRecentRequests = async (): Promise<
    {
        ID_SOLICITACAO: number;
        NOME: string;
        ANO: number;
        GENERO: string;
        USERNAME: string;
    }[]
> => {
    const response = await axios.get('/api/admin/solicitacoes/recentes');
    if (!response) {
        throw new Error('Failed to fetch recent requests');
    }
    return response.data;
};

export function AdminDashboard() {
    const router = useRouter();

    const {
        data: statsData,
        isLoading: isStatsLoading,
        error: statsError
    } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: fetchDashboardStats
    });

    const {
        data: requestsData,
        isLoading: isRequestsLoading,
        error: requestsError
    } = useQuery({
        queryKey: ['recentRequests'],
        queryFn: fetchRecentRequests
    });

    const isLoading = isStatsLoading || isRequestsLoading;
    const error = statsError || requestsError;

    const stats = statsData || {
        totalFilmes: 0,
        totalUsuarios: 0,
        totalAvaliacoes: 0,
        totalSolicitacoes: 0
    };

    const recenteSolicitacoes = requestsData || [];

    if (isLoading) {
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
                    <p className="block sm:inline">{error.message}</p>
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
                                recenteSolicitacoes.map((solicitacao) => (
                                    <TableRow key={solicitacao.ID_SOLICITACAO}>
                                        <TableCell className="font-medium">
                                            {solicitacao.ID_SOLICITACAO}
                                        </TableCell>
                                        <TableCell>
                                            {solicitacao.NOME}
                                        </TableCell>
                                        <TableCell>{solicitacao.ANO}</TableCell>
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
                                ))
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
                            onClick={() => router.push('/admin/solicitacoes')}
                        >
                            Ver Todas
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
