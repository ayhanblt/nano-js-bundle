export class DOMHighlighter {
  private static readonly STYLE_ID = 'nano-highlight-styles';
  private static readonly HIGHLIGHT_CLASS = 'nano-highlight-active';
  
  // Track highlighted elements to avoid duplicate work and allow easy cleanup
  private activeHighlights: Set<Element> = new Set();

  constructor() {
    this.injectStyles();
  }

  /**
   * Injects the required CSS styles into the host document's head exactly once.
   */
  private injectStyles() {
    if (document.getElementById(DOMHighlighter.STYLE_ID)) {
      return; // Styles already exist
    }

    const style = document.createElement('style');
    style.id = DOMHighlighter.STYLE_ID;
    
    // Using a very specific namespace 'nano-' to prevent collisions
    // Only adding box-shadow, background-color, and transitions
    // We use !important here because we explicitly want to override host styles temporarily
    // while highlighted, but removing the class will restore original state perfectly.
    style.textContent = `
      .${DOMHighlighter.HIGHLIGHT_CLASS} {
        animation: nano-pulse-glow 2s infinite ease-in-out !important;
        position: relative !important;
        z-index: 9999 !important;
        border-radius: 8px !important;
      }

      @keyframes nano-pulse-glow {
        0%, 100% { 
          box-shadow: 0 0 0 0px rgba(99, 14, 212, 0) !important; 
          background-color: transparent !important; 
        }
        50% { 
          box-shadow: 0 0 15px 5px rgba(99, 14, 212, 0.3) !important; 
          background-color: rgba(99, 14, 212, 0.05) !important; 
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Highlights specific elements by adding a CSS class.
   * Does not mutate inline styles.
   */
  public highlightElements(elements: Element[]): boolean {
    if (!elements || elements.length === 0) return false;

    let highlightedCount = 0;

    for (const el of elements) {
      if (this.activeHighlights.has(el)) {
        continue; // Skip if already highlighted
      }

      el.classList.add(DOMHighlighter.HIGHLIGHT_CLASS);
      this.activeHighlights.add(el);
      highlightedCount++;
    }

    return highlightedCount > 0;
  }

  /**
   * Smoothly scrolls to the first element in the provided list.
   */
  public scrollToElement(elements: Element[]): boolean {
    if (!elements || elements.length === 0) return false;

    const firstElement = elements[0];
    
    try {
      firstElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Cleans up all active highlights, restoring the DOM to its original state.
   */
  public clearHighlights() {
    for (const el of this.activeHighlights) {
      el.classList.remove(DOMHighlighter.HIGHLIGHT_CLASS);
    }
    this.activeHighlights.clear();
  }
}
