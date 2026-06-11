# NexusERP

FastAPI ve React ile geliştirilmiş tam kapsamlı bir Kurumsal Kaynak Planlama (ERP) sistemi. NexusERP; ürün yönetimi, sipariş işleme, müşteri yönetimi ve analitik dashboard ile eksiksiz bir iş yönetimi çözümü sunar.

## 🚀 Canlı Demo
- Frontend: [nexuserp-app.netlify.app](https://nexuserp-app.netlify.app)
- Backend API: [nexuserp-production-eebb.up.railway.app](https://nexuserp-production-eebb.up.railway.app)

## ✨ Özellikler

### 🔐 Kimlik Doğrulama ve Güvenlik
- JWT tabanlı kimlik doğrulama
- Rol bazlı erişim kontrolü (Admin / Kullanıcı)
- bcrypt şifre hashleme
- Token süresi dolunca otomatik çıkış

### 📦 Ürün Yönetimi
- Ürün listeleme, ekleme, güncelleme ve silme
- Gerçek zamanlı stok takibi
- Arama ve filtreleme
- Sayfalama (Pagination)

### 🛒 Sipariş Yönetimi
- Müşteri ve ürün seçimi ile sipariş oluşturma
- Stok doğrulama ve otomatik stok düşümü
- Sipariş durumu takibi (beklemede → tamamlandı / iptal)
- Race condition önleme için veritabanı transaction desteği
- İptal ile otomatik stok iadesi

### 👥 Müşteri Yönetimi
- Müşteri listeleme, ekleme ve silme
- Müşteri ülke bilgisi

### 📊 Analitik Dashboard
- Toplam sipariş, ürün ve gelir özeti
- Zaman içinde sipariş grafiği
- Gelir trendi grafiği

### 📄 Dışa Aktarma ve Raporlar
- Siparişleri CSV olarak dışa aktar
- Siparişleri Excel (.xlsx) olarak dışa aktar
- Tamamlanan siparişler için PDF fatura oluşturma

### 📱 Arayüz ve Kullanıcı Deneyimi
- Mobil hamburger menü ile responsive tasarım
- Koyu tema
- Toast bildirimleri
- Yükleme iskeletleri
- React Query ile optimistik UI güncellemeleri

## 🛠️ Teknoloji Yığını

### Backend
| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| FastAPI | REST API framework |
| SQLite | Veritabanı |
| JWT (python-jose) | Kimlik doğrulama |
| bcrypt | Şifre hashleme |
| python-dotenv | Ortam değişkenleri |
| Uvicorn | ASGI sunucusu |

### Frontend
| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| React 18 | UI framework |
| Vite | Build aracı |
| React Query | Sunucu durum yönetimi |
| Axios | HTTP istemcisi |
| Tailwind CSS | Stillendirme |
| Recharts | Grafikler |
| jsPDF | PDF oluşturma |
| SheetJS (xlsx) | Excel dışa aktarma |

## 📁 Proje Yapısı

```
NexusERP/
├── backend/
│   ├── routes/
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── orders.py
│   │   ├── customers.py
│   │   └── admin.py
│   ├── auth.py
│   ├── database.py
│   ├── security.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── features/
│       │   ├── dashboard/
│       │   ├── products/
│       │   ├── orders/
│       │   ├── customers/
│       │   └── stats/
│       ├── layouts/
│       └── pages/
└── README.md
```

## ⚙️ Kurulum

### Gereksinimler
- Python 3.10+
- Node.js 18+

### Backend Kurulumu
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
```

### Ortam Değişkenleri

**backend/.env**
```
SECRET_KEY=gizli_anahtar_buraya
DB_NAME=erp.db
```

**frontend/.env**
```
VITE_API_URL=http://localhost:8000
```

## 👤 Varsayılan Kullanıcılar

| Kullanıcı Adı | Şifre | Rol |
|---------------|-------|-----|
| admin | admin123 | Admin |
| demo | 1234 | Kullanıcı |

## 📸 Ekran Görüntüleri
![Dashboard](screenshots/dashboard.png)
![Ürünler](screenshots/products.png)
![Siparişler](screenshots/orders.png)
![Müşteriler](screenshots/customers.png)
![Analitik](screenshots/analytics.png)
![Giriş](screenshots/login.png)

## 📝 Lisans
MIT
