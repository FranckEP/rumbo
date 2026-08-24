# -*- coding: utf-8 -*-
"""
Extrae los nombres de becas de los sitios oficiales de las instituciones.

CONDICIONES CON LAS QUE SE ACEPTÓ ESTA RUTA (respetarlas):
  1. Se guarda la FECHA DE CAPTURA y la app la muestra.
  2. La app avisa que hay que verificar en el sitio de la institución.
  3. Se guarda SIEMPRE la URL de la página de becas: es lo único que no
     caduca. Si la extracción sale pobre, al menos queda el enlace.

Por qué esto es distinto de los datos curados: `becasUni.ts` tiene nombre,
cobertura y criterios, revisados a mano. Lo de aquí son nombres extraídos
automáticamente, sin criterios. Se marcan con `fuente: "web"` para no
mezclarlos con los curados.

Uso:  python scripts/raspar-becas.py [cuántas] [--escribir]
"""
import json
import re
import subprocess
import sys
import unicodedata
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
S = Path(__file__).resolve().parent.parent / "lib" / "snies"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0"

RUTAS = ["/becas", "/becas-y-descuentos", "/beneficios", "/apoyos-financieros",
         "/financiacion", "/becas-y-financiacion", "/admisiones/becas",
         "/estudiantes/becas", "/bienestar/becas", "/descuentos"]

# Encabezados que son ruido de plantilla, no nombres de beca.
RUIDO = {
    "becas", "beca", "descuentos", "beneficios", "nuestras becas", "tipos de becas",
    "becas y descuentos", "conoce nuestras becas", "requisitos", "preguntas frecuentes",
    "contacto", "inicio", "menu", "menú", "buscar", "noticias", "eventos",
    "admisiones", "programas", "pregrado", "posgrado", "estudiantes", "aspirantes",
    "financiacion", "financiación", "apoyos", "convocatorias", "documentos",
    "mas informacion", "más información", "ver mas", "ver más", "inscribete",
    "inscríbete", "aplica ya", "conoce mas", "conoce más", "beneficios",
}


def sinac(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower())
                   if unicodedata.category(c) != "Mn").strip()


def bajar(url, timeout=15):
    try:
        r = subprocess.run(["curl", "-s", "-m", str(timeout), "-L", "-A", UA, url],
                           capture_output=True, timeout=timeout + 10)
        return r.stdout[:300000].decode("utf-8", "replace")
    except Exception:
        return ""


def a_texto(html):
    t = re.sub(r"<script.*?</script>|<style.*?</style>|<!--.*?-->", " ", html, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def limpiar_rotulo(s):
    s = re.sub(r"<[^>]+>", " ", s)
    s = (s.replace("&nbsp;", " ").replace("&amp;", "&")
          .replace("&#8211;", "–").replace("&#8217;", "'").replace("&quot;", '"'))
    return re.sub(r"\s+", " ", s).strip(" -–—:·|")


def hallar_pagina(base):
    """Devuelve (url_becas, html) o (None, '')."""
    html = bajar(base)
    candidatas = []
    if html:
        for m in re.finditer(r'href=["\']([^"\']+)["\'][^>]*>(.{0,90}?)</a>', html, re.I | re.S):
            href, rot = m.group(1), sinac(limpiar_rotulo(m.group(2)))
            hl = href.lower()
            if ("beca" in rot or "beca" in hl or "descuento" in rot
                    or "financiacion" in hl or "apoyo economico" in rot):
                if href.startswith("http"):
                    candidatas.append(href)
                elif href.startswith("/"):
                    candidatas.append(base.rstrip("/") + href)
                if len(candidatas) >= 4:
                    break
    candidatas += [base.rstrip("/") + r for r in RUTAS[:5]]

    mejor = (0, None, "")
    vistas = set()
    for c in candidatas[:7]:
        if c in vistas:
            continue
        vistas.add(c)
        h = bajar(c, 12)
        if not h:
            continue
        t = a_texto(h).lower()
        if len(t) < 400:
            continue
        puntos = t.count("beca") * 2 + t.count("descuento") + t.count("condonable") * 2
        if puntos > mejor[0]:
            mejor = (puntos, c, h)
    return (mejor[1], mejor[2]) if mejor[0] >= 6 else (None, "")


def extraer(html):
    """Nombres de beca desde ENCABEZADOS y listas: son mucho más limpios que
    el texto corrido, donde caen frases de marketing."""
    nombres, vistos = [], set()
    for m in re.finditer(r"<(h[1-4]|strong|li)[^>]*>(.{3,110}?)</\1>", html, re.I | re.S):
        rot = limpiar_rotulo(m.group(2))
        clave = sinac(rot)
        if (not rot or clave in RUIDO or clave in vistos or len(rot) < 6
                or len(rot) > 80 or "beca" not in clave):
            continue
        # Un nombre de beca es un sintagma nominal corto: "Beca por Excelencia".
        # Lo que se cuela si no se filtra son ESLÓGANES ("Estudia con beca en la
        # CUN") y ENCABEZADOS DE TABLA ("Porcentaje de beca").
        if re.search(r"[¿?!¡]", clave):
            continue
        # empieza por verbo -> es una llamada a la acción, no un nombre
        if re.match(r"^(estudia|aplica|conoce|solicita|inscrib|descubre|quiero|haz|"
                    r"obten|accede|consulta|postula|elige|ven|logra|alcanza|paga|"
                    r"financia|invierte|separa|matricula)", clave):
            continue
        # rótulos de tabla o de sección, no becas
        if re.search(r"\b(porcentaje|valor|numero|cantidad|tipos? de|clases? de|"
                     r"listado|cuadro|tabla|como|cual|cuando|donde|quienes|"
                     r"terminos|condiciones|reglamento|politica)\b", clave):
            continue
        # "beca" suelta sin calificador no dice nada ("becas y auxilios")
        if not re.search(r"beca[s]?\s+(por|de|para|del|de la|a la|[A-ZÁÉÍÓÚÑ])", rot,
                         re.IGNORECASE) and not re.search(
                r"(excelencia|merito|mérito|deportiv|cultural|academic|académic|"
                r"socioeconomic|socioeconómic|convenio|hermano|familiar|egresado|"
                r"empleado|talento|honor|icfes|saber|condonable)", clave):
            continue
        vistos.add(clave)
        nombres.append(rot)
        if len(nombres) >= 8:
            break

    texto = a_texto(html)
    pcts = sorted({int(x) for x in re.findall(r"(\d{1,3})\s?%", texto) if 5 <= int(x) <= 100})
    return nombres, pcts


def procesar(item):
    cod, base, nombre = item
    url, html = hallar_pagina(base)
    if not url:
        return {"id": cod, "nombre": nombre, "estado": "sin-pagina"}
    becas, pcts = extraer(html)
    return {
        "id": cod, "nombre": nombre, "url": url,
        "becas": becas, "pcts": pcts,
        "estado": "ok" if becas else "pagina-sin-nombres",
    }


def main():
    cuantas = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 20
    cod = {k: v for k, v in json.loads((S / "codigos.json").read_text(encoding="utf-8")).items()
           if not k.startswith("_")}
    enl = {k: v for k, v in json.loads((S / "enlaces.json").read_text(encoding="utf-8")).items()
           if not k.startswith("_")}
    ies = {i["id"]: i for i in json.loads((S / "instituciones.json").read_text(encoding="utf-8"))}
    prog = json.loads((S / "programas.json").read_text(encoding="utf-8"))
    n = Counter(p["ies"] for p in prog)

    pendientes = sorted(enl.items(), key=lambda kv: -n[kv[0]])[:cuantas]
    items = [(k, v, ies[k]["nombre"]) for k, v in pendientes]

    with ThreadPoolExecutor(max_workers=4) as ex:
        res = list(ex.map(procesar, items))

    for r in sorted(res, key=lambda x: x["estado"]):
        if r["estado"] == "ok":
            pct = f" · {r['pcts'][:6]}" if r["pcts"] else ""
            print(f'  ok {r["nombre"][:34]:<34} {len(r["becas"])} becas{pct}')
            for b in r["becas"][:4]:
                print(f'        - {b}')
        else:
            print(f'  !! {r["nombre"][:34]:<34} {r["estado"]}')

    c = Counter(r["estado"] for r in res)
    print(f"\nRESUMEN {dict(c)}  ·  con nombres: {c['ok']}/{len(res)}")

    if "--escribir" in sys.argv:
        salida = {
            "_nota": ("Becas extraídas automáticamente del sitio de cada institución. "
                      "Son nombres, no criterios: SIEMPRE hay que verificar en la página "
                      "oficial, que es la que manda. Los datos curados a mano están en "
                      "becasUni.ts."),
            "_fecha": date.today().isoformat(),
            "datos": {r["id"]: {"url": r["url"], "becas": r["becas"], "pcts": r["pcts"]}
                      for r in res if r["estado"] == "ok"},
            "soloEnlace": {r["id"]: r["url"] for r in res if r["estado"] == "pagina-sin-nombres"},
        }
        (S / "becasWeb.json").write_text(
            json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f'-> lib/snies/becasWeb.json ({len(salida["datos"])} con becas, '
              f'{len(salida["soloEnlace"])} solo enlace)')


if __name__ == "__main__":
    main()
