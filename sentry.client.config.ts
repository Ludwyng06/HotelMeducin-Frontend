import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://3c28bbcad11d3dd63b854ab6fc1d115a@o4509464185274368.ingest.us.sentry.io/4509464369102848",
  
  // Configuración optimizada para reducir problemas con OpenTelemetry
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configuración para evitar problemas con OpenTelemetry en el cliente
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
  
  // Configuración de debug
  debug: false,
}); 