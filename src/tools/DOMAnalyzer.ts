import type { Registry, Product, Section, PageContext, DOMReference } from './types';

export class DOMAnalyzer {
  private registry: Registry = {
    version: 0,
    createdAt: Date.now(),
    isValid: false,
    analysisDuration: 0,
    sections: [],
    products: [],
    pageContext: this.createEmptyContext()
  };
  
  private observer: MutationObserver | null = null;
  private analyzeTimeout: any = null;
  private isReady = false;
  private static readonly NANO_ID_ATTR = 'data-nano-section-id';

  // --- Core Lifecycle ---

  public async waitUntilReady(): Promise<boolean> {
    if (this.isReady && this.registry.isValid) return true;

    return new Promise<boolean>((resolve) => {
      const check = () => {
        if (this.isReady && this.registry.isValid) {
          resolve(true);
        } else {
          setTimeout(check, 100);
        }
      };
      
      if (!this.observer) {
        this.setupObserverLayer();
      }
      
      if (document.readyState === 'complete') {
        this.analyzeDOM();
      } else {
        window.addEventListener('load', () => this.analyzeDOM(), { once: true });
      }
      
      check();
    });
  }

  private setupObserverLayer() {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      if (this.analyzeTimeout) clearTimeout(this.analyzeTimeout);
      this.analyzeTimeout = setTimeout(() => {
        this.analyzeDOM();
      }, 250); // 250ms debounce
    });

    this.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  private analyzeDOM() {
    const startTime = performance.now();
    try {
      const { newSections, newProducts } = this.performSingleTraversal();
      
      const newContext: PageContext = {
        platform: window.location.hostname,
        language: document.documentElement.lang || 'tr',
        currency: 'TRY',
        title: document.title,
        url: window.location.href,
        sections: newSections,
        products: newProducts,
        contextMetadata: {}
      };

      const newRegistry: Registry = {
        version: this.registry.version + 1,
        createdAt: Date.now(),
        isValid: false,
        analysisDuration: performance.now() - startTime,
        sections: newSections,
        products: newProducts,
        pageContext: newContext
      };

      const isValid = this.validateRegistry(newRegistry);
      newRegistry.isValid = isValid;

      if (isValid) {
        this.registry = Object.freeze(newRegistry);
        this.isReady = true;
        if (import.meta.env.DEV) {
          console.log(`[NANO DEBUG] 🔄 Unified Registry Updated (v${this.registry.version})`, this.registry);
        }
      } else {
        if (import.meta.env.DEV) {
          console.log(`[NANO DEBUG] ⚠️ Registry Validation Failed, keeping previous version (v${this.registry.version})`);
        }
      }
    } catch (e) {
      console.error('[NANO DEBUG] Error analyzing DOM:', e);
    }
  }

  private validateRegistry(newReg: Registry): boolean {
    if (!document.body) return false;
    
    // Prevent empty overwrite on the same URL if we previously had products
    if (this.registry.isValid && 
        this.registry.products.length > 0 && 
        newReg.products.length === 0 && 
        this.registry.pageContext.url === newReg.pageContext.url) {
      return false;
    }
    
    return true;
  }

  // --- Extractors ---

  private getSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    let path = [];
    let current: HTMLElement | null = el;
    while (current && current.tagName !== 'HTML') {
      let selector = current.tagName.toLowerCase();
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.split(' ').filter(c => c && !c.startsWith('nano-')).join('.');
        if (classes) selector += `.${classes}`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  private assignDatasetId(el: HTMLElement, prefix: string): string {
    let id = el.getAttribute(DOMAnalyzer.NANO_ID_ATTR);
    if (!id) {
      id = `nano-${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      el.setAttribute(DOMAnalyzer.NANO_ID_ATTR, id);
    }
    return id;
  }

  private performSingleTraversal() {
    const sections: Section[] = [];
    const products: Product[] = [];
    
    // Boundary-Driven candidate extraction
    const candidates = document.querySelectorAll('article, section, div > h1, div > h2, div > h3, li, .product, .card, .item');
    const processedNodes = new Set<HTMLElement>();

    candidates.forEach((el) => {
      try {
        const current = el as HTMLElement;
        if (processedNodes.has(current)) return;
        if (current.offsetParent === null) return;
        
        const text = current.innerText || '';
        if (text.length < 10) return;

        // Is it a Product Boundary?
        const priceMatch = text.match(/(?:₺|\$|€|£|TL)\s*\d+[.,]?\d*|\d+[.,]?\d*\s*(?:TL|USD|EUR|TRY)/i);
        const images = current.querySelectorAll('img');
        const links = current.querySelectorAll('a');
        
        if (priceMatch && images.length > 0 && links.length > 0 && current.getBoundingClientRect().width > 50) {
           const id = this.assignDatasetId(current, 'prod');
           const headings = current.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b');
           let title = headings.length > 0 ? (headings[0] as HTMLElement).innerText : text.split('\n')[0];
           title = title.substring(0, 50).trim();
           
           if (title.length > 3) {
             products.push({
               id,
               type: 'PRODUCT',
               domRef: { selector: this.getSelector(current), datasetId: id },
               title,
               text: text.trim(),
               price: priceMatch[0].trim(),
               currency: null,
               url: (links[0] as HTMLAnchorElement).href,
               image: (images[0] as HTMLImageElement).src || null,
               confidence: 'HIGH'
             });
             current.querySelectorAll('*').forEach(d => processedNodes.add(d as HTMLElement));
             return;
           }
        }
        
        // If not a product, is it a Section Boundary?
        if (['SECTION', 'ARTICLE'].includes(current.tagName) || current.tagName.match(/^H[1-6]$/) || (current.parentElement && current.parentElement.tagName === 'SECTION')) {
           const container = current.tagName.match(/^H[1-6]$/) ? current.parentElement! : current;
           if (processedNodes.has(container)) return;
           if (container.innerText.length < 20) return;
           
           const id = this.assignDatasetId(container, 'sec');
           const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
           const title = headings.length > 0 ? (headings[0] as HTMLElement).innerText : 'Untitled Section';
           const summary = container.innerText.substring(0, 100).replace(/\n/g, ' ') + '...';
           
           sections.push({
             id,
             type: 'SECTION',
             domRef: { selector: this.getSelector(container), datasetId: id },
             title: title.trim(),
             text: container.innerText,
             summary: summary.trim()
           });
           
           container.querySelectorAll('*').forEach(d => processedNodes.add(d as HTMLElement));
        }
      } catch (e) {}
    });

    return { newSections: sections, newProducts: products };
  }

  private createEmptyContext(): PageContext {
    return {
      platform: '',
      language: '',
      currency: '',
      title: '',
      url: '',
      sections: [],
      products: [],
      contextMetadata: {}
    };
  }

  // --- Data Accessors (Frontend Tools) ---

  public getRegistry(): Registry {
    return this.registry;
  }

  public getPageSummary(): string {
    const ctx = this.registry.pageContext;
    return JSON.stringify({
      platform: ctx.platform,
      language: ctx.language,
      title: ctx.title,
      sections: ctx.sections.map(s => ({ id: s.id, title: s.title, summary: s.summary })),
      products: ctx.products.map(p => ({ id: p.id, title: p.title, price: p.price, confidence: p.confidence }))
    });
  }

  public listVisibleSections() {
    return this.registry.sections.map(s => ({
      sectionId: s.id,
      title: s.title,
      summary: s.summary
    }));
  }

  public listVisibleProducts() {
    return {
      productsFound: this.registry.products.length,
      products: this.registry.products.map(p => ({
        title: p.title,
        price: p.price,
        url: p.url,
        sectionId: p.id,
        confidence: p.confidence
      }))
    };
  }

  public readSection(sectionId: string): string | null {
    const section = this.registry.sections.find(s => s.id === sectionId);
    if (section) return section.text;
    
    const product = this.registry.products.find(p => p.id === sectionId);
    if (product) return product.text; // purely in-memory
    
    return null;
  }

  private normalizeText(text: string): string {
    return text
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  public scoreRelevance(query: string, sectionIds?: string[]) {
    const results: Array<{ sectionId: string; score: number }> = [];
    const normalizedQuery = this.normalizeText(query);
    const queryWords = normalizedQuery.split(' ').filter(w => w.length > 0);
    
    const itemsToScore = [
      ...this.registry.sections.map(s => ({ id: s.id, text: s.text })),
      ...this.registry.products.map(p => ({ id: p.id, text: p.text }))
    ].filter(item => !sectionIds || sectionIds.includes(item.id));

    for (const item of itemsToScore) {
      if (!item.text) continue;
      const normalizedText = this.normalizeText(item.text);
      let score = 0;

      if (normalizedText.includes(normalizedQuery)) score += 100;

      queryWords.forEach(word => {
        if (normalizedText.includes(word)) {
          try {
            const regex = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'i');
            if (regex.test(normalizedText)) score += 20;
            else score += 10;
          } catch (e) {
            score += 10;
          }
        }
      });

      if (score > 0) results.push({ sectionId: item.id, score });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  public resolveElement(domRef: DOMReference): HTMLElement | null {
    if (domRef.datasetId) {
      const el = document.querySelector(`[${DOMAnalyzer.NANO_ID_ATTR}="${domRef.datasetId}"]`);
      if (el) return el as HTMLElement;
    }
    try {
      const el = document.querySelector(domRef.selector);
      if (el) return el as HTMLElement;
    } catch(e) {}
    return null;
  }

  public getDOMReferenceBySectionId(sectionId: string): DOMReference | null {
    const node = this.registry.sections.find(s => s.id === sectionId) || this.registry.products.find(p => p.id === sectionId);
    if (!node) return null;
    return node.domRef;
  }
}
