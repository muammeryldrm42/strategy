"use client";
import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, ColorType, LineStyle } from "lightweight-charts";
import { Candle } from "@/lib/indicators";
import { Position } from "@/lib/wallet";

interface Props {
  candles: Candle[];
  positions: Position[];
  symbol: string;
}

export default function PriceChart({ candles, positions, symbol }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<any[]>([]);

  // Chart kur (1 kez)
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b7d93",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(28, 39, 53, 0.5)" },
        horzLines: { color: "rgba(28, 39, 53, 0.5)" },
      },
      rightPriceScale: { borderColor: "#1c2735" },
      timeScale: { borderColor: "#1c2735", timeVisible: true, secondsVisible: false },
      crosshair: {
        mode: 1,
        vertLine: { color: "#2a3a4f", style: LineStyle.Dashed },
        horzLine: { color: "#2a3a4f", style: LineStyle.Dashed },
      },
      width: ref.current.clientWidth,
      height: 380,
    });
    const series = chart.addCandlestickSeries({
      upColor: "#00ff9d", downColor: "#ff3b6b",
      borderUpColor: "#00ff9d", borderDownColor: "#ff3b6b",
      wickUpColor: "#00b873", wickDownColor: "#c41f4a",
    });
    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (ref.current && chartRef.current) chart.applyOptions({ width: ref.current.clientWidth });
    });
    ro.observe(ref.current);

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; seriesRef.current = null; };
  }, []);

  // Candle veri güncelle
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;
    const data: CandlestickData[] = candles.map((c) => ({
      time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close,
    }));
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles, symbol]);

  // Pozisyon overlay'leri (entry, SL, TP, liq çizgileri)
  useEffect(() => {
    if (!seriesRef.current) return;
    // Eski çizgileri temizle
    priceLinesRef.current.forEach((pl) => { try { seriesRef.current!.removePriceLine(pl); } catch {} });
    priceLinesRef.current = [];
    // Yeni çizgiler
    const symPositions = positions.filter((p) => p.symbol === symbol);
    symPositions.forEach((pos) => {
      const sideClr = pos.side === "long" ? "#00ff9d" : "#ff3b6b";
      // Entry
      priceLinesRef.current.push(seriesRef.current!.createPriceLine({
        price: pos.entry, color: sideClr, lineWidth: 2, lineStyle: LineStyle.Solid,
        axisLabelVisible: true, title: `${pos.side.toUpperCase()} ${pos.leverage}x`,
      }));
      // Stop Loss
      priceLinesRef.current.push(seriesRef.current!.createPriceLine({
        price: pos.stop_loss, color: "#ff3b6b", lineWidth: 1, lineStyle: LineStyle.Dashed,
        axisLabelVisible: true, title: "SL",
      }));
      // Take Profits
      pos.take_profit.forEach((tp, i) => {
        priceLinesRef.current.push(seriesRef.current!.createPriceLine({
          price: tp, color: "#00ff9d", lineWidth: 1, lineStyle: LineStyle.Dashed,
          axisLabelVisible: true, title: `TP${i + 1}`,
        }));
      });
      // Liquidation
      priceLinesRef.current.push(seriesRef.current!.createPriceLine({
        price: pos.liquidation, color: "#a855f7", lineWidth: 1, lineStyle: LineStyle.Dotted,
        axisLabelVisible: true, title: "LIQ",
      }));
    });
  }, [positions, symbol, candles.length]);

  return <div ref={ref} style={{ width: "100%", height: 380, background: "var(--bg-soft)", borderRadius: 8 }} />;
}
