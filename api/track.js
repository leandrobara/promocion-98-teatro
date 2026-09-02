import { waitUntil } from '@vercel/functions';

export default function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const {
    canal,
    origen,
    campania
  } = req.body;

  const referer =
    req.headers.referer || '';

  const userAgent =
    req.headers['user-agent'] || '';

  const trackingData = {
    canal: canal || 'desconocido',
    origen: origen || 'desconocido',
    campania: campania || '',
    referer,
    userAgent
  };

  waitUntil(
    fetch(process.env.GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(trackingData)
    }).catch(error => {
      console.error(
        'Error registrando clic:',
        error
      );
    })
  );

  return res.status(204).end();
}