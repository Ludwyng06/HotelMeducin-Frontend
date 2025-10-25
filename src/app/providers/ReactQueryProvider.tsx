'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode, useState } from 'react';

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          // Datos se consideran frescos por 5 minutos
          staleTime: 5 * 60 * 1000,
          // Mantener datos en caché por 10 minutos (gcTime en v5)
          gcTime: 10 * 60 * 1000,
          // Reintentar solo 1 vez en caso de error
          retry: 1,
          // No refetch al cambiar de ventana
          refetchOnWindowFocus: false,
          // No refetch automático al reconectar
          refetchOnReconnect: false,
        },
        mutations: {
          // Reintentar mutaciones 1 vez
          retry: 1,
        },
      },
    })
  );
  
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
} 