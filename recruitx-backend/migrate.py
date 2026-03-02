"""
One-time migration: add new columns to student_profiles and users tables.
Run from recruitx-backend/:  venv\Scripts\python migrate.py
"""
import pymysql
from dotenv import load_dotenv
import os, re

load_dotenv()

url = os.getenv("DATABASE_URL", "")
# parse mysql+pymysql://user:pass@host:port/db
m = re.match(r"mysql\+pymysql://([^:]+):([^@]+)@([^:/]+):?(\d+)?/(.+)", url)
if not m:
    raise ValueError(f"Cannot parse DATABASE_URL: {url}")

user, password, host, port, db = m.groups()
port = int(port or 3306)

conn = pymysql.connect(host=host, port=port, user=user, password=password, database=db)
cur  = conn.cursor()

# ── student_profiles: new columns ────────────────────────────────
new_cols = [
    ("roll_no",            "VARCHAR(50)    DEFAULT NULL"),
    ("gender",             "VARCHAR(20)    DEFAULT NULL"),
    ("dob",                "VARCHAR(30)    DEFAULT NULL"),
    ("nationality",        "VARCHAR(50)    DEFAULT NULL"),
    ("degree",             "VARCHAR(50)    DEFAULT NULL"),
    ("college_name",       "VARCHAR(200)   DEFAULT NULL"),
    ("college_state",      "VARCHAR(100)   DEFAULT NULL"),
    ("university",         "VARCHAR(200)   DEFAULT NULL"),
    ("grading_system",     "VARCHAR(30)    DEFAULT NULL"),
    ("diploma_percent",    "FLOAT          DEFAULT NULL"),
    ("verified_academics", "TINYINT(1)     DEFAULT 0"),
    ("parsed_skills",      "TEXT           DEFAULT NULL"),
    ("internships",        "TEXT           DEFAULT NULL"),
    ("projects",           "TEXT           DEFAULT NULL"),
    ("achievements",       "TEXT           DEFAULT NULL"),
]

# Check which columns already exist
cur.execute("SHOW COLUMNS FROM student_profiles")
existing = {row[0] for row in cur.fetchall()}
print(f"Existing columns: {existing}")

for col, definition in new_cols:
    if col in existing:
        print(f"  skip  {col} (already exists)")
        continue
    sql = f"ALTER TABLE student_profiles ADD COLUMN {col} {definition}"
    print(f"  add   {col} ...")
    cur.execute(sql)
    conn.commit()
    print(f"  OK    {col}")

# ── users: new columns ────────────────────────────────────────────
cur.execute("SHOW COLUMNS FROM users")
existing_u = {row[0] for row in cur.fetchall()}

for col, definition in [
    ("is_active",           "TINYINT(1) DEFAULT 1"),
    ("is_default_password", "TINYINT(1) DEFAULT 1"),
]:
    if col in existing_u:
        print(f"  skip  users.{col} (already exists)")
        continue
    sql = f"ALTER TABLE users ADD COLUMN {col} {definition}"
    print(f"  add   users.{col} ...")
    cur.execute(sql)
    conn.commit()
    print(f"  OK    users.{col}")

cur.close()
conn.close()
print("\nMigration complete!")
