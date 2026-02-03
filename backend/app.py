from flask import Flask, jsonify, request, send_from_directory
from db import get_conn

app = Flask(__name__, static_folder="../web", static_url_path="/")


def query_all(sql, params=None):
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(sql, params or [])
        rows = cur.fetchall()
        cur.close()
        return rows
    finally:
        conn.close()


def execute(sql, params=None):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(sql, params or [])
        conn.commit()
        cur.close()
    finally:
        conn.close()


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/api/students")
def students():
    rows = query_all("SELECT Matricola, Nome, Cognome, DataNascita FROM STUDENTE ORDER BY Cognome, Nome")
    return jsonify(rows)


@app.get("/api/teachers")
def teachers():
    rows = query_all("SELECT IdDocente, Nome, Cognome, Dipartimento FROM DOCENTE ORDER BY Cognome, Nome")
    return jsonify(rows)


@app.get("/api/subjects")
def subjects():
    rows = query_all("SELECT IdMateria, Nome, CFU FROM MATERIA ORDER BY Nome")
    return jsonify(rows)


@app.post("/api/exams")
def create_exam():
    data = request.get_json(force=True)
    matricola = data.get("Matricola")
    id_materia = data.get("IdMateria")
    id_docente = data.get("IdDocente")
    data_esame = data.get("DataEsame")
    voto = data.get("Voto")
    lode = data.get("Lode", 0)

    if not all([matricola, id_materia, id_docente, data_esame, voto]):
        return jsonify({"error": "Missing fields"}), 400

    sql = (
        "INSERT INTO ESAME (Matricola, IdMateria, DataEsame, Voto, Lode, IdDocente) "
        "VALUES (%s, %s, %s, %s, %s, %s)"
    )
    execute(sql, [matricola, id_materia, data_esame, voto, int(bool(lode)), id_docente])
    return jsonify({"ok": True})


@app.get("/api/exams")
def list_exams():
    matricola = request.args.get("Matricola")
    id_docente = request.args.get("IdDocente")
    id_materia = request.args.get("IdMateria")

    where = []
    params = []
    if matricola:
        where.append("e.Matricola = %s")
        params.append(matricola)
    if id_docente:
        where.append("e.IdDocente = %s")
        params.append(id_docente)
    if id_materia:
        where.append("e.IdMateria = %s")
        params.append(id_materia)

    where_sql = ""
    if where:
        where_sql = "WHERE " + " AND ".join(where)

    sql = f"""
        SELECT e.Matricola, s.Nome AS NomeStudente, s.Cognome AS CognomeStudente,
               e.IdMateria, m.Nome AS NomeMateria, m.CFU,
               e.IdDocente, d.Nome AS NomeDocente, d.Cognome AS CognomeDocente,
               e.DataEsame, e.Voto, e.Lode
        FROM ESAME e
        JOIN STUDENTE s ON s.Matricola = e.Matricola
        JOIN MATERIA m ON m.IdMateria = e.IdMateria
        JOIN DOCENTE d ON d.IdDocente = e.IdDocente
        {where_sql}
        ORDER BY e.DataEsame DESC
    """
    rows = query_all(sql, params)
    return jsonify(rows)


@app.get("/api/averages")
def averages():
    sql = """
        SELECT s.Matricola, s.Nome, s.Cognome,
               ROUND(SUM(e.Voto * m.CFU) / NULLIF(SUM(m.CFU), 0), 2) AS MediaPesata,
               SUM(m.CFU) AS CFUTotali
        FROM STUDENTE s
        LEFT JOIN ESAME e ON e.Matricola = s.Matricola
        LEFT JOIN MATERIA m ON m.IdMateria = e.IdMateria
        GROUP BY s.Matricola, s.Nome, s.Cognome
        ORDER BY s.Cognome, s.Nome
    """
    rows = query_all(sql)
    return jsonify(rows)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
