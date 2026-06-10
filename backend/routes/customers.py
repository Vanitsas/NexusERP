from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database import get_conn
from security import get_current_user, require_admin

router = APIRouter()


# =========================
# MODEL
# =========================
class Customer(BaseModel):
    name: str
    country: str = ""


# =========================
# GET CUSTOMERS
# =========================
@router.get("/customers")
def get_customers(user=Depends(get_current_user)):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id, name, country FROM customers")
    rows = cur.fetchall()
    conn.close()

    return {
        "customers": [
            {"id": r[0], "name": r[1], "country": r[2]}
            for r in rows
        ]
    }


# =========================
# CREATE CUSTOMER
# =========================
@router.post("/customers")
def create_customer(customer: Customer, user=Depends(get_current_user)):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO customers (name, country) VALUES (?, ?)",
        (customer.name, customer.country)
    )

    conn.commit()
    conn.close()

    return {"message": "Customer created"}


# =========================
# DELETE CUSTOMER (ADMIN)
# =========================
@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, user=Depends(require_admin)):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id FROM customers WHERE id=?", (customer_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Customer not found")

    cur.execute("DELETE FROM customers WHERE id=?", (customer_id,))

    conn.commit()
    conn.close()

    return {"message": "Customer deleted"}