# SEED STRATEJİSİ - ÇOK ŞUBE SİSTEMİ

## Genel Yaklaşım

Sistemde iki tür veri var:

### 1. Global Veriler (İlk şubeye bağlı, tüm şubeler kullanabilir)
- **SportSpecialty** (Branşlar: Fitness, Yoga, Tekvando, vb.)
- **ExerciseCategory** (Alt Başlıklar: Göğüs, Sırt, Omuz, vb.)
- **Exercise** (Egzersizler: Bench Press, Squat, vb.)

**Neden Global?**
- Egzersiz tanımları standarttır
- Her şubede aynı egzersizleri tekrar tanımlamak gereksiz
- Merkezi yönetim kolaylığı

### 2. Şubeye Özel Veriler
- **Member** (Üyeler)
- **MembershipPackage** (Üyelik Paketleri)
- **TrainingPlan** (Antrenman Planları)
- **GroupClass** (Grup Dersleri)
- **Transaction** (Finansal İşlemler)
- **Attendance** (Yoklama Kayıtları)

**Neden Şubeye Özel?**
- Her şubenin kendi üyeleri var
- Finansal veriler şubeye özel olmalı
- Şubeler birbirinin verilerini görmemeli

## Seed Çalışma Sırası

```bash
# 1. Backend başlat
cd backend
npm run dev

# 2. Seed otomatik çalışır (app.js içinde)
# - seed.js: Super Master, BehaSoft şirketi ve şubesi
# - seedSpecialties.js: Branşlar, kategoriler, egzersizler
```

## Yeni Şube Ekleme Senaryosu

1. **Ayarlar > Şube Yönetimi** üzerinden yeni şube ekle
2. Yeni şube kullanıcısı login olur
3. Egzersizler zaten mevcut (global seed'den)
4. Şube kendi paketlerini/üyelerini/planlarını oluşturur

## Seed Dosyaları

### seed.js
- BehaSoft şirketi oluşturur
- BehaSoft Headquarters şubesi oluşturur
- Super Master kullanıcısı oluşturur
- `seedSpecialties()` çağırır

### seedSpecialties.js
- İlk şirket ve şubeyi bulur
- Tüm branşları bu şubeye bağlı olarak oluşturur
- Kategorileri ve egzersizleri oluşturur
- `branchId` ve `companyId` ekler

## Önemli Notlar

⚠️ **İlk Kurulum:**
- Seed sadece bir kez çalışır (findOrCreate kullanır)
- Mevcut veriler güncellenmez

⚠️ **Yeni Şube:**
- Egzersizler otomatik gelmez
- Şube admin'i kendi paketlerini oluşturmalı
- Veya global egzersizleri kullanabilir (branchId filtresi kaldırılırsa)

⚠️ **Alternatif Yaklaşım:**
- Egzersizleri tamamen global yapmak için `branchId` ve `companyId` NULL bırakılabilir
- Controller'larda `branchId` filtresi kaldırılır
- Tüm şubeler aynı egzersiz havuzunu kullanır

## Önerilen Yaklaşım

**Hibrit Model:**
1. Egzersizler global (branchId=NULL)
2. Paketler, üyeler, planlar şubeye özel
3. Her şube kendi paketlerini oluşturur ama egzersiz havuzu ortak

Bu yaklaşım için:
- Exercise, ExerciseCategory, SportSpecialty modellerinde `branchId` ve `companyId` NULL olabilir
- Controller'larda bu alanlar için filtreleme yapılmaz
- Diğer tüm modeller şubeye özel kalır
