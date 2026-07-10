import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const parseMarkdown = (text: string): string => {
  // Parse markdown to HTML synchronously
  const rawHtml = marked.parse(text, { async: false }) as string;
  
  // Sanitize the resulting HTML
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });

  return cleanHtml;
};
