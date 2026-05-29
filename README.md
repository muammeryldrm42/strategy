# Talons Strategy Lab

22 trading stratejisi (SMC + indikatör + memecoin), her biri Python + TypeScript + Pine Script kodu ile. Canlı Binance fiyatları üzerinde $1000 sanal bakiyeyle demo trade. Kendi stratejini JS olarak yazıp sandbox'ta çalıştır.

**Sıfır backend / sıfır VPS.** Next.js + Vercel. Binance public API Next.js route üzerinden proxy'lenir, bakiye localStorage'da tutulur, kullanıcı kodu izole Web Worker'da çalışır.

## Sayfalar

- `/` — ana sayfa, strateji listesi
- `/library` — 22 strateji detayı + 3 dilde kod (kopyala butonlu)
- `/demo` — strateji seç, canlı fiyatla otomatik/manuel demo trade, P&L takibi
- `/playground` — kendi JS stratejini yaz, sandbox'ta çalıştır, demo trade

17 strateji canlı fiyatla demo-tradeable. 5 memecoin stratejisi (bonding_curve_sniper, dev_pattern, holder_distribution, social_momentum, migration_play) off-chain veri gerektirdiği için kodu gösterilir ama demo'da devre dışıdır.

## Lokal çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Vercel'e Deploy

1. Bu klasörü bir GitHub reposuna push et:
   ```bash
   git init && git add . && git commit -m "Talons Strategy Lab"
   git branch -M main
   git remote add origin https://github.com/KULLANICI/talons-strategy-lab.git
   git push -u origin main
   ```
2. [vercel.com](https://vercel.com) → New Project → repoyu import et.
3. Vercel Next.js'i otomatik algılar. **Hiçbir ayar/env değişkeni gerekmez.** Deploy'a bas.

> Not: Binance API bu geliştirme sandbox'ında ağ kısıtı nedeniyle çalışmaz, ama Vercel'de sorunsuz çalışır.

## Yapı

```
app/
  page.tsx              ana sayfa
  library/page.tsx      kütüphane
  demo/page.tsx         demo trade
  playground/page.tsx   kod playground
  api/klines/route.ts   Binance proxy
lib/
  indicators.ts         teknik indikatörler
  registry.ts           strateji metadata + runner kaydı
  wallet.ts             demo bakiye/pozisyon motoru
  sandbox.ts            kullanıcı kodu Web Worker runner
  strategies/           çalıştırılabilir strateji implementasyonları
components/
  Nav.tsx, CodeViewer.tsx
public/code/            61 kütüphane kod dosyası (statik gösterim)
```

Demo amaçlıdır, finansal tavsiye değildir.
