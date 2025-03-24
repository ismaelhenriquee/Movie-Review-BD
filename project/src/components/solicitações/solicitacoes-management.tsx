'use client';
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
import { Check, X, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchSolicitacoes = async (): Promise<{
    solicitacoes: {
        id_solicitacao: number;
        nome: string;
        ano: number;
        genero: string;
        username: string;
        STATUS: string;
    }[];
    total: number;
}> => {
    const response = await axios.get(`/api/solicitacoes`);
    console.log(response.data);
    if (!response) {
        throw new Error('Failed to fetch solicitações');
    }
    return response.data;
};

export default function SolicitacoesManagement() {
    const router = useRouter();

    const {
        data: solicitacoes,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['solicitacoes'],
        queryFn: () => fetchSolicitacoes()
    });

    const handleApprove = async (id: number) => {
        try {
            await axios.post(`/api/admin/solicitacoes/${id}/approve`);
            refetch();
        } catch (error) {
            console.error('Erro ao aprovar solicitação:', error);
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axios.post(`/api/admin/solicitacoes/${id}/reject`);
            refetch();
        } catch (error) {
            console.error('Erro ao rejeitar solicitação:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-gray-500">
                        Carregando solicitações...
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
            <h1 className="text-3xl font-bold mb-8">
                Gerenciamento de Solicitações
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Solicitações de Filmes</CardTitle>
                    <CardDescription>
                        Visualize e gerencie as solicitações de filmes dos
                        usuários
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>ano</TableHead>
                                <TableHead>Gênero</TableHead>
                                <TableHead>Solicitante</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {solicitacoes &&
                            solicitacoes.solicitacoes.length > 0 ? (
                                solicitacoes.solicitacoes.map((solicitacao) => (
                                    <TableRow key={solicitacao.id_solicitacao}>
                                        <TableCell className="font-medium">
                                            {solicitacao.id_solicitacao}
                                        </TableCell>
                                        <TableCell>
                                            {solicitacao.nome}
                                        </TableCell>
                                        <TableCell>{solicitacao.ano}</TableCell>
                                        <TableCell>
                                            {solicitacao.genero}
                                        </TableCell>
                                        <TableCell>
                                            {solicitacao.username}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                    solicitacao.STATUS ===
                                                    'approved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : solicitacao.STATUS ===
                                                            'rejected'
                                                          ? 'bg-red-100 text-red-800'
                                                          : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {solicitacao.STATUS ===
                                                'approved'
                                                    ? 'Aprovado'
                                                    : solicitacao.STATUS ===
                                                        'rejected'
                                                      ? 'Rejeitado'
                                                      : 'Pendente'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(
                                                            `/admin/solicitacao/${solicitacao.id_solicitacao}`
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {solicitacao.STATUS ===
                                                    'pending' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-green-600 hover:text-green-800 hover:bg-green-100"
                                                            onClick={() =>
                                                                handleApprove(
                                                                    solicitacao.id_solicitacao
                                                                )
                                                            }
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                                            onClick={() =>
                                                                handleReject(
                                                                    solicitacao.id_solicitacao
                                                                )
                                                            }
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
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
                                        Nenhuma solicitação encontrada
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
