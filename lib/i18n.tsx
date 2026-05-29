"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "tr" | "es" | "fr" | "de" | "ru" | "zh" | "ja" | "ko" | "pt";

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "EN", native: "English" },
  { code: "tr", label: "TR", native: "Türkçe" },
  { code: "es", label: "ES", native: "Español" },
  { code: "fr", label: "FR", native: "Français" },
  { code: "de", label: "DE", native: "Deutsch" },
  { code: "ru", label: "RU", native: "Русский" },
  { code: "zh", label: "ZH", native: "中文" },
  { code: "ja", label: "JA", native: "日本語" },
  { code: "ko", label: "KO", native: "한국어" },
  { code: "pt", label: "PT", native: "Português" },
];

const DEFAULT_LANG: Lang = "en";

type Dict = Record<Lang, string>;
const D = (en: string, tr: string, es: string, fr: string, de: string, ru: string, zh: string, ja: string, ko: string, pt: string): Dict =>
  ({ en, tr, es, fr, de, ru, zh, ja, ko, pt });

export const STRINGS: Record<string, Dict> = {
  // ============ NAV ============
  "nav.library":     D("Library","Kütüphane","Biblioteca","Bibliothèque","Bibliothek","Библиотека","策略库","ライブラリ","라이브러리","Biblioteca"),
  "nav.demo":        D("Demo Trade","Demo Trade","Demo","Démo","Demo","Демо","模拟交易","デモ","데모","Demo"),
  "nav.playground":  D("Playground","Playground","Playground","Playground","Playground","Песочница","代码沙盒","プレイグラウンド","플레이그라운드","Playground"),

  // ============ HOME ============
  "home.tagline":    D("Strategy lab · 37 strategies · live demo · sandbox playground","Strateji laboratuvarı · 37 strateji · canlı demo · sandbox playground","Lab de estrategias · 37 estrategias · demo en vivo · playground","Lab de stratégies · 37 stratégies · démo live · playground","Strategie-Labor · 37 Strategien · Live-Demo · Playground","Лаборатория стратегий · 37 стратегий · живое демо · песочница","策略实验室 · 37个策略 · 实时演示 · 沙盒","戦略ラボ · 37戦略 · ライブデモ · プレイグラウンド","전략 실험실 · 37개 전략 · 라이브 데모 · 플레이그라운드","Lab de estratégias · 37 estratégias · demo ao vivo · playground"),
  "home.hero_sub":   D("Open Smart Money Concepts, indicator, memecoin, scalping & mean-reversion strategies. Browse, demo-trade with live Binance prices, or write your own in a sandbox.","Açık SMC, indikatör, memecoin, scalping ve mean-reversion stratejileri. İncele, canlı Binance fiyatlarıyla demo trade yap veya sandbox'ta kendi stratejini yaz.","Estrategias abiertas de SMC, indicadores, memecoin, scalping y reversión a la media. Explora, opera en demo con precios en vivo de Binance o crea las tuyas.","Stratégies ouvertes SMC, indicateurs, memecoin, scalping et mean-reversion. Parcourez, tradez en démo avec les prix Binance en direct ou créez les vôtres.","Offene SMC-, Indikator-, Memecoin-, Scalping- und Mean-Reversion-Strategien. Stöbern, mit Live-Binance-Preisen Demo-traden oder eigene erstellen.","Открытые стратегии SMC, индикаторов, мемкоинов, скальпинга и возврата к среднему. Изучайте, демо-торгуйте с живыми ценами Binance или пишите свои.","开源 SMC、指标、模因币、剥头皮和均值回归策略。浏览、用币安实时价格模拟交易，或在沙盒中编写您自己的策略。","オープンなSMC、インジケーター、ミームコイン、スキャルピング、平均回帰戦略。閲覧、Binanceライブ価格でデモ取引、サンドボックスで独自作成。","오픈 SMC, 지표, 밈코인, 스캘핑 및 평균 회귀 전략. 탐색하고, Binance 실시간 가격으로 데모 거래하거나, 샌드박스에서 직접 작성하세요.","Estratégias abertas de SMC, indicadores, memecoin, scalping e reversão à média. Explore, opere em demo com preços ao vivo da Binance ou escreva as suas."),
  "home.cta_browse": D("Browse Library →","Kütüphaneye Göz At →","Ver Biblioteca →","Voir Bibliothèque →","Bibliothek ansehen →","Открыть библиотеку →","浏览策略库 →","ライブラリを見る →","라이브러리 보기 →","Ver Biblioteca →"),
  "home.cta_demo":   D("Demo Trade →","Demo Trade'e Git →","Ir a Demo →","Démo Trade →","Demo Trade →","К демо-трейду →","模拟交易 →","デモトレード →","데모 거래 →","Demo Trade →"),
  "home.cta_play":   D("Playground →","Playground →","Playground →","Playground →","Playground →","Песочница →","沙盒 →","プレイグラウンド →","플레이그라운드 →","Playground →"),
  "home.f1.title":   D("Strategy Library","Strateji Kütüphanesi","Biblioteca","Bibliothèque","Bibliothek","Библиотека","策略库","ライブラリ","라이브러리","Biblioteca"),
  "home.f1.body":    D("37 strategies across 5 categories. Full source in Python, TypeScript and Pine Script — open under MIT.","5 kategoride 37 strateji. Python, TypeScript ve Pine Script tam kaynak — MIT açık.","37 estrategias en 5 categorías. Código fuente completo en Python, TypeScript y Pine Script — MIT.","37 stratégies dans 5 catégories. Code source complet en Python, TypeScript et Pine Script — MIT.","37 Strategien in 5 Kategorien. Vollständiger Quellcode in Python, TypeScript und Pine Script — MIT.","37 стратегий в 5 категориях. Полный исходный код на Python, TypeScript и Pine Script — MIT.","5个类别共37个策略。Python、TypeScript和Pine Script完整源码 — MIT开源。","5カテゴリ37戦略。Python、TypeScript、Pine Scriptの完全ソース — MIT。","5개 카테고리 37개 전략. Python, TypeScript, Pine Script 전체 소스 — MIT.","37 estratégias em 5 categorias. Código fonte completo em Python, TypeScript e Pine Script — MIT."),
  "home.f2.title":   D("Demo Trade","Demo Trade","Demo Trade","Démo Trade","Demo Trade","Демо-трейд","模拟交易","デモトレード","데모 거래","Demo Trade"),
  "home.f2.body":    D("Live Binance candles, 18 symbols, 1x–25x leverage with liquidation. Virtual balance, equity curve, full stats.","Canlı Binance mumları, 18 sembol, likidasyonlu 1x–25x kaldıraç. Sanal bakiye, equity eğrisi, tam istatistik.","Velas Binance en vivo, 18 símbolos, apalancamiento 1x–25x con liquidación. Saldo virtual, curva de equity, estadísticas.","Bougies Binance live, 18 symboles, levier 1x–25x avec liquidation. Solde virtuel, courbe d'equity, stats complètes.","Live-Binance-Kerzen, 18 Symbole, Hebel 1x–25x mit Liquidation. Virtuelle Balance, Equity-Kurve, vollständige Statistik.","Живые свечи Binance, 18 символов, плечо 1x–25x с ликвидацией. Виртуальный баланс, кривая капитала, полная статистика.","币安实时K线，18个交易对，1x-25x杠杆带强平。虚拟余额、净值曲线、完整统计。","Binanceライブローソク、18銘柄、清算付き1x-25xレバレッジ。仮想残高、エクイティカーブ、完全な統計。","바이낸스 라이브 캔들, 18개 심볼, 청산 포함 1x-25x 레버리지. 가상 잔고, 자산 곡선, 전체 통계.","Velas Binance ao vivo, 18 símbolos, alavancagem 1x-25x com liquidação. Saldo virtual, curva de equity, estatísticas completas."),
  "home.f3.title":   D("Playground","Playground","Playground","Playground","Playground","Песочница","沙盒","プレイグラウンド","플레이그라운드","Playground"),
  "home.f3.body":    D("Write your own strategy in JavaScript. Runs in an isolated Web Worker (no DOM/network). Demo-trade with leverage.","Kendi stratejini JavaScript ile yaz. İzole Web Worker'da çalışır (DOM/network yok). Kaldıraçlı demo trade.","Escribe tu estrategia en JavaScript. Se ejecuta en Web Worker aislado (sin DOM/red). Demo con apalancamiento.","Écrivez votre stratégie en JavaScript. Exécuté dans un Web Worker isolé (pas de DOM/réseau). Démo avec levier.","Eigene Strategie in JavaScript schreiben. Läuft in isoliertem Web Worker (kein DOM/Netzwerk). Demo mit Hebel.","Напишите свою стратегию на JavaScript. Работает в изолированном Web Worker (без DOM/сети). Демо с плечом.","用JavaScript编写您自己的策略。在隔离的Web Worker中运行（无DOM/网络）。杠杆模拟交易。","JavaScriptで独自戦略を作成。隔離されたWeb Workerで実行（DOM/ネットワークなし）。レバレッジ付きデモ。","JavaScript로 직접 전략 작성. 격리된 Web Worker에서 실행（DOM/네트워크 없음）. 레버리지 데모 거래.","Escreva sua estratégia em JavaScript. Roda em Web Worker isolado (sem DOM/rede). Demo com alavancagem."),

  // ============ COMMON ============
  "common.loading":   D("Loading...","Yükleniyor...","Cargando...","Chargement...","Wird geladen...","Загрузка...","加载中...","読み込み中...","로딩 중...","Carregando..."),
  "common.reset":     D("Reset","Sıfırla","Reiniciar","Réinitialiser","Zurücksetzen","Сбросить","重置","リセット","초기화","Resetar"),
  "common.top_up":    D("+$1000","+$1000","+$1000","+$1000","+$1000","+$1000","+$1000","+$1000","+$1000","+$1000"),
  "common.close":     D("Close","Kapat","Cerrar","Fermer","Schließen","Закрыть","关闭","閉じる","닫기","Fechar"),
  "common.confirm_reset": D("Reset all demo data?","Tüm demo sıfırlansın mı?","¿Reiniciar todos los datos demo?","Réinitialiser toutes les données démo ?","Alle Demo-Daten zurücksetzen?","Сбросить все демо-данные?","重置所有模拟数据？","すべてのデモデータをリセットしますか？","모든 데모 데이터를 초기화하시겠습니까？","Resetar todos os dados demo?"),
  "common.search":    D("Search...","Ara...","Buscar...","Rechercher...","Suchen...","Поиск...","搜索...","検索...","검색...","Buscar..."),
  "common.all":       D("All","Tümü","Todos","Tous","Alle","Все","全部","すべて","전체","Todos"),
  "common.balance":   D("Balance","Bakiye","Saldo","Solde","Guthaben","Баланс","余额","残高","잔고","Saldo"),
  "common.equity":    D("Equity","Equity","Equity","Equity","Equity","Капитал","净值","エクイティ","자산","Equity"),
  "common.total_pnl": D("Total P&L","Toplam P&L","P&L Total","P&L Total","Gesamt-P&L","Общий P&L","总盈亏","総損益","총 손익","P&L Total"),
  "common.roi":       D("ROI","ROI","ROI","ROI","ROI","ROI","ROI","ROI","ROI","ROI"),
  "common.long":      D("LONG","LONG","LONG","LONG","LONG","LONG","做多","ロング","롱","LONG"),
  "common.short":     D("SHORT","SHORT","SHORT","SHORT","SHORT","SHORT","做空","ショート","숏","SHORT"),
  "common.live_log":  D("Live Log","Canlı Log","Log en Vivo","Log Live","Live-Log","Живой лог","实时日志","ライブログ","실시간 로그","Log ao Vivo"),
  "common.no_data":   D("—","—","—","—","—","—","—","—","—","—"),

  // ============ CATEGORIES ============
  "cat.smc":          D("SMC / Price Action","SMC / Fiyat Hareketi","SMC / Price Action","SMC / Price Action","SMC / Price Action","SMC / Price Action","SMC / 价格行为","SMC / 価格アクション","SMC / 가격 액션","SMC / Price Action"),
  "cat.indicators":   D("Classic Indicators","Klasik İndikatörler","Indicadores Clásicos","Indicateurs Classiques","Klassische Indikatoren","Классические индикаторы","经典指标","クラシック指標","클래식 지표","Indicadores Clássicos"),
  "cat.memecoin":     D("Memecoin","Memecoin","Memecoin","Memecoin","Memecoin","Мемкоины","模因币","ミームコイン","밈코인","Memecoin"),
  "cat.scalping":     D("Scalping","Scalping","Scalping","Scalping","Scalping","Скальпинг","剥头皮","スキャルピング","스캘핑","Scalping"),
  "cat.meanrev":      D("Mean Reversion","Mean Reversion","Reversión a la Media","Mean Reversion","Mean Reversion","Возврат к среднему","均值回归","平均回帰","평균 회귀","Reversão à Média"),
  "cat.trend":        D("Trend Following","Trend Takibi","Seguimiento de Tendencia","Suivi de Tendance","Trendfolge","Следование тренду","趋势跟踪","トレンドフォロー","추세 추종","Seguimento de Tendência"),
  "cat.breakout":     D("Breakout","Kırılım","Ruptura","Cassure","Ausbruch","Пробой","突破","ブレイクアウト","돌파","Rompimento"),
  "cat.patterns":     D("Candlestick Patterns","Mum Formasyonları","Patrones de Velas","Figures Chandeliers","Kerzenmuster","Свечные паттерны","K线形态","ローソク足パターン","캔들 패턴","Padrões de Velas"),

  // ============ LIBRARY ============
  "lib.title":        D("STRATEGY LIBRARY","STRATEJİ KÜTÜPHANESİ","BIBLIOTECA DE ESTRATEGIAS","BIBLIOTHÈQUE DE STRATÉGIES","STRATEGIE-BIBLIOTHEK","БИБЛИОТЕКА СТРАТЕГИЙ","策略库","戦略ライブラリ","전략 라이브러리","BIBLIOTECA DE ESTRATÉGIAS"),
  "lib.subtitle":     D("37 strategies · 5 categories · open source","37 strateji · 5 kategori · açık kaynak","37 estrategias · 5 categorías · open source","37 stratégies · 5 catégories · open source","37 Strategien · 5 Kategorien · open source","37 стратегий · 5 категорий · открытый код","37个策略 · 5个类别 · 开源","37戦略 · 5カテゴリ · オープンソース","37개 전략 · 5개 카테고리 · 오픈소스","37 estratégias · 5 categorias · open source"),
  "lib.found":        D("strategies found","strateji bulundu","estrategias encontradas","stratégies trouvées","Strategien gefunden","стратегий найдено","个策略","戦略が見つかりました","개 전략 찾음","estratégias encontradas"),
  "lib.no_results":   D("No strategies match your filters.","Filtrelere uyan strateji yok.","Ninguna estrategia coincide.","Aucune stratégie ne correspond.","Keine passenden Strategien.","Стратегии не найдены.","没有匹配的策略。","条件に一致する戦略がありません。","조건에 맞는 전략이 없습니다.","Nenhuma estratégia corresponde."),

  // ============ STRATEGY DETAIL ============
  "strat.confidence": D("Confidence","Güven","Confianza","Confiance","Konfidenz","Уверенность","置信度","信頼度","신뢰도","Confiança"),
  "strat.entry":      D("Entry","Giriş","Entrada","Entrée","Einstieg","Вход","入场","エントリー","진입","Entrada"),
  "strat.exit":       D("Exit","Çıkış","Salida","Sortie","Ausstieg","Выход","离场","エグジット","청산","Saída"),
  "strat.description":D("Description","Açıklama","Descripción","Description","Beschreibung","Описание","描述","説明","설명","Descrição"),
  "strat.demo_btn":   D("Run in Demo Trade","Demo Trade'de Çalıştır","Ejecutar en Demo","Lancer en Démo","In Demo ausführen","Запустить в демо","在模拟中运行","デモで実行","데모에서 실행","Executar em Demo"),
  "strat.code":       D("Source Code","Kaynak Kod","Código Fuente","Code Source","Quellcode","Исходный код","源代码","ソースコード","소스 코드","Código Fonte"),
  "strat.copy":       D("Copy","Kopyala","Copiar","Copier","Kopieren","Копировать","复制","コピー","복사","Copiar"),
  "strat.copied":     D("Copied!","Kopyalandı!","¡Copiado!","Copié !","Kopiert!","Скопировано!","已复制！","コピーしました！","복사됨！","Copiado!"),

  // ============ DEMO ============
  "demo.title":       D("DEMO TRADE","DEMO TRADE","DEMO TRADE","DEMO TRADE","DEMO TRADE","ДЕМО-ТРЕЙД","模拟交易","デモトレード","데모 거래","DEMO TRADE"),
  "demo.subtitle":    D("Live Binance · virtual balance · 1x-25x leverage","Canlı Binance · sanal bakiye · 1x-25x kaldıraç","Binance en vivo · saldo virtual · apalancamiento 1x-25x","Binance live · solde virtuel · levier 1x-25x","Live Binance · virtuelle Balance · 1x-25x Hebel","Живой Binance · виртуальный баланс · плечо 1x-25x","币安实时 · 虚拟余额 · 1x-25x杠杆","Binanceライブ · 仮想残高 · 1x-25xレバレッジ","바이낸스 라이브 · 가상 잔고 · 1x-25x 레버리지","Binance ao vivo · saldo virtual · alavancagem 1x-25x"),
  "demo.pos_trade":   D("POS / TRADES","POZ / TRADE","POS / TRADES","POS / TRADES","POS / TRADES","ПОЗ / СДЕЛКИ","持仓/交易","ポジ/取引","포지션/거래","POS / TRADES"),
  "demo.show_stats":  D("📊 Stats","📊 İstatistikler","📊 Estadísticas","📊 Statistiques","📊 Statistik","📊 Статистика","📊 统计","📊 統計","📊 통계","📊 Estatísticas"),
  "demo.hide_stats":  D("✕ Hide Stats","✕ İstatistikleri Gizle","✕ Ocultar Stats","✕ Masquer","✕ Verbergen","✕ Скрыть","✕ 隐藏","✕ 隠す","✕ 숨기기","✕ Ocultar"),
  "demo.equity_curve":D("EQUITY CURVE","EQUITY EĞRİSİ","CURVA DE EQUITY","COURBE D'EQUITY","EQUITY-KURVE","КРИВАЯ КАПИТАЛА","净值曲线","エクイティカーブ","자산 곡선","CURVA DE EQUITY"),
  "demo.no_equity":   D("No equity history yet (builds as you trade)","Equity geçmişi yok (trade yaptıkça oluşur)","Sin historial (se construye al operar)","Pas d'historique (créé en tradant)","Keine Equity-Historie (entsteht beim Traden)","Нет истории (создаётся при торговле)","暂无净值历史（交易后生成）","エクイティ履歴なし（取引で生成）","자산 이력 없음（거래 시 생성）","Sem histórico (gerado ao operar)"),
  "demo.win_rate":    D("Win Rate","Win Rate","Tasa Ganadora","Taux Gagnant","Gewinnrate","Win Rate","胜率","勝率","승률","Taxa Vitória"),
  "demo.wins_losses": D("Wins / Losses","Kazanç / Kayıp","Ganadas / Perdidas","Gagnés / Perdus","Gewinne / Verluste","Победы / Поражения","盈利/亏损","勝/敗","승/패","Vitórias/Derrotas"),
  "demo.avg_win":     D("Avg Win","Ort. Kazanç","Prom. Ganancia","Gain Moy.","Ø Gewinn","Ср. прибыль","平均盈利","平均利益","평균 수익","Ganho Médio"),
  "demo.avg_loss":    D("Avg Loss","Ort. Kayıp","Prom. Pérdida","Perte Moy.","Ø Verlust","Ср. убыток","平均亏损","平均損失","평균 손실","Perda Média"),
  "demo.biggest_win": D("Biggest Win","En Büyük Kar","Mayor Ganancia","Plus Gros Gain","Größter Gewinn","Макс. прибыль","最大盈利","最大利益","최대 수익","Maior Ganho"),
  "demo.biggest_loss":D("Biggest Loss","En Büyük Zarar","Mayor Pérdida","Plus Grosse Perte","Größter Verlust","Макс. убыток","最大亏损","最大損失","최대 손실","Maior Perda"),
  "demo.liquidations":D("Liquidations","Likidasyon","Liquidaciones","Liquidations","Liquidationen","Ликвидации","强平","清算","청산","Liquidações"),
  "demo.best_symbol": D("Best Symbol","En İyi Sembol","Mejor Símbolo","Meilleur Symbole","Bestes Symbol","Лучший символ","最佳标的","最高銘柄","최고 심볼","Melhor Símbolo"),
  "demo.best_strat":  D("Best Strategy","En İyi Strateji","Mejor Estrategia","Meilleure Stratégie","Beste Strategie","Лучшая стратегия","最佳策略","最高戦略","최고 전략","Melhor Estratégia"),
  "demo.strategy":    D("Strategy","Strateji","Estrategia","Stratégie","Strategie","Стратегия","策略","戦略","전략","Estratégia"),
  "demo.symbol":      D("Symbol","Sembol","Símbolo","Symbole","Symbol","Символ","交易对","銘柄","심볼","Símbolo"),
  "demo.timeframe":   D("Timeframe","Zaman Dilimi","Marco Temporal","Période","Zeitrahmen","Таймфрейм","时间周期","時間枠","시간 프레임","Período"),
  "demo.leverage":    D("Leverage","Kaldıraç","Apalancamiento","Levier","Hebel","Плечо","杠杆","レバレッジ","레버리지","Alavancagem"),
  "demo.notional":    D("Position Notional ($)","Pozisyon Notional ($)","Tamaño Notional ($)","Notional ($)","Notional ($)","Номинал ($)","名义价值 ($)","名目額 ($)","명목 가치 ($)","Notional ($)"),
  "demo.margin":      D("Margin","Margin","Margen","Marge","Margin","Маржа","保证金","証拠金","증거금","Margem"),
  "demo.of_balance":  D("of balance","bakiye","del saldo","du solde","des Guthabens","от баланса","余额","残高","잔고","do saldo"),
  "demo.quick_size":  D("Quick Size (% balance × leverage)","Hızlı Boyut (% bakiye × kaldıraç)","Tamaño Rápido (% saldo × apalanc.)","Taille Rapide (% solde × levier)","Schnellgröße (% Guthaben × Hebel)","Быстрый размер (% баланса × плечо)","快速大小（%余额×杠杆）","クイックサイズ（%残高×レバ）","빠른 크기（% 잔고 × 레버리지）","Tamanho Rápido (% saldo × alav.)"),
  "demo.test_signal": D("🔍 Test Signal","🔍 Sinyal Test","🔍 Probar Señal","🔍 Test Signal","🔍 Signal testen","🔍 Тест сигнала","🔍 测试信号","🔍 シグナルテスト","🔍 신호 테스트","🔍 Testar Sinal"),
  "demo.auto":        D("Auto","Otomatik","Auto","Auto","Auto","Авто","自动","オート","자동","Auto"),
  "demo.auto_on":     D("● AUTO","● OTO","● AUTO","● AUTO","● AUTO","● АВТО","● 自动","● オート","● 자동","● AUTO"),
  "demo.last_signal": D("Last Signal","Son Sinyal","Última Señal","Dernier Signal","Letztes Signal","Последний сигнал","最新信号","最新シグナル","최근 신호","Último Sinal"),
  "demo.open_pos":    D("OPEN POSITIONS","AÇIK POZİSYONLAR","POSICIONES ABIERTAS","POSITIONS OUVERTES","OFFENE POSITIONEN","ОТКРЫТЫЕ ПОЗИЦИИ","持仓","オープンポジション","오픈 포지션","POSIÇÕES ABERTAS"),
  "demo.no_open_pos": D("No open positions.","Açık pozisyon yok.","Sin posiciones abiertas.","Aucune position ouverte.","Keine offenen Positionen.","Нет открытых позиций.","暂无持仓。","オープンポジションなし。","오픈 포지션 없음.","Sem posições abertas."),
  "demo.history":     D("TRADE HISTORY","İŞLEM GEÇMİŞİ","HISTORIAL","HISTORIQUE","HISTORIE","ИСТОРИЯ","交易历史","取引履歴","거래 내역","HISTÓRICO"),
  "demo.no_history":  D("No closed trades yet.","Henüz kapanmış işlem yok.","Sin operaciones cerradas.","Pas encore de trade fermé.","Noch keine abgeschlossenen Trades.","Закрытых сделок пока нет.","暂无已平仓交易。","クローズした取引はまだありません。","아직 종료된 거래 없음.","Sem trades fechados ainda."),

  // Position table headers
  "tbl.side":         D("Side","Yön","Lado","Côté","Seite","Сторона","方向","サイド","방향","Lado"),
  "tbl.lev":          D("Lev","Lev","Apal.","Levier","Hebel","Плечо","杠杆","レバ","레버","Alav."),
  "tbl.liq":          D("Liq","Liq","Liq","Liq","Liq","Ликв.","强平","清算","청산","Liq"),
  "tbl.close":        D("Close","Kapat","Cerrar","Fermer","Schließen","Закрыть","平仓","クローズ","청산","Fechar"),

  // Log messages
  "log.insufficient": D("Insufficient balance","Yetersiz bakiye","Saldo insuficiente","Solde insuffisant","Unzureichendes Guthaben","Недостаточный баланс","余额不足","残高不足","잔고 부족","Saldo insuficiente"),
  "log.fetch_fail":   D("Price fetch failed","Fiyat alınamadı","Error al obtener precio","Échec récupération prix","Preisabruf fehlgeschlagen","Не удалось получить цену","价格获取失败","価格取得失敗","가격 가져오기 실패","Falha ao obter preço"),
  "log.pos_closed":   D("Position closed","Pozisyon kapatıldı","Posición cerrada","Position fermée","Position geschlossen","Позиция закрыта","持仓已平仓","ポジションクローズ","포지션 종료","Posição fechada"),
  "log.topup":        D("💰 +$1000 balance","💰 +$1000 bakiye","💰 +$1000 saldo","💰 +$1000 solde","💰 +$1000 Guthaben","💰 +$1000 баланс","💰 +$1000 余额","💰 +$1000 残高","💰 +$1000 잔고","💰 +$1000 saldo"),
  "log.manual_entry": D("Manual entry","Manuel giriş","Entrada manual","Entrée manuelle","Manueller Einstieg","Ручной вход","手动入场","手動エントリー","수동 진입","Entrada manual"),
  "log.signal":       D("Signal","Sinyal","Señal","Signal","Signal","Сигнал","信号","シグナル","신호","Sinal"),
  "log.manual":       D("(manual)","(manuel)","(manual)","(manuel)","(manuell)","(вручную)","（手动）","（手動）","（수동）","(manual)"),
  "log.insufficient_data":D("Insufficient data","Yetersiz veri","Datos insuficientes","Données insuffisantes","Unzureichende Daten","Недостаточно данных","数据不足","データ不足","데이터 부족","Dados insuficientes"),

  // ============ PLAYGROUND ============
  "pg.title":         D("PLAYGROUND","PLAYGROUND","PLAYGROUND","PLAYGROUND","PLAYGROUND","ПЕСОЧНИЦА","代码沙盒","プレイグラウンド","플레이그라운드","PLAYGROUND"),
  "pg.subtitle":      D("Write your own strategy in JS. Runs in an isolated Web Worker · 1x-25x leverage.","Kendi stratejini JS olarak yaz. İzole Web Worker'da çalışır · 1x-25x kaldıraç.","Escribe tu estrategia en JS. Web Worker aislado · apalancamiento 1x-25x.","Écrivez votre stratégie en JS. Web Worker isolé · levier 1x-25x.","Eigene Strategie in JS. Isolierter Web Worker · 1x-25x Hebel.","Напишите стратегию на JS. Изолированный Web Worker · плечо 1x-25x.","用JS编写您的策略。隔离的Web Worker · 1x-25x杠杆。","JSで独自戦略。隔離されたWeb Worker · 1x-25xレバレッジ。","JS로 자체 전략 작성. 격리된 Web Worker · 1x-25x 레버리지.","Escreva sua estratégia em JS. Web Worker isolado · alavancagem 1x-25x."),
  "pg.run":           D("▶ Run","▶ Çalıştır","▶ Ejecutar","▶ Lancer","▶ Ausführen","▶ Запустить","▶ 运行","▶ 実行","▶ 실행","▶ Executar"),
  "pg.running":       D("Running...","Çalışıyor...","Ejecutando...","En cours...","Läuft...","Выполняется...","运行中...","実行中...","실행 중...","Executando..."),
  "pg.reset_code":    D("Reset","Sıfırla","Reiniciar","Réinitialiser","Zurücksetzen","Сбросить","重置","リセット","초기화","Resetar"),
  "pg.code_label":    D("strategy.js","strategy.js","strategy.js","strategy.js","strategy.js","strategy.js","strategy.js","strategy.js","strategy.js","strategy.js"),
  "pg.sandbox_note":  D("sandbox · isolated","sandbox · izole","sandbox · aislado","sandbox · isolé","Sandbox · isoliert","песочница · изолирована","沙盒 · 隔离","サンドボックス · 隔離","샌드박스 · 격리","sandbox · isolado"),

  // ============ MISC ============
  "misc.equilibrium": D("Equilibrium","Eşik","Equilibrio","Équilibre","Gleichgewicht","Равновесие","平衡","均衡","평형","Equilíbrio"),
  "lang.label":       D("Language","Dil","Idioma","Langue","Sprache","Язык","语言","言語","언어","Idioma"),
};

export function t(key: string, lang: Lang): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] || entry[DEFAULT_LANG] || key;
}

// React Context
interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string; }
const Ctx = createContext<I18nCtx>({ lang: DEFAULT_LANG, setLang: () => {}, t: (k) => t(k, DEFAULT_LANG) });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("talons_lang") as Lang | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("talons_lang", l); } catch {}
  };

  return (
    <Ctx.Provider value={{ lang, setLang, t: (k: string) => t(k, lang) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useT() { return useContext(Ctx); }
