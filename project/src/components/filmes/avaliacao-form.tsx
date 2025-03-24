'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export function AvaliacaoForm({
    filmeId,
    avaliacao,
    onSubmit
}: {
    filmeId: number;
    avaliacao?: {
        id_filme: number;
        username: string;
        nota: number;
        descricao: string;
    };
    onSubmit: (data: {
        id_filme: number;
        username: string;
        nota: number;
        descricao: string;
    }) => Promise<void>;
}) {
    const [nota, setnota] = useState(avaliacao ? avaliacao.nota : 0);
    const [descricao, setdescricao] = useState(
        avaliacao ? avaliacao.descricao : ''
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (avaliacao) {
            setnota(avaliacao.nota);
            setdescricao(avaliacao.descricao);
        }
    }, [avaliacao]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onSubmit({
                id_filme: filmeId,
                nota: nota,
                descricao: descricao,
                username: avaliacao ? avaliacao.username : ''
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStarClick = (value: number) => {
        setnota(value);
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 10; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    className={`h-8 w-8 ${
                        i <= nota ? 'text-yellow-400' : 'text-gray-300'
                    } focus:outline-none`}
                    onClick={() => handleStarClick(i)}
                >
                    ★
                </button>
            );
        }
        return stars;
    };

    return (
        <Card className="p-4">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <div className="flex items-center mb-2">
                        <div className="flex">{renderStars()}</div>
                        <span className="ml-2 font-semibold">{nota}/10</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={nota}
                        onChange={(e) => setnota(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                <Textarea
                    placeholder="Escreva sua avaliação (opcional)"
                    value={descricao}
                    onChange={(e) => setdescricao(e.target.value)}
                    className="mb-4"
                    rows={5}
                />

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || nota === 0}
                >
                    {isSubmitting
                        ? 'Salvando...'
                        : avaliacao
                          ? 'Atualizar avaliação'
                          : 'Enviar avaliação'}
                </Button>
            </form>
        </Card>
    );
}
