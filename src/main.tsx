import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import tailwindStyles from './index.css?inline'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/geist-sans/400.css'
import '@fontsource/geist-sans/500.css'
import '@fontsource/geist-sans/600.css'

declare global {
  interface Window {
    __NANO_AI_WIDGET__?: {
      destroy: () => void;
    }
  }
}

// Initialize Widget
function initWidget() {
  const HOST_ID = 'ai-assistant-widget-host';
  
  if (window.__NANO_AI_WIDGET__) {
    console.warn('[NanoAI] Widget is already running.');
    return window.__NANO_AI_WIDGET__;
  }

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.bottom = '0';
  host.style.right = '0';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none'; // Let clicks pass through the host container itself
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Inject Tailwind CSS
  const style = document.createElement('style');
  style.textContent = tailwindStyles;
  shadowRoot.appendChild(style);

  // Add React mount point
  const container = document.createElement('div');
  container.id = 'react-root';
  container.style.pointerEvents = 'auto';
  container.classList.add('antialiased');
  shadowRoot.appendChild(container);

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  window.__NANO_AI_WIDGET__ = {
    destroy: () => {
      // 1. Unmount React
      root.unmount();
      
      // 2. Remove Host from DOM
      if (host.parentNode) {
        host.parentNode.removeChild(host);
      }

      // 3. Remove highlight style tag if exists
      const styleTag = document.getElementById('nano-highlight-styles');
      if (styleTag && styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }

      // 4. Remove active highlight classes
      document.querySelectorAll('.nano-highlight-active').forEach(el => {
        el.classList.remove('nano-highlight-active');
      });

      // 5. Cleanup global reference
      delete window.__NANO_AI_WIDGET__;
      console.log('[NanoAI] Widget destroyed successfully.');
    }
  };
  
  return window.__NANO_AI_WIDGET__;
}

// In development, auto-init. In production, this would be called by the snippet.
initWidget();
