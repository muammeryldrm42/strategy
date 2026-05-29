import { Candle, Signal, makeSignal, ema, sma, macd, atr } from '../indicators';

// 3. Heikin Ashi Trend - HA mumları renk değişimi + gövde gücü
export function heikinAshiTrend(c: Candle[]): Signal {
