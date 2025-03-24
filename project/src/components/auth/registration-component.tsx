'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const registerFormSchema = z
    .object({
        username: z
            .string()
            .min(3, {
                message: 'Nome de usuário deve ter pelo menos 3 caracteres.'
            })
            .max(255),
        email: z
            .string()
            .email({
                message: 'Endereço de email inválido.'
            })
            .max(255),
        senha: z
            .string()
            .min(6, {
                message: 'Senha deve ter pelo menos 6 caracteres.'
            })
            .max(255),
        confirmarSenha: z.string(),
        isAdmin: z.boolean().default(false),
        nome: z.string().max(255).optional(),
        codigo: z.number().optional()
    })
    .refine((data) => data.senha === data.confirmarSenha, {
        message: 'As senhas não coincidem',
        path: ['confirmarSenha']
    })
    .refine((data) => !data.isAdmin || (data.nome && data.codigo), {
        message: 'Nome e código são obrigatórios para administradores',
        path: ['isAdmin']
    });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            username: '',
            email: '',
            senha: '',
            confirmarSenha: '',
            isAdmin: false,
            nome: '',
            codigo: undefined
        }
    });


    const registerUser = async (data: RegisterFormValues) => {
        const response = await axios.post('/api/auth/register', data);
        return response.data;
    };

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            toast({
                description: 'Usuário registrado com sucesso!',
                variant: 'default'
            });

            localStorage.setItem('token', data.token);

            router.push('/home');
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast({
                description: `Erro ao registrar: ${error.response?.data?.message || 'Ocorreu um erro desconhecido'}`,
                variant: 'destructive'
            });
            setIsSubmitting(false);
        }
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsSubmitting(true);
        try {
            await mutation.mutateAsync(data);
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-md">
            <Button
                variant="ghost"
                onClick={() => router.push('/auth/login')}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para início
            </Button>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Criar conta
                    </CardTitle>
                    <CardDescription>
                        Registre-se para acompanhar, avaliar e descobrir novos
                        filmes.
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
                                        <FormDescription>
                                            Este será seu identificador único na
                                            plataforma.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="seu.email@exemplo.com"
                                                type="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Usaremos seu email para comunicações
                                            importantes.
                                        </FormDescription>
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
                                        <FormDescription>
                                            Mínimo de 6 caracteres.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmarSenha"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar senha</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Confirme sua senha"
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
                                        Registrando...
                                    </>
                                ) : (
                                    'Criar conta'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Já tem uma conta?{' '}
                        <Link
                            href="/auth/login"
                            className="text-blue-600 hover:underline"
                        >
                            Faça login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
