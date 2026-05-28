"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { STRATEGIES, getStrategy, CATEGORY_LABELS } from "@/lib/registry";
import { Candle } from "@/lib/indicators";
import * as W from "@/lib/wallet";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];
const INTERVALS = ["5m", "15m", "1h", "4h"];

function DemoInner() {
  const params = useSearchParams();
  const initialStrat = params.get("strategy") || "fvg";

  const [stratId, setStratId] = useState(initialStrat);
  const [symbol, setSymbol] = useState("SOLUSDT");
  const [interval, setIntervalV] = useState("15m");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState(0);
  const [wallet, setWallet] = useState<W.WalletState>({ balance: 1000, positions: [], history: [], topups: 0 });
  const [auto, setAuto] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [posSize, setPosSize] = useState(100);
  const [lastSignal, setLastSignal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const walletRef = useRef(wallet);
  walletRef.current = wallet;

  const strat = getStrategy(stratId)!;
  const runnable = strat?.run != null;

  useEffect(() => { setWallet(W.loadWallet()); }, []);

  const pushLog = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString("tr")} · ${m}`, ...l].slice(0, 40));

  // Fiyat çek
  const fetchData = async () => {
    try {
      const r = await fetch(`/api/klines?symbol=${symbol}&interval=${interval}&limit=300`);
      const d = await r.json();
      if (d.candles?.length) {
        setCandles(d.candles);
        const p = d.candles[d.candles.length - 1].close;
        setPrice(p);
        // SL/TP kontrolü
        const { wallet: nw, events } = W.checkPositions(walletRef.current, symbol, p);
        if (events.length) { setWallet(nw); events.forEach(pushLog); }
      }
    } catch { pushLog("⚠ Fiyat alınamadı"); }
    setLoading(false);
  };

  useEffect(() => { setLoading(true); fetchData(); /* eslint-disable-next-line */ }, [symbol, interval]);

  // Canlı güncelleme (10sn)
  useEffect(() => {
    const t = setInterval(fetchData, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [symbol, interval]);

  // Otomatik trade
  useEffect(() => {
    if (!auto || !runnable || candles.length < 50) return;
    const t = setInterval(() => {
      const sig = strat.run!(candles);
      setLastSignal(sig);
      const w = walletRef.current;
      const hasOpen = w.positions.some((p) => p.symbol === symbol && p.strategy === strat.name);
      if ((sig.signal === "long" || sig.signal === "short") && !hasOpen && sig.entry > 0) {
        if (posSize <= w.balance) {
          const nw = W.openPosition(w, {
            strategy: strat.name, symbol, side: sig.signal,
            entry: price, size: posSize, stop_loss: sig.stop_loss,
            take_profit: sig.take_profit, reason: sig.reason,
          });
          setWallet(nw);
          pushLog(`${sig.signal === "long" ? "🟢 LONG" : "🔴 SHORT"} ${symbol} @ ${price.toFixed(2)} · ${sig.reason}`);
        } else {
          pushLog("⚠ Yetersiz bakiye");
        }
      }
    }, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [auto, candles, stratId, symbol, posSize, price, runnable]);

  // Manuel sinyal test
  const testSignal = () => {
    if (!runnable || candles.length < 50) return;
    const sig = strat.run!(candles);
    setLastSignal(sig);
    pushLog(`Sinyal: ${sig.signal.toUpperCase()} · ${sig.reason}`);
  };

  const manualOpen = (side: "long" | "short") => {
    const sig = lastSignal && lastSignal.signal === side ? lastSignal : null;
    const sl = sig ? sig.stop_loss : (side === "long" ? price * 0.97 : price * 1.03);
    const tp = sig ? sig.take_profit : (side === "long" ? [price * 1.03, price * 1.05, price * 1.08] : [price * 0.97, price * 0.95, price * 0.92]);
    if (posSize > wallet.balance) { pushLog("⚠ Yetersiz bakiye"); return; }
    const nw = W.openPosition(wallet, {
      strategy: sig ? strat.name : "Manuel", symbol, side, entry: price, size: posSize,
      stop_loss: sl, take_profit: tp, reason: sig ? sig.reason : "Manuel giriş",
    });
    setWallet(nw);
    pushLog(`${side === "long" ? "🟢 LONG" : "🔴 SHORT"} ${symbol} @ ${price.toFixed(2)} (manuel)`);
  };

  const closePos = (id: string) => {
    const nw = W.closePosition(wallet, id, price, "Manuel kapatma");
    setWallet(nw);
    pushLog("Pozisyon kapatıldı");
  };

  const doTopup = () => { setWallet(W.topUp(wallet, 1000)); pushLog("💰 +$1000 bakiye eklendi"); };
  const doReset = () => { if (confirm("Demo hesabı sıfırlansın mı? Tüm pozisyon ve geçmiş silinir.")) { setWallet(W.resetWallet()); setLog([]); } };

  const eq = W.equity(wallet, { [symbol]: price });
  const totalDeposit = 1000 + wallet.topups;
  const totalPnl = eq - totalDeposit;

  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 6 }}>DEMO TRADE</h1>
      <p style={{ color: "var(--text-dim)", marginBottom: 24, fontSize: 14 }}>Canlı Binance fiyatları · sanal bakiye · gerçek para yok</p>

      {/* Üst bar: bakiye */}
      <div className="panel" style={{ padding: 18, marginBottom: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 18 }}>
        <Stat label="BAKİYE" value={`$${wallet.balance.toFixed(2)}`} />
        <Stat label="EQUITY" value={`$${eq.toFixed(2)}`} color="var(--cyan)" />
        <Stat label="TOPLAM P&L" value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`} color={totalPnl >= 0 ? "var(--green)" : "var(--red)"} />
        <Stat label="AÇIK POZİSYON" value={`${wallet.positions.length}`} />
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={doTopup} style={{ fontSize: 12, padding: "8px 12px" }}>+$1000</button>
          <button className="btn btn-ghost" onClick={doReset} style={{ fontSize: 12, padding: "8px 12px" }}>Sıfırla</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
        {/* Kontrol paneli */}
        <div className="panel" style={{ padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 16 }}>
            <Field label="Strateji">
              <select value={stratId} onChange={(e) => setStratId(e.target.value)} style={selStyle}>
                {["smc", "indicators", "memecoin"].map((cat) => (
                  <optgroup key={cat} label={CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}>
                    {STRATEGIES.filter((s) => s.category === cat).map((s) => (
                      <option key={s.id} value={s.id} disabled={!s.run}>
                        {s.name}{!s.run ? " (off-chain)" : ""}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Sembol">
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)} style={selStyle}>
                {SYMBOLS.map((s) => <option key={s} value={s}>{s.replace("USDT", "/USDT")}</option>)}
              </select>
            </Field>
            <Field label="Timeframe">
              <select value={interval} onChange={(e) => setIntervalV(e.target.value)} style={selStyle}>
                {INTERVALS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Pozisyon ($)">
              <input type="number" value={posSize} onChange={(e) => setPosSize(Math.max(1, +e.target.value))} style={selStyle} />
            </Field>
          </div>

          {/* Fiyat + sinyal */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="mono" style={{ color: "var(--text-faint)", fontSize: 12 }}>{symbol} · {interval}</span>
              <div className="mono" style={{ fontSize: 26, fontWeight: 700 }}>
                {loading ? <span className="pulse">···</span> : `$${price.toLocaleString(undefined, { maximumFractionDigits: 4 })}`}
              </div>
            </div>
            {lastSignal && (
              <div style={{ textAlign: "right" }}>
                <span className={`mono ${lastSignal.signal}`} style={{ fontSize: 18, fontWeight: 700 }}>{lastSignal.signal.toUpperCase()}</span>
                <div style={{ fontSize: 11, color: "var(--text-dim)", maxWidth: 280 }}>{lastSignal.reason}</div>
                {lastSignal.signal !== "neutral" && (
                  <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>
                    SL {lastSignal.stop_loss.toFixed(2)} · TP {lastSignal.take_profit.map((t: number) => t.toFixed(2)).join(" / ")}
                  </div>
                )}
              </div>
            )}
          </div>

          {!runnable ? (
            <div className="panel" style={{ padding: 14, background: "rgba(255,184,0,.06)", borderColor: "rgba(255,184,0,.3)" }}>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--amber)" }}>⚠ {strat.offchainNote}</span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn" onClick={testSignal} disabled={loading}>🔍 Sinyal Test Et</button>
              <button className="btn btn-primary" onClick={() => manualOpen("long")} disabled={loading}>🟢 LONG Aç</button>
              <button className="btn btn-danger" onClick={() => manualOpen("short")} disabled={loading}>🔴 SHORT Aç</button>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", cursor: "pointer" }}>
                <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--green)" }} />
                <span style={{ fontSize: 13, color: auto ? "var(--green)" : "var(--text-dim)", fontWeight: 600 }}>
                  {auto ? "● OTOMATİK AÇIK" : "Otomatik Trade"}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Açık pozisyonlar */}
        <div className="panel" style={{ padding: 18 }}>
          <h3 className="display" style={{ fontSize: 15, marginBottom: 12 }}>AÇIK POZİSYONLAR</h3>
          {wallet.positions.length === 0 ? (
            <p style={{ color: "var(--text-faint)", fontSize: 13 }}>Açık pozisyon yok.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "var(--text-faint)", textAlign: "left" }}>
                    <th style={th}>Strateji</th><th style={th}>Sembol</th><th style={th}>Yön</th>
                    <th style={th}>Giriş</th><th style={th}>Boyut</th><th style={th}>P&L</th><th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.positions.map((p) => {
                    const pnl = p.symbol === symbol ? W.calcPnl(p, price) : 0;
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={td}>{p.strategy}</td>
                        <td style={td} className="mono">{p.symbol}</td>
                        <td style={td}><span className={`mono ${p.side}`}>{p.side.toUpperCase()}</span></td>
                        <td style={td} className="mono">{p.entry.toFixed(2)}</td>
                        <td style={td} className="mono">${p.size}</td>
                        <td style={td} className={`mono ${pnl >= 0 ? "long" : "short"}`}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}</td>
                        <td style={td}><button className="btn btn-ghost" onClick={() => closePos(p.id)} style={{ padding: "4px 10px", fontSize: 11 }}>Kapat</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {/* İşlem geçmişi */}
          <div className="panel" style={{ padding: 18 }}>
            <h3 className="display" style={{ fontSize: 15, marginBottom: 12 }}>İŞLEM GEÇMİŞİ</h3>
            {wallet.history.length === 0 ? (
              <p style={{ color: "var(--text-faint)", fontSize: 13 }}>Henüz kapanmış işlem yok.</p>
            ) : (
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {wallet.history.map((t) => (
                  <div key={t.id + t.closeTime} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12.5 }}>
                    <div>
                      <span className={`mono ${t.side}`}>{t.side.toUpperCase()}</span> <span className="mono">{t.symbol}</span>
                      <div style={{ color: "var(--text-faint)", fontSize: 11 }}>{t.closeReason}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className={`mono ${t.pnl >= 0 ? "long" : "short"}`}>{t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}</span>
                      <div className="mono" style={{ color: "var(--text-faint)", fontSize: 11 }}>{t.pnlPct >= 0 ? "+" : ""}{t.pnlPct.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Canlı log */}
          <div className="panel" style={{ padding: 18 }}>
            <h3 className="display" style={{ fontSize: 15, marginBottom: 12 }}>CANLI LOG</h3>
            <div style={{ maxHeight: 280, overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              {log.length === 0 ? <p style={{ color: "var(--text-faint)" }}>—</p> :
                log.map((l, i) => <div key={i} style={{ padding: "4px 0", color: "var(--text-dim)", borderBottom: "1px solid var(--bg-soft)" }}>{l}</div>)}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const selStyle: React.CSSProperties = {
  width: "100%", padding: "9px 10px", background: "var(--bg-soft)", border: "1px solid var(--border-glow)",
  borderRadius: 6, color: "var(--text)", fontSize: 13,
};
const th: React.CSSProperties = { padding: "6px 10px", fontWeight: 500, fontSize: 11, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "8px 10px" };

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 4 }}>{label}</div>
      <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: color || "var(--text)" }}>{value}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 40 }}>Yükleniyor...</div>}>
      <DemoInner />
    </Suspense>
  );
}
