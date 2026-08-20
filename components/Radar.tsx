import { DIMS, DIM_KEYS, type DimKey, type Scores } from "@/lib/riasec";

const SIZE = 340;
const R_MAX = 118;
const CX = SIZE / 2;
const CY = SIZE / 2 + 6;

const angle = (i: number) => (Math.PI * 2 * i) / 6 - Math.PI / 2;
const pt = (i: number, r: number): [number, number] => [
  CX + Math.cos(angle(i)) * r,
  CY + Math.sin(angle(i)) * r,
];

interface Props {
  n: Scores;
  ready: boolean;
  hovered: DimKey | null;
  onHover: (dim: DimKey | null) => void;
}

export default function Radar({ n, ready, hovered, onHover }: Props) {
  const shape = DIM_KEYS.map((k, i) => pt(i, Math.max(R_MAX * n[k], 3)).join(",")).join(" ");

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      role="img"
      aria-label="Gráfico radar de tu perfil RIASEC"
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={DIM_KEYS.map((_, i) => pt(i, R_MAX * f).join(",")).join(" ")}
          fill="none"
          stroke="var(--line)"
          strokeWidth="1"
        />
      ))}

      {DIM_KEYS.map((_, i) => {
        const [x, y] = pt(i, R_MAX);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />;
      })}

      <g className={`radar-shape${ready ? " ready" : ""}`} style={{ transformOrigin: `${CX}px ${CY}px` }}>
        <polygon
          points={shape}
          fill="var(--accent)"
          fillOpacity="0.16"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {DIM_KEYS.map((k, i) => {
          const [x, y] = pt(i, Math.max(R_MAX * n[k], 3));
          const isHovered = hovered === k;
          return (
            <g key={k}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 15 : 11}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => onHover(k)}
                onMouseLeave={() => onHover(null)}
              />
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 6 : 4}
                fill={DIMS[k].color}
                style={{ transition: "r .15s ease", pointerEvents: "none" }}
              />
              {isHovered && (
                <text
                  x={x}
                  y={y - 13}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                  fontSize="12"
                  fill={DIMS[k].color}
                  style={{ pointerEvents: "none" }}
                >
                  {Math.round(n[k] * 100)}%
                </text>
              )}
            </g>
          );
        })}
      </g>

      {DIM_KEYS.map((k, i) => {
        const [lx, ly] = pt(i, R_MAX + 26);
        const isHovered = hovered === k;
        return (
          <g
            key={`label-${k}`}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHover(k)}
            onMouseLeave={() => onHover(null)}
          >
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="var(--font-display)"
              fontWeight="800"
              fontSize={isHovered ? 17 : 15}
              fill={DIMS[k].color}
              style={{ transition: "font-size .15s ease" }}
            >
              {k}
            </text>
            <text
              x={lx}
              y={ly + 15}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill={isHovered ? DIMS[k].color : "var(--ink-faint)"}
            >
              {DIMS[k].name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
