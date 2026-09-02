import { waitUntil } from '@vercel/functions';
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const {
    canal,
    origen,
    campania
  } = req.body || {};

  const userAgent =
    req.headers['user-agent'] || '';

  /*
   * Obtenemos la IP únicamente para deduplicar.
   * NO se envía ni se guarda en Google Sheets.
   */
  const forwardedFor =
    req.headers['x-forwarded-for'] || '';

  const ip =
    forwardedFor.split(',')[0].trim();

  /*
   * La huella identifica:
   *
   * mismo dispositivo/conexión
   * + mismo canal
   * + mismo origen
   * + misma campaña
   */
  const fingerprintSource = [
    ip,
    canal || '',
    origen || '',
    campania || ''
  ].join('|');

  const fingerprint = crypto
    .createHash('sha256')
    .update(fingerprintSource)
    .digest('hex');

  const trackingData = {
    canal: canal || 'desconocido',
    origen: origen || 'desconocido',
    campania: campania || '',
    userAgent,
    fingerprint
  };

  waitUntil(
    fetch(process.env.GOOGLE_SCRIPT_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },

      body: JSON.stringify(
        trackingData
      )

    }).catch(error => {

      console.error(
        'Error registrando clic:',
        error
      );

    })
  );

  return res.status(204).end();
}