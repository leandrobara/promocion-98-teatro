import { waitUntil } from '@vercel/functions';

const PLATEANET_URL =
  'https://www.plateanet.com/obra/34854?obra=PROMOCION-98&paso=inicio';

export default {
  fetch(request) {
    const url = new URL(request.url);

    // Atribución definida por nosotros
    const canal = url.searchParams.get('canal') || 'desconocido';
    const origen = url.searchParams.get('origen') || 'desconocido';
    const campania = url.searchParams.get('campania') || '';

    // Información adicional enviada por el navegador
    const referer = request.headers.get('referer') || '';
    const userAgent = request.headers.get('user-agent') || '';

    const trackingData = {
      canal,
      origen,
      campania,
      referer,
      userAgent
    };

    // Registramos el clic sin hacer esperar al usuario
    console.log(
      'GOOGLE_SCRIPT_URL:',
      process.env.GOOGLE_SCRIPT_URL
    );

    waitUntil(
      fetch(process.env.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(trackingData)
      }).catch(error => {
        console.error('Error registrando clic:', error);
      })
    );

    // Redirección inmediata a Plateanet
    return Response.redirect(PLATEANET_URL, 302);
  }
};
