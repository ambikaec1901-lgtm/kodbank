/**
 * Central API base URL config
 * - Local dev:  http://localhost:5000
 * - Production: uses VITE_API_URL environment variable from Vercel
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;
