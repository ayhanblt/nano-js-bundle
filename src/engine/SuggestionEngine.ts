import { DOMAnalyzer } from '../tools/DOMAnalyzer';
import type { Message } from '../components/MessageBubble';

export class SuggestionEngine {
  private analyzer: DOMAnalyzer;

  constructor(analyzer: DOMAnalyzer) {
    this.analyzer = analyzer;
  }

  public generateSuggestions(messages: Message[]): string[] {
    const productsResult = this.analyzer.listVisibleProducts();
    const products = productsResult.products;
    const sections = this.analyzer.listVisibleSections();

    let suggestions = new Set<string>();
    
    // Find the last user message to understand context
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user')?.text?.toLowerCase() || '';

    if (products.length > 0) {
      const hasPrices = products.some(p => p.price);
      const hasMultiple = products.length > 1;
      const hasEnergyClass = products.some(p => p.title.match(/\b(A\+\+\+|A\+\+|A\+|A|B|C|D|E|F|G)\b|\bkWh\b/i));
      
      if (messages.length === 0) {
        if (hasPrices) suggestions.add("En uygun fiyatlı ürünü göster");
        if (hasMultiple) suggestions.add("Ürünleri birbiriyle karşılaştır");
        if (hasEnergyClass) suggestions.add("Enerji tüketimlerini karşılaştır");
        suggestions.add("En yüksek puanlı ürünü bul");
        if (suggestions.size < 2) suggestions.add("Öne çıkan özellikleri özetle");
      } else {
        // Active chat follow-ups
        if (lastUserMessage.includes('fiyat') || lastUserMessage.includes('uygun') || lastUserMessage.includes('pahalı') || lastUserMessage.includes('ucuz')) {
          if (hasEnergyClass) suggestions.add("Enerji tüketimlerini karşılaştır");
          suggestions.add("Benzer fiyatlı ürünleri göster");
          suggestions.add("En pahalı modeli göster");
          suggestions.add("Garanti sürelerini karşılaştır");
        } else if (lastUserMessage.includes('karşılaştır') || lastUserMessage.includes('fark')) {
          if (hasPrices) suggestions.add("En ucuz olan hangisi?");
          suggestions.add("Ortak özellikleri neler?");
          suggestions.add("Tasarım farkları var mı?");
        } else {
          if (hasPrices) suggestions.add("Fiyatları listele");
          if (hasMultiple) suggestions.add("Ürünleri karşılaştır");
          suggestions.add("Stok durumlarını kontrol et");
          suggestions.add("En yeni modeli göster");
        }
      }
    } else if (sections.length > 0) {
      if (messages.length === 0) {
        suggestions.add(`${sections[0].title} hakkında bilgi ver`);
        if (sections.length > 1) suggestions.add(`${sections[1].title} detaylarını anlat`);
        suggestions.add("Bu sayfanın özeti nedir?");
      } else {
        suggestions.add("Daha fazla detay verebilir misin?");
        suggestions.add("Sayfada başka hangi bölümler var?");
      }
    } else {
      if (messages.length === 0) {
        suggestions.add("Bu site hakkında yardımcı ol");
        suggestions.add("Nasıl iletişime geçebilirim?");
      } else {
        suggestions.add("Başka neler yapabilirsin?");
        suggestions.add("Bana yardımcı olabileceğin konular neler?");
      }
    }

    return Array.from(suggestions).slice(0, 4);
  }
}
