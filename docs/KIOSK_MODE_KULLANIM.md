# KIOSK MODE KULLANIM KILAVUZU

## Kiosk Mode Nedir?

Kiosk Mode, spor salonu giriş terminallerinin otomatik olarak açılıp çalışmasını sağlayan bir özelliktir. Bu özellik sayesinde:

- Terminal bilgisayarlar açıldığında otomatik giriş yapar
- Direkt olarak "Giriş Terminali" ekranına yönlendirilir
- Sunucu bağlantısı sürekli kontrol edilir
- Bağlantı kesilirse otomatik yeniden bağlanma dener

## Kurulum Adımları

### 1. Terminal Oluşturma (Ana Sunucu)

1. Ana sunucuda BehaGym Pro'ya giriş yapın
2. **Ayarlar** > **TERMİNAL TANIMLARI** sekmesine gidin
3. Yeni terminal formu doldurun:
   - **Terminal Adı**: Örn: "ANAKAPI", "Kiosk1", "T1"
   - **Şifre**: Terminal için güvenli bir şifre
   - **Kart ID** (opsiyonel): NFC kart kodu
   - **KIOSK MODU AKTİF**: ✓ İşaretleyin
   - **SERVER IP ADRESİ**: Ana sunucu IP (otomatik doldurulur)
   - **OTOMATİK GİRİŞ**: ✓ İşaretleyin

4. **TERMİNALİ SİSTEME EKLE** butonuna tıklayın
5. Otomatik olarak `[terminal-adi]-kiosk-config.json` dosyası indirilecektir

### 2. Kiosk Bilgisayara Kurulum

#### Yöntem 1: Config Dosyası ile (Önerilen)

1. İndirilen JSON config dosyasını kiosk bilgisayara kopyalayın
2. Kiosk bilgisayarda BehaGym Pro login ekranını açın
3. Sayfanın en altında "KIOSK CONFIG YÜKLE" linkine tıklayın
4. Config dosyasını seçin
5. Sistem otomatik olarak giriş yapacak ve terminali başlatacaktır

#### Yöntem 2: LocalStorage ile (Gelişmiş)

Tarayıcı konsolunda şu komutu çalıştırın:

```javascript
localStorage.setItem('kioskConfig', JSON.stringify({
  "kioskMode": true,
  "terminalUsername": "Terminal-T1",
  "terminalPassword": "123456",
  "serverIP": "192.168.1.101",
  "autoLogin": true
}));
```

Ardından sayfayı yenileyin.

## Config Dosyası Formatı

```json
{
  "kioskMode": true,
  "terminalUsername": "Terminal-ANAKAPI",
  "terminalPassword": "güvenli_şifre",
  "serverIP": "192.168.1.101",
  "autoLogin": true,
  "createdAt": "2024-02-23T10:30:00.000Z"
}
```

## Kiosk Mode Özellikleri

### Otomatik Giriş
- Sayfa yüklendiğinde config kontrol edilir
- Sunucu bağlantısı test edilir
- Başarılı olursa otomatik giriş yapılır
- Giriş Terminali ekranına yönlendirilir

### Bağlantı İzleme
- Sunucu erişilemezse hata gösterilir
- 5 saniye sonra otomatik yeniden deneme
- Bağlantı durumu ekranda gösterilir

### Görsel Göstergeler
- Kiosk mode aktifken tam ekran yükleme göstergesi
- Bağlantı durumu mesajları:
  - "BAĞLANTI KONTROL EDİLİYOR..."
  - "SUNUCUYA BAĞLANILIYOR..."
  - "GİRİŞ YAPILIYOR..."
  - "GİRİŞ BAŞARILI - YÖNLENDİRİLİYOR..."
  - "BAĞLANTI HATASI - YENİDEN DENENİYOR..."

## Güvenlik Notları

1. **Şifre Güvenliği**: Terminal şifreleri güçlü olmalıdır
2. **Ağ Güvenliği**: Kiosk bilgisayarlar güvenli ağda olmalıdır
3. **Fiziksel Güvenlik**: Config dosyaları yetkisiz erişime karşı korunmalıdır
4. **Tarayıcı Ayarları**: Kiosk modda tam ekran ve otomatik başlatma ayarlanmalıdır

## Sorun Giderme

### Kamera Çalışmıyor
- HTTPS veya localhost kullanın
- Chrome için: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
- IP adresini ekleyin: `http://192.168.1.101:5173`

### Otomatik Giriş Çalışmıyor
1. Config dosyasının doğru yüklendiğini kontrol edin
2. LocalStorage'ı kontrol edin: `localStorage.getItem('kioskConfig')`
3. Sunucu IP adresinin doğru olduğunu kontrol edin
4. Ağ bağlantısını test edin

### Sunucu Bağlantı Hatası
1. Ana sunucunun çalıştığından emin olun
2. IP adresinin doğru olduğunu kontrol edin
3. Firewall ayarlarını kontrol edin
4. Port 5000'in açık olduğunu kontrol edin

## Tarayıcı Tam Ekran Modu

Kiosk için tam ekran başlatma (Windows):

1. Chrome kısayolu oluşturun
2. Hedef kısmına ekleyin:
```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk "http://192.168.1.101:5173/login" --auto-open-devtools-for-tabs
```

## Otomatik Başlatma (Windows)

1. `shell:startup` klasörünü açın
2. Chrome kısayolunu buraya kopyalayın
3. Bilgisayar açıldığında otomatik başlayacaktır

## Destek

Sorunlar için sistem yöneticisine başvurun veya ana sunucu loglarını kontrol edin.
