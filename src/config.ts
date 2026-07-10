export const config = {
  // If VITE_API_BASE_URL is defined in .env, use it. 
  // Otherwise, use the production Vercel domain.
  // Replace 'https://your-production-domain.vercel.app' with the actual domain.
  apiEndpoint: import.meta.env.VITE_API_BASE_URL || 'https://nano-js-bundle.vercel.app/api/chat'
};
