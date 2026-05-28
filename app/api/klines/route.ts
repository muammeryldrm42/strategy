import { NextRequest, NextResponse } from "next/server";

// Binance public API proxy - key gerekmez, ücretsiz, CORS sorunsuz
// /api/klines?symbol=BTCUSDT&interval=15m&limit=300
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();
  const interval = searchParams.get("interval") || "15m";
  const limit = searchParams.get("limit") || "300";

  // Whitelist - sadece güvenli parametreler
  const allowedIntervals = ["1m", "5m", "15m", "1h", "4h", "1d"];
  if (!allowedIntervals.includes(interval)) {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
  }
  const lim = Math.min(Math.max(parseInt(limit) || 300, 50), 1000);

  const endpoints = [
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${lim}`,
    `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${lim}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { next: { revalidate: 0 } });
      if (!res.ok) continue;
      const raw = await res.json();
      const candles = raw.map((k: any[]) => ({
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
      return NextResponse.json({ symbol, interval, candles });
    } catch (e) {
      continue;
    }
  }
  return NextResponse.json({ error: "Fiyat verisi alınamadı" }, { status: 502 });
}
