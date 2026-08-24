# -*- coding: utf-8 -*-
"""
Propone dominios candidatos para las instituciones sin enlace y los verifica.

No adivina: genera candidatos a partir del nombre (las IES colombianas siguen
patrones bastante regulares) y solo acepta los que responden de verdad por HTTP.
Lo que no resuelve queda listado para buscarlo a mano.

Uso:  python scripts/dominios.py 40      -> intenta con las 40 más grandes
"""
import json, re, subprocess, sys, unicodedata
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
S = Path(__file__).resolve().parent.parent / "lib" / "snies"

STOP = {"universidad", "universitaria", "universitario", "corporacion", "fundacion",
        "institucion", "institucional", "escuela", "colegio", "superior", "superiores",
        "educacion", "de", "del", "la", "el", "los", "las", "y", "en", "para", "nacional"}


def sin(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower())
                   if unicodedata.category(c) != "Mn")


def candidatos(nombre):
    n = sin(nombre)
    out = []
    # 1) sigla entre guiones: "...-cun-" o "- Udes"
    for m in re.findall(r"-\s*([a-z][a-z0-9.]{1,12})\s*-?\s*$", n) + re.findall(r"-([a-z]{2,12})-", n):
        s = m.replace(".", "")
        if s and s not in STOP:
            out += [f"{s}.edu.co", f"www.{s}.edu.co"]
    palabras = [w for w in re.findall(r"[a-z]+", n) if w not in STOP and len(w) > 2]
    if palabras:
        p = "".join(palabras[:2])
        out += [f"{palabras[0]}.edu.co", f"www.{palabras[0]}.edu.co",
                f"uni{palabras[0]}.edu.co", f"{p}.edu.co", f"www.{p}.edu.co"]
        # sigla por iniciales
        if len(palabras) >= 3:
            ini = "".join(w[0] for w in palabras[:4])
            out += [f"{ini}.edu.co", f"www.{ini}.edu.co"]
    vistos, unicos = set(), []
    for c in out:
        if c not in vistos:
            vistos.add(c); unicos.append(c)
    return unicos[:9]


def probar(host):
    try:
        r = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-m", "9", "-L", "-w", "%{http_code} %{url_effective}",
             "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0",
             f"https://{host}"],
            capture_output=True, text=True, timeout=25)
        code, _, url = r.stdout.partition(" ")
        return (code in ("200", "301", "302", "403"), code, url.strip())
    except Exception:
        return (False, "err", "")


def main():
    cuantas = int(sys.argv[1]) if len(sys.argv) > 1 else 40
    faltan = json.loads((S / "faltantes.json").read_text(encoding="utf-8"))[:cuantas]

    # Dominios ya asignados: si se vuelven a proponer, el enlace quedaría
    # duplicado y apuntando a la institución equivocada. Pasó con
    # politecnico.edu.co y unicatolica.edu.co.
    usados = set()
    for archivo in ("enlaces.json",):
        for v in json.loads((S / archivo).read_text(encoding="utf-8")).values():
            usados.add(re.sub(r"^https?://(www\.)?", "", str(v)).strip("/"))
    for v in json.loads((RAIZ_LIB).read_text(encoding="utf-8")) if False else []:
        pass

    usados |= {re.sub(r"^https?://(www\.)?", "", u).strip("/")
               for u in re.findall(r'"(https://[^"]+)"',
                                   (S.parent / "universities.ts").read_text(encoding="utf-8"))}

    def resolver(inst):
        for c in candidatos(inst["nombre"]):
            if re.sub(r"^www\.", "", c) in usados:
                continue
            ok, code, url = probar(c)
            if ok:
                return (inst, c, code, url)
        return (inst, None, None, None)

    with ThreadPoolExecutor(max_workers=6) as ex:
        res = list(ex.map(resolver, faltan))

    hallados = [(i, c, code, url) for i, c, code, url in res if c]
    perdidos = [i for i, c, *_ in res if not c]

    print(f"RESUELTOS {len(hallados)} de {len(faltan)}\n")
    for i, c, code, url in sorted(hallados, key=lambda x: -x[0]["programas"]):
        print(f'  "{i["id"]}": "https://{c}",  // {code} · {i["programas"]:>3}p · {i["nombre"][:44]}')
    if perdidos:
        print(f"\nSIN RESOLVER ({len(perdidos)}) — hay que buscarlos:")
        for i in sorted(perdidos, key=lambda x: -x["programas"]):
            print(f'  [{i["id"]}] {i["programas"]:>3}p · {i["nombre"][:60]}')


if __name__ == "__main__":
    main()
