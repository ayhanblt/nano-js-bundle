const en = {
  "ai.assistant": "AI Assistant",
  "assistant.thinking": "Assistant is thinking...",
  "execution.timeline": "Execution Timeline",
  "processing.request": "Processing request...",
  "analyzing.details": "Analyzing product details",
  "welcome.title": "How can I help you?",
  "welcome.desc": "I understand the products on this page and can assist you.",
  "input.placeholder": "Ask the Assistant...",
  "footer.branding": "Nano AI Assistant",
  "btn.retry": "Retry connection",
  "btn.attempting": "Attempting...",
  "btn.close": "Close",
  "err.unavailable": "Assistant is currently unavailable.",
  "err.network": "We're having trouble connecting to the AI service. Please check your internet connection and try again.",
  "msg.analyzing.page": "I am analyzing the page right now, please try again in a few seconds.",
  "msg.limit.reached": "I have reached my safety limit to prevent too many actions. Please ask a simpler question.",
  "msg.empty.response": "The response was empty, please ask again.",
  "msg.default.error": "I couldn't connect or an error occurred. Please try again.",
  "msg.connection.error": "Could not connect.",
  "msg.error.occurred": "An error occurred",
  "lbl.confidence": "Confidence",
  "lbl.found.in": "Found in",
  "lbl.go.to.area": "Go to relevant area"
};

const tr = {
  "ai.assistant": "Yapay Zeka Asistanı",
  "assistant.thinking": "Asistan düşünüyor...",
  "execution.timeline": "İşlem Geçmişi",
  "processing.request": "İstek işleniyor...",
  "analyzing.details": "Ürün detayları analiz ediliyor",
  "welcome.title": "Size nasıl yardımcı olabilirim?",
  "welcome.desc": "Bu sayfadaki ürünleri anlıyor ve size yardımcı olabiliyorum.",
  "input.placeholder": "Asistan'a soru sorun...",
  "footer.branding": "Nano AI Assistant",
  "btn.retry": "Yeniden Dene",
  "btn.attempting": "Bağlanıyor...",
  "btn.close": "Kapat",
  "err.unavailable": "Asistan şu anda kullanılamıyor.",
  "err.network": "Yapay zeka servisine bağlanırken sorun yaşıyoruz. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.",
  "msg.analyzing.page": "Şu anda sayfayı analiz ediyorum, lütfen birkaç saniye sonra tekrar deneyin.",
  "msg.limit.reached": "Sistem güvenliği için çok fazla işlem yapmamı engelleyen limite ulaştım. Lütfen daha basit bir soru sorar mısın?",
  "msg.empty.response": "Aldığım cevap boştu, lütfen tekrar sorar mısın?",
  "msg.default.error": "Şu an bağlantı kuramıyorum veya bir hata oluştu. Lütfen tekrar deneyin.",
  "msg.connection.error": "Bağlantı kurulamadı.",
  "msg.error.occurred": "Hata oluştu",
  "lbl.confidence": "Güvenilirlik",
  "lbl.found.in": "Bulunan kaynak:",
  "lbl.go.to.area": "İlgili alana git"
};

export type LangType = 'en' | 'tr';
export type TranslationKey = keyof typeof en;

let cachedLang: LangType | null = null;

export const getCurrentLanguage = (): LangType => {
  if (cachedLang) return cachedLang;
  const lang = document.documentElement.lang?.toLowerCase() || '';
  cachedLang = lang.startsWith('tr') ? 'tr' : 'en';
  return cachedLang;
};

export const t = (key: TranslationKey): string => {
  const lang = getCurrentLanguage();
  return lang === 'tr' ? tr[key] : en[key];
};
