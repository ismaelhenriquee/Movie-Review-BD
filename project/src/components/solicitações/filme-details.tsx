'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

interface fetchFilmeResponse {
    nome: string;
    ano: number;
    ID_SOLICITACAO: number;
    duracao: number;
    Tags: { TAG: string }[];
    genero: string;
    sinopse: string;
    diretor: string;
    idioma: string;
    IMAGEM: string;
}
export function SolicitationDetails() {
    const { user } = useAuth();

    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();

    async function fetchSolicitacion(): Promise<fetchFilmeResponse> {
        const { data } = await axios.get(`/api/solicitacoes/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        console.log(data, '💜💜');
        return data;
    }
    async function aproveSolicitacion(): Promise<void> {
        await axios.post(
            `/api/solicitacoes/${id}`,
            {
                adminUsername: user?.username
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
    }

    async function rejectSolicitacion(): Promise<void> {
        await axios.delete(`/api/solicitacoes/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }
    const mutationAprove = useMutation({
        mutationFn: aproveSolicitacion,
        onSuccess: () => {
            toast({
                title: 'Solicitação aprovada com sucesso!',
                description: 'O filme foi adicionado ao catálogo.',
                variant: 'default'
            });
            router.push('/admin');
        },
        onError: () => {
            toast({
                title: 'Erro ao aprovar a solicitação',
                variant: 'destructive'
            });
        }
    });
    const mutationReject = useMutation({
        mutationFn: rejectSolicitacion,
        onSuccess: () => {
            toast({
                title: 'Solicitação aprovada com sucesso!',
                variant: 'default'
            });
            router.push('/admin');
        },
        onError: () => {
            toast({
                title: 'Erro ao aprovar a solicitação',
                variant: 'destructive'
            });
        }
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ['solicitation', id],
        queryFn: fetchSolicitacion,
        enabled: !!id
    });

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
                    Erro ao carregar os detalhes da solicitação
                </p>
                <Button onClick={() => router.push('/admin')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="col-span-1">
                    <div className="bg-gray-200 w-full h-96 rounded-lg mb-4">
                        <img
                            src={`/api/placeholder/400/600?text=${encodeURIComponent(data?.nome || '')}`}
                            alt={data?.nome}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <dt className="text-sm text-gray-500">sinopse</dt>
                        <dd>{data?.sinopse}</dd>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="flex items-start justify-between mb-2 flex-col gap-2">
                        {user && user.isAdmin && (
                            <div className="flex items-center gap-2 w-full">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="ml-auto "
                                    onClick={() => mutationAprove.mutate()}
                                    disabled={mutationAprove.isPending}
                                >
                                    Aprovar Solicitação
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="ml-auto "
                                    onClick={() => mutationReject.mutate()}
                                    disabled={mutationReject.isPending}
                                >
                                    Rejeitar Solicitação
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex items-center mt-1 flex-col w-full">
                                <h3 className="text-lg font-semibold mb-2">
                                    Informações do Usuário
                                </h3>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div>
                                        <dt className="text-sm text-gray-500">
                                            nome
                                        </dt>
                                        <dd>{user?.username}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">
                                            Email
                                        </dt>
                                        <dd>{user?.email}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <Tabs
                        defaultValue="solicitation"
                        className="w-full"
                    >
                        <h3 className="text-lg font-semibold ml-auto mr-auto my-4 text-center">
                            Informações do Filme
                        </h3>
                        <TabsList className="mb-4">
                            <TabsTrigger value="solicitation">
                                Solicitação
                            </TabsTrigger>
                            <TabsTrigger value="elenco">Elenco</TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="solicitation"
                            className="space-y-6"
                        >
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        nome
                                    </dt>
                                    <dd>{data?.nome}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        diretor
                                    </dt>
                                    <dd>{data?.diretor}</dd>
                                </div>

                                <div>
                                    <dt className="text-sm text-gray-500">
                                        ano
                                    </dt>
                                    <dd>{data?.ano}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        Duração
                                    </dt>
                                    <dd>
                                        {Math.floor((data?.duracao || 0) / 60)}h{' '}
                                        {(data?.duracao || 0) % 60}
                                        min
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        idioma
                                    </dt>
                                    <dd>{data?.idioma}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        Gênero
                                    </dt>
                                    <dd>{data?.genero}</dd>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <dt className="text-sm text-gray-500">
                                        Tags
                                    </dt>
                                    <dd className="flex flex-wrap gap-1 mt-1">
                                        {data?.Tags &&
                                            data?.Tags.map((tag) => (
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
                                                <AvatarImage
                                                    src={`/api/placeholder/80/80?text=${encodeURIComponent(data?.diretor[0] || '')}`}
                                                    alt={
                                                        data?.diretor ||
                                                        ''.diretor
                                                    }
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                                <AvatarFallback>
                                                    {data?.diretor
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="font-semibold text-center">
                                                {data?.diretor}
                                            </div>
                                            <div className="text-gray-500 text-sm text-center">
                                                diretor
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
