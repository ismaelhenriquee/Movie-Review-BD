'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";

export function Navbar({ user, isAdmin }: { user: {
    username: string;
    email: string;
    ID_USUARIO: number;
    senha: string;
}; isAdmin: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className="text-xl font-bold" href="/">
                FilmCatalog
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="p-2" href="/filmes">
                Filmes
              </NavigationMenuLink>
            </NavigationMenuItem>
            {user && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Minha Conta</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                      <NavigationMenuLink className="block p-2 hover:bg-gray-100 rounded" href="/user/perfil">
                        Perfil
                      </NavigationMenuLink>
                      <NavigationMenuLink className="block p-2 hover:bg-gray-100 rounded" href="/user/historico">
                        Assistidos
                      </NavigationMenuLink>
                      <NavigationMenuLink className="block p-2 hover:bg-gray-100 rounded" href="/user/watchlist">
                        Quero Assistir
                      </NavigationMenuLink>
                      <NavigationMenuLink className="block p-2 hover:bg-gray-100 rounded" href="/user/favoritos">
                        Favoritos
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </>
            )}
            {isAdmin && (
              <NavigationMenuItem>
                <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-48 p-2">
                    <NavigationMenuLink className="block p-2 hover:bg-gray-100 rounded" href="/admin/dashboard">
                      Dashboard
                    </NavigationMenuLink>
                    <NavigationMenuLink className="block p-2 hover:bg-gray-100 rounded" href="/admin/solicitacoes">
                      Solicitações
                    </NavigationMenuLink>
                    <NavigationMenuLink className="block p-2 hover:bg-gray-100 rounded" href="/admin/membros">
                      Membros
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar filmes..."
              className="pl-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`} alt={user.username} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/login">Login</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/auth/register">Cadastrar</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}