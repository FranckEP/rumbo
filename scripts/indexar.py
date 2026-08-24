# -*- coding: utf-8 -*-
"""
Construye el índice que consume la app a partir de los datos del SNIES.

No se puede importar programas.json (1,8 MB) al bundle: la app solo necesita
saber, para cada carrera y nivel, qué instituciones la ofrecen en qué
departamento. Eso se precalcula aquí y queda mucho más liviano.

Genera lib/snies/oferta.json:
  {
    "Psicología": {
      "profesional": {
        "Atlántico": ["1713", "2805", ...],
        ...
      },
      "_dur": { "profesional": 10 },      // duración mediana real, en semestres
      "_costo": { "profesional": 3900000 } // matrícula mediana, o 0 si no hay dato
    }
  }

Uso:  python scripts/indexar.py
"""
import json
import statistics
import sys
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
S = Path(__file__).resolve().parent.parent / "lib" / "snies"


# Rangos plausibles de duración por nivel, en semestres. El SNIES trae unos
# pocos errores de digitación (una "Tecnología en Actuación" de 27 semestres) y,
# aunque la mediana los aguanta, no tiene sentido dejarlos entrar.
PLAUSIBLE = {
    "profesional": (6, 14),
    "tecnologica": (3, 9),
    "tecnica": (1, 7),
}


def main():
    prog = json.loads((S / "programas.json").read_text(encoding="utf-8"))
    mapeo = json.loads((S / "mapeo.json").read_text(encoding="utf-8"))
    cod = {k: v for k, v in json.loads((S / "codigos.json").read_text(encoding="utf-8")).items()
           if not k.startswith("_")}
    enlaces = {k for k in json.loads((S / "enlaces.json").read_text(encoding="utf-8"))
               if not k.startswith("_")}
    con_enlace = set(cod.values()) | enlaces

    oferta = defaultdict(lambda: defaultdict(lambda: defaultdict(set)))
    duraciones = defaultdict(lambda: defaultdict(list))
    costos = defaultdict(lambda: defaultdict(list))
    sin_enlace = 0

    for p in prog:
        carrera = mapeo.get(p["n"])
        if not carrera:
            continue
        # Sin enlace no se puede mostrar: la ficha necesita a dónde mandar al joven.
        if p["ies"] not in con_enlace:
            sin_enlace += 1
            continue
        oferta[carrera][p["nivel"]][p["dep"]].add(p["ies"])
        lo, hi = PLAUSIBLE[p["nivel"]]
        if lo <= p["per"] <= hi:
            duraciones[carrera][p["nivel"]].append(p["per"])
        if p["costo"] > 0:
            costos[carrera][p["nivel"]].append(p["costo"])

    salida = {}
    for carrera, niveles in oferta.items():
        d = {}
        for nivel, deps in niveles.items():
            d[nivel] = {dep: sorted(ids) for dep, ids in sorted(deps.items())}
        d["_dur"] = {n: round(statistics.median(v))
                     for n, v in duraciones[carrera].items() if v}
        d["_costo"] = {n: round(statistics.median(v) / 100000) * 100000
                       for n, v in costos[carrera].items() if v}
        salida[carrera] = d

    (S / "oferta.json").write_text(
        json.dumps(salida, ensure_ascii=False, separators=(",", ":"), sort_keys=True),
        encoding="utf-8")

    total_ies = len({i for c in salida.values() for n, deps in c.items()
                     if not n.startswith("_") for ids in deps.values() for i in ids})
    kb = (S / "oferta.json").stat().st_size / 1024
    print(f"carreras con oferta:   {len(salida)}")
    print(f"instituciones usadas:  {total_ies}")
    print(f"programas descartados por no tener enlace: {sin_enlace}")
    print(f"-> lib/snies/oferta.json  {kb:,.0f} KB")

    print("\nejemplo (Psicología):")
    ps = salida.get("Psicología", {})
    print("  duración mediana:", ps.get("_dur"))
    print("  matrícula mediana:", ps.get("_costo"))
    for niv in ("profesional", "tecnologica", "tecnica"):
        if niv in ps:
            deps = ps[niv]
            print(f"  {niv}: {len(deps)} departamentos, "
                  f"{sum(len(v) for v in deps.values())} instituciones-depto")
            if "Atlántico" in deps:
                print(f"     Atlántico -> {len(deps['Atlántico'])} instituciones")


if __name__ == "__main__":
    main()
