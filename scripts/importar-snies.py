# -*- coding: utf-8 -*-
"""
Importa el archivo de programas del SNIES y genera los datos del proyecto.

Uso:  python scripts/importar-snies.py ruta/al/Programas.xlsx

Por qué Python y no Node: lee el .xlsx sin instalar nada (zipfile viene en la
librería estándar). Es una herramienta de mantenimiento que se corre cuando el
SNIES publica una actualización, no parte del build.

Genera:
  lib/snies/instituciones.json  — una entrada por institución
  lib/snies/programas.json      — pregrado ACTIVO únicamente

Descarta a propósito: programas inactivos y posgrados. Un joven de 17 años que
está eligiendo qué estudiar no necesita ver 14.000 maestrías ni programas que
ya no se ofrecen.
"""
import json
import re
import sys
import unicodedata
import zipfile
from collections import defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "lib" / "snies"

# Solo pregrado. El SNIES mezcla pregrado y posgrado en el mismo archivo.
NIVELES_PREGRADO = {
    "Universitario": "profesional",
    "Tecnológico": "tecnologica",
    "Formación técnica profesional": "tecnica",
}

# Cuántos semestres vale un periodo de cada tipo.
# "Periodos" y "Sin definir" no dicen la unidad: se asumen semestres, que es
# lo que reportan sus valores (8, 9, 10...).
A_SEMESTRES = {
    "Semestral": 1.0,
    "Anual": 2.0,
    "Cuatrimestral": 4 / 6,
    "Trimestral": 0.5,
    "Mensual": 1 / 6,
    "Periodos": 1.0,
    "Sin definir": 1.0,
    "": 1.0,
}

COLS = {
    "cod_padre": 0,
    "cod_ies": 1,
    "nombre_ies": 2,
    "caracter": 4,
    "sector": 5,
    "cod_programa": 7,
    "programa": 9,
    "estado": 11,
    "acreditacion": 14,
    "nivel": 26,
    "modalidad": 27,
    "periodos": 29,
    "periodicidad": 30,
    "departamento": 34,
    "municipio": 35,
    "costo": 36,
}

CELDA = re.compile(
    r'<c r="([A-Z]+)\d+"[^>]*>(?:<is><t[^>]*>(.*?)</t></is>|<v>(.*?)</v>)?</c>'
)


def indice_columna(ref: str) -> int:
    n = 0
    for ch in ref:
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def arreglar(s: str) -> str:
    """El archivo trae UTF-8 leído como latin-1: 'Bogotá' llega como 'BogotÃ¡'."""
    if not s:
        return ""
    try:
        s = s.encode("latin1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    return (
        s.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").strip()
    )


# El SNIES guarda varios nombres sin tildes ("Administracion", "Corporacion").
# No es un problema de codificación: viene así en el archivo.
TILDES = {
    "administracion": "administración", "educacion": "educación",
    "corporacion": "corporación", "fundacion": "fundación",
    "tecnologia": "tecnología", "tecnologias": "tecnologías",
    "tecnologico": "tecnológico", "tecnologica": "tecnológica",
    "ingenieria": "ingeniería", "ingenierias": "ingenierías",
    "biologia": "biología", "psicologia": "psicología",
    "sociologia": "sociología", "geologia": "geología",
    "filosofia": "filosofía", "teologia": "teología",
    "economia": "economía", "agronomia": "agronomía",
    "gastronomia": "gastronomía", "odontologia": "odontología",
    "bacteriologia": "bacteriología", "fonoaudiologia": "fonoaudiología",
    "musica": "música", "matematicas": "matemáticas", "fisica": "física",
    "quimica": "química", "estadistica": "estadística",
    "informatica": "informática", "electronica": "electrónica",
    "mecanica": "mecánica", "mecatronica": "mecatrónica",
    "electrica": "eléctrica", "hidraulica": "hidráulica",
    "farmaceutica": "farmacéutica", "veterinaria": "veterinaria",
    "nutricion": "nutrición", "comunicacion": "comunicación",
    "produccion": "producción", "construccion": "construcción",
    "gestion": "gestión", "direccion": "dirección",
    "formacion": "formación", "investigacion": "investigación",
    "innovacion": "innovación", "internacionales": "internacionales",
    "publica": "pública", "publicas": "públicas", "publico": "público",
    "grafico": "gráfico", "grafica": "gráfica", "artistica": "artística",
    "logistica": "logística", "turistica": "turística",
    "agropecuaria": "agropecuaria", "agroindustrial": "agroindustrial",
    "pedagogia": "pedagogía", "pedagogica": "pedagógica",
    "linguistica": "lingüística", "juridicas": "jurídicas",
    "politica": "política", "politicas": "políticas",
    "atlantico": "atlántico", "bolivar": "bolívar", "boyaca": "boyacá",
    "caqueta": "caquetá", "choco": "chocó", "cordoba": "córdoba",
    "guajira": "guajira", "quindio": "quindío", "vaupes": "vaupés",
    "andres": "andrés", "bogota": "bogotá", "medellin": "medellín",
    "cucuta": "cúcuta", "ibague": "ibagué", "monteria": "montería",
    "popayan": "popayán", "sincelejo": "sincelejo", "tunja": "tunja",
    "america": "américa", "americana": "americana", "cientifica": "científica",
    "maritima": "marítima", "militar": "militar", "catolica": "católica",
    "autonoma": "autónoma", "tecnica": "técnica", "tecnico": "técnico",
    "san": "san", "jose": "josé", "maria": "maría", "nunez": "núñez",
}


def con_tildes(s: str) -> str:
    def rep(m):
        w = m.group(0)
        base = TILDES.get(w.lower())
        if not base:
            return w
        return base.capitalize() if w[:1].isupper() else base

    return re.sub(r"[A-Za-zÁÉÍÓÚáéíóúÑñ]+", rep, s)


def titulo(s: str) -> str:
    """El SNIES guarda todo en MAYÚSCULAS; se ve fatal en pantalla."""
    if not s:
        return ""
    if s != s.upper():
        return s  # ya viene con mayúsculas y minúsculas
    menores = {"de", "del", "la", "las", "los", "y", "en", "e", "el", "a", "para", "con"}
    partes = s.lower().split()
    out = []
    for i, p in enumerate(partes):
        out.append(p if (i > 0 and p in menores) else p.capitalize())
    return con_tildes(" ".join(out))


def sin_tildes(s: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn"
    )


def leer(ruta: Path):
    z = zipfile.ZipFile(ruta)
    hoja = max(
        (n for n in z.namelist() if n.startswith("xl/worksheets/sheet")),
        key=lambda n: z.getinfo(n).file_size,
    )
    data = z.read(hoja).decode("utf-8", "ignore")
    for bruto in data.split("<row ")[2:]:
        vals = {}
        for m in CELDA.finditer(bruto):
            vals[indice_columna(m.group(1))] = m.group(2) or m.group(3) or ""
        if vals:
            yield vals


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    if len(sys.argv) < 2:
        sys.exit("Falta la ruta del .xlsx.  Uso: python scripts/importar-snies.py Programas.xlsx")
    ruta = Path(sys.argv[1])
    if not ruta.exists():
        sys.exit(f"No encuentro el archivo: {ruta}")

    programas = []
    ies = {}
    deptos_por_ies = defaultdict(set)
    total = descartados_inactivos = descartados_posgrado = 0

    for v in leer(ruta):
        total += 1
        if v.get(COLS["estado"]) != "Activo":
            descartados_inactivos += 1
            continue
        nivel_snies = arreglar(v.get(COLS["nivel"], ""))
        if nivel_snies not in NIVELES_PREGRADO:
            descartados_posgrado += 1
            continue

        # El SNIES registra cada SEDE como institución aparte y las une con el
        # código de institución padre. Agrupamos por padre: UNAL Bogotá y UNAL
        # Medellín son la misma universidad y comparten sitio web.
        cod = (v.get(COLS["cod_padre"], "").strip() or v.get(COLS["cod_ies"], "").strip())
        depto = arreglar(v.get(COLS["departamento"], ""))

        if cod not in ies:
            ies[cod] = {
                "id": cod,
                "nombre": titulo(arreglar(v.get(COLS["nombre_ies"], ""))),
                "sector": "publica"
                if arreglar(v.get(COLS["sector"], "")) == "Oficial"
                else "privada",
                "caracter": arreglar(v.get(COLS["caracter"], "")),
            }
        if depto:
            deptos_por_ies[cod].add(depto)

        # OJO: la duración del SNIES viene en unidades de PERIODICIDAD, no
        # siempre en semestres. "Tecnología en Animación Digital" reporta 27
        # con periodicidad Mensual: son 27 MESES (4,5 semestres), no 27
        # semestres. Sin esta conversión la ficha mostraba disparates.
        try:
            bruto = float(v.get(COLS["periodos"], "") or 0)
        except ValueError:
            bruto = 0.0
        periodos = round(bruto * A_SEMESTRES.get(arreglar(v.get(COLS["periodicidad"], "")), 1.0), 1)
        try:
            costo = int(float(v.get(COLS["costo"], "") or 0))
        except ValueError:
            costo = 0

        programas.append(
            {
                "ies": cod,
                "cod": v.get(COLS["cod_programa"], "").strip(),
                "n": titulo(arreglar(v.get(COLS["programa"], ""))),
                "nivel": NIVELES_PREGRADO[nivel_snies],
                "dep": depto,
                "mun": titulo(arreglar(v.get(COLS["municipio"], ""))),
                "per": periodos,
                "mod": arreglar(v.get(COLS["modalidad"], "")),
                "costo": costo,
                "acred": arreglar(v.get(COLS["acreditacion"], "")),
            }
        )

    for cod, deps in deptos_por_ies.items():
        ies[cod]["deps"] = sorted(deps)
    for inst in ies.values():
        inst.setdefault("deps", [])
        inst["buscar"] = sin_tildes(inst["nombre"])

    SALIDA.mkdir(parents=True, exist_ok=True)
    lista_ies = sorted(ies.values(), key=lambda x: x["nombre"])
    (SALIDA / "instituciones.json").write_text(
        json.dumps(lista_ies, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    (SALIDA / "programas.json").write_text(
        json.dumps(programas, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )

    niveles = defaultdict(int)
    for p in programas:
        niveles[p["nivel"]] += 1

    print(f"Leídas            {total:>7} filas")
    print(f"  descartadas     {descartados_inactivos:>7} inactivas")
    print(f"  descartadas     {descartados_posgrado:>7} de posgrado")
    print(f"PROGRAMAS         {len(programas):>7} de pregrado activo")
    for k, n in sorted(niveles.items(), key=lambda x: -x[1]):
        print(f"  {k:<14} {n:>7}")
    print(f"INSTITUCIONES     {len(lista_ies):>7}")
    pub = sum(1 for i in lista_ies if i["sector"] == "publica")
    print(f"  públicas        {pub:>7}")
    print(f"  privadas        {len(lista_ies)-pub:>7}")
    con_costo = sum(1 for p in programas if p["costo"] > 0)
    print(f"  con costo       {con_costo:>7} ({con_costo*100//len(programas)}%)")
    for f in ("instituciones.json", "programas.json"):
        kb = (SALIDA / f).stat().st_size / 1024
        print(f"-> lib/snies/{f}  {kb:,.0f} KB")


if __name__ == "__main__":
    main()
