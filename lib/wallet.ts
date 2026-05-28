// Demo cüzdan + trade motoru (localStorage, sıfır backend)
"use client";

export interface Position {
  id: string;
  strategy: string;
  symbol: string;
  side: "long" | "short";
  entry: number;
  size: number;       // USD cinsinden pozisyon büyüklüğü
  stop_loss: number;
  take_profit: number[];
  tpHit: boolean[];
  openTime: number;
  reason: string;
}

export interface ClosedTrade {
  id: string;
  strategy: string;
  symbol: string;
  side: "long" | "short";
  entry: number;
  exit: number;
  size: number;
  pnl: number;
  pnlPct: number;
  reason: string;
  closeReason: string;
  openTime: number;
  closeTime: number;
}

export interface WalletState {
  balance: number;
  positions: Position[];
  history: ClosedTrade[];
  topups: number;
}

const KEY = "talons_wallet_v1";
const START = 1000;

export function loadWallet(): WalletState {
  if (typeof window === "undefined") return { balance: START, positions: [], history: [], topups: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { balance: START, positions: [], history: [], topups: 0 };
    return JSON.parse(raw);
  } catch {
    return { balance: START, positions: [], history: [], topups: 0 };
  }
}

export function saveWallet(w: WalletState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(w));
}

export function resetWallet(): WalletState {
  const w = { balance: START, positions: [], history: [], topups: 0 };
  saveWallet(w);
  return w;
}

export function topUp(w: WalletState, amount = 1000): WalletState {
  const nw = { ...w, balance: w.balance + amount, topups: w.topups + amount };
  saveWallet(nw);
  return nw;
}

// Pozisyon aç
export function openPosition(w: WalletState, p: Omit<Position, "id" | "openTime" | "tpHit">): WalletState {
  if (p.size > w.balance) return w; // yetersiz bakiye
  const pos: Position = {
    ...p,
    id: Math.random().toString(36).slice(2, 10),
    openTime: Date.now(),
    tpHit: p.take_profit.map(() => false),
  };
  const nw: WalletState = {
    ...w,
    balance: w.balance - p.size, // margin ayrılır
    positions: [...w.positions, pos],
  };
  saveWallet(nw);
  return nw;
}

// Pozisyon kapat (manuel veya otomatik)
export function closePosition(w: WalletState, posId: string, exitPrice: number, closeReason: string): WalletState {
  const pos = w.positions.find((p) => p.id === posId);
  if (!pos) return w;
  const pnl = calcPnl(pos, exitPrice);
  const closed: ClosedTrade = {
    id: pos.id, strategy: pos.strategy, symbol: pos.symbol, side: pos.side,
    entry: pos.entry, exit: exitPrice, size: pos.size,
    pnl, pnlPct: (pnl / pos.size) * 100,
    reason: pos.reason, closeReason,
    openTime: pos.openTime, closeTime: Date.now(),
  };
  const nw: WalletState = {
    ...w,
    balance: w.balance + pos.size + pnl, // margin geri + kar/zarar
    positions: w.positions.filter((p) => p.id !== posId),
    history: [closed, ...w.history].slice(0, 100),
  };
  saveWallet(nw);
  return nw;
}

// PnL hesabı (USD)
export function calcPnl(pos: Position, price: number): number {
  const change = pos.side === "long"
    ? (price - pos.entry) / pos.entry
    : (pos.entry - price) / pos.entry;
  return pos.size * change;
}

// Her fiyat güncellemesinde SL/TP kontrolü, otomatik kapatma
export function checkPositions(w: WalletState, symbol: string, price: number): { wallet: WalletState; events: string[] } {
  let nw = w;
  const events: string[] = [];
  for (const pos of w.positions.filter((p) => p.symbol === symbol)) {
    // SL kontrol
    const slHit = pos.side === "long" ? price <= pos.stop_loss : price >= pos.stop_loss;
    if (slHit) {
      nw = closePosition(nw, pos.id, pos.stop_loss, "Stop Loss");
      events.push(`🔴 ${pos.strategy} SL'e takıldı @ ${pos.stop_loss.toFixed(2)}`);
      continue;
    }
    // Son TP (full exit)
    const lastTp = pos.take_profit[pos.take_profit.length - 1];
    const tpHit = pos.side === "long" ? price >= lastTp : price <= lastTp;
    if (tpHit) {
      nw = closePosition(nw, pos.id, lastTp, "Take Profit (final)");
      events.push(`🟢 ${pos.strategy} TP'ye ulaştı @ ${lastTp.toFixed(2)}`);
    }
  }
  return { wallet: nw, events };
}

export function equity(w: WalletState, prices: Record<string, number>): number {
  let eq = w.balance;
  for (const pos of w.positions) {
    const price = prices[pos.symbol] ?? pos.entry;
    eq += pos.size + calcPnl(pos, price);
  }
  return eq;
}
