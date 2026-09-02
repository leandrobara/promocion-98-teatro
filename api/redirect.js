import { waitUntil } from '@vercel/functions';

const PLATEANET_URL =
  'https://www.plateanet.com/obra/34854?obra=PROMOCION-98&paso=inicio';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    const canal =
      url.searchParams.get('canal') || 'desconocido';

    const origen =
      url.searchParams.get('origen') || 'desconocido';

    const campania =
      url.searchParams.get('campania') || '';

    const referer =
      request.headers.get('referer') || '';

    const userAgent =
      request.headers.get('user-agent') || '';

    // Solo lo usamos para generar la huella.
    // NO se guarda en Google Sheets.
    const forwardedFor =
      request.headers.get('x-forwarded-for') || '';

    const ip =
      forwardedFor.split(',')[0].trim();

    // Ventanas de 10 segundos
    const timeBucket =
      Math.floor(Date.now() / 10000);

    const dedupeKey = await sha256(
      [
        ip,
        userAgent,
        canal,
        origen,
        campania,
        timeBucket
      ].join('|')
    );

    const trackingData = {
      canal,
      origen,
      campania,
      referer,
      userAgent,
      dedupeKey
    };

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

    return Response.redirect(
      PLATEANET_URL,
      302
    );
  }
};