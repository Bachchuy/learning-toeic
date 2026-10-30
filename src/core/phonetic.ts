/**
 * Bảng ánh xạ phiên âm chuẩn quốc tế (IPA) dành cho các từ vựng và cụm từ thông dụng trong TOEIC
 * Tách riêng khỏi vocabDictionary.ts để các Client Component có thể import trực tiếp
 * mà không kéo toàn bộ 800+ dòng từ điển vào bundle trình duyệt.
 */
export const PHONETIC_WORD_MAP: Record<string, string> = {
  // Cụm từ & từ khóa cốt lõi Part 5
  keynote: "ˈkiːnoʊt",
  speaker: "ˈspiːkər",
  speakers: "ˈspiːkərz",
  "keynote speaker": "ˈkiːnoʊt ˈspiːkər",
  exchange: "ɪksˈtʃeɪndʒ",
  rate: "reɪt",
  rates: "reɪts",
  "exchange rate": "ɪksˈtʃeɪndʒ reɪt",
  "exchange rates": "ɪksˈtʃeɪndʒ reɪts",
  favorable: "ˈfeɪvərəbl",
  "favorable exchange rates": "ˈfeɪvərəbl ɪksˈtʃeɪndʒ reɪts",
  export: "ˈekspɔːrt",
  exports: "ˈekspɔːrts",
  import: "ˈɪmpɔːrt",
  imports: "ˈɪmpɔːrts",
  boost: "buːst",
  boosts: "buːsts",
  boosted: "ˈbuːstɪd",
  overseas: "ˌoʊvərˈsiːz",
  conveyor: "kənˈveɪər",
  system: "ˈsɪstəm",
  systems: "ˈsɪstəmz",
  "conveyor system": "kənˈveɪər ˈsɪstəm",
  operate: "ˈɑːpəreɪt",
  operates: "ˈɑːpəreɪts",
  operated: "ˈɑːpəreɪtɪd",
  operating: "ˈɑːpəreɪtɪŋ",
  efficient: "ɪˈfɪʃnt",
  efficiently: "ɪˈfɪʃntli",
  efficiency: "ɪˈfɪʃnsi",
  nervous: "ˈnɜːrvəs",
  confidential: "ˌkɑːnfɪˈdenʃl",
  shred: "ʃred",
  shredded: "ˈʃredɪd",
  brief: "briːf",
  briefly: "ˈbriːfli",
  summary: "ˈsʌməri",
  summaries: "ˈsʌməriz",
  customer: "ˈkʌstəmər",
  customers: "ˈkʌstəmərz",
  service: "ˈsɜːrvɪs",
  services: "ˈsɜːrvɪsɪz",
  "customer service": "ˈkʌstəmər ˈsɜːrvɪs",
  board: "bɔːrd",
  meeting: "ˈmiːtɪŋ",
  meetings: "ˈmiːtɪŋz",
  "board meeting": "bɔːrd ˈmiːtɪŋ",
  director: "daɪˈrektər",
  directors: "daɪˈrektərz",
  "board of directors": "bɔːrd əv daɪˈrektərz",
  annual: "ˈænjuəl",
  report: "rɪˈpɔːrt",
  reports: "rɪˈpɔːrts",
  "annual report": "ˈænjuəl rɪˈpɔːrt",
  "annual meeting": "ˈænjuəl ˈmiːtɪŋ",
  press: "pres",
  release: "rɪˈliːs",
  "press release": "pres rɪˈliːs",
  safety: "ˈseɪfti",
  regulation: "ˌreɡjuˈleɪʃn",
  regulations: "ˌreɡjuˈleɪʃnz",
  "safety regulations": "ˈseɪfti ˌreɡjuˈleɪʃnz",
  flight: "flaɪt",
  attendant: "əˈtendənt",
  "flight attendant": "flaɪt əˈtendənt",
  take: "teɪk",
  advantage: "ədˈvæntɪdʒ",
  of: "əv",
  "take advantage of": "teɪk ədˈvæntɪdʒ əv",
  due: "djuː",
  to: "tuː",
  "due to": "djuː tuː",
  in: "ɪn",
  order: "ˈɔːrdər",
  "in order to": "ɪn ˈɔːrdər tuː",
  charge: "tʃɑːrdʒ",
  "in charge of": "ɪn tʃɑːrdʒ əv",
  behalf: "bɪˈhæf",
  "on behalf of": "ɑːn bɪˈhæf əv",
  as: "æz",
  well: "wel",
  "as well as": "æz wel æz",
  prior: "ˈpraɪər",
  "prior to": "ˈpraɪər tuː",
  look: "lʊk",
  forward: "ˈfɔːrwərd",
  "look forward to": "lʊk ˈfɔːrwərd tuː",
  comply: "kəmˈplaɪ",
  with: "wɪð",
  "comply with": "kəmˈplaɪ wɪð",
  participate: "pɑːrˈtɪsɪpeɪt",
  "participate in": "pɑːrˈtɪsɪpeɪt ɪn",
  account: "əˈkaʊnt",
  for: "fɔːr",
  "account for": "əˈkaʊnt fɔːr",
  focus: "ˈfoʊkəs",
  on: "ɑːn",
  "focus on": "ˈfoʊkəs ɑːn",
  schedule: "ˈskedʒuːl",
  scheduled: "ˈskedʒuːld",
  increase: "ɪnˈkriːs",
  increased: "ɪnˈkriːst",
  decrease: "dɪˈkriːs",
  decreased: "dɪˈkriːst",
  revenue: "ˈrevənuː",
  profit: "ˈprɑːfɪt",
  profits: "ˈprɑːfɪts",
  quarter: "ˈkwɔːrtər",
  quarterly: "ˈkwɔːrtərli",
  growth: "ɡroʊθ",
  strategy: "ˈstrætədʒi",
  development: "dɪˈveləpmənt",
  investment: "ɪnˈvestmənt",
  contract: "ˈkɑːntrækt",
  agreement: "əˈɡriːmənt",
  proposal: "prəˈpoʊzl",
  presentation: "ˌpriːzenˈteɪʃn",
  conference: "ˈkɑːnfərəns",
  seminar: "ˈsemɪnɑːr",
  workshop: "ˈwɜːrkʃɑːp",
  facility: "fəˈsɪləti",
  facilities: "fəˈsɪlətiz",
  warehouse: "ˈwerhaʊs",
  equipment: "ɪˈkwɪpmənt",
  maintenance: "ˈmeɪntənəns",
  warranty: "ˈwɔːrənti",
  guarantee: "ˌɡærənˈtiː",
  client: "ˈklaɪənt",
  clients: "ˈklaɪənts",
  vendor: "ˈvendər",
  vendors: "ˈvendərz",
  supplier: "səˈplaɪər",
  suppliers: "səˈplaɪərz",
  shipment: "ˈʃɪpmənt",
  shipments: "ˈʃɪpmənts",
  delivery: "dɪˈlɪvəri",
  department: "dɪˈpɑːrtmənt",
  division: "dɪˈvɪʒn",
  employee: "ɪmˈplɔɪiː",
  employees: "ɪmˈplɔɪiːz",
  manager: "ˈmænɪdʒər",
  management: "ˈmænɪdʒmənt",
  executive: "ɪɡˈzekjətɪv",
  human: "ˈhjuːmən",
  resource: "ˈriːsɔːrs",
  resources: "rɪˈsɔːrsɪz",
  "human resources": "ˈhjuːmən rɪˈsɔːrsɪz",
  candidate: "ˈkændɪdeɪt",
  applicant: "ˈæplɪkənt",
  interview: "ˈɪntərvjuː",
  position: "pəˈzɪʃn",
  deadline: "ˈdedlaɪn",
  requirement: "rɪˈkwaɪərmənt",
  requirements: "rɪˈkwaɪərmənts",
  policy: "ˈpɑːləsi",
  procedure: "prəˈsiːdʒər",
  product: "ˈprɑːdʌkt",
  production: "prəˈdʌkʃn",
  quality: "ˈkwɑːləti",
  security: "səˈkjʊrəti",
  access: "ˈækses",
  request: "rɪˈkwest",
  refund: "ˈriːfʌnd",
  discount: "ˈdɪskaʊnt",
  delay: "dɪˈleɪ",
  notice: "ˈnoʊtɪs",
  information: "ˌɪnfərˈmeɪʃn",
  contact: "ˈkɑːntækt",
  support: "səˈpɔːrt",
  market: "ˈmɑːrkɪt",
  business: "ˈbɪznəs",
  company: "ˈkʌmpəni",
  corporation: "ˌkɔːrpəˈreɪʃn",
  firm: "fɜːrm",
  office: "ˈɑːfɪs",
  staff: "stæf",
  team: "tiːm",
  price: "praɪs",
  cost: "kɔːst",
  costs: "kɔːsts",
  sales: "seɪlz",
  budget: "ˈbʌdʒɪt",
  finance: "ˈfaɪnæns",
  financial: "faɪˈnænʃl",
  plan: "plæn",
  plans: "plænz",
  project: "ˈprɑːdʒekt",
  projects: "ˈprɑːdʒekts",
  condition: "kənˈdɪʃn",
  conditions: "kənˈdɪʃnz",
  standard: "ˈstændərd",
  standards: "ˈstændərdz",
  feedback: "ˈfiːdbæk",
  survey: "ˈsɜːrveɪ",
  inquiry: "ˈɪnkwəri",
  inquiries: "ˈɪnkwəriz",
  complaint: "kəmˈpleɪnt",
  complaints: "kəmˈpleɪnts",
  solution: "səˈluːʃn",
  solutions: "səˈluːʃnz",
  success: "səkˈses",
  successful: "səkˈsesfl",
  successfully: "səkˈsesfəli",
  effective: "ɪˈfektɪv",
  effectively: "ɪˈfektɪvli",
  available: "əˈveɪləbl",
  eligible: "ˈelɪdʒəbl",
  responsible: "rɪˈspɑːnsəbl",
  appropriate: "əˈproʊpriət",
  essential: "ɪˈsenʃl",
  critical: "ˈkrɪtɪkl",
  significant: "sɪɡˈnɪfɪkənt",
  significantly: "sɪɡˈnɪfɪkəntli",
  substantial: "səbˈstænʃl",
  substantially: "səbˈstænʃli",
  rapid: "ˈræpɪd",
  rapidly: "ˈræpɪdli",
  steady: "ˈstedi",
  steadily: "ˈstedɪli",
  temporary: "ˈtempəreri",
  temporarily: "ˌtempəˈrerəli",
  permanent: "ˈpɜːrmənənt",
  permanently: "ˈpɜːrmənəntli",
  initial: "ɪˈnɪʃl",
  initially: "ɪˈnɪʃəli",
  final: "ˈfaɪnl",
  finally: "ˈfaɪnəli",
  regular: "ˈreɡjələr",
  regularly: "ˈreɡjələrli",
  frequent: "ˈfriːkwənt",
  frequently: "ˈfriːkwəntli",
  recent: "ˈriːsnt",
  recently: "ˈriːsntli",
  current: "ˈkɜːrənt",
  currently: "ˈkɜːrəntli",
  direct: "dəˈrekt",
  directly: "dəˈrektli",
  immediate: "ɪˈmiːdiət",
  immediately: "ɪˈmiːdiətli",
  proper: "ˈprɑːpər",
  properly: "ˈprɑːpərli",
  thorough: "ˈθɜːroʊ",
  thoroughly: "ˈθɜːrəli",
  accurate: "ˈækjərət",
  accurately: "ˈækjərətli",
  convenient: "kənˈviːniənt",
  conveniently: "kənˈviːniəntli",
  suitable: "ˈsuːtəbl",
  reliable: "rɪˈlaɪəbl",
  flexible: "ˈfleksəbl",
  innovative: "ˈɪnəveɪtɪv",
  competitive: "kəmˈpetətɪv",
  beneficial: "ˌbenɪˈfɪʃl",
  promising: "ˈprɑːmɪsɪŋ",
  comprehensive: "ˌkɑːmprɪˈhensɪv",
  line: "laɪn",
  assembly: "əˈsembli",
  "assembly line": "əˈsembli laɪn",
  logistics: "ləˈdʒɪstɪks",
  supply: "səˈplaɪ",
  chain: "tʃeɪn",
  "supply chain": "səˈplaɪ tʃeɪn",
  inventory: "ˈɪnvəntɔːri",

  // Cụm từ và từ thông dụng trong giao tiếp & công sở TOEIC
  nice: "naɪs",
  meet: "miːt",
  you: "juː",
  "nice to meet you": "naɪs tuː miːt juː",
  good: "ɡʊd",
  morning: "ˈmɔːrnɪŋ",
  afternoon: "ˌæftərˈnuːn",
  evening: "ˈiːvnɪŋ",
  see: "siː",
  later: "ˈleɪtər",
  care: "ker",
  "take care": "teɪk ker",
  "take care of": "teɪk ker əv",
  far: "fɑːr",
  "so far": "soʊ fɑːr",
  such: "sʌtʃ",
  "such as": "sʌtʃ æz",
  thanks: "θæŋks",
  "thanks to": "θæŋks tuː",
  accordance: "əˈkɔːrdns",
  "in accordance with": "ɪn əˈkɔːrdns wɪð",
  compliance: "kəmˈplaɪəns",
  "in compliance with": "ɪn kəmˈplaɪəns wɪð",
  spite: "spaɪt",
  "in spite of": "ɪn spaɪt əv",
  view: "vjuː",
  point: "pɔɪnt",
  "point of view": "pɔɪnt əv vjuː",
  touch: "tʌtʃ",
  keep: "kiːp",
  "keep in touch": "kiːp ɪn tʌtʃ",
  mind: "maɪnd",
  "keep in mind": "kiːp ɪn maɪnd",
};

/**
 * Chuẩn hóa chuỗi IPA thô từ cơ sở dữ liệu cũ hoặc nguồn ngoại vi sang IPA quốc tế chuẩn:
 * - Thay thế dấu nháy đơn ' hoặc dấu acute ´ thành ký hiệu trọng âm chính ˈ
 * - Thay thế dấu phẩy , hoặc cedilla ¸ thành ký hiệu trọng âm phụ ˌ
 * - Chuẩn hóa trường âm : sang ː
 * - Khắc phục các ký hiệu lai cũ: dʤ -> dʒ, iɳ -> ɪŋ, ɳ -> ŋ, ou -> oʊ, ei -> eɪ...
 */
export function sanitizeIpaString(raw?: string): string {
  if (!raw) return "";
  let s = raw.trim();
  if (!s || s === "/" || s === "//") return "";

  // Bỏ dấu gạch chéo bọc ngoài nếu có
  s = s.replace(/^\/+|\/+$/g, "");

  // Dấu trọng âm
  s = s.replace(/['´’]/g, "ˈ");
  s = s.replace(/[,¸]/g, "ˌ");

  // Độ dài nguyên âm
  s = s.replace(/:/g, "ː");

  // Tổ hợp phụ âm
  s = s.replace(/dʤ/g, "dʒ");
  s = s.replace(/iɳ/g, "ɪŋ");
  s = s.replace(/ɳ/g, "ŋ");
  s = s.replace(/g/g, "ɡ");

  // Nguyên âm đôi / ghép
  s = s.replace(/ou/g, "oʊ");
  s = s.replace(/ei/g, "eɪ");
  s = s.replace(/ai/g, "aɪ");
  s = s.replace(/au/g, "aʊ");
  s = s.replace(/ɔi/g, "ɔɪ");
  s = s.replace(/əː/g, "ɜːr");
  s = s.replace(/ʤ/g, "ʒ");

  // Xóa ngoặc vuông nếu có
  s = s.replace(/[\[\]]/g, "");

  return `/${s.trim()}/`;
}

/**
 * Trích xuất phần IPA cốt lõi từ chuỗi phiên âm (bỏ dấu gạch / và chú thích)
 */
export function extractCoreIpa(ipaString?: string): string {
  if (!ipaString) return "";
  const firstSlashMatch = ipaString.match(/\/([^\/]+)\//);
  if (firstSlashMatch) {
    return firstSlashMatch[1].trim();
  }
  return ipaString.replace(/^\/+|\/+$/g, "").trim();
}

/**
 * Giải quyết và sinh phiên âm ngữ âm chuẩn IPA cho từ vựng và CỤM TỪ (Phrases):
 * - Ưu tiên phiên âm đã lưu nếu hợp lệ, đồng thời TỰ ĐỘNG CHUẨN HÓA qua sanitizeIpaString
 * - Tra cứu bảng ánh xạ PHONETIC_WORD_MAP trực tiếp
 * - Tự động ghép nối IPA từ các từ thành phần cho cụm từ (Phrases / Compound words)
 */
export function resolvePhonetic(
  term: string,
  existingPhonetic?: string,
  fallbackDictionary?: Record<string, { phonetic?: string }>
): string {
  const existing = (existingPhonetic || "").trim();
  if (existing && existing !== "//" && existing !== "/") {
    return sanitizeIpaString(existing);
  }

  if (!term || !term.trim()) return "";

  const clean = term.trim().toLowerCase();

  // 1. Kiểm tra trực tiếp trong PHONETIC_WORD_MAP
  if (PHONETIC_WORD_MAP[clean]) {
    const raw = PHONETIC_WORD_MAP[clean];
    return raw.startsWith("/") ? raw : `/${raw}/`;
  }

  // 1b. Kiểm tra trong fallbackDictionary nếu được truyền
  if (fallbackDictionary && fallbackDictionary[clean]?.phonetic) {
    return fallbackDictionary[clean].phonetic || "";
  }

  // 2. Xử lý số nhiều hoặc biến thể đuôi s, es, ed của từ đơn
  if (!clean.includes(" ") && !clean.includes("-")) {
    if (clean.endsWith("s")) {
      const base = clean.endsWith("es") ? clean.slice(0, -2) : clean.slice(0, -1);
      const baseIpa =
        PHONETIC_WORD_MAP[base] ||
        extractCoreIpa(fallbackDictionary?.[base]?.phonetic);
      if (baseIpa) {
        return `/${baseIpa}s/`;
      }
    }
    if (clean.endsWith("ed")) {
      const base = clean.slice(0, -2);
      const baseIpa =
        PHONETIC_WORD_MAP[base] ||
        extractCoreIpa(fallbackDictionary?.[base]?.phonetic);
      if (baseIpa) {
        return `/${baseIpa}d/`;
      }
    }
  }

  // 3. Xử lý CỤM TỪ (Phrases): Ghép nối phiên âm IPA từ các từ thành phần
  if (clean.includes(" ") || clean.includes("-")) {
    const tokens = clean.split(/[\s\-]+/);
    const resolvedTokens: string[] = [];

    for (const token of tokens) {
      if (!token) continue;
      let tokenIpa =
        PHONETIC_WORD_MAP[token] ||
        extractCoreIpa(fallbackDictionary?.[token]?.phonetic);

      if (!tokenIpa && token.endsWith("s")) {
        const base = token.endsWith("es") ? token.slice(0, -2) : token.slice(0, -1);
        const baseIpa =
          PHONETIC_WORD_MAP[base] ||
          extractCoreIpa(fallbackDictionary?.[base]?.phonetic);
        if (baseIpa) {
          tokenIpa = `${baseIpa}s`;
        }
      }

      if (tokenIpa) {
        resolvedTokens.push(tokenIpa);
      } else {
        resolvedTokens.push(token);
      }
    }

    if (resolvedTokens.length > 0) {
      return `/${resolvedTokens.join(" ")}/`;
    }
  }

  return "";
}
