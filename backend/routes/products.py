from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database import get_conn
from security import get_current_user, require_admin

router = APIRouter()


# =========================
# MODEL
# =========================
class Product(BaseModel):
    name: str
    price: float
    stock: int = 0


# =========================
# GET PRODUCTS
# =========================
@router.get("/products")
def get_products(user=Depends(get_current_user)):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id, name, price, stock FROM products")
    rows = cur.fetchall()
    conn.close()

    return {
        "products": [
            {"id": r[0], "name": r[1], "price": r[2], "stock": r[3]}
            for r in rows
        ]
    }


# =========================
# CREATE PRODUCT (ADMIN)
# =========================
@router.post("/products")
def create_product(product: Product, user=Depends(require_admin)):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
        (product.name, product.price, product.stock)
    )

    conn.commit()
    conn.close()

    return {"message": "Product created"}


# =========================
# DELETE PRODUCT (ADMIN)
# =========================
@router.delete("/products/{product_id}")
def delete_product(product_id: int, user=Depends(require_admin)):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id FROM products WHERE id=?", (product_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Product not found")

    cur.execute("DELETE FROM products WHERE id=?", (product_id,))

    conn.commit()
    conn.close()

    return {"message": "Product deleted"}

# =========================
# UPDATE PRODUCT (ADMIN)
# =========================
class ProductUpdate(BaseModel):
    name: str
    price: float
    stock: int

@router.put("/products/{product_id}")
def update_product(product_id: int, product: ProductUpdate, user=Depends(require_admin)):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id FROM products WHERE id=?", (product_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Product not found")

    cur.execute(
        "UPDATE products SET name=?, price=?, stock=? WHERE id=?",
        (product.name, product.price, product.stock, product_id)
    )

    conn.commit()
    conn.close()

    return {"message": "Product updated"}