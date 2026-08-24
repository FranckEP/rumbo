# -*- coding: utf-8 -*-
"""
Mapea los nombres de programa del SNIES a nuestros 32 arquetipos de carrera.

Por qué hace falta: el SNIES tiene 2.489 nombres distintos ("Ingeniería de
Sistemas", "Tecnología en Desarrollo de Software", "Ingeniería Informática"…)
y Rumbo razona sobre 32 arquetipos con vector RIASEC. Sin este puente, los
9.148 programas reales no se pueden mostrar junto al resultado del test.

EL ORDEN IMPORTA: se aplica el primer patrón que coincida, así que lo
específico va antes que lo general. "Medicina Veterinaria" debe caer en
Veterinaria, no en Medicina; "Licenciatura en Educación Física" en Ciencias
del Deporte, no en Educación.

Uso:  python scripts/mapear.py            -> reporte de cobertura
      python scripts/mapear.py --escribir -> genera lib/snies/mapeo.json
"""
import json, re, sys, unicodedata
from collections import Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
S = Path(__file__).resolve().parent.parent / "lib" / "snies"

# (carrera, [patrones]) — se evalúa en este orden.
REGLAS = [
    # --- primero lo que se confunde con algo más general ---
    ("Veterinaria",              [r"veterinaria", r"zootecni"]),
    ("Ciencias del Deporte",     [r"deport", r"educacion fisica", r"actividad fisica",
                                  r"entrenamiento deportivo", r"cultura fisica"]),
    ("Gastronomía",              [r"gastronom", r"culinari", r"\bcocina\b", r"chef"]),
    ("Turismo y Hotelería",      [r"turis", r"hotele", r"hospitalidad"]),
    ("Química y Farmacia",       [r"farmac", r"\bquimic", r"regencia"]),
    ("Odontología",              [r"odontolog", r"salud oral", r"higiene oral"]),
    ("Fisioterapia",             [r"fisioterap", r"terapia fisica", r"terapia ocupacional",
                                  r"fonoaudiolog", r"rehabilitacion", r"terapia respiratoria"]),
    ("Enfermería",               [r"enfermer"]),
    ("Psicología",               [r"psicolog", r"psicopedagog"]),
    ("Medicina",                 [r"\bmedicina\b", r"medico cirujano", r"instrumentacion quirurgica",
                                  r"\bnutricion\b", r"dietetica", r"bacteriolog", r"optometr",
                                  r"radiolog", r"imagenes diagnosticas", r"salud publica",
                                  r"atencion prehospitalaria", r"citohistolog"]),

    # --- ingenierías y tecnología ---
    ("Ingeniería de Software",   [r"sistemas", r"software", r"informatic", r"computacion",
                                  r"telematic", r"desarrollo de aplicaciones", r"redes",
                                  r"telecomunicacion", r"ciberseguridad", r"multimedia"]),
    ("Ciencia de Datos",         [r"\bdatos\b", r"estadistic", r"inteligencia artificial",
                                  r"analitica", r"actuari", r"matematic", r"fisica"]),
    ("Ingeniería Ambiental",     [r"ambiental", r"saneamiento", r"recursos naturales",
                                  r"ecolog", r"sanitaria"]),
    ("Ingeniería Civil",         [r"\bcivil", r"obras civiles", r"construccion", r"topograf",
                                  r"vias\b", r"catastral", r"geodes"]),
    ("Ingeniería Mecánica / Mecatrónica",
                                 [r"mecanic", r"mecatron", r"electromecanic", r"automotriz",
                                  r"automatizacion", r"robotic", r"aeronautic", r"naval",
                                  r"\belectric", r"electronic", r"instrumentacion y control",
                                  r"metalmecanic", r"mantenimiento", r"biomedic", r"energia"]),
    ("Ingeniería Industrial",    [r"industrial", r"produccion", r"logistic", r"calidad",
                                  r"procesos", r"petrole", r"\bminas\b", r"mineria"]),

    # --- diseño y comunicación ---
    ("Arquitectura",             [r"arquitect", r"urbanis", r"diseño de espacios",
                                  r"diseño de interiores"]),
    ("Cine y Comunicación Audiovisual",
                                 [r"\bcine", r"audiovisual", r"television", r"fotograf",
                                  r"animacion", r"produccion de medios", r"realizacion"]),
    ("Diseño Gráfico / UX",      [r"diseño grafic", r"diseño visual", r"diseño digital",
                                  r"diseño industrial", r"diseño de mod", r"diseño de vestuario",
                                  r"artes visuales", r"artes plastic", r"publicitario",
                                  r"^diseño", r"diseño", r"moda", r"videojuego", r"medios grafic"]),
    ("Publicidad y Marketing",   [r"publicidad", r"mercad", r"marketing", r"mercadotecnia"]),
    ("Turismo y Hotelería",      [r"eventos"]),
    ("Periodismo y Comunicación",[r"comunicacion social", r"periodis", r"comunicacion"]),
    ("Música y Artes Escénicas", [r"\bmusica", r"musical", r"\bdanza", r"teatro",
                                  r"arte dramatic", r"artes escenic", r"\bcanto\b"]),

    # --- sociales y administrativas ---
    ("Derecho",                  [r"\bderecho", r"juridic", r"criminalistic", r"criminolog", r"investigacion criminal"]),
    ("Relaciones Internacionales",
                                 [r"relaciones internacionales", r"negocios internacionales",
                                  r"comercio exterior", r"comercio internacional",
                                  r"ciencia politica", r"ciencias politicas", r"\bgobierno\b",
                                  r"\bdiplomac", r"negociacion internacional", r"aduaner"]),
    ("Contabilidad y Finanzas",  [r"contadur", r"contable", r"finanzas", r"financier",
                                  r"tributar", r"banca", r"seguros", r"costos"]),
    ("Economía",                 [r"\beconomia\b", r"economic"]),
    ("Recursos Humanos",         [r"talento humano", r"recursos humanos", r"gestion humana",
                                  r"seguridad y salud en el trabajo", r"salud ocupacional",
                                  r"\bsst\b"]),
    ("Administración de Empresas",
                                 [r"administracion", r"gestion empresarial", r"empresarial",
                                  r"\bnegocios\b", r"emprendimiento", r"gerencia",
                                  r"administrativ", r"comercial", r"\bventas\b",
                                  r"gestion documental", r"archiv", r"secretariado"]),
    ("Trabajo Social",           [r"trabajo social", r"desarrollo social", r"\bsociolog",
                                  r"gerontolog", r"\bfamilia\b"]),
    ("Educación / Docencia",     [r"licenciatura", r"pedagog", r"\beducacion", r"docenc",
                                  r"\bnormalista", r"preescolar", r"infantil"]),

    # --- ciencias y agro ---
    ("Biología",                 [r"biolog", r"microbiolog", r"\bbiotecnolog", r"ciencias naturales",
                                  r"acuicultura", r"piscicultura", r"\bmarina\b", r"geolog", r"\bgeociencia"]),
    ("Agronomía",                [r"agronom", r"agropecuar", r"agroindustrial", r"agricol",
                                  r"forestal", r"\bagro", r"alimentos", r"zootecn", r"rural", r"pecuari"]),
]


def norma(s: str) -> str:
    """Minúsculas y sin tildes, pero CONSERVANDO la ñ.

    Descomponer sin cuidado convierte "diseño" en "diseno", y entonces ningún
    patrón escrito con ñ coincide: los 100+ programas de Diseño quedaban sin
    mapear. Se protege la ñ con un marcador que no aparece en ningún nombre.
    """
    MARCA = "~n~"
    s = s.lower().replace("ñ", MARCA)
    s = "".join(c for c in unicodedata.normalize("NFD", s)
                if unicodedata.category(c) != "Mn")
    s = s.replace(MARCA, "ñ")
    return re.sub(r"\s+", " ", s).strip()


def carrera_de(nombre: str):
    n = norma(nombre)
    for carrera, patrones in REGLAS:
        for p in patrones:
            if re.search(p, n):
                return carrera
    return None


def main():
    prog = json.loads((S / "programas.json").read_text(encoding="utf-8"))
    nombres = Counter(p["n"] for p in prog)

    mapeo, sin_mapear = {}, []
    for nombre, veces in nombres.items():
        c = carrera_de(nombre)
        if c:
            mapeo[nombre] = c
        else:
            sin_mapear.append((nombre, veces))

    cubiertos = sum(nombres[n] for n in mapeo)
    total = len(prog)
    print(f"Nombres distintos:     {len(nombres):>5}")
    print(f"  mapeados:            {len(mapeo):>5}")
    print(f"  sin mapear:          {len(sin_mapear):>5}")
    print(f"\nPROGRAMAS CUBIERTOS:   {cubiertos:>5} de {total} ({cubiertos*100//total}%)")

    por_carrera = Counter()
    for p in prog:
        c = mapeo.get(p["n"])
        if c:
            por_carrera[c] += 1
    print(f"\nprogramas por carrera ({len(por_carrera)} de 32 con oferta):")
    for c, q in por_carrera.most_common():
        print(f"  {q:>5}  {c}")

    huerfanas = [c for c, _ in REGLAS if c not in por_carrera]
    if huerfanas:
        print(f"\nCARRERAS SIN NINGÚN PROGRAMA: {huerfanas}")

    sin_mapear.sort(key=lambda x: -x[1])
    print(f"\nlos 25 sin mapear que más pesan ({sum(v for _, v in sin_mapear)} programas):")
    for n, v in sin_mapear[:25]:
        print(f"  {v:>4}  {n}")

    if "--escribir" in sys.argv:
        (S / "mapeo.json").write_text(
            json.dumps(mapeo, ensure_ascii=False, indent=0, sort_keys=True), encoding="utf-8")
        print(f"\n-> lib/snies/mapeo.json ({len(mapeo)} nombres)")


if __name__ == "__main__":
    main()
