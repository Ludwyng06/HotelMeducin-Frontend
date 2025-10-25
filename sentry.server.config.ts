// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://3c28bbcad11d3dd63b854ab6fc1d115a@o4509464185274368.ingest.us.sentry.io/4509464369102848",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Configuración para reducir problemas con OpenTelemetry
  integrations: [
    // Deshabilitar integraciones problemáticas en desarrollo
    ...(process.env.NODE_ENV === 'production' ? [] : []),
  ],
  
  // Configuración para evitar problemas con módulos dinámicos
  beforeSend(event) {
    // Filtrar eventos problemáticos relacionados con OpenTelemetry
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type?.includes('OpenTelemetry') || error?.value?.includes('OpenTelemetry')) {
        return null;
      }
    }
    return event;
  },
});
