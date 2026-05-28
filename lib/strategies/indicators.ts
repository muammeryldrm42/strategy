import { Candle, Signal, makeSignal, ema, sma, rsi, macd, atr, bollingerBands, vwap, swingHighs, swingLows } from "../indicators";

// 1. Triple Confluence
export function tripleConfluence(c: Candle[]): Signal {
  if (c.length < 205) return makeSignal({ reason: "Yetersiz veri" });
  const closes = c.map((x) => x.close);
  const ef = ema(closes, 50), es = ema(closes, 200), rs = rsi(closes, 14);
  const { macd: ml, signal: sg, histogram: h } = macd(closes);
  const a = atr(c, 14), i = c.length - 1, cur = c[i];
  const longC = ef[i] > es[i] && cur.close > ef[i] && rs[i] > 50 && rs[i] < 70 && h[i] > 0 && ml[i] > sg[i] && h[i] > h[i - 1];
  const shortC = ef[i] < es[i] && cur.close < ef[i] && rs[i] > 30 && rs[i] < 50 && h[i] < 0 && ml[i] < sg[i] && h[i] < h[i - 1];
  if (longC) { const sl = cur.close - 2 * a[i], r = cur.close - sl; return makeSignal({ signal: "long", entry: cur.close, stop_loss: sl, take_profit: [cur.close + r * 1.5, cur.close + r * 2.5, cur.close + r * 4], confidence: 0.8, reason: "Triple confluence LONG" }); }
  if (shortC) { const sl = cur.close + 2 * a[i], r = sl - cur.close; return makeSignal({ signal: "short", entry: cur.close, stop_loss: sl, take_profit: [cur.close - r * 1.5, cur.close - r * 2.5, cur.close - r * 4], confidence: 0.8, reason: "Triple confluence SHORT" }); }
  return makeSignal({ reason: "Konfluans yok" });
}

// 2. BB Squeeze
export function bbSqueeze(c: Candle[]): Signal {
  if (c.length < 70) return makeSignal({ reason: "Yetersiz veri" });
  const closes = c.map((x) => x.close);
  const { upper, middle, lower } = bollingerBands(closes, 20, 2);
  const width = upper.map((u, i) => (u - lower[i]) / middle[i]);
  const cur = c[c.length - 1], prev = c[c.length - 2], i = c.length - 1;
  const recent = width.slice(-50).filter((v) => !isNaN(v)).sort((a, b) => a - b);
  const q25 = recent[Math.floor(recent.length * 0.25)];
  const wasSqueeze = width.slice(-5, -1).every((v) => v < q25);
  const vols = c.map((x) => x.volume), avgV = sma(vols, 20)[i];
  const volOk = cur.volume > avgV * 1.2;
  if (wasSqueeze && cur.close > upper[i] && prev.close <= upper[i - 1] && volOk) {
    const sl = middle[i], r = cur.close - sl;
    return makeSignal({ signal: "long", entry: cur.close, stop_loss: sl, take_profit: [cur.close + r * 1.5, cur.close + r * 2.5, cur.close + r * 4], confidence: 0.75, reason: "BB squeeze breakout UP" });
  }
  if (wasSqueeze && cur.close < lower[i] && prev.close >= lower[i - 1] && volOk) {
    const sl = middle[i], r = sl - cur.close;
    return makeSignal({ signal: "short", entry: cur.close, stop_loss: sl, take_profit: [cur.close - r * 1.5, cur.close - r * 2.5, cur.close - r * 4], confidence: 0.75, reason: "BB squeeze breakout DOWN" });
  }
  return makeSignal({ reason: "Squeeze breakout yok" });
}

// 3. Ichimoku
export function ichimoku(c: Candle[]): Signal {
  if (c.length < 100) return makeSignal({ reason: "Yetersiz veri" });
  const highs = c.map((x) => x.high), lows = c.map((x) => x.low);
  const rMax = (arr: number[], p: number, idx: number) => Math.max(...arr.slice(Math.max(0, idx - p + 1), idx + 1));
  const rMin = (arr: number[], p: number, idx: number) => Math.min(...arr.slice(Math.max(0, idx - p + 1), idx + 1));
  const i = c.length - 1;
  const tenkan = (rMax(highs, 9, i) + rMin(lows, 9, i)) / 2;
  const kijun = (rMax(highs, 26, i) + rMin(lows, 26, i)) / 2;
  const tenkanP = (rMax(highs, 9, i - 1) + rMin(lows, 9, i - 1)) / 2;
  const kijunP = (rMax(highs, 26, i - 1) + rMin(lows, 26, i - 1)) / 2;
  const ci = Math.max(0, i - 26);
  const sa = ((rMax(highs, 9, ci) + rMin(lows, 9, ci)) / 2 + (rMax(highs, 26, ci) + rMin(lows, 26, ci)) / 2) / 2;
  const sb = (rMax(highs, 52, ci) + rMin(lows, 52, ci)) / 2;
  const cloudTop = Math.max(sa, sb), cloudBot = Math.min(sa, sb), green = sa > sb;
  const cur = c[i];
  if (cur.close > cloudTop && tenkan > kijun && tenkanP <= kijunP && green) {
    const r = cur.close - kijun; if (r <= 0) return makeSignal({ reason: "Geçersiz risk" });
    return makeSignal({ signal: "long", entry: cur.close, stop_loss: kijun, take_profit: [cur.close + r * 2, cur.close + r * 3, cur.close + r * 5], confidence: 0.8, reason: "Ichimoku full bullish" });
  }
  if (cur.close < cloudBot && tenkan < kijun && tenkanP >= kijunP && !green) {
    const r = kijun - cur.close; if (r <= 0) return makeSignal({ reason: "Geçersiz risk" });
    return makeSignal({ signal: "short", entry: cur.close, stop_loss: kijun, take_profit: [cur.close - r * 2, cur.close - r * 3, cur.close - r * 5], confidence: 0.8, reason: "Ichimoku full bearish" });
  }
  return makeSignal({ reason: "Ichimoku hizalı değil" });
}

// 4. VWAP + Volume
export function vwapVolume(c: Candle[]): Signal {
  if (c.length < 50) return makeSignal({ reason: "Yetersiz veri" });
  const vw = vwap(c), i = c.length - 1, cur = c[i], prev = c[i - 1];
  const a = atr(c, 14), vols = c.map((x) => x.volume), avgV = sma(vols, 20)[i];
  const spike = cur.volume > avgV * 1.5;
  if (cur.close > vw[i] && prev.close <= vw[i - 1] && spike) {
    const sl = cur.close - 1.5 * a[i], r = cur.close - sl;
    return makeSignal({ signal: "long", entry: cur.close, stop_loss: sl, take_profit: [cur.close + r * 1.5, cur.close + r * 2.5, cur.close + r * 4], confidence: 0.72, reason: "VWAP breakout + hacim" });
  }
  if (cur.close < vw[i] && prev.close >= vw[i - 1] && spike) {
    const sl = cur.close + 1.5 * a[i], r = sl - cur.close;
    return makeSignal({ signal: "short", entry: cur.close, stop_loss: sl, take_profit: [cur.close - r * 1.5, cur.close - r * 2.5, cur.close - r * 4], confidence: 0.72, reason: "VWAP breakdown + hacim" });
  }
  return makeSignal({ reason: "VWAP cross + hacim yok" });
}

// 5. RSI Divergence
export function rsiDivergence(c: Candle[]): Signal {
  if (c.length < 44) return makeSignal({ reason: "Yetersiz veri" });
  const closes = c.map((x) => x.close), rs = rsi(closes, 14);
  const sh = swingHighs(c, 5), sl = swingLows(c, 5);
  const li: number[] = [], hi: number[] = [];
  sl.forEach((v, i) => v !== null && li.push(i));
  sh.forEach((v, i) => v !== null && hi.push(i));
  if (li.length < 2 || hi.length < 2) return makeSignal({ reason: "Yetersiz swing" });
  const a = atr(c, 14), cur = c[c.length - 1], ai = a.length - 1;
  const l1 = li[li.length - 2], l2 = li[li.length - 1];
  const h1 = hi[hi.length - 2], h2 = hi[hi.length - 1];
  if (c[l2].low < c[l1].low && rs[l2] > rs[l1] && rs[l2] < 40) {
    const sv = c[l2].low - 0.3 * a[ai], r = cur.close - sv;
    if (r > 0) return makeSignal({ signal: "long", entry: cur.close, stop_loss: sv, take_profit: [cur.close + r * 2, cur.close + r * 3, cur.close + r * 5], confidence: 0.78, reason: "Bullish RSI divergence" });
  }
  if (c[h2].high > c[h1].high && rs[h2] < rs[h1] && rs[h2] > 60) {
    const sv = c[h2].high + 0.3 * a[ai], r = sv - cur.close;
    if (r > 0) return makeSignal({ signal: "short", entry: cur.close, stop_loss: sv, take_profit: [cur.close - r * 2, cur.close - r * 3, cur.close - r * 5], confidence: 0.78, reason: "Bearish RSI divergence" });
  }
  return makeSignal({ reason: "RSI divergence yok" });
}

// 6. Chandelier
export function chandelier(c: Candle[]): Signal {
  if (c.length < 205) return makeSignal({ reason: "Yetersiz veri" });
  const closes = c.map((x) => x.close), a = atr(c, 22), e = ema(closes, 200);
  const highs = c.map((x) => x.high), lows = c.map((x) => x.low);
  const ls: number[] = [], ss: number[] = [];
  for (let i = 0; i < c.length; i++) {
    if (i < 21) { ls.push(NaN); ss.push(NaN); continue; }
    ls.push(Math.max(...highs.slice(i - 21, i + 1)) - a[i] * 3);
    ss.push(Math.min(...lows.slice(i - 21, i + 1)) + a[i] * 3);
  }
  const i = c.length - 1, cur = c[i], prev = c[i - 1];
  if (cur.close > ss[i] && prev.close <= ss[i - 1] && cur.close > e[i]) {
    const r = cur.close - ls[i]; if (r <= 0) return makeSignal({ reason: "Geçersiz risk" });
    return makeSignal({ signal: "long", entry: cur.close, stop_loss: ls[i], take_profit: [cur.close + r * 1.5, cur.close + r * 2.5, cur.close + r * 4], confidence: 0.7, reason: "Chandelier long breakout" });
  }
  if (cur.close < ls[i] && prev.close >= ls[i - 1] && cur.close < e[i]) {
    const r = ss[i] - cur.close; if (r <= 0) return makeSignal({ reason: "Geçersiz risk" });
    return makeSignal({ signal: "short", entry: cur.close, stop_loss: ss[i], take_profit: [cur.close - r * 1.5, cur.close - r * 2.5, cur.close - r * 4], confidence: 0.7, reason: "Chandelier short breakout" });
  }
  return makeSignal({ reason: "Chandelier breakout yok" });
}

// 7. Supertrend + ADX
function calcAdx(c: Candle[], p = 14): number[] {
  const res: number[] = new Array(c.length).fill(NaN);
  if (c.length < p * 2) return res;
  const pdm = [0], mdm = [0], trs = [c[0].high - c[0].low];
  for (let i = 1; i < c.length; i++) {
    const up = c[i].high - c[i - 1].high, dn = c[i - 1].low - c[i].low;
    pdm.push(up > dn && up > 0 ? up : 0); mdm.push(dn > up && dn > 0 ? dn : 0);
    trs.push(Math.max(c[i].high - c[i].low, Math.abs(c[i].high - c[i - 1].close), Math.abs(c[i].low - c[i - 1].close)));
  }
  let sp = pdm.slice(1, p + 1).reduce((a, b) => a + b, 0), sm = mdm.slice(1, p + 1).reduce((a, b) => a + b, 0), st = trs.slice(1, p + 1).reduce((a, b) => a + b, 0);
  const dx: number[] = [];
  for (let i = p; i < c.length; i++) {
    if (i > p) { sp = sp - sp / p + pdm[i]; sm = sm - sm / p + mdm[i]; st = st - st / p + trs[i]; }
    const pdi = 100 * (sp / (st || 1e-10)), mdi = 100 * (sm / (st || 1e-10));
    dx.push(100 * (Math.abs(pdi - mdi) / ((pdi + mdi) || 1e-10)));
  }
  for (let i = 0; i < dx.length; i++) { if (i < p - 1) continue; res[i + p] = dx.slice(i - p + 1, i + 1).reduce((a, b) => a + b, 0) / p; }
  return res;
}
function calcSt(c: Candle[], p = 10, m = 3) {
  const a = atr(c, p), st: number[] = new Array(c.length).fill(NaN), dir: number[] = new Array(c.length).fill(0);
  for (let i = 0; i < c.length; i++) {
    const hl2 = (c[i].high + c[i].low) / 2, ub = hl2 + m * a[i], lb = hl2 - m * a[i];
    if (i === 0) { st[i] = ub; dir[i] = -1; continue; }
    if (c[i - 1].close > st[i - 1]) { st[i] = Math.max(lb, st[i - 1]); if (c[i].close < st[i]) { st[i] = ub; dir[i] = -1; } else dir[i] = 1; }
    else { st[i] = Math.min(ub, st[i - 1]); if (c[i].close > st[i]) { st[i] = lb; dir[i] = 1; } else dir[i] = -1; }
  }
  return { st, dir };
}
export function supertrendAdx(c: Candle[]): Signal {
  if (c.length < 60) return makeSignal({ reason: "Yetersiz veri" });
  const { st, dir } = calcSt(c, 10, 3), adx = calcAdx(c, 14), i = c.length - 1, cur = c[i];
  const up = dir[i] === 1 && dir[i - 1] === -1, dn = dir[i] === -1 && dir[i - 1] === 1, strong = adx[i] > 25;
  if (up && strong) { const r = cur.close - st[i]; if (r <= 0) return makeSignal({ reason: "Geçersiz risk" }); return makeSignal({ signal: "long", entry: cur.close, stop_loss: st[i], take_profit: [cur.close + r * 1.5, cur.close + r * 2.5, cur.close + r * 4], confidence: 0.78, reason: `Supertrend flip up + ADX ${adx[i].toFixed(0)}` }); }
  if (dn && strong) { const r = st[i] - cur.close; if (r <= 0) return makeSignal({ reason: "Geçersiz risk" }); return makeSignal({ signal: "short", entry: cur.close, stop_loss: st[i], take_profit: [cur.close - r * 1.5, cur.close - r * 2.5, cur.close - r * 4], confidence: 0.78, reason: `Supertrend flip down + ADX ${adx[i].toFixed(0)}` }); }
  return makeSignal({ reason: "Supertrend flip + güçlü ADX yok" });
}

// 8. Wyckoff
export function wyckoff(c: Candle[]): Signal {
  if (c.length < 80) return makeSignal({ reason: "Yetersiz veri" });
  const i = c.length - 1, cur = c[i], a = atr(c, 14), ca = a[i];
  const rng = c.slice(c.length - 35, c.length - 1);
  const rh = Math.max(...rng.map((x) => x.high)), rl = Math.min(...rng.map((x) => x.low)), size = rh - rl;
  const vols = c.map((x) => x.volume), avgV = sma(vols, 50)[i], hv = cur.volume > avgV * 1.5;
  if (size / ca >= 8) return makeSignal({ reason: "Konsolidasyon yok" });
  if (cur.low < rl && cur.close > rl && cur.close > cur.open && hv) {
    return makeSignal({ signal: "long", entry: cur.close, stop_loss: cur.low - 0.5 * ca, take_profit: [rh, rh + size * 0.5, rh + size], confidence: 0.82, reason: "Wyckoff Spring (accumulation)" });
  }
  if (cur.high > rh && cur.close < rh && cur.close < cur.open && hv) {
    return makeSignal({ signal: "short", entry: cur.close, stop_loss: cur.high + 0.5 * ca, take_profit: [rl, rl - size * 0.5, rl - size], confidence: 0.82, reason: "Wyckoff Upthrust (distribution)" });
  }
  return makeSignal({ reason: "Spring/Upthrust yok" });
}
