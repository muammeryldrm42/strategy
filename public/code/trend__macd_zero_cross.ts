import { Candle, Signal, makeSignal, ema, sma, macd, atr } from '../indicators';

// 2. MACD Zero Cross - MACD çizgisi sıfır çizgisini geçer (güçlü trend onayı)
export function macdZeroCross(c: Candle[]): Signal {
