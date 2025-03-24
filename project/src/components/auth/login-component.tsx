'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const loginFormSchema = z.object({
    username: z.string().min(1, { message: 'Nome de usuário é obrigatório' }),
    senha: z.string().min(1, { message: 'Senha é obrigatória' })
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            username: '',
            senha: ''
        }
    });

    const loginUser = async (data: LoginFormValues) => {
        const response = await axios.post('/api/auth/login', data);
        return response.data;
    };

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            toast({
                description: 'Login realizado com sucesso!',
                variant: 'default'
            });

            localStorage.setItem('token', data.token);

            router.push('/home');
        },
        onError: (error: {
            response?: {
                data?: {
                    message?: string;
                };
            };
        }) => {
            toast({
                description: `Erro ao fazer login: ${error.response?.data?.message || 'Credenciais inválidas'}`,
                variant: 'destructive'
            });
            setIsSubmitting(false);
        }
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsSubmitting(true);
        try {
            await mutation.mutateAsync(data);
        } catch (error) {
            console.error('Erro ao fazer login:', error);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-md">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>
                        Entre na sua conta para continuar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome de usuário</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="seu_username"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="senha"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Sua senha"
                                                type="password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Não tem uma conta?{' '}
                        <Link
                            href="/auth/cadastro"
                            className="text-blue-600 hover:underline"
                        >
                            Registre-se
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
