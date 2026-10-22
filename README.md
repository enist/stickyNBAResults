# NBA Sonuçları — reTerminal Sticky

reTerminal Sticky'nin 480x800 siyah-beyaz ekranı için, bir önceki günün (ABD Doğu saati) NBA maç sonuçlarını gösteren tek dosyalık HTML sayfası. Veriler [balldontlie](https://www.balldontlie.io) API'sinin `/nba/v1/games` uç noktasından alınır.

## Kurulum

1. Bu repoyu GitHub'a gönderin; **Settings → Pages → Source** olarak **GitHub Actions** seçin. Her `main` push'unda sayfa yayınlanır.
2. Cihaza şu adresi verin:

   ```
   https://<kullanici>.github.io/<repo>/?key=<BALLDONTLIE_API_KEY>
   ```

   Alternatif olarak anahtarı `index.html` içindeki `API_KEY` sabitine yazabilirsiniz. Her iki durumda da anahtar sayfayı açabilen herkese görünür.

## Parametreler

| Parametre | Açıklama |
|---|---|
| `key` | balldontlie API anahtarı |
| `date` | Belirli bir gün, ör. `?date=2026-10-21` (varsayılan: dün, ABD Doğu saati) |
| `demo` | API'ye bağlanmadan örnek verilerle gösterir |
