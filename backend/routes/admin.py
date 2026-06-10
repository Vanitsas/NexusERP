from fastapi import APIRouter, Depends
from database import get_conn
from security import require_admin

router = APIRouter()

@router.get("/admin/stats")
def admin_stats(user=Depends(require_admin)):
    conn = get_conn()
    cur = conn.cursor()

    # basic stats
    cur.execute("SELECT COUNT(*) FROM orders")
    total_orders = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM products")
    total_products = cur.fetchone()[0]

    cur.execute("SELECT COALESCE(SUM(total_price),0) FROM orders")
    total_revenue = cur.fetchone()[0]

    # chart data
    cur.execute("""
        SELECT 
            strftime('%m', created_at) as month,
            COUNT(*) as count,
            SUM(total_price) as revenue
        FROM orders
        GROUP BY month
        ORDER BY month
    """)

    chart = cur.fetchall()
    conn.close()

    return {
        "total_orders": total_orders,
        "total_products": total_products,
        "pending_revenue": total_revenue,
        "orders_over_time": [
            {"month": r[0], "count": r[1], "revenue": r[2]}
            for r in chart
        ]
    }