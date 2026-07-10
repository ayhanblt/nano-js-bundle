import { DOMAnalyzer, DOMHighlighter } from '../tools';
import type { MessageAction } from '../components/MessageBubble';

export class ToolOrchestrator {
  public analyzer: DOMAnalyzer;
  public highlighter: DOMHighlighter;

  constructor() {
    this.analyzer = new DOMAnalyzer();
    this.highlighter = new DOMHighlighter(this.analyzer);
  }

  /**
   * Waits for the DOM to be ready for analysis
   */
  public async waitUntilReady(): Promise<boolean> {
    return this.analyzer.waitUntilReady();
  }

  /**
   * Scans the page and returns context for the AI.
   */
  public getPageContext(): string {
    return this.analyzer.getPageSummary();
  }

  /**
   * Creates an actionable message containing a "Go to source" button if relevant elements are found.
   */
  public createHighlightAction(sectionId: string): MessageAction | undefined {
    const ref = this.analyzer.getDOMReferenceBySectionId(sectionId);
    if (!ref) return undefined;

    return {
      label: 'İlgili alana git',
      icon: 'location_on',
      onClick: () => {
        this.highlighter.clearHighlights(); // Clear previous
        this.highlighter.highlightElements([ref]);
        this.highlighter.scrollToElement([ref]);
      }
    };
  }

  /**
   * Single entry point to execute a tool safely.
   */
  public executeTool(call: import('../api/types').ToolCall): import('../api/types').ToolResponse {
    // In Vite, we use import.meta.env.DEV to check for development mode
    const isDev = import.meta.env.DEV;
    const startTime = performance.now();
    
    if (isDev) {
      console.log(`\n[NANO DEBUG] 🚀 Executing Tool: ${call.name}`);
      console.log(`[NANO DEBUG] 📥 Arguments:`, call.args);
    }

    let response: import('../api/types').ToolResponse;

    try {
      let result: any = null;

      switch (call.name) {
        case 'listVisibleProducts':
          result = this.analyzer.listVisibleProducts();
          response = { status: result.productsFound > 0 ? 'success' : 'empty', tool: call.name, result };
          break;

        case 'listVisibleSections':
          result = this.analyzer.listVisibleSections();
          response = { status: result.length > 0 ? 'success' : 'empty', tool: call.name, result };
          break;

        case 'readSection':
          result = this.analyzer.readSection(call.args.sectionId);
          response = { status: result ? 'success' : 'empty', tool: call.name, result: result || '' };
          break;

        case 'scoreRelevance':
          result = this.analyzer.scoreRelevance(call.args.query, call.args.sectionIds);
          if (isDev) {
            console.log(`[NANO DEBUG] 📊 Top scores for "${call.args.query}":`, result);
          }
          response = { status: result.length > 0 ? 'success' : 'empty', tool: call.name, result };
          break;

        case 'highlightElements': {
          const ids: string[] = call.args.sectionIds || (call.args.sectionId ? [call.args.sectionId] : []);
          const refs = ids.map((id: string) => this.analyzer.getDOMReferenceBySectionId(id)).filter(Boolean) as import('../tools/types').DOMReference[];
          
          if (refs.length > 0) {
            this.highlighter.clearHighlights();
            const highlighted = this.highlighter.highlightElements(refs) ? refs.length : 0;
            this.highlighter.scrollToElement(refs);
            
            result = { matched: refs.length, highlighted, elementIds: ids };
            response = { status: 'success', tool: call.name, result };
          } else {
            result = { matched: 0, highlighted: 0 };
            response = { status: 'empty', tool: call.name, result };
          }
          break;
        }

        default:
          response = { status: 'error', tool: call.name, result: null, error: `Unknown tool: ${call.name}` };
          break;
      }
    } catch (err: any) {
      response = { status: 'error', tool: call.name, result: null, error: err.message };
    }

    if (isDev) {
      const executionTime = (performance.now() - startTime).toFixed(2);
      console.log(`[NANO DEBUG] ⏱️ Execution Time: ${executionTime}ms`);
      console.log(`[NANO DEBUG] 📤 Response:`, response);
    }

    return response;
  }
}
