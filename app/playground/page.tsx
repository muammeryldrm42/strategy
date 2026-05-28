"use client";
import { useState, useEffect, useRef } from "react";
import { Candle } from "@/lib/indicators";
import { runUserStrategy, DEFAULT_USER_CODE } from "@/lib/sandbox";
import * as W from "@/lib/wallet";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];
const INTERVALS = ["5m", "15m", "1h", "4h"];

export default function Playground() {
  const [code, setCode] = useState(DEFAULT_USER_CODE);
  const [symbol, setSymbol] = useState("SOLUSDT");
  const [interval, setIntervalV] = useState("15m");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState(0);
  const [wallet, setWallet] = useState<W.WalletState>({ balance: 1000, positions: [], history: [], topups: 0 });
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [auto, setAuto] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [posSize, setPosSize] = useState(100);
  const walletRef = useRef(wallet); walletRef.current = wallet;
  const codeRef = useRef(code); codeRef.current = code;
  const candlesRef = useRef(candles); candlesRef.current = candles;

  useEffect(() => { setWallet(W.loadWallet()); }, []);
  const pushLog = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString("tr")} · ${m}`, ...l].slice(0, 30));

  const fetchData = async () => {
    try {
      const r = await fetch(`/api/klines?symbol=${symbol}&interval=${interval}&limit=300`);
      const d = await r.json();
      if (d.candles?.length) {
        setCandles(d.candles);
        const p = d.candles[d.candles.length - 1].close;
        setPrice(p);
        const { wallet: nw, events } = W.checkPositions(walletRef.current, symbol, p);
        if (events.length) { setWallet(nw); events.forEach(pushLog); }
      }
    } catch { pushLog("⚠ Fiyat alınamadı"); }
  };
  useEffect(() => { fetchData(); const t = setInterval(fetchData, 10000); return () => clearInterval(t); /* eslint-disable-next-line */ }, [symbol, interval]);

  const run = async () => {
    if (candles.length < 50) { pushLog("⚠ Yetersiz veri"); return; }
    setRunning(true);
    const res = await runUserStrategy(code, candles);
    setRunning(false);
    if (res.ok) { setResult(res.signal); pushLog(`✓ Sinyal: ${res.signal!.signal.toUpperCase()} · ${res.signal!.reason}`); }
    else { setResult(null); pushLog(`✗ Hata: ${res.error}`); }
  };

  // Otomatik
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(async () => {
      if (candlesRef.current.length < 50) return;
      const res = await runUserStrategy(codeRef.current, candlesRef.current);
      if (res.ok && res.signal) {
        setResult(res.signal);
        const w = walletRef.current;
        const sig = res.signal;
        const hasOpen = w.positions.some((p) => p.symbol === symbol && p.strategy === "Custom");
        if ((sig.signal === "long" || sig.signal === "short") && !hasOpen && sig.entry > 0 && posSize <= w.balance) {
          const nw = W.openPosition(w, {
            strategy: "Custom", symbol, side: sig.signal, entry: price, size: posSize,
            stop_loss: sig.stop_loss, take_profit: sig.take_profit, reason: sig.reason,
          });
          setWallet(nw);
          pushLog(`${sig.signal === "long" ? "🟢 LONG" : "🔴 SHORT"} @ ${price.toFixed(2)} · ${sig.reason}`);
        }
      }
    }, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [auto, symbol, posSize, price]);

  const openManual = (side: "long" | "short") => {
    const sl = result && result.signal === side ? result.stop_loss : (side === "long" ? price * 0.97 : price * 1.03);
    const tp = result && result.signal === side ? result.take_profit : (side === "long" ? [price * 1.03, price * 1.06] : [price * 0.97, price * 0.94]);
    if (posSize > wallet.balance) { pushLog("⚠ Yetersiz bakiye"); return; }
    const nw = W.openPosition(wallet, { strategy: "Custom", symbol, side, entry: price, size: posSize, stop_loss: sl, take_profit: tp, reason: result?.reason || "Manuel" });
    setWallet(nw); pushLog(`${side === "long" ? "🟢 LONG" : "🔴 SHORT"} @ ${price.toFixed(2)}`);
  };
  const closePos = (id: string) => { setWallet(W.closePosition(wallet, id, price, "Manuel kapatma")); };
  const doTopup = () => { setWallet(W.topUp(wallet, 1000)); pushLog("💰 +$1000"); };

  const eq = W.equity(wallet, { [symbol]: price });

  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 6 }}>PLAYGROUND</h1>
      <p style={{ color: "var(--text-dim)", marginBottom: 20, fontSize: 14 }}>
        Kendi stratejini JavaScript olarak yaz. Kod tarayıcında izole sandbox'ta çalışır — sunucuya gitmez.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
        {/* Editör */}
        <div className="panel" style={{ overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--green)" }}>strategy.js</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>sandbox · izole</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%", height: 460, padding: 16, background: "var(--bg-soft)", border: "none",
              color: "var(--text)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, lineHeight: 1.6, resize: "vertical", outline: "none",
            }}
          />
          <div style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={run} disabled={running}>{running ? "Çalışıyor..." : "▶ Çalıştır"}</button>
            <button className="btn btn-ghost" onClick={() => setCode(DEFAULT_USER_CODE)} style={{ fontSize: 12 }}>Sıfırla</button>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", cursor: "pointer" }}>
              <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--green)" }} />
              <span style={{ fontSize: 13, color: auto ? "var(--green)" : "var(--text-dim)", fontWeight: 600 }}>{auto ? "● OTO TRADE" : "Otomatik"}</span>
            </label>
          </div>
        </div>

        {/* Sağ panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Bakiye */}
          <div className="panel" style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>BAKİYE</div><div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>${wallet.balance.toFixed(2)}</div></div>
            <div><div className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>EQUITY</div><div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--cyan)" }}>${eq.toFixed(2)}</div></div>
            <button className="btn btn-primary" onClick={doTopup} style={{ fontSize: 12, padding: "7px 10px" }}>+$1000</button>
            <button className="btn btn-ghost" onClick={() => { if (confirm("Sıfırlansın mı?")) { setWallet(W.resetWallet()); setLog([]); } }} style={{ fontSize: 12, padding: "7px 10px" }}>Sıfırla</button>
          </div>

          {/* Market ayarları */}
          <div className="panel" style={{ padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)} style={selStyle}>{SYMBOLS.map((s) => <option key={s}>{s}</option>)}</select>
              <select value={interval} onChange={(e) => setIntervalV(e.target.value)} style={selStyle}>{INTERVALS.map((i) => <option key={i}>{i}</option>)}</select>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="mono" style={{ fontSize: 12, color: "var(--text-faint)" }}>{symbol}</span>
              <span className="mono" style={{ fontSize: 20, fontWeight: 700 }}>${price.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Boyut $</span>
              <input type="number" value={posSize} onChange={(e) => setPosSize(Math.max(1, +e.target.value))} style={{ ...selStyle, width: 90 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" onClick={() => openManual("long")} style={{ flex: 1, justifyContent: "center" }}>🟢 LONG</button>
              <button className="btn btn-danger" onClick={() => openManual("short")} style={{ flex: 1, justifyContent: "center" }}>🔴 SHORT</button>
            </div>
          </div>

          {/* Sonuç */}
          {result && (
            <div className="panel" style={{ padding: 16 }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 6 }}>SON SİNYAL</div>
              <span className={`mono ${result.signal}`} style={{ fontSize: 18, fontWeight: 700 }}>{result.signal.toUpperCase()}</span>
              <p style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 4 }}>{result.reason}</p>
              {result.signal !== "neutral" && (
                <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
                  Giriş {result.entry.toFixed(2)} · SL {result.stop_loss.toFixed(2)}<br />
                  TP {result.take_profit.map((t: number) => t.toFixed(2)).join(" / ")}
                </div>
              )}
            </div>
          )}

          {/* Log */}
          <div className="panel" style={{ padding: 16 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 8 }}>LOG</div>
            <div style={{ maxHeight: 160, overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
              {log.length === 0 ? <span style={{ color: "var(--text-faint)" }}>—</span> :
                log.map((l, i) => <div key={i} style={{ padding: "3px 0", color: "var(--text-dim)" }}>{l}</div>)}
            </div>
          </div>
        </div>
      </div>

      {/* Açık pozisyonlar */}
      {wallet.positions.length > 0 && (
        <div className="panel" style={{ padding: 18, marginTop: 18 }}>
          <h3 className="display" style={{ fontSize: 15, marginBottom: 12 }}>AÇIK POZİSYONLAR</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {wallet.positions.map((p) => {
                  const pnl = p.symbol === symbol ? W.calcPnl(p, price) : 0;
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: 8 }}>{p.strategy}</td>
                      <td style={{ padding: 8 }} className="mono">{p.symbol}</td>
                      <td style={{ padding: 8 }}><span className={`mono ${p.side}`}>{p.side.toUpperCase()}</span></td>
                      <td style={{ padding: 8 }} className="mono">{p.entry.toFixed(2)}</td>
                      <td style={{ padding: 8 }} className="mono">${p.size}</td>
                      <td style={{ padding: 8 }} className={`mono ${pnl >= 0 ? "long" : "short"}`}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}</td>
                      <td style={{ padding: 8 }}><button className="btn btn-ghost" onClick={() => closePos(p.id)} style={{ padding: "4px 10px", fontSize: 11 }}>Kapat</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

const selStyle: React.CSSProperties = {
  width: "100%", padding: "8px 10px", background: "var(--bg-soft)", border: "1px solid var(--border-glow)",
  borderRadius: 6, color: "var(--text)", fontSize: 13,
};
