# -*- coding: utf-8 -*-
"""
Verifica que un dominio pertenezca REALMENTE a la institución esperada.

Un HTTP 200 solo dice que el sitio existe. En la primera tanda,
'politecnico.edu.co' respondía 200 pero es el Instituto Politécnico de
Bucaramanga, no el Politécnico Colombiano Jaime Isaza Cadavid: dos
instituciones distintas. Por eso aquí se compara el <title> de la página con
el nombre del SNIES y se exige coincidencia de palabras significativas.

Uso:  python scripts/verificar.py pares.json
      (pares.json = { "codigoSNIES": "https://dominio", ... })
"""
import json, re, subprocess, sys, unicodedata
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
S = Path(__file__).resolve().parent.parent / "lib" / "snies"
STOP = {"universidad", "universitaria", "universitario", "corporacion", "fundacion",
        "institucion", "institucional", "escuela", "colegio", "superior", "superiores",
        "educacion", "de", "del", "la", "el", "los", "las", "y", "en", "para",
        "unificada", "internacional", "inicio", "home", "com", "edu"}

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0"


def sin(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower())
                   if unicodedata.category(c) != "Mn")


def palabras(s):
    return {w for w in re.findall(r"[a-z]{3,}", sin(s)) if w not in STOP}


def traer(url):
    try:
        # bytes + decode explícito: si se deja que el shell decida, los títulos
        # llegan como "CorporaciÃ³n" y la comparación de palabras falla.
        r = subprocess.run(["curl", "-s", "-m", "14", "-L", "-A", UA, url],
                           capture_output=True, timeout=30)
        html = r.stdout[:40000].decode("utf-8", "replace")
        m = re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I)
        titulo = re.sub(r"\s+", " ", m.group(1)).strip() if m else ""
        og = re.search(r'property="og:site_name"\s+content="([^"]+)"', html)
        return titulo, (og.group(1) if og else "")
    except Exception:
        return "", ""


def main():
    pares = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    ies = {i["id"]: i for i in json.loads((S / "instituciones.json").read_text(encoding="utf-8"))}

    def chequear(item):
        cod, url = item
        inst = ies.get(cod)
        if not inst:
            return (cod, url, "SIN-IES", "", 0)
        titulo, sitio = traer(url)
        texto = f"{titulo} {sitio} {url}"
        esperadas = palabras(inst["nombre"])
        encontradas = palabras(texto)
        # también cuenta si la sigla del dominio aparece en el nombre
        dom = re.sub(r"^https?://(www\.)?", "", url).split(".")[0]
        comunes = esperadas & encontradas
        score = len(comunes)
        if dom in sin(inst["nombre"]).replace(" ", ""):
            score += 1
        # Exigente a propósito: una sola palabra en común da falsos positivos.
        # 'medellin.edu.co' es la Secretaría de Educación de Medellín y pasaba
        # como Universidad de Medellín solo por compartir "medellin".
        distintivas = esperadas - {"nacional", "colombia", "colombiana", "medellin",
                                   "bogota", "cali", "caribe", "santander", "antioquia",
                                   "politecnico", "tecnologico", "tecnologica", "maria",
                                   "san", "santa", "catolica", "mayor", "central"}
        fuertes = distintivas & encontradas
        estado = ("VACIO" if not titulo
                  else "OK" if (fuertes or (dom in sin(inst["nombre"]).replace(" ", "") and score >= 2))
                  else "DUDOSO")
        return (cod, url, estado, titulo[:64], score)

    with ThreadPoolExecutor(max_workers=6) as ex:
        res = list(ex.map(chequear, pares.items()))

    ok = [r for r in res if r[2] == "OK"]
    mal = [r for r in res if r[2] != "OK"]
    for cod, url, estado, titulo, score in sorted(res, key=lambda r: r[2]):
        marca = "  ok " if estado == "OK" else "  !! "
        print(f'{marca}[{cod}] {url:<42} {estado:<7} {titulo}')
    print(f"\nconfirmados: {len(ok)} · a revisar: {len(mal)}")


if __name__ == "__main__":
    main()
