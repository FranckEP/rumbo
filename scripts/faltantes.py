# -*- coding: utf-8 -*-
"""
Lista las instituciones del SNIES que todavía no tienen enlace verificado,
ordenadas por cuántos programas de pregrado ofrecen: resolver primero las que
más pesan da más cobertura por cada búsqueda.

Uso:  python scripts/faltantes.py [cuántas mostrar]
"""
import json, sys
from collections import Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
S = Path(__file__).resolve().parent.parent / "lib" / "snies"

cod = {k: v for k, v in json.loads((S / "codigos.json").read_text(encoding="utf-8")).items()
       if not k.startswith("_")}
ies = json.loads((S / "instituciones.json").read_text(encoding="utf-8"))
prog = json.loads((S / "programas.json").read_text(encoding="utf-8"))
n = Counter(p["ies"] for p in prog)

extra = {k: v for k, v in json.loads((S / "enlaces.json").read_text(encoding="utf-8")).items()
         if not k.startswith("_")}
conocidos = set(cod.values()) | set(extra)
faltan = sorted((i for i in ies if i["id"] not in conocidos), key=lambda i: -n[i["id"]])

(S / "faltantes.json").write_text(
    json.dumps([{**{k: i[k] for k in ("id", "nombre", "sector", "deps")},
                 "programas": n[i["id"]]} for i in faltan],
               ensure_ascii=False, indent=1), encoding="utf-8")

cub = sum(n[c] for c in conocidos)
print(f"  de universities.ts: {len(set(cod.values())):>3} · nuevas del SNIES: {len(extra):>3}")
print(f"Con enlace:      {len(conocidos):>3} instituciones · {cub} programas ({cub*100//len(prog)}%)")
print(f"Sin enlace:      {len(faltan):>3} instituciones · {len(prog)-cub} programas")
top = int(sys.argv[1]) if len(sys.argv) > 1 else 20
print(f"\nPrioridad (las {top} que más programas ofrecen):")
for i in faltan[:top]:
    deps = ", ".join(i["deps"][:2]) + ("…" if len(i["deps"]) > 2 else "")
    print(f'  {n[i["id"]]:>4} · [{i["id"]}] {i["nombre"][:52]:<52} {i["sector"]:<8} {deps}')
