const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'https://movies.com',
  'https://localhost:3000',
];

export const corsMiddleware =
  (acceptedOrigin = ACCEPTED_ORIGINS) =>
  (req, res, next) => {
    // CORS:
    // res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    console.log(acceptedOrigin);
    const origin = req.header('origin');
    if (acceptedOrigin.includes(origin) || !origin) {
      res.header('Access-Control-Allow-Origin', origin);
      next();
    }
  };

// .options('/movies', (req, res) => {
//   const origin = req.header('origin');
//   if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//     res.header('Access-Control-Allow-Origin', origin);
//     res.header(
//       'Access-Control-Allow-Methods',
//       'GET, POST, PUT, PATCH, DELETE'
//     );
//   }
//   res.status(200);
// })
