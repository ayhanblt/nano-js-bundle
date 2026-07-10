export interface SectionData {
  sectionId: string;
  title: string;
  summary: string;
  element: HTMLElement;
}

export class DOMAnalyzer {
  private sectionMap: Map<string, SectionData> = new Map();
  private static readonly NANO_ID_ATTR = 'data-nano-section-id';

  /**
   * Scans the host page DOM for meaningful sections (headings, articles, sections, main wrappers).
   * Generates IDs for elements and tracks them.
   */
  public listVisibleSections(): Pick<SectionData, 'sectionId' | 'title' | 'summary'>[] {
    this.sectionMap.clear();

    const sections: Pick<SectionData, 'sectionId' | 'title' | 'summary'>[] = [];
    
    // Simplistic selector for demo purposes. 
    // Real implementation would look for actual structural elements like article, section, [role="main"], etc.
    const candidates = document.querySelectorAll('section, article, div > h1, div > h2, div > h3');
    
    let counter = 0;
    
    candidates.forEach((el) => {
      // Find the parent block if we hit a heading
      const container = (el.tagName.match(/^H[1-6]$/) ? el.parentElement : el) as HTMLElement;
      if (!container) return;

      // Ensure it's somewhat visible and meaningful
      if (container.offsetParent === null || container.innerText.trim().length < 20) return;

      // Check if already processed
      if (container.hasAttribute(DOMAnalyzer.NANO_ID_ATTR)) {
         return; 
      }

      const sectionId = `nano-sec-${Date.now()}-${counter++}`;
      container.setAttribute(DOMAnalyzer.NANO_ID_ATTR, sectionId);

      // Extract title and summary
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const title = headings.length > 0 ? (headings[0] as HTMLElement).innerText : 'Untitled Section';
      const summary = container.innerText.substring(0, 100).replace(/\n/g, ' ') + '...';

      const sectionData: SectionData = {
        sectionId,
        title: title.trim(),
        summary: summary.trim(),
        element: container
      };

      this.sectionMap.set(sectionId, sectionData);

      sections.push({
        sectionId,
        title: sectionData.title,
        summary: sectionData.summary
      });
    });

    return sections;
  }

  /**
   * Identifies product cards on the screen using heuristic scoring.
   * Does not rely on specific class names or IDs.
   */
  public listVisibleProducts() {
    const products: Array<any> = [];
    const processedNodes = new Set<HTMLElement>();
    
    // Signal: Products typically contain images
    const images = document.querySelectorAll('img, picture');
    
    images.forEach(img => {
      let current: HTMLElement | null = img as HTMLElement;
      let depth = 0;
      let bestCandidate: HTMLElement | null = null;
      let bestConfidence = 0;
      
      // Traverse up to 6 levels to find a suitable card container
      while (current && current !== document.body && depth < 6) {
        if (processedNodes.has(current)) {
           break;
        }

        let confidence = 0;
        const text = current.innerText || '';
        
        // Signal 1: Contains price (currency symbol + number)
        const priceMatch = text.match(/(?:₺|\$|€|£|TL)\s*\d+[.,]?\d*|\d+[.,]?\d*\s*(?:TL|USD|EUR|TRY)/i);
        if (priceMatch) confidence += 0.4;
        
        // Signal 2: Contains link
        if (current.tagName === 'A' || current.querySelector('a')) confidence += 0.2;
        
        // Signal 3: Contains Heading or Strong text for title
        if (current.querySelector('h1, h2, h3, h4, h5, h6, strong, b')) confidence += 0.2;
        
        // Signal 4: Semantic classes
        const className = (current.className || '').toString().toLowerCase();
        if (className.includes('product') || className.includes('item') || className.includes('card')) {
          confidence += 0.1;
        }
        
        // Signal 5: Dimensions (visible and reasonable size for a card)
        const rect = current.getBoundingClientRect();
        if (rect.width > 50 && rect.height > 50 && rect.width < 1000 && rect.height < 1000) {
          confidence += 0.1;
        }

        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestCandidate = current;
        }
        
        current = current.parentElement;
        depth++;
      }
      
      // If we found a good candidate
      if (bestCandidate && bestConfidence >= 0.6) {
        processedNodes.add(bestCandidate);
        
        // Mark all descendants as processed to avoid nested card detection
        const allDescendants = bestCandidate.querySelectorAll('*');
        allDescendants.forEach(d => processedNodes.add(d as HTMLElement));

        // Assign Section ID for highlight integration
        let sectionId = bestCandidate.getAttribute(DOMAnalyzer.NANO_ID_ATTR);
        if (!sectionId) {
          sectionId = `nano-prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          bestCandidate.setAttribute(DOMAnalyzer.NANO_ID_ATTR, sectionId);
          
          // Register it in sectionMap so highlightElements can use it
          this.sectionMap.set(sectionId, {
             sectionId,
             title: 'Product Card',
             summary: 'Heuristically detected product card',
             element: bestCandidate
          });
        }

        // Extract Product Data
        const text = bestCandidate.innerText || '';
        const priceMatch = text.match(/(?:₺|\$|€|£|TL)\s*\d+[.,]?\d*|\d+[.,]?\d*\s*(?:TL|USD|EUR|TRY)/i);
        const headings = bestCandidate.querySelectorAll('h1, h2, h3, h4, h5, h6, strong');
        const title = headings.length > 0 ? (headings[0] as HTMLElement).innerText : text.split('\n')[0].substring(0, 50);
        
        const link = bestCandidate.tagName === 'A' ? bestCandidate : bestCandidate.querySelector('a');
        const url = link ? (link as HTMLAnchorElement).href : null;

        products.push({
          title: title.trim(),
          price: priceMatch ? priceMatch[0].trim() : null,
          url,
          sectionId,
          confidence: Number(bestConfidence.toFixed(2))
        });
      }
    });

    const averageConfidence = products.length > 0 
      ? Number((products.reduce((acc, p) => acc + p.confidence, 0) / products.length).toFixed(2)) 
      : 0;

    return {
      productsFound: products.length,
      averageConfidence,
      products
    };
  }

  /**
   * Reads the readable text of a specific section.
   */
  public readSection(sectionId: string): string | null {
    const section = this.sectionMap.get(sectionId);
    if (!section) return null;

    // Return innerText which naturally excludes hidden elements and preserves some spacing
    return section.element.innerText;
  }

  /**
   * Mock implementation for scoring relevance.
   * Simple keyword matching for demo purposes.
   */
  public scoreRelevance(query: string, sectionIds?: string[]): Array<{ sectionId: string; score: number }> {
    const results: Array<{ sectionId: string; score: number }> = [];
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    const idsToScore = sectionIds || Array.from(this.sectionMap.keys());

    for (const id of idsToScore) {
      const section = this.sectionMap.get(id);
      if (!section) continue;

      const text = section.element.innerText.toLowerCase();
      let score = 0;

      queryWords.forEach(word => {
        if (text.includes(word)) score += 10;
      });

      results.push({ sectionId: id, score });
    }

    // Sort by descending score
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Utility to get an HTML Element by its assigned sectionId
   */
  public getElementBySectionId(sectionId: string): HTMLElement | null {
    return this.sectionMap.get(sectionId)?.element || null;
  }
}
