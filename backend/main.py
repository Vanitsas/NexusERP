from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db

from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.orders import router as orders_router
from routes.admin import router as admin_router   # 👈 EKLENDİ
from routes.customers import router as customers_router

app = FastAPI(docs_url=None, redoc_url=None)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://nexuserp-app.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# startup
@app.on_event("startup")
def startup():
    init_db()

# routes
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(admin_router)   
app.include_router(customers_router)

@app.get("/")
def home():
    return {"status": "ERP API running 🚀"}