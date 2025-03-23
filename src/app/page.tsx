import { WelcomeLink } from '@/components/WelcomeLinks';

import { Book, Github, Globe, Mountain } from 'lucide-react';

export default function WelcomeScreen() {
    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <div className="mx-auto  space-y-8">
                {/* Header */}
                <div className="flex items-center justify-center space-x-3">
                    <Mountain className="h-8 w-8" />
                    <h1 className="text-2xl font-bold">Bem-vindo(a)</h1>
                </div>

                <div className="">
                    {/* Main Actions */}
                    <div className="space-y-6">
                        {/* Quick Links */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">
                                Links Rápidos
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <WelcomeLink
                                    href="https://tailwindcss.com/docs/flex"
                                    className="justify-start space-x-2"
                                    target="_blank"
                                >
                                    <Book className="h-4 w-4" />
                                    <span>Tailwind</span>
                                </WelcomeLink>
                                <WelcomeLink
                                    href="https://github.com/ismaelhenriquee"
                                    className="justify-start space-x-2"
                                    target="_blank"
                                >
                                    <Github className="h-4 w-4" />
                                    <span>GitHub</span>
                                </WelcomeLink>
                                <WelcomeLink
                                    href="https://ui.shadcn.com/docs/components/accordion"
                                    className="justify-start space-x-2"
                                    target="_blank"
                                >
                                    <Globe className="h-4 w-4" />
                                    <span>Shadcn</span>
                                </WelcomeLink>
                       
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
