import { DIMS, type DimKey } from "@/lib/riasec";
import { useCountUp } from "@/lib/useCountUp";

interface Props {
  dim: DimKey;
  pct: number;
  active: boolean;
  hovered: boolean;
  onHover: (dim: DimKey | null) => void;
}

export default function DimBar({ dim, pct, active, hovered, onHover }: Props) {
  const d = DIMS[dim];
  const shown = useCountUp(pct, active);

  return (
    <div
      className={`bar-row${hovered ? " hovered" : ""}`}
      onMouseEnter={() => onHover(dim)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(dim)}
      onBlur={() => onHover(null)}
      tabIndex={0}
      role="img"
      aria-label={`${d.name}: ${pct} por ciento`}
    >
      <span className="bl" style={{ background: d.soft, color: d.color }}>
        {dim}
      </span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: active ? `${pct}%` : "0%", background: d.color }} />
      </div>
      <span className="bar-pct">{shown}%</span>
    </div>
  );
}
