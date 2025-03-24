'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

interface FilmeFormData {
    NOME: string;
    ANO: number;
    DURACAO: number;
    GENERO: string;
    SINOPSE: string;
    DIRETOR: string;
    IDIOMA: string;
    IMAGEM: string;
    TAGS: string[];
}

interface FilmeEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filmeId?: number;
    onSuccess?: () => void;
}

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
    'Terror',
    'Mistério',
    'Romance',
    'Suspense'
];

const idiomas = [
    'Português',
    'Inglês',
    'Espanhol',
    'Francês',
    'Alemão',
    'Italiano',
    'Japonês',
    'Coreano',
    'Mandarim',
    'Russo'
];

export function FilmeEditModal({
    open,
    onOpenChange,
    filmeId,
    onSuccess
}: FilmeEditModalProps) {
    const { toast } = useToast();
    const [novaTag, setNovaTag] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const isEditing = !!filmeId;

    const {
        register,
        reset,
        setValue,
        formState: { errors },
        handleSubmit
    } = useForm<FilmeFormData>({
        defaultValues: {
            NOME: '',
            ANO: new Date().getFullYear(),
            DURACAO: 90,
            GENERO: 'Drama',
            SINOPSE: '',
            DIRETOR: '',
            IDIOMA: 'Inglês',
            IMAGEM: '',
            TAGS: []
        }
    });

    useEffect(() => {
        if (isEditing && open) {
            fetchFilmeData();
        } else if (!isEditing && open) {
            reset();
            setTags([]);
        }
    }, [isEditing, open, filmeId]);

    const fetchFilmeData = async () => {
        try {
            const { data } = await axios.get(`/api/filmes/${filmeId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const filme = data.filme;
            setValue('NOME', filme.NOME);
            setValue('ANO', filme.ANO);
            setValue('DURACAO', filme.DURACAO);
            setValue('GENERO', filme.GENERO);
            setValue('SINOPSE', filme.SINOPSE);
            setValue('DIRETOR', filme.DIRETOR);
            setValue('IDIOMA', filme.IDIOMA);
            setValue('IMAGEM', filme.IMAGEM);

            const filmeTags = filme.Tags.map((tag: { TAG: string }) => tag.TAG);
            setTags(filmeTags);
        } catch (error) {
            console.error('Erro ao buscar dados do filme:', error);
            toast({
                description: 'Erro ao buscar dados do filme',
                variant: 'destructive'
            });
        }
    };

    const saveFilme = async (data: FilmeFormData) => {
        const filmeData = {
            ...data,
            TAGS: tags
        };

        if (isEditing) {
            await axios.patch(`/api/filmes/${filmeId}`, filmeData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
        } else {
            await axios.post('/api/filmes', filmeData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
        }
    };

    const mutation = useMutation({
        mutationFn: saveFilme,
        onSuccess: () => {
            toast({
                description: `Filme ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
                variant: 'default'
            });
            onSuccess?.();
            onOpenChange(false);
        },
        onError: (error) => {
            console.error('Erro ao salvar filme:', error);
            toast({
                description: `Erro ao ${isEditing ? 'atualizar' : 'criar'} filme.`,
                variant: 'destructive'
            });
        }
    });

    const onSubmit = (data: FilmeFormData) => {
        mutation.mutate(data);
    };

    const addTag = () => {
        if (novaTag.trim() !== '' && !tags.includes(novaTag.trim())) {
            setTags([...tags, novaTag.trim()]);
            setNovaTag('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Filme' : 'Adicionar Novo Filme'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Edite as informações do filme abaixo.'
                            : 'Preencha os detalhes do novo filme.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label htmlFor="nome">Nome</Label>
                            <Input
                                id="nome"
                                {...register('NOME', {
                                    required: 'Nome é obrigatório'
                                })}
                                placeholder="Nome do filme"
                                className="mt-1"
                            />
                            {errors.NOME && (
                                <p className="text-red-500 text-sm">
                                    {errors.NOME.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="ano">Ano</Label>
                                <Input
                                    id="ano"
                                    type="number"
                                    {...register('ANO', {
                                        required: 'Ano é obrigatório',
                                        min: {
                                            value: 1888,
                                            message: 'Ano inválido'
                                        },
                                        max: {
                                            value: new Date().getFullYear() + 5,
                                            message: 'Ano inválido'
                                        }
                                    })}
                                    className="mt-1"
                                />
                                {errors.ANO && (
                                    <p className="text-red-500 text-sm">
                                        {errors.ANO.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="duracao">
                                    Duração (minutos)
                                </Label>
                                <Input
                                    id="duracao"
                                    type="number"
                                    {...register('DURACAO', {
                                        required: 'Duração é obrigatória',
                                        min: {
                                            value: 1,
                                            message: 'Duração inválida'
                                        }
                                    })}
                                    className="mt-1"
                                />
                                {errors.DURACAO && (
                                    <p className="text-red-500 text-sm">
                                        {errors.DURACAO.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="genero">Gênero</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue('GENERO', value)
                                    }
                                    defaultValue="Drama"
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Selecione um gênero" />
                                    </SelectTrigger>
                                    <SelectContent>
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

                            <div>
                                <Label htmlFor="idioma">Idioma</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setValue('IDIOMA', value)
                                    }
                                    defaultValue="Inglês"
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Selecione um idioma" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                        </div>

                        <div>
                            <Label htmlFor="diretor">Diretor</Label>
                            <Input
                                id="diretor"
                                {...register('DIRETOR', {
                                    required: 'Diretor é obrigatório'
                                })}
                                placeholder="Nome do diretor"
                                className="mt-1"
                            />
                            {errors.DIRETOR && (
                                <p className="text-red-500 text-sm">
                                    {errors.DIRETOR.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="sinopse">Sinopse</Label>
                            <Textarea
                                id="sinopse"
                                {...register('SINOPSE', {
                                    required: 'Sinopse é obrigatória'
                                })}
                                placeholder="Breve descrição do filme"
                                className="mt-1"
                                rows={4}
                            />
                            {errors.SINOPSE && (
                                <p className="text-red-500 text-sm">
                                    {errors.SINOPSE.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="imagem">URL da Imagem</Label>
                            <Input
                                id="imagem"
                                {...register('IMAGEM', {
                                    required: 'URL da imagem é obrigatória'
                                })}
                                placeholder="https://exemplo.com/imagem.jpg"
                                className="mt-1"
                            />
                            {errors.IMAGEM && (
                                <p className="text-red-500 text-sm">
                                    {errors.IMAGEM.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="tags">Tags</Label>
                            <div className="flex mt-1">
                                <Input
                                    id="tags"
                                    value={novaTag}
                                    onChange={(e) => setNovaTag(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Adicionar tag"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    onClick={addTag}
                                    className="ml-2"
                                >
                                    Adicionar
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending
                                ? 'Salvando...'
                                : isEditing
                                  ? 'Salvar alterações'
                                  : 'Criar filme'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
