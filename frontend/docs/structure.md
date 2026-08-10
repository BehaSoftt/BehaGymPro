# BehaGym Frontend Mimari Yapısı

Bu doküman, Mart 2026 itibarıyla geçilen yeni servis tabanlı (Service-Oriented) ve modüler bileşen yapısını açıklar.

## 1. Klasör Yapısı

- `src/services/`: API isteklerinin merkezi yönetildiği katman. Her modül (Member, Dashboard, Training vb.) için ayrı bir servis dosyası bulunur.
- `src/components/base/`: Proje genelinde kullanılan temel UI bileşenleri (Button, Modal, StatCard vb.).
- `src/components/member/`: Üye portalına özel parçalanmış UI bileşenleri.
- `src/store/`: Pinia state yönetim dosyaları. Artık ham `axios` yerine `src/services` altındaki servisleri kullanır.
- `scripts/`: Geliştirme sürecinde kullanılan yardımcı scriptler.
- `docs/`: Proje dokümantasyonu.

## 2. Service Layer (Servis Katmanı)

API istekleri artık doğrudan sayfalarda (views) veya storelarda yapılmaz. `src/utils/api.js` dosyasındaki `apiClient` (Axios instance) kullanılarak servislerde tanımlanır.

Örnek kullanım:
```javascript
import { dashboardService } from '../services/dashboardService'
const data = await dashboardService.getMemberDashboard()
```

## 3. Bileşen Parçalama (Component Splitting)

Büyük sayfa dosyaları (örn: `MemberDashboard.vue`), okunabilirlik ve bakım kolaylığı için küçük bileşenlere bölünmüştür.
- `MemberQuickStats.vue`: Üstteki özet kartlar.
- `MemberTrainingPackages.vue`: Paket ve antrenman listesi.
- `TrainingPlanModal.vue`: Antrenman detay modalı.

## 4. Avantajlar

1. **Bakım Kolaylığı**: API URL veya yapısı değiştiğinde sadece ilgili servis dosyasını güncellemek yeterlidir.
2. **Performans**: Daha küçük bileşenler sayesinde Vue.js sadece değişen kısımları render eder.
3. **Okunabilirlik**: 1600 satırlık dosyalar 300 satıra indirilmiştir.
