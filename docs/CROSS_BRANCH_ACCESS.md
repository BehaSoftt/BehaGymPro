# CROSS-BRANCH ACCESS (ŞUBELER ARASI ERİŞİM)

## Özellik Açıklaması

Aynı şirkete bağlı farklı şubelerdeki üyeler, herhangi bir şubede giriş yapabilir.

## Nasıl Çalışır?

### Senaryo
- **Şirket**: BehaGym Spor Merkezleri
- **Şubeler**: 
  - Kadıköy Şubesi
  - Beşiktaş Şubesi
  - Üsküdar Şubesi

- **Üye**: Ahmet Yılmaz (Kadıköy Şubesi'ne kayıtlı)
- **Durum**: Ahmet, Beşiktaş Şubesi'ne gidip giriş yapabilir

### Kontrol Mekanizması

1. **Şirket Kontrolü**
   - Üyenin `companyId` ile giriş yapılan şubenin `companyId` karşılaştırılır
   - Eşleşiyorsa giriş izni verilir
   - Eşleşmiyorsa "Farklı şirket - Erişim reddedildi" hatası

2. **Üyelik Durumu Kontrolü**
   - Üyelik aktif mi?
   - Üyelik süresi dolmuş mu?
   - Tüm standart kontroller yapılır

3. **Bilgilendirme**
   - Farklı şubede giriş yapıldığında ekranda gösterilir
   - Örnek: "HOŞ GELDİNİZ! (Kayıtlı Şube: Kadıköy)"

## Teknik Detaylar

### Backend (QRController.js)

```javascript
// Üyenin şirketi ile giriş yapılan şubenin şirketi aynı mı?
if (member.companyId !== requestBranch.companyId) {
    return res.status(403).json({ 
        status: 'DENIED', 
        message: 'Bu üye farklı bir şirkete kayıtlı.' 
    });
}

// Farklı şubede giriş yapıyorsa bilgilendirme
if (member.branchId !== branchId) {
    crossBranchMessage = ` (Kayıtlı Şube: ${memberBranch.name})`;
}
```

### AccessLog Kaydı

Her giriş/çıkış `AccessLog` tablosuna kaydedilir:
- `memberId`: Üye ID
- `branchId`: Giriş yapılan şube ID
- `status`: SUCCESS / DENIED
- `actionType`: ENTRY / EXIT
- `failureReason`: Reddedilme sebebi (varsa)

## Avantajlar

✅ **Esneklik**: Üyeler en yakın şubeyi kullanabilir
✅ **Müşteri Memnuniyeti**: Seyahat/taşınma durumlarında kesintisiz hizmet
✅ **Merkezi Yönetim**: Tüm şubeler tek şirket altında
✅ **Güvenlik**: Farklı şirketler arası erişim engellenir
✅ **İzlenebilirlik**: Hangi üye hangi şubede giriş yaptı takip edilir

## Gelecek Geliştirmeler

### Opsiyonel Kontroller (Branch.allowCrossBranchAccess)

```javascript
// Şube bazlı kontrol (gelecekte)
if (!requestBranch.allowCrossBranchAccess && member.branchId !== branchId) {
    return res.status(403).json({ 
        message: 'Bu şube şubeler arası erişime kapalı.' 
    });
}
```

### Raporlama

- Hangi üyeler hangi şubeleri kullanıyor?
- En çok cross-branch erişimi olan üyeler
- Şubeler arası üye trafiği analizi

## Test Senaryoları

1. **Aynı Şirket, Farklı Şube**: ✅ İzin verilir
2. **Farklı Şirket**: ❌ Reddedilir
3. **Kendi Şubesi**: ✅ Normal giriş
4. **Üyelik Süresi Dolmuş**: ❌ Hangi şubede olursa olsun reddedilir
5. **Pasif Üyelik**: ❌ Hangi şubede olursa olsun reddedilir

## Kullanım

Backend'i yeniden başlat, sistem otomatik çalışacak. Üyeler QR kod okuttuğunda cross-branch kontrolü otomatik yapılır.
