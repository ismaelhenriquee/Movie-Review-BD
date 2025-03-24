'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface User {
    username: string;
    email: string;
    role: string;
}

export default function UserManagementPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.isAdmin) {
            router.push('/home');
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/admin', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const userWithoutUserLogin = response.data.data.filter(
                    (userr: User) => userr.username !== user?.username
                );
                setUsers(userWithoutUserLogin);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast({
                    title: 'Erro',
                    description: 'Não foi possível carregar os usuários',
                    variant: 'destructive'
                });
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [user, router, toast]);

    const handleDeleteUser = async (username: string) => {
        try {
            await axios.delete(`/api/admin?username=${username}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setUsers(users.filter((u) => u.username !== username));

            toast({
                description: 'Usuário excluído com sucesso',
                variant: 'default'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível excluir o usuário',
                variant: 'destructive'
            });
        }
    };

    if (isLoading) {
        return <div className="p-4">Carregando...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                Gerenciamento de Usuários
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>username</TableHead>
                                <TableHead>email</TableHead>
                                <TableHead>Papel</TableHead>
                                <TableHead className="text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.username}>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.role === 'Público'
                                            ? 'Usuário'
                                            : 'Admin'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                handleDeleteUser(user.username)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
