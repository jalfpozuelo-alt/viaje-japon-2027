import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig(() => {
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
  return {
    base: process.env.GITHUB_ACTIONS && repository ? `/${repository}/` : '/',
    plugins:[react(),VitePWA({registerType:'autoUpdate',manifest:{name:'Japón · un viaje para recordar',short_name:'Japón 2027',description:'Agenda personal de viaje · mayo 2027',theme_color:'#a63128',background_color:'#f6f1e8',display:'standalone',start_url:'./',icons:[{src:'icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]},workbox:{globPatterns:['**/*.{js,css,html,svg}'],runtimeCaching:[{urlPattern:/^https:\/\/commons\.wikimedia\.org\//,handler:'CacheFirst',options:{cacheName:'viaje-imagenes',expiration:{maxEntries:30,maxAgeSeconds:2592000}}}]}})]
  };
});
