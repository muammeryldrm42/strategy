import { Candle, Signal, makeSignal, sma, atr } from "../indicators";

// Volume Surge - fiyat/hacim bazlı, demo trade'de çalışır
export function volumeSurge(c: Candle[]): Signal {
  if (c.length < 30) return makeSignal({ reason: "Yetersiz veri" });
  const vols = c.map((x) => x.volume), i = c.length - 1, cur = c[i];
  const avgV = sma(vols.slice(0, -1), 20)[vols.length - 2];
  const mult = cur.volume / (avgV || 1);
  if (mult < 3) return makeSignal({ reason: `Surge yok (${mult.toFixed(2)}x)` });
  if (cur.close <= cur.open) return makeSignal({ reason: "Kırmızı mumda hacim - pas" });
  const a = atr(c, 14), sl = cur.close - a[i] * 1.5, r = cur.close - sl;
  const conf = Math.min(0.5 + (mult - 3) * 0.05 + 0.2, 0.95);
  return makeSignal({ signal: "long", entry: cur.close, stop_loss: sl, take_profit: [cur.close + r * 2, cur.close + r * 3.5, cur.close + r * 5], confidence: conf, reason: `Volume surge ${mult.toFixed(1)}x, yeşil mum` });
}

// Tiered Exit - momentum entry (EMA cross), tiered TP demo motoru pozisyon yönetiminde uygular
export function tieredExit(c: Candle[]): Signal {
  if (c.length < 25) return makeSignal({ reason: "Yetersiz veri" });
  const closes = c.map((x) => x.close);
  const ef: number[] = [], es: number[] = [];
  const k9 = 2 / 10, k21 = 2 / 22;
  let p9 = closes[0], p21 = closes[0];
  for (let i = 0; i < closes.length; i++) { p9 = i === 0 ? closes[0] : closes[i] * k9 + p9 * (1 - k9); p21 = i === 0 ? closes[0] : closes[i] * k21 + p21 * (1 - k21); ef.push(p9); es.push(p21); }
  const i = c.length - 1, cur = c[i];
  if (ef[i] > es[i] && ef[i - 1] <= es[i - 1]) {
    const sl = cur.close * 0.75, r = cur.close - sl;
    // tiered: +50% / +150% / +300%
    return makeSignal({ signal: "long", entry: cur.close, stop_loss: sl, take_profit: [cur.close * 1.5, cur.close * 2.5, cur.close * 4], confidence: 0.7, reason: "EMA cross momentum (kademeli TP: +50/+150/+300%)" });
  }
  return makeSignal({ reason: "Momentum girişi yok" });
}
