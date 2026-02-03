import os
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
}

ssl_ca = os.getenv("DB_SSL_CA")
if ssl_ca:
    DB_CONFIG["ssl_ca"] = ssl_ca

pool = pooling.MySQLConnectionPool(
    pool_name="exam_pool",
    pool_size=5,
    **DB_CONFIG,
)


def get_conn():
    return pool.get_connection()
