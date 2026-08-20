import { DIMS, PROFILE_TITLES, type DimKey } from "@/lib/riasec";

interface Props {
  code: DimKey[];
  topCareer?: { n: string; match: number };
  hoverDim: DimKey | null;
  onHover: (k: DimKey | null) => void;
}

/** Resumen siempre visible: quién eres y tu mejor match, sin volver a subir. */
export default function SummaryBar({ code, topCareer, hoverDim, onHover }: Props) {
  return (
    <div className="summary-bar">
      <div className="summary-id">
        <div className="summary-letters">
          {code.map((k) => (
            <span
              key={k}
              className={`summary-letter${hoverDim === k ? " hovered" : ""}`}
              style={{ background: DIMS[k].soft, color: DIMS[k].color }}
              title={DIMS[k].name}
              onMouseEnter={() => onHover(k)}
              onMouseLeave={() => onHover(null)}
            >
              {k}
            </span>
          ))}
        </div>
        <div className="summary-text">
          <b>
            {PROFILE_TITLES[code[0]]}
            {code[1] ? ` · ${DIMS[code[1]].name}` : ""}
          </b>
          <em>Código Holland {code.join("-")}</em>
        </div>
      </div>

      {topCareer && (
        <div className="summary-match">
          <span className="eyebrow">Tu mejor match</span>
          <b>
            {topCareer.n} · {Math.round(topCareer.match * 100)}%
          </b>
        </div>
      )}
    </div>
  );
}
