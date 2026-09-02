const PLATEANET_URL =
  'https://www.plateanet.com/obra/34854?obra=PROMOCION-98&paso=inicio';

export default function handler(req, res) {
  const canal = req.query.canal || 'desconocido';
  const origen = req.query.origen || 'desconocido';
  const campania = req.query.campania || '';

  const data = JSON.stringify({
    canal,
    origen,
    campania
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  res.status(200).send(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <title>Promoción 98</title>
</head>

<body>

<script>
  const trackingData = ${data};

  async function trackAndRedirect() {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trackingData),
        keepalive: true
      });
    } catch (e) {
      // Nunca impedimos que el usuario llegue a Plateanet
    }

    window.location.replace(
      ${JSON.stringify(PLATEANET_URL)}
    );
  }

  trackAndRedirect();
</script>

<noscript>
  <meta
    http-equiv="refresh"
    content="0;url=${PLATEANET_URL}"
  >
</noscript>

</body>
</html>
  `);
}