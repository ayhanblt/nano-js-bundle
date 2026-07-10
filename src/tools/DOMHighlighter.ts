import type { DOMReference } from './types';
import type { DOMAnalyzer } from './DOMAnalyzer';

export class DOMHighlighter {
  private static readonly STYLE_ID = 'nano-highlight-styles';
  private static readonly HIGHLIGHT_CLASS = 'nano-highlight-active';

  private activeOverlays: Set<HTMLElement> = new Set();
  private activeTrackers: number[] = [];
  private analyzer: DOMAnalyzer;

  constructor(analyzer: DOMAnalyzer) {
    this.analyzer = analyzer;
    this.injectStyles();
  }

  private injectStyles() {
    if (document.getElementById(DOMHighlighter.STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = DOMHighlighter.STYLE_ID;

    style.textContent = `
      .${DOMHighlighter.HIGHLIGHT_CLASS} {
        animation: nano-pulse-glow-yellow 2s infinite ease-in-out !important;
        position: absolute !important;
        z-index: 2147483646 !important;
        border-radius: 4px !important;
        outline: 3px solid #FFD700 !important;
        pointer-events: none !important;
        transition: all 0.1s ease-out !important;
      }

      @keyframes nano-pulse-glow-yellow {
        0%, 100% { 
          box-shadow: 0 0 0 0px rgba(255, 215, 0, 0) !important; 
          background-color: rgba(255, 215, 0, 0.05) !important; 
        }
        50% { 
          box-shadow: 0 0 15px 5px rgba(255, 215, 0, 0.4) !important; 
          background-color: rgba(255, 215, 0, 0.2) !important; 
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Highlights specific elements dynamically using DOMReference to survive React rerenders.
   */
  public highlightElements(refs: DOMReference[]): boolean {
    if (!refs || refs.length === 0) return false;

    let started = false;

    for (const ref of refs) {
      const overlay = document.createElement('div');
      overlay.className = DOMHighlighter.HIGHLIGHT_CLASS;
      overlay.style.display = 'none'; // hidden until resolved
      document.body.appendChild(overlay);
      this.activeOverlays.add(overlay);
      started = true;

      const track = () => {
        const el = this.analyzer.resolveElement(ref);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            overlay.style.display = 'block';
            overlay.style.top = (rect.top + window.scrollY) + 'px';
            overlay.style.left = (rect.left + window.scrollX) + 'px';
            overlay.style.width = rect.width + 'px';
            overlay.style.height = rect.height + 'px';
          } else {
            overlay.style.display = 'none';
          }
        } else {
          overlay.style.display = 'none';
        }

        const rafId = requestAnimationFrame(track);
        this.activeTrackers.push(rafId);
      };

      track();
    }

    if (started) {
      setTimeout(() => {
        this.clearHighlights();
      }, 4000);
    }

    return started;
  }

  /**
   * Smoothly scrolls to the first resolved element.
   */
  public scrollToElement(refs: DOMReference[]): boolean {
    if (!refs || refs.length === 0) return false;

    const firstRef = refs[0];
    const el = this.analyzer.resolveElement(firstRef);

    if (el) {
      try {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  /**
   * Cleans up all active highlight overlays and stops tracking.
   */
  public clearHighlights() {
    // Stop tracking loops
    for (const id of this.activeTrackers) {
      cancelAnimationFrame(id);
    }
    this.activeTrackers = [];

    // Remove overlays
    for (const overlay of this.activeOverlays) {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }
    this.activeOverlays.clear();
  }
}
