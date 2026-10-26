# NBA Sonuçları — reTerminal Sticky

reTerminal Sticky'nin 480x800 siyah-beyaz ekranı için, bir önceki günün (ABD Doğu saati) NBA maç sonuçlarını ve takımların sezon rekorlarını (W-L) gösteren tek dosyalık HTML sayfası.

## Nasıl çalışır

- `scripts/fetch-data.mjs`, [balldontlie](https://www.balldontlie.io) API'sinin `/nba/v1/games` uç noktasından sezonun dünkü tarihe kadarki tüm maçlarını çeker, normal sezon rekorlarını hesaplar ve dünün maçlarını `data.json` dosyasına yazar. Ücretsiz plan dakikada 5 istek verdiği için sayfalar arasında 13 sn bekler (sezon sonunda ~13 istek, ~3 dk).
- GitHub Actions bu script'i her gün 06:30 ve 09:00 UTC'de (09:30 / 12:00 TR) çalıştırır, `data.json`'u commit'ler ve sayfayı GitHub Pages'e yayınlar.
- `index.html` yalnızca `data.json`'u okur; API'ye istek atmaz, API anahtarı sayfada yer almaz.

## Kurulum

1. **Settings → Pages → Source**: **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → New repository secret**: adı `BDL_API_KEY`, değeri balldontlie API anahtarı.
3. Veriyi hemen üretmek için **Actions → Deploy static content to Pages → Run workflow**.
4. Cihaza şu adresi verin: `https://<kullanici>.github.io/<repo>/`

`main`'e yapılan push'lar veri çekmez, mevcut `data.json` ile yayın yapar. GitHub, 60 gün commit almayan public repolarda zamanlanmış işleri durdurur; günlük `data.json` commit'leri bunu önler.

## Yerelde

```bash
BDL_API_KEY=... node scripts/fetch-data.mjs            # dün
BDL_API_KEY=... node scripts/fetch-data.mjs 2026-10-21 # belirli gün
```

`index.html?demo` API'ye ve `data.json`'a bakmadan örnek verilerle gösterir.
