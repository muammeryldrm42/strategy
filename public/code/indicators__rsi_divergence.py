"""
RSI Divergence Strategy
=======================
Regular bullish: Fiyat LL, RSI HL = trend tersine dönecek (long).
Regular bearish: Fiyat HH, RSI LH = trend tersine dönecek (short).
Hidden bullish: Fiyat HL, RSI LL = trend devamı (long).
Hidden bearish: Fiyat LH, RSI HH = trend devamı (short).
"""
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
import pandas as pd
import numpy as np
from common import make_signal, rsi, atr, swing_highs_lows


def detect_rsi_divergence_signal(
    df: pd.DataFrame,
    rsi_period: int = 14,
    swing_lb: int = 5,
    lookback: int = 30,
) -> dict:
    if len(df) < lookback + rsi_period + 10:
        return make_signal(reason="Insufficient data")

    rsi_v = rsi(df["close"], rsi_period)
    sh, sl = swing_highs_lows(df, swing_lb)
    current = df.iloc[-1]
    current_atr = atr(df, 14).iloc[-1]

    # Son 2 swing high & low
    recent_lows = df["low"][sl.notna()].tail(2)
    recent_highs = df["high"][sh.notna()].tail(2)
    if len(recent_lows) < 2 or len(recent_highs) < 2:
        return make_signal(reason="Not enough swings")

    # Karşılık gelen RSI değerleri
    low_indices = sl.dropna().tail(2).index
    high_indices = sh.dropna().tail(2).index
    rsi_at_lows = [rsi_v.loc[i] for i in low_indices]
    rsi_at_highs = [rsi_v.loc[i] for i in high_indices]

    # Regular bullish divergence: price LL, RSI HL
    if recent_lows.iloc[1] < recent_lows.iloc[0] and rsi_at_lows[1] > rsi_at_lows[0] and rsi_at_lows[1] < 40:
        entry = current["close"]
        stop_loss = recent_lows.iloc[1] - 0.3 * current_atr
        risk = entry - stop_loss
        if risk > 0:
            return make_signal(
                signal="long",
                entry=entry,
                stop_loss=stop_loss,
                take_profit=[entry + risk * 2, entry + risk * 3, entry + risk * 5],
                confidence=0.78,
                reason="Regular bullish RSI divergence",
                metadata={"rsi_now": float(rsi_v.iloc[-1])},
            )

    # Regular bearish: price HH, RSI LH
    if recent_highs.iloc[1] > recent_highs.iloc[0] and rsi_at_highs[1] < rsi_at_highs[0] and rsi_at_highs[1] > 60:
        entry = current["close"]
        stop_loss = recent_highs.iloc[1] + 0.3 * current_atr
        risk = stop_loss - entry
        if risk > 0:
            return make_signal(
                signal="short",
                entry=entry,
                stop_loss=stop_loss,
                take_profit=[entry - risk * 2, entry - risk * 3, entry - risk * 5],
                confidence=0.78,
                reason="Regular bearish RSI divergence",
                metadata={"rsi_now": float(rsi_v.iloc[-1])},
            )

    return make_signal(reason="No RSI divergence")
