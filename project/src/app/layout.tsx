import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/navbar';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/lib/react.quey';

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app'
};
const inter = Inter({ subsets: ['latin'], weight: ['400', '700'] });

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
  
    return (
        <html lang="pt-br">
            <body className={`${inter.className}`}>
                <QueryClientProvider client={queryClient}>
                    <Navbar
                        user={{
                            username: 'Lucas',
                            email: 'jj@gmail.com',
                            ID_USUARIO: 1,
                            senha: '123456'
                        }}
                        isAdmin={true}

                    >
                    {children}
                    </Navbar>
                    <Toaster />
                </QueryClientProvider>
            </body>
        </html>
    );
}
