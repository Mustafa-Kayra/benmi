# 🎭 Real-Time Yüz Analiz Arayüzü

Modern, responsive ve gerçek zamanlı yüz analizi yapan web uygulaması. Dark mode tasarım ve stabil tahminler ile hem masaüstü hem de mobil cihazlarda mükemmel çalışır.

## ✨ Özellikler

- 🎥 **Gerçek Zamanlı Video İşleme**: Webcam veya mobil kamera desteği
- 👤 **Yüz Algılama**: Merkezdeki algılama çerçevesi ile hassas yüz tanıma
- 📊 **Yaş & Cinsiyet Tahmini**: AI tabanlı anlık tahminler
- 🎯 **Stabil Tahminler**: Titreşim önleyici smoothing algoritması (5 frame ortalaması)
- 📱 **Tam Responsive**: Desktop, tablet ve mobil uyumlu
- 🌙 **Dark Mode**: Modern, göz dostu arayüz (#121212 + #007BFF)
- ⚡ **Yüksek Performans**: Optimize edilmiş algılama döngüsü (1 saniyede bir güncelleme)

## 🎨 Tasarım

- **Renk Paleti**:
  - Arka Plan: `#121212` (Koyu Gri)
  - Vurgu: `#007BFF` (Canlı Mavi)
  - Metin: `#FFFFFF` (Beyaz)
  
- **Layout**:
  - Desktop: Video sol/merkez, tahmin paneli sağda
  - Mobil: Video üstte, tahmin paneli altta

## 🚀 Kurulum & Çalıştırma

### Gereksinimler

- Modern bir web tarayıcı (Chrome, Firefox, Safari, Edge)
- Kamera/Webcam erişim izni
- İnternet bağlantısı (Face-API.js modelleri için)

### Adımlar

1. **Projeyi klonlayın veya indirin**
   ```bash
   git clone <repo-url>
   cd piro
   ```

2. **HTTP Sunucusu başlatın**
   
   Python 3 ile:
   ```powershell
   python -m http.server 8000
   ```
   
   Node.js ile:
   ```powershell
   npx http-server -p 8000
   ```
   
   VS Code ile:
   - Live Server eklentisini yükleyin
   - `index.html` dosyasına sağ tıklayıp "Open with Live Server" seçin

3. **Tarayıcıda açın**
   ```
   http://localhost:8000
   ```

4. **Kamera iznini verin**
   - Tarayıcı izin istediğinde "İzin Ver" seçeneğini tıklayın

## 📱 Mobil Kullanım

### Android Cihazlarda

1. Cihazınızda Chrome veya Brave tarayıcısını açın
2. Aynı ağda bilgisayarınızın IP adresini bulun:
   ```powershell
   ipconfig
   ```
3. Mobil tarayıcıda açın:
   ```
   http://<bilgisayar-ip>:8000
   ```
4. Kamera iznini verin
5. Ön kamerayı kullanarak yüzünüzü çerçeveye getirin

**Not**: HTTPS gereksinimi için ngrok veya benzeri tunnel servisleri kullanabilirsiniz.

## 🔧 Teknik Detaylar

### Kullanılan Teknolojiler

- **HTML5**: Modern semantik yapı
- **CSS3**: Flexbox, Grid, Animations, Media Queries
- **JavaScript (ES6+)**: Async/Await, Promises
- **Face-API.js**: TensorFlow.js tabanlı yüz analizi
  - TinyFaceDetector (hafif ve hızlı)
  - AgeGenderNet (yaş ve cinsiyet tahmini)
  - FaceLandmark68Net (yüz işaretleri)

### Stabilizasyon Algoritması

```javascript
// Son 5 tahminin ortalamasını alır
predictionHistory: {
    age: [],      // Yaş geçmişi
    gender: [],   // Cinsiyet geçmişi
    maxHistorySize: 5
}
```

- Yaş: 5 frame ortalaması alınır ve ±2 yaş aralığı gösterilir
- Cinsiyet: 5 frame'de en çok tekrarlanan seçilir
- Güncelleme Sıklığı: Saniyede 1 kez (titreşimi önler)

### Performans Optimizasyonları

- Video mirroring: Kullanıcı deneyimi için ayna efekti
- Canvas overlay: Hafif çizim katmanı
- Lazy detection: 1 saniyelik interval ile CPU tasarrufu
- Mobile-first approach: Touch-friendly, responsive

## 📁 Proje Yapısı

```
piro/
├── index.html          # Ana HTML dosyası
├── style.css           # Tüm stiller (responsive dahil)
├── app.js              # Ana JavaScript mantığı
└── README.md           # Bu dosya
```

## 🎯 Kullanım İpuçları

1. **İyi Aydınlatma**: Yüzünüzün net görünmesi için yeterli ışık sağlayın
2. **Sabit Duruş**: En iyi sonuç için yüzünüzü birkaç saniye çerçevede tutun
3. **Mesafe**: Kameradan 50-100cm uzaklık ideal
4. **Çerçeve İçinde Kalın**: Mavi çerçevenin ortasında konumlanın

## 🐛 Bilinen Sorunlar & Çözümler

### Kamera Açılmıyor
- Tarayıcı izinlerini kontrol edin
- HTTPS kullanıyor musunuz? (Bazı tarayıcılar gerektirir)
- Başka bir uygulama kamerayı kullanıyor olabilir

### Modeller Yüklenmiyor
- İnternet bağlantınızı kontrol edin
- AdBlock eklentilerini devre dışı bırakın
- Tarayıcı konsolunu kontrol edin (F12)

### Tahminler Stabilitesi
- Yüzünüzü 2-3 saniye sabit tutun
- Smoothing sistemi devreye girecektir

## 🔐 Gizlilik

- Tüm işlemler **tarayıcınızda** gerçekleşir
- Hiçbir görüntü veya veri sunucuya gönderilmez
- Face-API.js modelleri CDN'den yüklenir (sadece model dosyaları)

## 📄 Lisans

Bu proje MIT lisansı altında sunulmaktadır.

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır! Büyük değişiklikler için lütfen önce bir issue açarak ne değiştirmek istediğinizi tartışın.

## 📞 İletişim

Sorularınız veya geri bildirimleriniz için lütfen bir issue açın.

---

**Made with ❤️ and ☕**
