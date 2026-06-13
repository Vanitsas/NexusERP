import sqlite3
import bcrypt
from dotenv import load_dotenv
import os

load_dotenv()

DB_NAME = os.getenv("DB_NAME", "erp.db")


# =======================
# CONNECTION
# =======================
def get_conn():
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


# =======================
# PASSWORD HASH
# =======================
def hash_password(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str):
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# =======================
# INIT DATABASE
# =======================
def init_db():
    conn = get_conn()
    cur = conn.cursor()

    # =======================
    # USERS
    # =======================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
    )
    """)

    # default users
    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] == 0:
        cur.executemany("""
        INSERT INTO users (username, password, role)
        VALUES (?, ?, ?)
        """, [
            ("admin", hash_password(os.getenv("ADMIN_PASSWORD", "changeme")), "admin"),
            ("demo", hash_password(os.getenv("DEMO_PASSWORD", "changeme")), "user")
        ])

    # =======================
    # CUSTOMERS
    # =======================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        country TEXT
    )
    """)

    # =======================
    # PRODUCTS
    # =======================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 10
    )
    """)

    # =======================
    # ORDERS
    # =======================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        total_price REAL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # =======================
    # PAYMENTS
    # =======================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        amount REAL,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()


# =======================
# LOGIN CHECK
# =======================
def check_login(username, password):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT password, role
        FROM users
        WHERE username = ?
    """, (username,))

    row = cur.fetchone()
    conn.close()

    if not row:
        return None

    db_password, role = row

    if not verify_password(password, db_password):
        return None

    return {
        "username": username,
        "role": role
    }