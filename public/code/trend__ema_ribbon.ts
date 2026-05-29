import { Candle, Signal, makeSignal, ema, sma, macd, atr } from '../indicators';

// 1. EMA Ribbon - çoklu EMA hizalaması (8/13/21/34/55)
export function emaRibbon(c: Candle[]): Signal {
