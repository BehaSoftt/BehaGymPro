const { SportSpecialty, ExerciseCategory, Exercise } = require('../models');

const seedSportSpecialties = async (branchId = null, companyId = null) => {
    try {
        console.log('--- BehaGym Pro: Branş, Alt Başlık ve İstasyon (Global Identity Seed) Başlıyor... ---');

        const specialtiesData = [
            {
                name: 'Fitness',
                description: 'Ağırlık ve direnç antrenmanları odaklı genel spor branşı.',
                categories: [
                    {
                        name: 'Göğüs',
                        exercises: [
                            { name: 'Bench Press', criterion: 'SETS_REPS', c: 12 },
                            { name: 'Incline Bench Press', criterion: 'SETS_REPS', c: 10 },
                            { name: 'Dumbbell Fly', criterion: 'SETS_REPS', c: 8 },
                            { name: 'Cable Crossover', criterion: 'SETS_REPS', c: 15 }
                        ]
                    },
                    {
                        name: 'Sırt',
                        exercises: [
                            { name: 'Lat Pulldown', criterion: 'SETS_REPS', c: 12 },
                            { name: 'Seated Row', criterion: 'SETS_REPS', c: 12 },
                            { name: 'Deadlift', criterion: 'SETS_REPS', c: 15 },
                            { name: 'T-Bar Row', criterion: 'SETS_REPS', c: 12 }
                        ]
                    },
                    {
                        name: 'Omuz',
                        exercises: [
                            { name: 'Shoulder Press', criterion: 'SETS_REPS', c: 12 },
                            { name: 'Lateral Raise', criterion: 'SETS_REPS', c: 8 },
                            { name: 'Front Raise', criterion: 'SETS_REPS', c: 8 }
                        ]
                    },
                    {
                        name: 'Bacak',
                        exercises: [
                            { name: 'Squat', criterion: 'SETS_REPS', c: 18 },
                            { name: 'Leg Press', criterion: 'SETS_REPS', c: 20 },
                            { name: 'Leg Extension', criterion: 'SETS_REPS', c: 12 },
                            { name: 'Leg Curl', criterion: 'SETS_REPS', c: 12 }
                        ]
                    },
                    {
                        name: 'Kol',
                        exercises: [
                            { name: 'Biceps Curl', criterion: 'SETS_REPS', c: 8 },
                            { name: 'Triceps Extension', criterion: 'SETS_REPS', c: 10 },
                            { name: 'Hammer Curl', criterion: 'SETS_REPS', c: 8 }
                        ]
                    },
                    {
                        name: 'Karın',
                        exercises: [
                            { name: 'Crunch', criterion: 'REPS_ONLY', c: 5 },
                            { name: 'Leg Raise', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Plank', criterion: 'DURATION', c: 15 }
                        ]
                    },
                ]
            },
            {
                name: 'Yoga',
                description: 'Zihin ve beden bütünlüğü için esneme ve nefes egzersizleri.',
                categories: [
                    {
                        name: 'Vinyasa',
                        exercises: [
                            { name: 'Sun Salutation (Suryanamaskar)', criterion: 'DURATION', c: 15 },
                            { name: 'Warrior I', criterion: 'DURATION', c: 10 },
                            { name: 'Warrior II', criterion: 'DURATION', c: 10 }
                        ]
                    },
                    {
                        name: 'Hatha',
                        exercises: [
                            { name: 'Mountain Pose (Tadasana)', criterion: 'DURATION', c: 5 },
                            { name: 'Tree Pose (Vrksasana)', criterion: 'DURATION', c: 8 },
                            { name: 'Bridge Pose', criterion: 'DURATION', c: 8 }
                        ]
                    },
                ]
            },
            {
                name: 'Tekvando',
                description: 'Geleneksel Kore dövüş sanatı ve olimpik spor dalı.',
                hasBelts: true,
                belts: ['Beyaz', 'Sarı', 'Yeşil', 'Mavi', 'Kırmızı', 'Siyah', '1. Dan', '2. Dan', '3. Dan'],
                categories: [
                    {
                        name: 'Temel Teknik',
                        exercises: [
                            { name: 'Ap Chagi (Ön Tekme)', criterion: 'REPS_ONLY', c: 5 },
                            { name: 'Dolyo Chagi (Döner Tekme)', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Yop Chagi (Yan Tekme)', criterion: 'REPS_ONLY', c: 8 }
                        ]
                    },
                    {
                        name: 'Poomsae (Form)',
                        exercises: [
                            { name: 'Taegeuk Il Jang', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Taegeuk Ee Jang', criterion: 'REPS_ONLY', c: 10 }
                        ]
                    },
                    {
                        name: 'Kyorugi (Müsabaka)',
                        exercises: [
                            { name: 'Adım Çalışması', criterion: 'DURATION', c: 15 },
                            { name: 'Müsabaka Kombinasyonları', criterion: 'ROUNDS_DURATION', c: 20 }
                        ]
                    }
                ]
            },
            {
                name: 'Plates',
                description: 'Vücut farkındalığı, esneklik ve merkez bölge kontrolü için kontrollü hareketler.',
                categories: [
                    {
                        name: 'REFORMER',
                        exercises: [
                            { name: 'Hundred', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Leg Circles', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Elephant', criterion: 'SETS_REPS', c: 12 },
                            { name: 'Chest Expansion', criterion: 'SETS_REPS', c: 10 }
                        ]
                    },
                    {
                        name: 'BAŞLANGIÇ SEVİYE',
                        exercises: [
                            { name: 'Pelvic Tilt', criterion: 'DURATION', c: 5 },
                            { name: 'Chest Lift', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Leg Fold', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Single Leg Stretch', criterion: 'REPS_ONLY', c: 12 }
                        ]
                    },
                    {
                        name: 'MAT PILATES',
                        exercises: [
                            { name: 'Roll Up', criterion: 'REPS_ONLY', c: 15 },
                            { name: 'Single Leg Circle', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Rolling Like a Ball', criterion: 'REPS_ONLY', c: 12 },
                            { name: 'Scissors', criterion: 'DURATION', c: 10 }
                        ]
                    }
                ]
            },
            {
                name: 'Box',
                description: 'Kondisyon, koordinasyon ve savunma teknikleri odaklı antrenman.',
                categories: [
                    {
                        name: 'TORBA ÇALIŞMASI',
                        exercises: [
                            { name: 'Sol Direk', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Sağ Direk', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Kroşe', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Uppercut', criterion: 'REPS_ONLY', c: 10 }
                        ]
                    },
                    {
                        name: 'LAPA (PAD) ÇALIŞMASI',
                        exercises: [
                            { name: '1-2 Kombinasyonu', criterion: 'ROUNDS_DURATION', c: 25 },
                            { name: 'Kaçış ve Kontra', criterion: 'DURATION', c: 15 },
                            { name: 'Savunma Blokları', criterion: 'REPS_ONLY', c: 5 }
                        ]
                    },
                    {
                        name: 'TEKNİK DRİLLER',
                        exercises: [
                            { name: 'Gölge Boksu', criterion: 'DURATION', c: 20 },
                            { name: 'Ayak Oyunları', criterion: 'DURATION', c: 15 },
                            { name: 'İp Atlama', criterion: 'DURATION', c: 25 }
                        ]
                    }
                ]
            },
            {
                name: 'Zumba',
                description: 'Eğlence ve dansı fitness ile birleştiren yüksek tempolu antrenman.',
                categories: [
                    {
                        name: 'AQUA ZUMBA',
                        exercises: [
                            { name: 'Su İçi Isınma', criterion: 'DURATION', c: 12 },
                            { name: 'Yan Adım', criterion: 'DURATION', c: 10 },
                            { name: 'Kalp Ritmi Yükseltme', criterion: 'DURATION', c: 18 }
                        ]
                    },
                    {
                        name: 'ZUMBA TONING',
                        exercises: [
                            { name: 'Merengue (Light Weight)', criterion: 'DURATION', c: 15 },
                            { name: 'Salsa Steps', criterion: 'DURATION', c: 12 },
                            { name: 'Cumbia', criterion: 'DURATION', c: 12 }
                        ]
                    },
                    {
                        name: 'ZUMBA KIDS',
                        exercises: [
                            { name: 'Oyunla Dans', criterion: 'DURATION', c: 8 },
                            { name: 'Hayvan Taklitleri', criterion: 'DURATION', c: 6 },
                            { name: 'Koordinasyon', criterion: 'DURATION', c: 10 }
                        ]
                    },
                    {
                        name: 'ZUMBA FITNESS',
                        exercises: [
                            { name: 'Beto Shuffle', criterion: 'DURATION', c: 20 },
                            { name: 'Reggaeton', criterion: 'DURATION', c: 22 },
                            { name: 'Isınma Dansı', criterion: 'DURATION', c: 10 }
                        ]
                    }
                ]
            },
            {
                name: 'Jimnastik',
                description: 'Esneklik, denge, güç ve koordinasyon geliştiren artistik spor dalı.',
                categories: [
                    {
                        name: 'ARTISTIK JIMNASTIK',
                        exercises: [
                            { name: 'Takla (Forward Roll)', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'El Üstü Duruş (Handstand)', criterion: 'DURATION', c: 12 },
                            { name: 'Köprü (Bridge)', criterion: 'DURATION', c: 10 },
                            { name: 'Cartwheel', criterion: 'REPS_ONLY', c: 10 }
                        ]
                    },
                    {
                        name: 'RİTMİK JİMNASTİK',
                        exercises: [
                            { name: 'Top Çalışması', criterion: 'DURATION', c: 15 },
                            { name: 'Kurdele Çalışması', criterion: 'DURATION', c: 15 },
                            { name: 'Çember Çalışması', criterion: 'DURATION', c: 12 },
                            { name: 'İp Atlama (Ritmik)', criterion: 'DURATION', c: 18 }
                        ]
                    },
                    {
                        name: 'TEMEL ESNEKLİK',
                        exercises: [
                            { name: 'Split (Yan Açma)', criterion: 'DURATION', c: 8 },
                            { name: 'Straddle Split', criterion: 'DURATION', c: 8 },
                            { name: 'Sırt Esneme', criterion: 'DURATION', c: 10 },
                            { name: 'Omuz Esneme', criterion: 'DURATION', c: 8 }
                        ]
                    },
                    {
                        name: 'DENGE VE KOORDİNASYON',
                        exercises: [
                            { name: 'Tek Ayak Dengesi', criterion: 'DURATION', c: 6 },
                            { name: 'Denge Tahtası', criterion: 'DURATION', c: 12 },
                            { name: 'Parmak Ucu Yürüyüşü', criterion: 'DURATION', c: 10 },
                            { name: 'Dönüş Çalışması', criterion: 'REPS_ONLY', c: 8 }
                        ]
                    }
                ]
            },
            {
                name: 'Karate',
                description: 'Geleneksel Japon dövüş sanatı, disiplin ve öz savunma odaklı antrenman.',
                hasBelts: true,
                belts: [
                    'Beyaz (Başlangıç)',
                    'Beyaz-Sarı (Ara)',
                    'Sarı (8. Kyu)',
                    'Sarı-Turuncu (Ara)',
                    'Turuncu (7. Kyu)',
                    'Turuncu-Yeşil (Ara)',
                    'Yeşil (6. Kyu)',
                    'Yeşil-Mavi (Ara)',
                    'Mavi (5. Kyu)',
                    'Mavi-Mor (Ara)',
                    'Mor (4. Kyu)',
                    'Kahverengi (3. Kyu)',
                    'Kahverengi (2. Kyu)',
                    'Kahverengi (1. Kyu)',
                    'Siyah (1. Dan)',
                    'Siyah (2. Dan)',
                    'Siyah (3. Dan)'
                ],
                categories: [
                    {
                        name: 'TEMEL TEKNİKLER (KIHON)',
                        exercises: [
                            { name: 'Oi-Zuki (İleri Yumruk)', criterion: 'REPS_ONLY', c: 5 },
                            { name: 'Gyaku-Zuki (Ters Yumruk)', criterion: 'REPS_ONLY', c: 5 },
                            { name: 'Age-Uke (Yukarı Blok)', criterion: 'REPS_ONLY', c: 5 },
                            { name: 'Soto-Uke (Dışarı Blok)', criterion: 'REPS_ONLY', c: 5 },
                            { name: 'Gedan-Barai (Aşağı Savunma)', criterion: 'REPS_ONLY', c: 5 },
                            { name: 'Mae-Geri (Ön Tekme)', criterion: 'REPS_ONLY', c: 6 },
                            { name: 'Mawashi-Geri (Döner Tekme)', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Yoko-Geri (Yan Tekme)', criterion: 'REPS_ONLY', c: 8 }
                        ]
                    },
                    {
                        name: 'KATA (FORMLAR)',
                        exercises: [
                            { name: 'Heian Shodan', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Heian Nidan', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Heian Sandan', criterion: 'REPS_ONLY', c: 12 },
                            { name: 'Heian Yondan', criterion: 'REPS_ONLY', c: 12 },
                            { name: 'Heian Godan', criterion: 'REPS_ONLY', c: 12 },
                            { name: 'Tekki Shodan', criterion: 'REPS_ONLY', c: 15 },
                            { name: 'Bassai Dai', criterion: 'REPS_ONLY', c: 18 },
                            { name: 'Kanku Dai', criterion: 'REPS_ONLY', c: 20 }
                        ]
                    },
                    {
                        name: 'KUMITE (DÖVÜŞ)',
                        exercises: [
                            { name: 'Gohon Kumite (5 Adım Dövüş)', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Sanbon Kumite (3 Adım Dövüş)', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Ippon Kumite (1 Adım Dövüş)', criterion: 'REPS_ONLY', c: 12 },
                            { name: 'Jiyu Kumite (Serbest Dövüş)', criterion: 'ROUNDS_DURATION', c: 25 },
                            { name: 'Adım ve Mesafe Çalışması', criterion: 'DURATION', c: 15 },
                            { name: 'Kontra Atak Drilleri', criterion: 'REPS_ONLY', c: 10 }
                        ]
                    },
                    {
                        name: 'KONDİSYON VE GÜÇLENDIRME',
                        exercises: [
                            { name: 'Şınav (Knuckle Push-ups)', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Mekik (Sit-ups)', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Squat', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Burpee', criterion: 'REPS_ONLY', c: 12 },
                            { name: 'Plank', criterion: 'DURATION', c: 10 },
                            { name: 'Yüksek Tekme Çalışması', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Hız ve Refleks Drilleri', criterion: 'DURATION', c: 15 }
                        ]
                    },
                    {
                        name: 'ESNEKLİK VE ISINMA',
                        exercises: [
                            { name: 'Dinamik Esneme', criterion: 'DURATION', c: 10 },
                            { name: 'Split Çalışması', criterion: 'DURATION', c: 8 },
                            { name: 'Bacak Esneme', criterion: 'DURATION', c: 8 },
                            { name: 'Omuz ve Kol Esneme', criterion: 'DURATION', c: 5 },
                            { name: 'Bel ve Sırt Esneme', criterion: 'DURATION', c: 8 },
                            { name: 'Koşu ve Isınma', criterion: 'DURATION', c: 12 }
                        ]
                    }
                ]
            },
            {
                name: 'Kickbox',
                description: 'Yumruk, tekme, diz ve süpürme tekniklerini içeren dövüş sporu.',
                hasBelts: true,
                belts: ['Beyaz', 'Sarı', 'Yeşil', 'Mavi', 'Kırmızı', 'Kahverengi', 'Siyah', '1. Dan', '2. Dan', '3. Dan'],
                categories: [
                    {
                        name: 'TEMEL TEKNİKLER',
                        exercises: [
                            { name: 'Sol Direk (Jab)', criterion: 'REPS_ONLY', c: 5 },
                            { name: 'Sağ Direk (Cross)', criterion: 'REPS_ONLY', c: 5 },
                            { name: 'Sol Kroşe (Left Hook)', criterion: 'REPS_ONLY', c: 6 },
                            { name: 'Sağ Kroşe (Right Hook)', criterion: 'REPS_ONLY', c: 6 },
                            { name: 'Sol Uppercut', criterion: 'REPS_ONLY', c: 6 },
                            { name: 'Sağ Uppercut', criterion: 'REPS_ONLY', c: 6 },
                            { name: 'Low Kick (Alt Seviye Tekme)', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Middle Kick (Orta Seviye)', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'High Kick (Üst Seviye)', criterion: 'REPS_ONLY', c: 10 }
                        ]
                    },
                    {
                        name: 'TORBA ÇALIŞMASI',
                        exercises: [
                            { name: 'Hız ve Güç Drilleri', criterion: 'DURATION', c: 15 },
                            { name: 'Serbest Kombinasyonlar', criterion: 'ROUNDS_DURATION', c: 20 },
                            { name: 'Savunma ve Kontra', criterion: 'DURATION', c: 12 }
                        ]
                    },
                    {
                        name: 'LAPA (PAD) ÇALIŞMASI',
                        exercises: [
                            { name: 'Antrenörle Teknik Çalışma', criterion: 'DURATION', c: 25 },
                            { name: 'Kombinasyon Akışları', criterion: 'ROUNDS_DURATION', c: 30 },
                            { name: 'Refleks ve Karşılama', criterion: 'DURATION', c: 15 }
                        ]
                    }
                ]
            },
            {
                name: 'Muay Thai',
                description: 'Sekiz Uzuv Sanatı olarak bilinen, diz ve dirsek kullanımının yoğun olduğu Tayland dövüş sanatı.',
                hasBelts: true,
                belts: ['Beyaz (Level 1)', 'Sarı (Level 2)', 'Yeşil (Level 3)', 'Mavi (Level 4)', 'Kırmızı (Level 5)', 'Mor (Level 6)', 'Kahverengi (Level 7)', 'Siyah (Level 8)'],
                categories: [
                    {
                        name: 'TEMEL DURUŞ VE ADIM',
                        exercises: [
                            { name: 'Muay Thai Duruşu', criterion: 'DURATION', c: 5 },
                            { name: 'İleri-Geri-Yan Adımlama', criterion: 'DURATION', c: 8 },
                            { name: 'Gard Koruma ve Blok', criterion: 'DURATION', c: 10 }
                        ]
                    },
                    {
                        name: 'DİZ VE DİRSEK TEKNİKLERİ',
                        exercises: [
                            { name: 'Khao (Diz Vuruşu)', criterion: 'REPS_ONLY', c: 12 },
                            { name: 'Sok (Dirsek Vuruşu)', criterion: 'REPS_ONLY', c: 15 },
                            { name: 'Clinch (Boyun Yakalama)', criterion: 'DURATION', c: 20 }
                        ]
                    },
                    {
                        name: 'TEKME TEKNİKLERİ',
                        exercises: [
                            { name: 'Teep (Push Kick)', criterion: 'REPS_ONLY', c: 8 },
                            { name: 'Roundhouse Kick', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Low Kick (Kaval Kemikli)', criterion: 'REPS_ONLY', c: 12 }
                        ]
                    }
                ]
            },
            {
                name: 'Judo',
                description: 'Yumuşaklık yolu anlamına gelen, fırlatma ve yerde tutma teknikleri odaklı Japon dövüş sanatı.',
                hasBelts: true,
                belts: ['Beyaz', 'Sarı', 'Turuncu', 'Yeşil', 'Mavi', 'Kahverengi', 'Siyah (1. Dan)', 'Siyah (2. Dan)', 'Siyah (3. Dan)'],
                categories: [
                    {
                        name: 'SELAMLAMA VE DURUŞ',
                        exercises: [
                            { name: 'Ritsurei (Selam)', criterion: 'REPS_ONLY', c: 1 },
                            { name: 'Shizentai (Temel Duruş)', criterion: 'DURATION', c: 5 }
                        ]
                    },
                    {
                        name: 'FIRLATMA TEKNİKLERI',
                        exercises: [
                            { name: 'O-Goshi (Kalça Atışı)', criterion: 'REPS_ONLY', c: 10 },
                            { name: 'Seoi-Nage', criterion: 'REPS_ONLY', c: 10 }
                        ]
                    }
                ]
            },
            {
                name: 'Futbol',
                facilityType: 'SAHA',
                description: 'Dünyanın en popüler takım sporu; koordinasyon, dayanıklılık ve strateji odaklı ana branş.',
                categories: [
                    {
                        name: 'ISINMA VE MOBİLİTE',
                        exercises: [
                            { name: 'Dinamik Esneme', criterion: 'DURATION', c: 10 },
                            { name: 'Topla Isınma (Rondo/5e2)', criterion: 'DURATION', c: 15 },
                            { name: 'Mobilizasyon Drilleri', criterion: 'DURATION', c: 8 }
                        ]
                    },
                    {
                        name: 'TEKNİK ÇALIŞMALAR',
                        exercises: [
                            { name: 'Kısa Pas İstasyonu', criterion: 'REPS_ONLY', c: 20 },
                            { name: 'Dribbling ve Slalom', criterion: 'SETS_REPS', c: 12 },
                            { name: 'Şut ve Bitiricilik', criterion: 'REPS_ONLY', c: 15 },
                            { name: 'Top Kontrolü (Duvar Pası)', criterion: 'REPS_ONLY', c: 25 }
                        ]
                    },
                    {
                        name: 'TAKTİK VE POZİSYONAL',
                        exercises: [
                            { name: 'Alan Savunma Pratiği', criterion: 'DURATION', c: 20 },
                            { name: 'Hücum Organizasyonları', criterion: 'DURATION', c: 25 },
                            { name: 'Geçiş Hücumu Drilleri', criterion: 'DURATION', c: 15 }
                        ]
                    }
                ]
            }
        ];

        for (const s of specialtiesData) {
            const [specialty, created] = await SportSpecialty.findOrCreate({
                where: { name: s.name },
                defaults: {
                    description: s.description,
                    belts: s.belts || [],
                    hasBelts: s.hasBelts || false
                }
            });

            if (!created) {
                await specialty.update({
                    description: s.description,
                    facilityType: s.facilityType || specialty.facilityType,
                    belts: s.belts || specialty.belts,
                    hasBelts: s.hasBelts !== undefined ? s.hasBelts : specialty.hasBelts
                });
            }

            if (created) console.log(`Branş Tanımlandı: [${s.name}]`);

            // Seed Categories & Exercises
            for (const cat of s.categories) {
                const [category, catCreated] = await ExerciseCategory.findOrCreate({
                    where: {
                        name: cat.name.trim(),
                        specialtyId: specialty.id
                    }
                });

                if (cat.exercises) {
                    for (const ex of cat.exercises) {
                        await Exercise.findOrCreate({
                            where: {
                                name: ex.name.trim(),
                                categoryId: category.id,
                                specialtyId: specialty.id
                            },
                            defaults: {
                                criterionType: ex.criterion,
                                caloriesPerMinute: ex.c || 10,
                                description: `${s.name} - ${cat.name} egzersizi.`
                            }
                        });
                    }
                }
            }

            // Seed Formations for Football
            if (s.name === 'Futbol' && branchId && companyId) {
                const { SportFormation } = require('../models');
                const defaultFormations = [
                    { name: '4-4-2 KLASİK', layout: [{ x: 10, y: 50 }, { x: 25, y: 20 }, { x: 25, y: 40 }, { x: 25, y: 60 }, { x: 25, y: 80 }, { x: 50, y: 20 }, { x: 50, y: 40 }, { x: 50, y: 60 }, { x: 50, y: 80 }, { x: 80, y: 40 }, { x: 80, y: 60 }] },
                    { name: '4-3-3 MODERN', layout: [{ x: 10, y: 50 }, { x: 25, y: 20 }, { x: 25, y: 40 }, { x: 25, y: 60 }, { x: 25, y: 80 }, { x: 45, y: 30 }, { x: 45, y: 50 }, { x: 45, y: 70 }, { x: 75, y: 20 }, { x: 75, y: 50 }, { x: 75, y: 80 }] },
                    { name: '5-4-1 DEFANSİF', layout: [{ x: 10, y: 50 }, { x: 25, y: 15 }, { x: 25, y: 32 }, { x: 25, y: 50 }, { x: 25, y: 68 }, { x: 25, y: 85 }, { x: 50, y: 25 }, { x: 50, y: 42 }, { x: 50, y: 58 }, { x: 50, y: 75 }, { x: 80, y: 50 }] }
                ];

                for (const form of defaultFormations) {
                    await SportFormation.findOrCreate({
                        where: {
                            name: form.name,
                            sportSpecialtyId: specialty.id,
                            branchId,
                            companyId
                        },
                        defaults: {
                            layout: form.layout,
                            isActive: true
                        }
                    });
                }
            }
        }

        console.log('--- BehaGym Pro: Global Identity Seed Başarıyla Tamamlandı ---');
    } catch (err) {
        console.error('Identity Seed Hatası:', err);
    }
};

module.exports = seedSportSpecialties;
