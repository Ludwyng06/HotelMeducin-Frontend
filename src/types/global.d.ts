// Tipos globales para el frontend

// Evitar errores de tipos faltantes que no son necesarios en el frontend
declare module 'aria-query' {
  export const elementRoles: Map<string, Set<string>>;
  export const roles: Map<string, any>;
}

declare module 'jsdom' {
  export const JSDOM: any;
}

declare module 'mysql' {
  export const createConnection: any;
}

declare module 'pg' {
  export const Client: any;
  export const Pool: any;
}

declare module 'pg-pool' {
  export const Pool: any;
}

declare module 'react-reconciler' {
  export default any;
}

declare module 'shimmer' {
  export const shimmer: any;
}

declare module 'tedious' {
  export const Connection: any;
}

declare module 'testing-library__jest-dom' {
  export const toBeInTheDocument: any;
}

declare module 'tough-cookie' {
  export const CookieJar: any;
}

// Tipos específicos para Next.js que pueden faltar
declare global {
  interface Window {
    // Agregar cualquier propiedad global del window que uses
  }
}

export {};
