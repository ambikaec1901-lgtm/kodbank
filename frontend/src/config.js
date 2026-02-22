/**
 * Central API base URL config
 *
 * - Local dev:  http://localhost:5000  (Express server on port 5000)
 * - Vercel:     '' (empty string = same origin, /api/* routes
 *               are handled by the Vercel serverless function)
 */
const API_BASE = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default API_BASE;
