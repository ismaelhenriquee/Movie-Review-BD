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
        ID_FILME: number;
        USERNAME: string;
        NOTA: number;
        DESCRICAO: string;
    };
    onSubmit: (data: {
        ID_FILME: number;
        USERNAME: string;
        NOTA: number;
        DESCRICAO: string;
    }) => Promise<void>;
}) {
    const [nota, setNota] = useState(avaliacao ? avaliacao.NOTA : 0);
    const [descricao, setDescricao] = useState(
        avaliacao ? avaliacao.DESCRICAO : ''
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (avaliacao) {
            setNota(avaliacao.NOTA);
            setDescricao(avaliacao.DESCRICAO);
        }
    }, [avaliacao]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onSubmit({
                ID_FILME: filmeId,
                NOTA: nota,
                DESCRICAO: descricao,
                USERNAME: avaliacao ? avaliacao.USERNAME : ''
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStarClick = (value: number) => {
        setNota(value);
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
                        onChange={(e) => setNota(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                <Textarea
                    placeholder="Escreva sua avaliação (opcional)"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
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
