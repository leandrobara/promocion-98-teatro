const PLATEANET_URL =
  'https://www.plateanet.com/obra/34854?obra=PROMOCION-98&paso=inicio';

export default function handler(req, res) {
  const canal =
    req.query.canal || 'desconocido';

  const origen =
    req.query.origen || 'desconocido';

  const campania =
    req.query.campania || '';

  const trackingData = JSON.stringify({
    canal,
    origen,
    campania
  });

  const plateanetUrl =
    JSON.stringify(PLATEANET_URL);

  res.setHeader(
    'Content-Type',
    'text/html; charset=utf-8'
  );

  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate'
  );

  res.status(200).send(`
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">

  <meta
    name="robots"
    content="noindex,nofollow"
  >

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>Promoción 98</title>
</head>

<body>

<script>
  const trackingData = ${trackingData};

  const PLATEANET_URL = ${plateanetUrl};

  async function trackAndRedirect() {
    try {

      const storageKey =
        'promo98-tracked:' +
        trackingData.canal + ':' +
        trackingData.origen + ':' +
        trackingData.campania;

      const now = Date.now();

      const lastTracked =
        Number(
          sessionStorage.getItem(storageKey) || 0
        );

      /*
       * Si este mismo navegador ya registró
       * este mismo enlace durante los últimos
       * 15 segundos, no volvemos a contarlo.
       */
      const shouldTrack =
        now - lastTracked > 15000;

      if (shouldTrack) {

        /*
         * Lo guardamos ANTES del fetch.
         *
         * De esta manera, si Facebook o el
         * navegador provoca otra ejecución
         * inmediatamente, ya queda bloqueada.
         */
        sessionStorage.setItem(
          storageKey,
          String(now)
        );

        await fetch('/api/track', {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(
            trackingData
          ),

          /*
           * Ayuda a que el request continúe
           * aunque inmediatamente después
           * redirijamos la página.
           */
          keepalive: true
        });
      }

    } catch (error) {

      /*
       * Nunca bloqueamos el acceso
       * a Plateanet por un error
       * de tracking.
       */
      console.error(
        'Error de tracking:',
        error
      );

    } finally {

      window.location.replace(
        PLATEANET_URL
      );
    }
  }

  trackAndRedirect();
</script>

<noscript>
  <p>
    Redirigiendo a Plateanet...
  </p>

  <meta
    http-equiv="refresh"
    content="0;url=${PLATEANET_URL}"
  >
</noscript>

</body>
</html>
  `);
}
