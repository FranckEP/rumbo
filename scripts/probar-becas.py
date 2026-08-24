# -*- coding: utf-8 -*-
"""
PRUEBA DE VIABILIDAD: ¿se puede sacar la información de becas de los sitios?

No extrae nada todavía. Solo mide, sobre una muestra, cuántos sitios permiten
llegar a una página de becas con contenido legible. Sirve para decidir si vale
la pena automatizar la extracción o si hay que seguir capturándolas a mano.

Uso:  python scripts/probar-becas.py [cuántas]
"""
import json
import re
import subprocess
import sys
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
S = Path(__file__).resolve().parent.parent / "lib" / "snies"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0"

# Rutas donde las universidades colombianas suelen poner sus becas.
RUTAS = ["/becas", "/becas-y-descuentos", "/beneficios", "/apoyos-financieros",
         "/financiacion", "/becas-y-financiacion", "/admisiones/becas",
         "/estudiantes/becas", "/bienestar/becas"]

PALABRAS = ["beca", "descuento", "auxilio", "apoyo económico", "financiación",
            "matrícula", "condonable", "estímulo"]


def texto(url, timeout=14):
    try:
        r = subprocess.run(["curl", "-s", "-m", str(timeout), "-L", "-A", UA, url],
                           capture_output=True, timeout=timeout + 10)
        html = r.stdout[:250000].decode("utf-8", "replace")
    except Exception:
        return "", ""
    limpio = re.sub(r"<script.*?</script>|<style.*?</style>|<!--.*?-->", " ", html,
                    flags=re.S | re.I)
    limpio = re.sub(r"<[^>]+>", " ", limpio)
    return re.sub(r"\s+", " ", limpio).strip(), html


def evaluar(item):
    cod, url, nombre = item
    base = url.rstrip("/")

    # 1) ¿La portada menciona becas y enlaza a alguna página?
    cuerpo, html = texto(base)
    if not cuerpo:
        return (cod, nombre, "SIN-CONTENIDO", 0, "")

    # 2) Buscar en la portada un enlace cuyo texto o href hable de becas
    candidatos = []
    for m in re.finditer(r'href=["\']([^"\']+)["\'][^>]*>([^<]{0,80})', html, re.I):
        href, rotulo = m.group(1), m.group(2).lower()
        if any(p in rotulo for p in ("beca", "descuento", "financia", "apoyo")) or \
           any(p in href.lower() for p in ("beca", "financia", "descuento")):
            if href.startswith("http"):
                candidatos.append(href)
            elif href.startswith("/"):
                candidatos.append(base + href)
            if len(candidatos) >= 3:
                break

    # 3) Probar rutas típicas si la portada no dio pistas
    for r in RUTAS[:4]:
        if len(candidatos) >= 3:
            break
        candidatos.append(base + r)

    mejor = (0, "")
    for c in candidatos[:4]:
        cuerpo2, _ = texto(c, 12)
        if len(cuerpo2) < 400:
            continue
        bajo = cuerpo2.lower()
        hits = sum(bajo.count(p) for p in PALABRAS)
        if hits > mejor[0]:
            mejor = (hits, c)

    if mejor[0] >= 8:
        estado = "BUENO"
    elif mejor[0] >= 3:
        estado = "DEBIL"
    else:
        estado = "NO-ENCONTRADO"
    return (cod, nombre, estado, mejor[0], mejor[1])


def main():
    cuantas = int(sys.argv[1]) if len(sys.argv) > 1 else 12
    cod = {k: v for k, v in json.loads((S / "codigos.json").read_text(encoding="utf-8")).items()
           if not k.startswith("_")}
    enl = {k: v for k, v in json.loads((S / "enlaces.json").read_text(encoding="utf-8")).items()
           if not k.startswith("_")}
    ies = {i["id"]: i for i in json.loads((S / "instituciones.json").read_text(encoding="utf-8"))}
    prog = json.loads((S / "programas.json").read_text(encoding="utf-8"))
    n = Counter(p["ies"] for p in prog)

    muestra = sorted(enl.items(), key=lambda kv: -n[kv[0]])[:cuantas]
    items = [(k, v, ies[k]["nombre"]) for k, v in muestra]

    with ThreadPoolExecutor(max_workers=5) as ex:
        res = list(ex.map(evaluar, items))

    conteo = Counter(r[2] for r in res)
    for cod_, nombre, estado, hits, url in sorted(res, key=lambda r: r[2]):
        marca = {"BUENO": "  ok ", "DEBIL": "  ~~ "}.get(estado, "  !! ")
        print(f"{marca}{nombre[:40]:<40} {estado:<14} {hits:>3} menciones  {url[:52]}")
    print(f"\nRESUMEN sobre {len(res)}: {dict(conteo)}")
    buenos = conteo["BUENO"]
    print(f"utilizables directamente: {buenos}/{len(res)} ({buenos*100//len(res)}%)")


if __name__ == "__main__":
    main()
