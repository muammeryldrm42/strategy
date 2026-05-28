import { Candle, Signal } from "./indicators";
import * as smc from "./strategies/smc";
import * as ind from "./strategies/indicators";
import * as meme from "./strategies/memecoin";

export type Category = "smc" | "indicators" | "memecoin";

export interface StrategyMeta {
  id: string;
  slug: string;        // public/code dosya prefix'i: {category}__{slug}
  name: string;
  category: Category;
  short: string;       // kısa açıklama
  description: string; // detaylı açıklama (TR)
  entry: string;       // giriş kuralı
  exit: string;        // çıkış / risk
  confidence: number;  // tipik confidence
  langs: ("python" | "typescript" | "pinescript")[];
  // Demo trade için çalıştırılabilir runner. null ise off-chain veri gerektirir.
  run: ((c: Candle[]) => Signal) | null;
  offchainNote?: string;
}

export const STRATEGIES: StrategyMeta[] = [
  // ---------------- SMC ----------------
  {
    id: "fvg", slug: "fvg", name: "Fair Value Gap (FVG)", category: "smc",
    short: "3 mumda oluşan likidite boşluğu, mitigation'da giriş.",
    description: "Üç ardışık mumda oluşan doldurulmamış likidite boşluğu. Fiyat hızlı hareket ettiğinde arada boşluk kalır; piyasa genelde bu boşluğu doldurmaya (mitigation) geri döner. Bullish FVG: candle[i-2].high < candle[i].low. Bearish FVG: candle[i-2].low > candle[i].high.",
    entry: "FVG'nin %50 orta noktasına (midpoint) geri çekilmede, EMA200 trend yönünde.",
    exit: "SL: FVG'nin ters ucu + 0.5 ATR. TP: 1:2, 1:3, 1:5 RR kademeli.",
    confidence: 0.75, langs: ["python", "typescript", "pinescript"], run: smc.fvg,
  },
  {
    id: "order_block", slug: "order_block", name: "Order Block", category: "smc",
    short: "Güçlü hareketten önceki son zıt-yön mum, retest'te giriş.",
    description: "Güçlü bir impulse hareketinden önceki son zıt-yön mum. Kurumların emir biriktirdiği bölge. Fiyat bu bölgeye geri döndüğünde (retest) tepki verir. Bullish OB: düşüş mumu + ardından ≥1.5 ATR yükseliş impulse.",
    entry: "OB bölgesinin retest'inde (gövde ortası), trend yönünde.",
    exit: "SL: OB'nin diğer ucu + 0.5 ATR. TP: 1:2, 1:3, 1:5.",
    confidence: 0.78, langs: ["python", "typescript", "pinescript"], run: smc.orderBlock,
  },
  {
    id: "liquidity_grab_bos", slug: "liquidity_grab_bos", name: "Liquidity Grab + BOS", category: "smc",
    short: "Stop-hunt + yapı kırılımı (Break of Structure).",
    description: "Stop-hunt + yapı kırılımı kombinasyonu. Fiyat önce likiditeyi süpürür (önceki swing'i wick ile aşar), sonra gerçek yönde yapıyı kırar. En yüksek confidence'lı SMC stratejilerinden.",
    entry: "BOS onayı geldiğinde market girişi.",
    exit: "SL: süpürülen wick + 0.3 ATR. TP: 1:2, 1:3, 1:5.",
    confidence: 0.82, langs: ["python", "typescript", "pinescript"], run: smc.liquidityGrabBos,
  },
  {
    id: "inducement", slug: "inducement", name: "Inducement & Mitigation", category: "smc",
    short: "Sahte kırılım ile retail tuzağa düşürülür, gerçek yön başlar.",
    description: "Inducement = düşük zaman diliminde sahte kırılım ile likidite çekme. Retail tuzağa düşürülür, sonra gerçek yön başlar. Swing seviyesinin altına/üstüne wick atılır ama kapatılamaz, hızlı dönüş gelir.",
    entry: "Önceki 3 mumun aralığı kırıldığında.",
    exit: "SL: wick dibi/tepesi + 0.3 ATR. TP: 1:2, 1:3, 1:5.",
    confidence: 0.7, langs: ["python", "typescript", "pinescript"], run: smc.inducement,
  },
  {
    id: "eq_sweep", slug: "eq_sweep", name: "Equal Highs/Lows Sweep", category: "smc",
    short: "Yakın seviyedeki likidite havuzunun süpürülmesi.",
    description: "Birbirine çok yakın seviyede oluşan 2+ high/low = likidite havuzu. Bu seviyenin üstünde/altında stoplar birikir. Süpürme + dönüş = giriş. Double top/bottom benzeri formasyonlarda işe yarar.",
    entry: "EQH/EQL sweep + dönüş mumu (tolerans 0.15 ATR).",
    exit: "SL: sweep wick + 0.3 ATR. TP: 1:2, 1:3, 1:5.",
    confidence: 0.76, langs: ["python", "typescript", "pinescript"], run: smc.eqSweep,
  },
  {
    id: "breaker_block", slug: "breaker_block", name: "Breaker Block", category: "smc",
    short: "Başarısız order block, ters yönde direnç/destek olur.",
    description: "Başarısız order block. Bir OB kırıldığında, o bölge ters yönde direnç/destek görevi görür. Failed bullish OB → bearish breaker. Trend dönüşlerinde, yapı değişimi sonrası kullanılır.",
    entry: "Kırılan OB'nin retest'inde ters yönde.",
    exit: "SL: breaker'ın ters ucu + 0.5 ATR. TP: 1:2, 1:3, 1:5.",
    confidence: 0.74, langs: ["python", "typescript", "pinescript"], run: smc.breakerBlock,
  },
  {
    id: "ote", slug: "ote", name: "Optimal Trade Entry (OTE)", category: "smc",
    short: "Fibonacci 0.62-0.79 geri çekilme bölgesi.",
    description: "Son impulse hareketinin Fibonacci 0.62-0.79 geri çekilme bölgesi. Premium (0.5 üstü) = pahalı bölge (short), Discount (0.5 altı) = ucuz bölge (long). ICT metodolojisinin temel taşı.",
    entry: "Trend yönünde 0.62-0.79 fib zone'a çekilmede.",
    exit: "SL: impulse dibi/tepesi + 0.3 ATR. Son TP impulse zirvesine.",
    confidence: 0.77, langs: ["python", "typescript", "pinescript"], run: smc.ote,
  },

  // ---------------- INDICATORS ----------------
  {
    id: "triple_confluence", slug: "triple_confluence", name: "Triple Confluence", category: "indicators",
    short: "EMA + RSI + MACD üçlü onayı.",
    description: "Üç bağımsız indikatörün aynı yönü işaret etmesi. Yanlış sinyalleri ciddi şekilde azaltır. EMA50>EMA200 trend, RSI 50-70 momentum, MACD histogram pozitif ve artıyor.",
    entry: "Üç koşul da sağlandığında.",
    exit: "SL: 2 ATR. TP: 1:1.5, 1:2.5, 1:4.",
    confidence: 0.8, langs: ["python", "typescript", "pinescript"], run: ind.tripleConfluence,
  },
  {
    id: "bb_squeeze", slug: "bb_squeeze", name: "Bollinger Squeeze Breakout", category: "indicators",
    short: "Daralan bant sonrası volatilite patlaması.",
    description: "Bollinger Band'ları daraldığında (squeeze) volatilite düşüktür; bunu genelde patlama izler. Squeeze sonrası bant dışına kırılım = giriş. Konsolidasyon sonrası breakout yakalama.",
    entry: "Squeeze sonrası bant kırılımı + hacim teyidi (1.2x).",
    exit: "SL: orta bant. TP: 1:1.5, 1:2.5, 1:4.",
    confidence: 0.75, langs: ["python", "typescript", "pinescript"], run: ind.bbSqueeze,
  },
  {
    id: "ichimoku", slug: "ichimoku", name: "Ichimoku Cloud Breakout", category: "indicators",
    short: "Tüm Ichimoku bileşenlerinin hizalanması.",
    description: "Bulut (Kumo), Tenkan/Kijun kesişimi ve renk onayı bir arada. Fiyat bulut üstünde + Tenkan>Kijun cross + Kumo yeşil = long. Güçlü trendlerde tüm onaylar hizalı girince.",
    entry: "Fiyat bulut dışında + TK cross + Kumo rengi onayı.",
    exit: "SL: Kijun-sen seviyesi. TP: 1:2, 1:3, 1:5.",
    confidence: 0.8, langs: ["python", "typescript", "pinescript"], run: ind.ichimoku,
  },
  {
    id: "vwap_volume", slug: "vwap_volume", name: "VWAP + Volume Profile", category: "indicators",
    short: "VWAP cross + hacim spike.",
    description: "VWAP kurumsal ortalama maliyet. Üstü premium, altı discount. Hacim spike'ı (1.5x ortalama) ile VWAP cross = giriş. Intraday hacim teyitli girişler.",
    entry: "Hacim spike ile VWAP cross.",
    exit: "SL: 1.5 ATR. TP1 Value Area seviyesine.",
    confidence: 0.72, langs: ["python", "typescript", "pinescript"], run: ind.vwapVolume,
  },
  {
    id: "rsi_divergence", slug: "rsi_divergence", name: "RSI Divergence", category: "indicators",
    short: "Fiyat ve RSI uyumsuzluğu.",
    description: "Fiyat ve RSI'ın uyumsuzluğu trend zayıflamasını gösterir. Regular bullish: fiyat LL, RSI HL (RSI<40). Regular bearish: fiyat HH, RSI LH (RSI>60). Trend dönüş noktaları.",
    entry: "Divergence tespitinde.",
    exit: "SL: son swing + 0.3 ATR. TP: 1:2, 1:3, 1:5.",
    confidence: 0.78, langs: ["python", "typescript", "pinescript"], run: ind.rsiDivergence,
  },
  {
    id: "chandelier", slug: "chandelier", name: "Chandelier Exit", category: "indicators",
    short: "ATR tabanlı trailing stop sistemi.",
    description: "ATR tabanlı trailing stop. Highest high'dan ATR×3 aşağısı = long stop. Fiyat short-stop'u yukarı kırarsa long. Trend takibi + dinamik stop yönetimi.",
    entry: "Fiyat chandelier seviyesini kırarsa, EMA200 yönünde.",
    exit: "SL: Chandelier seviyesi. TP: 1:1.5, 1:2.5, 1:4.",
    confidence: 0.7, langs: ["python", "typescript", "pinescript"], run: ind.chandelier,
  },
  {
    id: "supertrend_adx", slug: "supertrend_adx", name: "Supertrend + ADX", category: "indicators",
    short: "Supertrend yön + ADX güç filtresi.",
    description: "Supertrend yön verir, ADX trend gücünü filtreler. Zayıf trendde (ADX<25) sinyal alınmaz. Supertrend flip + ADX>25 = giriş. Güçlü trend ortamları için.",
    entry: "Supertrend renk değişimi + ADX>25.",
    exit: "SL: Supertrend çizgisi. TP: 1:1.5, 1:2.5, 1:4.",
    confidence: 0.78, langs: ["python", "typescript", "pinescript"], run: ind.supertrendAdx,
  },
  {
    id: "wyckoff", slug: "wyckoff", name: "Wyckoff Phase Detection", category: "indicators",
    short: "Spring / Upthrust tespiti.",
    description: "Wyckoff accumulation/distribution fazları. Spring (taban yalancı kırılım) ve Upthrust (tepe yalancı kırılım) tespiti. Uzun konsolidasyon sonrası büyük hareketleri yakalar. En yüksek confidence (0.82).",
    entry: "Spring (long) veya Upthrust (short) + yüksek hacim, range içinde.",
    exit: "SL: wick + 0.5 ATR. TP: range karşı ucu ve ötesi.",
    confidence: 0.82, langs: ["python", "typescript", "pinescript"], run: ind.wyckoff,
  },

  // ---------------- MEMECOIN ----------------
  {
    id: "volume_surge", slug: "volume_surge", name: "Volume Surge", category: "memecoin",
    short: "Hacim patlaması + pozitif momentum.",
    description: "Tokenın hacminde ani patlama + pozitif momentum. 5m hacim ortalamanın 3x+ üstünde + yeşil mum. Demo trade'de canlı fiyat/hacim ile çalışır (fiyat-bazlı).",
    entry: "Hacim ≥3x ortalama + yeşil mum.",
    exit: "SL: 1.5 ATR. TP: +50/+150/+300% benzeri kademeli.",
    confidence: 0.7, langs: ["python", "typescript", "pinescript"], run: meme.volumeSurge,
  },
  {
    id: "tiered_exit", slug: "tiered_exit", name: "Tiered Exit", category: "memecoin",
    short: "Kademeli kar alma + trailing stop sistemi.",
    description: "Memecoin'lerin hızlı pump-dump profiline uygun kademeli kar alma. +50% / +150% / +300% seviyelerinde parça parça satış, trailing stop ile moonbag takibi. Demo'da EMA cross momentum girişi + kademeli TP.",
    entry: "EMA9/EMA21 cross (momentum).",
    exit: "Kademeli TP: +50% (%30 sat), +150%, +300%. Hard SL -25%.",
    confidence: 0.7, langs: ["python", "typescript", "pinescript"], run: meme.tieredExit,
  },
  {
    id: "bonding_curve_sniper", slug: "bonding_curve_sniper", name: "Bonding Curve Sniper", category: "memecoin",
    short: "Pump.fun bonding curve erken giriş.",
    description: "Yeni launch edilen tokenı bonding curve'un erken aşamasında (%10-35) yakalar. 7 kriterli skorlama; 6/7 geçerse giriş. Yaş, BC progress, MC, dev %, holder, top10, buy/sell ratio.",
    entry: "Skor ≥6/7. Off-chain token verisi gerekir.",
    exit: "TP: +50/+150/+300%. SL: -30% hard stop.",
    confidence: 0.7, langs: ["python", "typescript"], run: null,
    offchainNote: "Bu strateji on-chain token verisi (bonding curve %, holder count, dev wallet) gerektirir; canlı fiyat grafiğiyle demo trade yapılamaz. Python/TS kodunu kendi data kaynağınla (Pump.fun/Helius API) kullan.",
  },
  {
    id: "dev_pattern", slug: "dev_pattern", name: "Dev Pattern & First Buyers", category: "memecoin",
    short: "Dev wallet geçmişi + ilk alıcı analizi.",
    description: "Geliştirici cüzdanının geçmişi ve ilk alıcı yapısı ile rug riskini değerlendirir. Red flag varsa otomatik elenir. Dev holding, launch geçmişi, bundle tespiti, unique alıcılar.",
    entry: "3+ green flag, red flag yok. Off-chain veri gerekir.",
    exit: "TP: 1.5x/3x/6x MC. SL: -35%.",
    confidence: 0.85, langs: ["python", "typescript"], run: null,
    offchainNote: "Dev wallet geçmişi, ilk alıcı listesi ve bundle verisi gerektirir; canlı grafik demo'su yapılamaz. Helius/RugCheck API ile kullan.",
  },
  {
    id: "holder_distribution", slug: "holder_distribution", name: "Holder Distribution", category: "memecoin",
    short: "Top holder konsantrasyon analizi.",
    description: "Token holder yapısının sağlığı. Dağınık = güvenli, konsantre = manipülasyon/rug riski. Top1≤%8, Top10≤%40, holder≥100 ideal. Top1>%20 veya Top10>%75 tehlike (short sinyali).",
    entry: "5 kriterden 4'ü geçerse long. Off-chain veri gerekir.",
    exit: "TP: 1.5x/2.5x/4x MC. SL: -30%.",
    confidence: 0.75, langs: ["python", "typescript"], run: null,
    offchainNote: "Top holder dağılımı (Birdeye/Solscan API) gerektirir; canlı grafik demo'su yapılamaz.",
  },
  {
    id: "social_momentum", slug: "social_momentum", name: "Social Momentum", category: "memecoin",
    short: "Sosyal medya mention velocity.",
    description: "Tokenın sosyal medya hızı (Twitter/Telegram/Farcaster). Mention velocity, unique poster, sentiment, KOL mention. Spam oranı >%60 ise pas. Viral momentum öncesi erken pozisyon.",
    entry: "5 kriterden 4'ü geçerse long. Off-chain veri gerekir.",
    exit: "TP: 1.5x/2.5x/4x. SL: -20%.",
    confidence: 0.75, langs: ["python", "typescript"], run: null,
    offchainNote: "Sosyal mention verisi (Neynar/LunarCrush/Twitter API) gerektirir; canlı grafik demo'su yapılamaz.",
  },
  {
    id: "migration_play", slug: "migration_play", name: "Migration Play", category: "memecoin",
    short: "Raydium/Meteora migration event'i.",
    description: "Bonding curve %100 → Raydium/Meteora migration. Migration genelde +50-200% pump getirir. Pre-migration (≥%90, riskli) veya post-migration (ilk 5dk, LP locked, güvenli) giriş.",
    entry: "Pre/post-migration koşulları. Off-chain veri gerekir.",
    exit: "TP kademeli. LP lock kontrolü zorunlu.",
    confidence: 0.78, langs: ["python", "typescript"], run: null,
    offchainNote: "Migration durumu ve LP lock verisi (Pump.fun webhook/Raydium API) gerektirir; canlı grafik demo'su yapılamaz.",
  },
];

export function getStrategy(id: string) {
  return STRATEGIES.find((s) => s.id === id);
}

export function byCategory(cat: Category) {
  return STRATEGIES.filter((s) => s.category === cat);
}

export const CATEGORY_LABELS: Record<Category, string> = {
  smc: "SMC / Price Action",
  indicators: "Klasik İndikatör",
  memecoin: "Memecoin",
};
