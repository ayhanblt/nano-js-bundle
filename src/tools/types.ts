export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DOMReference {
  selector: string;     // Unique CSS selector path (if available)
  datasetId?: string;   // Nano section id or other stable IDs
}

export interface BaseNode {
  id: string;
  type: 'PRODUCT' | 'SECTION' | 'REVIEW' | 'UNKNOWN';
  domRef: DOMReference;
  metadata?: Record<string, unknown>;
}

export interface Product extends BaseNode {
  type: 'PRODUCT';
  title: string;
  text: string;
  price: string | null;
  currency: string | null;
  url: string | null;
  image: string | null;
  confidence: ConfidenceLevel;
}

export interface Section extends BaseNode {
  type: 'SECTION';
  title: string;
  text: string;
  summary: string;
}

export interface PageContext {
  platform: string;
  language: string;
  currency: string;
  title: string;
  url: string;
  sections: Section[];
  products: Product[];
  contextMetadata: Record<string, unknown>;
}

export interface Registry {
  version: number;
  createdAt: number;
  isValid: boolean;
  analysisDuration: number;
  sections: Section[];
  products: Product[];
  pageContext: PageContext;
}
