"""
Order Block Strategy
====================
Son bullish/bearish mum + agresif hareket + retest = entry.

Bullish OB: Düşüş yapısının son düşüş mumu, sonrasında güçlü yükseliş.
Bearish OB: Yükseliş yapısının son yükseliş mumu, sonrasında güçlü düşüş.

Entry: OB'nin retest'inde (mumun gövdesine değme)
SL: OB'nin diğer ucu + 0.5 ATR
TP: 1:2, 1:3, 1:5
"""
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

import pandas as pd
import numpy as np
from common import make_signal, atr, ema


def detect_order_blocks(df: pd.DataFrame, impulse_atr: float = 1.5, lookback: int = 50):
    """
    Order block tespiti.
    impulse_atr: Sonraki hareket bu kadar ATR olursa OB geçerli.
    """
    atr_series = atr(df, 14)
    obs = []

    for i in range(3, min(len(df) - 1, lookback + 3)):
        idx = len(df) - lookback + i if len(df) > lookback else i
        if idx >= len(df) - 1 or idx < 1:
            continue
        candle = df.iloc[idx]
        next_candle = df.iloc[idx + 1] if idx + 1 < len(df) else None
        if next_candle is None:
            continue
        current_atr = atr_series.iloc[idx]
        if pd.isna(current_atr):
            continue

        # Bearish candle + güçlü yükseliş = bullish OB
        if candle["close"] < candle["open"]:
            impulse = next_candle["high"] - candle["low"]
            if impulse >= current_atr * impulse_atr and next_candle["close"] > candle["high"]:
                obs.append({
                    "index": idx,
                    "type": "bullish",
                    "top": candle["high"],
                    "bottom": candle["low"],
                    "open": candle["open"],
                    "close": candle["close"],
                })

        # Bullish candle + güçlü düşüş = bearish OB
        elif candle["close"] > candle["open"]:
            impulse = candle["high"] - next_candle["low"]
            if impulse >= current_atr * impulse_atr and next_candle["close"] < candle["low"]:
                obs.append({
                    "index": idx,
                    "type": "bearish",
                    "top": candle["high"],
                    "bottom": candle["low"],
                    "open": candle["open"],
                    "close": candle["close"],
                })

    return obs


def detect_order_block_signal(
    df: pd.DataFrame,
    impulse_atr: float = 1.5,
    use_trend_filter: bool = True,
    ema_period: int = 200,
) -> dict:
    if len(df) < ema_period + 10:
        return make_signal(reason="Insufficient data")

    obs = detect_order_blocks(df, impulse_atr)
    if not obs:
        return make_signal(reason="No order block detected")

    current_price = df["close"].iloc[-1]
    current_atr = atr(df, 14).iloc[-1]
    trend_ema = ema(df["close"], ema_period).iloc[-1]
    trend = "up" if current_price > trend_ema else "down"

    for ob in reversed(obs):
        # Retest kontrolü
        if ob["type"] == "bullish":
            if use_trend_filter and trend != "up":
                continue
            # Fiyat OB içine girdi mi?
            if current_price <= ob["top"] and current_price >= ob["bottom"]:
                entry = (ob["top"] + ob["bottom"]) / 2
                stop_loss = ob["bottom"] - (0.5 * current_atr)
                risk = entry - stop_loss
                return make_signal(
                    signal="long",
                    entry=entry,
                    stop_loss=stop_loss,
                    take_profit=[entry + risk * 2, entry + risk * 3, entry + risk * 5],
                    confidence=0.78,
                    reason=f"Bullish OB retest at {entry:.4f}",
                    metadata={"ob": ob, "trend": trend},
                )
        else:
            if use_trend_filter and trend != "down":
                continue
            if current_price <= ob["top"] and current_price >= ob["bottom"]:
                entry = (ob["top"] + ob["bottom"]) / 2
                stop_loss = ob["top"] + (0.5 * current_atr)
                risk = stop_loss - entry
                return make_signal(
                    signal="short",
                    entry=entry,
                    stop_loss=stop_loss,
                    take_profit=[entry - risk * 2, entry - risk * 3, entry - risk * 5],
                    confidence=0.78,
                    reason=f"Bearish OB retest at {entry:.4f}",
                    metadata={"ob": ob, "trend": trend},
                )

    return make_signal(reason="No active OB retest")
