"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
<<<<<<< HEAD
import { STRATEGIES, getStrategy, ALL_CATEGORIES } from "@/lib/registry";
import { Candle } from "@/lib/indicators";
import * as W from "@/lib/wallet";
import PriceChart from "@/components/PriceChart";
import EquityCurve from "@/components/EquityCurve";
import { useT } from "@/lib/i18n";

const SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "DOGEUSDT",
  "AVAXUSDT", "ADAUSDT", "LINKUSDT", "TONUSDT", "SUIUSDT", "WIFUSDT",
  "PEPEUSDT", "SHIBUSDT", "TRXUSDT", "ARBUSDT", "OPUSDT", "INJUSDT",
];
const INTERVALS = ["1m", "5m", "15m", "1h", "4h"];
const LEVERAGES = [1, 2, 3, 5, 10, 15, 20, 25];

function DemoInner() {
  const { t } = useT();
=======
import { STRATEGIES, getStrategy, CATEGORY_LABELS } from "@/lib/registry";
import { Candle } from "@/lib/indicators";
import * as W from "@/lib/wallet";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];
const INTERVALS = ["5m", "15m", "1h", "4h"];

function DemoInner() {
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
  const params = useSearchParams();
  const initialStrat = params.get("strategy") || "fvg";

  const [stratId, setStratId] = useState(initialStrat);
  const [symbol, setSymbol] = useState("SOLUSDT");
  const [interval, setIntervalV] = useState("15m");
<<<<<<< HEAD
  const [leverage, setLeverage] = useState(5);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState(0);
  const [wallet, setWallet] = useState<W.WalletState>({ balance: 1000, positions: [], history: [], topups: 0, equityHistory: [] });
=======
  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState(0);
  const [wallet, setWallet] = useState<W.WalletState>({ balance: 1000, positions: [], history: [], topups: 0 });
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
  const [auto, setAuto] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [posSize, setPosSize] = useState(100);
  const [lastSignal, setLastSignal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [showStats, setShowStats] = useState(false);
=======
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
  const walletRef = useRef(wallet);
  walletRef.current = wallet;

  const strat = getStrategy(stratId)!;
  const runnable = strat?.run != null;

  useEffect(() => { setWallet(W.loadWallet()); }, []);

<<<<<<< HEAD
  const pushLog = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString()} · ${m}`, ...l].slice(0, 50));

=======
  const pushLog = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString("tr")} · ${m}`, ...l].slice(0, 40));

  // Fiyat çek
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
  const fetchData = async () => {
    try {
      const r = await fetch(`/api/klines?symbol=${symbol}&interval=${interval}&limit=300`);
      const d = await r.json();
      if (d.candles?.length) {
        setCandles(d.candles);
        const p = d.candles[d.candles.length - 1].close;
        setPrice(p);
<<<<<<< HEAD
        const { wallet: nw, events } = W.checkPositions(walletRef.current, symbol, p);
        if (events.length) { setWallet(nw); events.forEach(pushLog); }
        const ew = W.snapshotEquity(events.length ? nw : walletRef.current, { [symbol]: p });
        if (ew.equityHistory.length !== walletRef.current.equityHistory.length) setWallet(ew);
      } else if (d.error) pushLog(`⚠ ${d.error}`);
    } catch { pushLog(`⚠ ${t("log.fetch_fail")}`); }
=======
        // SL/TP kontrolü
        const { wallet: nw, events } = W.checkPositions(walletRef.current, symbol, p);
        if (events.length) { setWallet(nw); events.forEach(pushLog); }
      }
    } catch { pushLog("⚠ Fiyat alınamadı"); }
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
    setLoading(false);
  };

  useEffect(() => { setLoading(true); fetchData(); /* eslint-disable-next-line */ }, [symbol, interval]);
<<<<<<< HEAD
  useEffect(() => { const tm = setInterval(fetchData, 10000); return () => clearInterval(tm); /* eslint-disable-next-line */ }, [symbol, interval]);

  useEffect(() => {
    if (!auto || !runnable || candles.length < 50) return;
    const tm = setInterval(() => {
=======

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
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
      const sig = strat.run!(candles);
      setLastSignal(sig);
      const w = walletRef.current;
      const hasOpen = w.positions.some((p) => p.symbol === symbol && p.strategy === strat.name);
      if ((sig.signal === "long" || sig.signal === "short") && !hasOpen && sig.entry > 0) {
<<<<<<< HEAD
        const res = W.openPosition(w, {
          strategy: strat.name, symbol, side: sig.signal,
          entry: price, size: posSize, leverage,
          stop_loss: sig.stop_loss, take_profit: sig.take_profit, reason: sig.reason,
        });
        if (res.error) pushLog(`⚠ ${res.error}`);
        else { setWallet(res.wallet); pushLog(`${sig.signal === "long" ? "🟢 LONG" : "🔴 SHORT"} ${leverage}x ${symbol} @ ${price.toFixed(4)} · ${sig.reason}`); }
      }
    }, 8000);
    return () => clearInterval(tm);
    // eslint-disable-next-line
  }, [auto, candles, stratId, symbol, posSize, price, runnable, leverage]);

=======
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
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
  const testSignal = () => {
    if (!runnable || candles.length < 50) return;
    const sig = strat.run!(candles);
    setLastSignal(sig);
<<<<<<< HEAD
    pushLog(`${t("log.signal")}: ${sig.signal.toUpperCase()} · ${sig.reason}`);
=======
    pushLog(`Sinyal: ${sig.signal.toUpperCase()} · ${sig.reason}`);
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
  };

  const manualOpen = (side: "long" | "short") => {
    const sig = lastSignal && lastSignal.signal === side ? lastSignal : null;
<<<<<<< HEAD
    const sl = sig ? sig.stop_loss : (side === "long" ? price * (1 - 0.5/leverage) : price * (1 + 0.5/leverage));
    const tp = sig ? sig.take_profit : (side === "long"
      ? [price * (1 + 0.3/leverage), price * (1 + 0.6/leverage), price * (1 + 1.2/leverage)]
      : [price * (1 - 0.3/leverage), price * (1 - 0.6/leverage), price * (1 - 1.2/leverage)]);
    const res = W.openPosition(wallet, {
      strategy: sig ? strat.name : "Manual", symbol, side, entry: price, size: posSize, leverage,
      stop_loss: sl, take_profit: tp, reason: sig ? sig.reason : t("log.manual_entry"),
    });
    if (res.error) pushLog(`⚠ ${res.error}`);
    else { setWallet(res.wallet); pushLog(`${side === "long" ? "🟢 LONG" : "🔴 SHORT"} ${leverage}x @ ${price.toFixed(4)} ${t("log.manual")}`); }
  };

  const closePos = (id: string) => { setWallet(W.closePosition(wallet, id, price, "Manual")); pushLog(t("log.pos_closed")); };
  const doTopup = () => { setWallet(W.topUp(wallet, 1000)); pushLog(t("log.topup")); };
  const doReset = () => { if (confirm(t("common.confirm_reset"))) { setWallet(W.resetWallet()); setLog([]); } };
=======
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
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814

  const eq = W.equity(wallet, { [symbol]: price });
  const totalDeposit = 1000 + wallet.topups;
  const totalPnl = eq - totalDeposit;
<<<<<<< HEAD
  const stats = W.calcStats(wallet);
  const requiredMargin = posSize / leverage;
  const quickSize = (pct: number) => Math.floor(wallet.balance * pct * leverage);

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="display" style={{ fontSize: 28, lineHeight: 1 }}>{t("demo.title")}</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4 }}>{t("demo.subtitle")}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => setShowStats(!showStats)} style={{ fontSize: 12 }}>
          {showStats ? t("demo.hide_stats") : t("demo.show_stats")}
        </button>
      </div>

      <div className="panel" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 14, alignItems: "center" }}>
          <Stat label={t("common.balance")} value={`$${wallet.balance.toFixed(2)}`} />
          <Stat label={t("common.equity")} value={`$${eq.toFixed(2)}`} color="var(--cyan)" />
          <Stat label={t("common.total_pnl")} value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`} color={totalPnl >= 0 ? "var(--green)" : "var(--red)"} />
          <Stat label={t("common.roi")} value={`${totalPnl >= 0 ? "+" : ""}${((totalPnl / totalDeposit) * 100).toFixed(1)}%`} color={totalPnl >= 0 ? "var(--green)" : "var(--red)"} />
          <Stat label={t("demo.pos_trade")} value={`${wallet.positions.length} / ${stats.totalTrades}`} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={doTopup} style={{ fontSize: 11, padding: "7px 12px" }}>{t("common.top_up")}</button>
            <button className="btn btn-ghost" onClick={doReset} style={{ fontSize: 11, padding: "7px 12px" }}>{t("common.reset")}</button>
          </div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 4 }}>{t("demo.equity_curve")}</div>
          <EquityCurve history={wallet.equityHistory} startBalance={1000} />
        </div>
      </div>

      {showStats && (
        <div className="panel fade-up" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
            <Stat label={t("demo.win_rate")} value={`${stats.winRate.toFixed(1)}%`} color={stats.winRate >= 50 ? "var(--green)" : "var(--red)"} />
            <Stat label={t("demo.wins_losses")} value={`${stats.wins} / ${stats.losses}`} />
            <Stat label={t("demo.avg_win")} value={`$${stats.avgWin.toFixed(2)}`} color="var(--green)" />
            <Stat label={t("demo.avg_loss")} value={`$${stats.avgLoss.toFixed(2)}`} color="var(--red)" />
            <Stat label={t("demo.biggest_win")} value={`$${stats.biggestWin.toFixed(2)}`} color="var(--green)" />
            <Stat label={t("demo.biggest_loss")} value={`$${stats.biggestLoss.toFixed(2)}`} color="var(--red)" />
            <Stat label={t("demo.liquidations")} value={`${stats.liquidations}`} color={stats.liquidations > 0 ? "var(--purple)" : "var(--text)"} />
            <Stat label={t("demo.best_symbol")} value={stats.bestSymbol} />
            <Stat label={t("demo.best_strat")} value={stats.bestStrategy} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16 }}>
        <div className="panel" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div>
              <span className="display" style={{ fontSize: 18 }}>{symbol.replace("USDT", "/USDT")}</span>
              <span className="mono" style={{ marginLeft: 10, color: "var(--text-faint)", fontSize: 12 }}>{interval}</span>
            </div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>
              {loading ? <span className="pulse">···</span> : `$${price.toLocaleString(undefined, { maximumFractionDigits: 6 })}`}
            </div>
          </div>
          <PriceChart candles={candles} positions={wallet.positions} symbol={symbol} />
        </div>

        <div className="panel" style={{ padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
            <Field label={t("demo.strategy")}>
              <select value={stratId} onChange={(e) => setStratId(e.target.value)} style={selStyle}>
                {ALL_CATEGORIES.map((cat) => (
                  <optgroup key={cat} label={t(`cat.${cat}`)}>
                    {STRATEGIES.filter((s) => s.category === cat).map((s) => (
                      <option key={s.id} value={s.id} disabled={!s.run}>{s.name}{!s.run ? " (off-chain)" : ""}</option>
=======

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
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
<<<<<<< HEAD
            <Field label={t("demo.symbol")}>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)} style={selStyle}>
                {SYMBOLS.map((s) => <option key={s} value={s}>{s.replace("USDT", "")}</option>)}
              </select>
            </Field>
            <Field label={t("demo.timeframe")}>
=======
            <Field label="Sembol">
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)} style={selStyle}>
                {SYMBOLS.map((s) => <option key={s} value={s}>{s.replace("USDT", "/USDT")}</option>)}
              </select>
            </Field>
            <Field label="Timeframe">
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
              <select value={interval} onChange={(e) => setIntervalV(e.target.value)} style={selStyle}>
                {INTERVALS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
<<<<<<< HEAD
            <Field label={`${t("demo.leverage")}: ${leverage}x`}>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {LEVERAGES.map((l) => (
                  <button key={l} onClick={() => setLeverage(l)} style={{
                    flex: "1 1 auto", minWidth: 32, padding: "7px 4px",
                    background: leverage === l ? (l >= 15 ? "var(--red)" : l >= 10 ? "var(--amber)" : "var(--green)") : "var(--bg-soft)",
                    color: leverage === l ? "#04150d" : "var(--text-dim)",
                    border: "1px solid " + (leverage === l ? "transparent" : "var(--border-glow)"),
                    borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}>{l}x</button>
                ))}
              </div>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Field label={t("demo.notional")}>
              <input type="number" value={posSize} onChange={(e) => setPosSize(Math.max(1, +e.target.value))} style={selStyle} />
              <div className="mono" style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 4 }}>
                {t("demo.margin")}: ${requiredMargin.toFixed(2)} · {((requiredMargin / wallet.balance) * 100 || 0).toFixed(1)}% {t("demo.of_balance")}
              </div>
            </Field>
            <Field label={t("demo.quick_size")}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0.05, 0.1, 0.25, 0.5].map((p) => (
                  <button key={p} onClick={() => setPosSize(quickSize(p))} style={{
                    flex: 1, padding: "8px 4px", background: "var(--bg-soft)", color: "var(--text-dim)",
                    border: "1px solid var(--border-glow)", borderRadius: 4,
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: "pointer",
                  }}>{(p * 100).toFixed(0)}%</button>
                ))}
              </div>
            </Field>
          </div>

          {lastSignal && (
            <div style={{ padding: "10px 12px", background: "var(--bg-soft)", borderRadius: 6, marginBottom: 14, borderLeft: `3px solid ${lastSignal.signal === "long" ? "var(--green)" : lastSignal.signal === "short" ? "var(--red)" : "var(--text-faint)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span className={`mono ${lastSignal.signal}`} style={{ fontSize: 16, fontWeight: 700 }}>{lastSignal.signal.toUpperCase()}</span>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{lastSignal.reason}</span>
              </div>
              {lastSignal.signal !== "neutral" && (
                <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>
                  {t("strat.entry")} {lastSignal.entry.toFixed(4)} · SL {lastSignal.stop_loss.toFixed(4)} · TP {lastSignal.take_profit.map((t: number) => t.toFixed(4)).join(" / ")}
                </div>
              )}
            </div>
          )}
=======
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
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814

          {!runnable ? (
            <div className="panel" style={{ padding: 14, background: "rgba(255,184,0,.06)", borderColor: "rgba(255,184,0,.3)" }}>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--amber)" }}>⚠ {strat.offchainNote}</span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
<<<<<<< HEAD
              <button className="btn" onClick={testSignal} disabled={loading}>{t("demo.test_signal")}</button>
              <button className="btn btn-primary" onClick={() => manualOpen("long")} disabled={loading}>🟢 LONG {leverage}x</button>
              <button className="btn btn-danger" onClick={() => manualOpen("short")} disabled={loading}>🔴 SHORT {leverage}x</button>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", cursor: "pointer" }}>
                <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--green)" }} />
                <span style={{ fontSize: 13, color: auto ? "var(--green)" : "var(--text-dim)", fontWeight: 600 }}>
                  {auto ? t("demo.auto_on") : t("demo.auto")}
=======
              <button className="btn" onClick={testSignal} disabled={loading}>🔍 Sinyal Test Et</button>
              <button className="btn btn-primary" onClick={() => manualOpen("long")} disabled={loading}>🟢 LONG Aç</button>
              <button className="btn btn-danger" onClick={() => manualOpen("short")} disabled={loading}>🔴 SHORT Aç</button>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", cursor: "pointer" }}>
                <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--green)" }} />
                <span style={{ fontSize: 13, color: auto ? "var(--green)" : "var(--text-dim)", fontWeight: 600 }}>
                  {auto ? "● OTOMATİK AÇIK" : "Otomatik Trade"}
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
                </span>
              </label>
            </div>
          )}
        </div>

<<<<<<< HEAD
        <div className="panel" style={{ padding: 16 }}>
          <h3 className="display" style={{ fontSize: 15, marginBottom: 12 }}>{t("demo.open_pos")} ({wallet.positions.length})</h3>
          {wallet.positions.length === 0 ? (
            <p style={{ color: "var(--text-faint)", fontSize: 13 }}>{t("demo.no_open_pos")}</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ color: "var(--text-faint)", textAlign: "left" }}>
                    <th style={th}>{t("demo.strategy")}</th><th style={th}>{t("demo.symbol")}</th><th style={th}>{t("tbl.side")}</th>
                    <th style={th}>{t("tbl.lev")}</th><th style={th}>{t("strat.entry")}</th><th style={th}>{t("demo.notional").replace(" ($)","")}</th>
                    <th style={th}>{t("demo.margin")}</th><th style={th}>{t("tbl.liq")}</th><th style={th}>P&L</th><th style={th}>ROE</th><th style={th}></th>
=======
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
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
                  </tr>
                </thead>
                <tbody>
                  {wallet.positions.map((p) => {
                    const pnl = p.symbol === symbol ? W.calcPnl(p, price) : 0;
<<<<<<< HEAD
                    const roe = p.symbol === symbol ? W.calcRoe(p, price) : 0;
                    const liqDist = p.symbol === symbol ? Math.abs((price - p.liquidation) / price) * 100 : 0;
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={td}>{p.strategy}</td>
                        <td style={td} className="mono">{p.symbol.replace("USDT", "")}</td>
                        <td style={td}><span className={`mono ${p.side}`}>{p.side.toUpperCase()}</span></td>
                        <td style={td} className="mono"><span style={{ color: p.leverage >= 15 ? "var(--red)" : p.leverage >= 10 ? "var(--amber)" : "var(--green)" }}>{p.leverage}x</span></td>
                        <td style={td} className="mono">{p.entry.toFixed(4)}</td>
                        <td style={td} className="mono">${p.size}</td>
                        <td style={td} className="mono">${p.margin.toFixed(2)}</td>
                        <td style={{ ...td, color: liqDist < 5 && liqDist > 0 ? "var(--red)" : "var(--text-dim)" }} className="mono">{p.liquidation.toFixed(4)}{liqDist > 0 && <span style={{ fontSize: 10 }}> ({liqDist.toFixed(1)}%)</span>}</td>
                        <td style={td} className={`mono ${pnl >= 0 ? "long" : "short"}`}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}</td>
                        <td style={td} className={`mono ${roe >= 0 ? "long" : "short"}`}>{roe >= 0 ? "+" : ""}{roe.toFixed(1)}%</td>
                        <td style={td}><button className="btn btn-ghost" onClick={() => closePos(p.id)} style={{ padding: "4px 10px", fontSize: 11 }}>{t("tbl.close")}</button></td>
=======
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={td}>{p.strategy}</td>
                        <td style={td} className="mono">{p.symbol}</td>
                        <td style={td}><span className={`mono ${p.side}`}>{p.side.toUpperCase()}</span></td>
                        <td style={td} className="mono">{p.entry.toFixed(2)}</td>
                        <td style={td} className="mono">${p.size}</td>
                        <td style={td} className={`mono ${pnl >= 0 ? "long" : "short"}`}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}</td>
                        <td style={td}><button className="btn btn-ghost" onClick={() => closePos(p.id)} style={{ padding: "4px 10px", fontSize: 11 }}>Kapat</button></td>
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

<<<<<<< HEAD
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <div className="panel" style={{ padding: 16 }}>
            <h3 className="display" style={{ fontSize: 15, marginBottom: 12 }}>{t("demo.history")} ({wallet.history.length})</h3>
            {wallet.history.length === 0 ? (
              <p style={{ color: "var(--text-faint)", fontSize: 13 }}>{t("demo.no_history")}</p>
            ) : (
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {wallet.history.map((tr) => (
                  <div key={tr.id + tr.closeTime} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <span className={`mono ${tr.side}`}>{tr.side.toUpperCase()}</span>
                      <span className="mono" style={{ marginLeft: 6 }}>{tr.symbol.replace("USDT", "")}</span>
                      <span className="mono" style={{ marginLeft: 6, color: "var(--text-faint)" }}>{tr.leverage}x</span>
                      <div style={{ color: "var(--text-faint)", fontSize: 10, marginTop: 2 }}>{tr.closeReason}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className={`mono ${tr.pnl >= 0 ? "long" : "short"}`}>{tr.pnl >= 0 ? "+" : ""}${tr.pnl.toFixed(2)}</span>
                      <div className="mono" style={{ color: tr.roe >= 0 ? "var(--green-dim)" : "var(--red-dim)", fontSize: 10 }}>ROE {tr.roe >= 0 ? "+" : ""}{tr.roe.toFixed(1)}%</div>
=======
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
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

<<<<<<< HEAD
          <div className="panel" style={{ padding: 16 }}>
            <h3 className="display" style={{ fontSize: 15, marginBottom: 12 }}>{t("common.live_log")}</h3>
            <div style={{ maxHeight: 320, overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
              {log.length === 0 ? <p style={{ color: "var(--text-faint)" }}>—</p> :
                log.map((l, i) => <div key={i} style={{ padding: "3px 0", color: "var(--text-dim)", borderBottom: "1px solid var(--bg-soft)" }}>{l}</div>)}
=======
          {/* Canlı log */}
          <div className="panel" style={{ padding: 18 }}>
            <h3 className="display" style={{ fontSize: 15, marginBottom: 12 }}>CANLI LOG</h3>
            <div style={{ maxHeight: 280, overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              {log.length === 0 ? <p style={{ color: "var(--text-faint)" }}>—</p> :
                log.map((l, i) => <div key={i} style={{ padding: "4px 0", color: "var(--text-dim)", borderBottom: "1px solid var(--bg-soft)" }}>{l}</div>)}
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const selStyle: React.CSSProperties = {
<<<<<<< HEAD
  width: "100%", padding: "8px 10px", background: "var(--bg-soft)", border: "1px solid var(--border-glow)",
  borderRadius: 6, color: "var(--text)", fontSize: 13,
};
const th: React.CSSProperties = { padding: "6px 8px", fontWeight: 500, fontSize: 10, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "8px 8px" };
=======
  width: "100%", padding: "9px 10px", background: "var(--bg-soft)", border: "1px solid var(--border-glow)",
  borderRadius: 6, color: "var(--text)", fontSize: 13,
};
const th: React.CSSProperties = { padding: "6px 10px", fontWeight: 500, fontSize: 11, textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "8px 10px" };
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
<<<<<<< HEAD
      <div className="mono" style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 4 }}>{label}</div>
      <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: color || "var(--text)" }}>{value}</div>
=======
      <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 4 }}>{label}</div>
      <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: color || "var(--text)" }}>{value}</div>
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
<<<<<<< HEAD
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 5 }}>{label}</div>
=======
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>{label}</div>
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
      {children}
    </div>
  );
}

export default function DemoPage() {
  return (
<<<<<<< HEAD
    <Suspense fallback={<div className="container" style={{ padding: 40 }}>Loading...</div>}>
=======
    <Suspense fallback={<div className="container" style={{ padding: 40 }}>Yükleniyor...</div>}>
>>>>>>> 40b8debf6aee9c31feaea4d0f6fbe1f5b8d83814
      <DemoInner />
    </Suspense>
  );
}
