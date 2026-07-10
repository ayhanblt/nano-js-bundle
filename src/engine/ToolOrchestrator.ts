import { DOMAnalyzer, DOMHighlighter } from '../tools';
import type { MessageAction } from '../components/MessageBubble';

export class ToolOrchestrator {
  public analyzer: DOMAnalyzer;
  public highlighter: DOMHighlighter;

  constructor() {
    this.analyzer = new DOMAnalyzer();
    this.highlighter = new DOMHighlighter();
  }

  /**
   * Scans the page and returns context for the AI.
   */
  public getPageContext(): string {
    const sections = this.analyzer.listVisibleSections();
    let context = "Page Sections:\n";
    for (const sec of sections) {
      context += `- ID: ${sec.sectionId} | Title: ${sec.title} | Summary: ${sec.summary}\n`;
    }
    return context;
  }

  /**
   * Creates an actionable message containing a "Go to source" button if relevant elements are found.
   */
  public createHighlightAction(sectionId: string): MessageAction | undefined {
    const el = this.analyzer.getElementBySectionId(sectionId);
    if (!el) return undefined;

    return {
      label: 'İlgili alana git',
      icon: 'location_on',
      onClick: () => {
        this.highlighter.clearHighlights(); // Clear previous
        this.highlighter.highlightElements([el]);
        this.highlighter.scrollToElement([el]);
        
        // Auto-clear highlight after some time for better UX
        setTimeout(() => {
          this.highlighter.clearHighlights();
        }, 4000);
      }
    };
  }

  /**
   * Single entry point to execute a tool safely.
   */
  public executeTool(call: import('../api/types').ToolCall): import('../api/types').ToolResponse {
    try {
      let result: any = null;

      switch (call.name) {
        case 'listVisibleSections':
          result = this.analyzer.listVisibleSections();
          return { status: result.length > 0 ? 'success' : 'empty', tool: call.name, result };

        case 'readSection':
          result = this.analyzer.readSection(call.args.sectionId);
          return { status: result ? 'success' : 'empty', tool: call.name, result: result || '' };

        case 'scoreRelevance':
          result = this.analyzer.scoreRelevance(call.args.query, call.args.sectionIds);
          return { status: result.length > 0 ? 'success' : 'empty', tool: call.name, result };

        case 'highlightElements':
          const el = this.analyzer.getElementBySectionId(call.args.sectionId);
          if (el) {
            this.highlighter.clearHighlights();
            this.highlighter.highlightElements([el]);
            this.highlighter.scrollToElement([el]);
            result = { highlighted: true, sectionId: call.args.sectionId };
            return { status: 'success', tool: call.name, result };
          } else {
            return { status: 'error', tool: call.name, result: null, error: 'Element not found' };
          }

        default:
          return { status: 'error', tool: call.name, result: null, error: `Unknown tool: ${call.name}` };
      }
    } catch (err: any) {
      return { status: 'error', tool: call.name, result: null, error: err.message };
    }
  }
}
