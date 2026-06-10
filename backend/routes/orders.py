from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_conn
from security import get_current_user, require_admin

router = APIRouter()


# =========================
# MODEL
# =========================
class Order(BaseModel):
    customer_id: int
    product_id: int
    quantity: int


# =========================
# CREATE ORDER
# =========================
@router.post("/orders")
def create_order(order: Order, user=Depends(get_current_user)):
    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute("BEGIN EXCLUSIVE")

        cur.execute(
            "SELECT stock, price FROM products WHERE id=?",
            (order.product_id,)
        )
        product = cur.fetchone()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        stock, price = product

        if order.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0"
            )

        if stock < order.quantity:
            raise HTTPException(
                status_code=400,
                detail="Not enough stock"
            )

        total_price = price * order.quantity

        cur.execute(
            "UPDATE products SET stock = stock - ? WHERE id=?",
            (order.quantity, order.product_id)
        )

        cur.execute("""
            INSERT INTO orders (customer_id, product_id, quantity, total_price, status)
            VALUES (?, ?, ?, ?, 'pending')
        """, (
            order.customer_id,
            order.product_id,
            order.quantity,
            total_price
        ))

        conn.commit()

    except HTTPException:
        conn.rollback()
        raise

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Order creation failed")

    finally:
        conn.close()

    return {
        "message": "Order created",
        "total_price": total_price
    }


# =========================
# GET ALL ORDERS
# =========================
@router.get("/orders")
def get_orders(user=Depends(get_current_user)):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, customer_id, product_id, quantity, total_price, status
        FROM orders
        ORDER BY id DESC
    """)

    rows = cur.fetchall()
    conn.close()

    return {
        "orders": [
            {
                "id": r[0],
                "customer_id": r[1],
                "product_id": r[2],
                "quantity": r[3],
                "total": r[4],
                "status": r[5],
            }
            for r in rows
        ]
    }


# =========================
# COMPLETE ORDER (ADMIN)
# =========================
@router.put("/orders/{order_id}/complete")
def complete_order(order_id: int, user=Depends(require_admin)):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT status FROM orders WHERE id=?", (order_id,))
    order = cur.fetchone()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order[0] != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending orders can be completed"
        )

    cur.execute(
        "UPDATE orders SET status='completed' WHERE id=?",
        (order_id,)
    )

    conn.commit()
    conn.close()

    return {"message": "Order completed"}


# =========================
# CANCEL ORDER
# =========================
@router.put("/orders/{order_id}/cancel")
def cancel_order(order_id: int, user=Depends(get_current_user)):
    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute("BEGIN EXCLUSIVE")

        cur.execute("""
            SELECT product_id, quantity, status
            FROM orders
            WHERE id=?
        """, (order_id,))

        order = cur.fetchone()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        product_id, quantity, status = order

        if status != "pending":
            raise HTTPException(
                status_code=400,
                detail="Only pending orders can be cancelled"
            )

        cur.execute(
            "UPDATE products SET stock = stock + ? WHERE id=?",
            (quantity, product_id)
        )

        cur.execute(
            "UPDATE orders SET status='cancelled' WHERE id=?",
            (order_id,)
        )

        conn.commit()

    except HTTPException:
        conn.rollback()
        raise

    except Exception:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Cancel failed")

    finally:
        conn.close()

    return {
        "message": "Order cancelled + stock restored"
    }