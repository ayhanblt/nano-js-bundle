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
