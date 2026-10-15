
import React from "react";
import "./BakuCircuit.css";

export default function BakuCircuit({
  currentLap = 25,
  totalLaps = 51,
  tyreWear = 42,
  fuel = 35,
  pitLap = 29,
}) {
  const progress = Math.max(
    0,
    Math.min(100, (currentLap / totalLaps) * 100)
  );

  // Illustrative circuit route coordinates.
  // The car follows this SVG path continuously.
  const trackPath = `
    M 65 100
    L 130 65
    L 220 75
    L 300 60
    L 410 72
    L 475 100
    L 450 140
    L 490 175
    L 440 205
    L 365 220
    L 320 265
    L 225 275
    L 180 245
    L 115 250
    L 75 210
    L 85 160
    L 45 130
    Z
  `;

  return (
    <section className="live-circuit-panel neon-circuit">
      {/* Header */}
      <header className="live-circuit-header">
        <div>
          <span className="live-circuit-eyebrow">
            GRIDBRAIN F1 / CIRCUIT TRACKING
          </span>
          <h2>Baku City Circuit</h2>
          <p>Azerbaijan Grand Prix · Simulated race tracking</p>
        </div>

        <div className="live-indicator">
          <span className="live-dot" />
          SIMULATION LIVE
        </div>
      </header>

      {/* Circuit background and animated route */}
      <div className="live-circuit-map">
        <div className="circuit-background" />

        <svg
          className="circuit-overlay"
          viewBox="0 0 540 320"
          role="img"
          aria-label="Illustrative Baku circuit with moving race car"
        >
          <defs>
            <linearGradient
              id="bakuRouteGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#ff244f" />
              <stop offset="50%" stopColor="#ff6048" />
              <stop offset="100%" stopColor="#ffae55" />
            </linearGradient>

            <filter id="bakuGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dark translucent surface improves contrast */}
          <rect
            width="540"
            height="320"
            fill="#070913"
            fillOpacity="0.16"
          />

          {/* Track outer edge */}
          <path
            d={trackPath}
            fill="none"
            stroke="#71bfff"
            strokeWidth="15"
            strokeOpacity="0.45"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Track surface */}
          <path
            d={trackPath}
            fill="none"
            stroke="#141722"
            strokeWidth="11"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Glowing racing line */}
          <path
            d={trackPath}
            fill="none"
            stroke="url(#bakuRouteGradient)"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#bakuGlow)"
          />

          {/* Animated dashed racing line */}
          <path
            d={trackPath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="5 12"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="racing-dashes"
          />

          {/* Start / finish marker */}
          <g transform="translate(65 100)">
            <circle
              r="10"
              fill="#10121b"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="3"
              fill="#ffffff"
              fontSize="8"
              textAnchor="middle"
              fontWeight="bold"
            >
              S/F
            </text>
          </g>

          <text
            x="78"
            y="88"
            fill="#ffffff"
            fontSize="9"
            fontWeight="bold"
          >
            START / FINISH
          </text>

          {/* Pit lane marker */}
          <g transform="translate(108 143)">
            <circle
              r="10"
              fill="#211a08"
              stroke="#ffc04a"
              strokeWidth="2"
            />
            <text
              x="0"
              y="3"
              fill="#ffc04a"
              fontSize="10"
              textAnchor="middle"
              fontWeight="bold"
            >
              P
            </text>
          </g>

          {/* Turn markers */}
          {[
            { x: 130, y: 65, label: "T1" },
            { x: 300, y: 60, label: "T2" },
            { x: 475, y: 100, label: "T3" },
            { x: 490, y: 175, label: "T4" },
            { x: 320, y: 265, label: "T5" },
            { x: 115, y: 250, label: "T6" },
          ].map((turn) => (
            <g key={turn.label}>
              <circle
                cx={turn.x}
                cy={turn.y}
                r="8"
                fill="#11121c"
                stroke="#ff596b"
                strokeWidth="1.5"
              />
              <text
                x={turn.x}
                y={turn.y + 3}
                fill="#ffffff"
                fontSize="7"
                textAnchor="middle"
              >
                {turn.label}
              </text>
            </g>
          ))}

          {/* Animated car */}
          <g>
            <circle r="13" fill="#ff244f" opacity="0.25">
              <animate
                attributeName="r"
                values="9;17;9"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Car body */}
            <g>
              <rect
                x="-10"
                y="-5"
                width="20"
                height="10"
                rx="3"
                fill="#ff244f"
                stroke="#ffffff"
                strokeWidth="1"
              />

              <rect
                x="-3"
                y="-3"
                width="7"
                height="6"
                rx="1"
                fill="#10121b"
              />

              <rect
                x="-8"
                y="-7"
                width="5"
                height="3"
                rx="1"
                fill="#ffffff"
              />
              <rect
                x="3"
                y="-7"
                width="5"
                height="3"
                rx="1"
                fill="#ffffff"
              />
              <rect
                x="-8"
                y="4"
                width="5"
                height="3"
                rx="1"
                fill="#ffffff"
              />
              <rect
                x="3"
                y="4"
                width="5"
                height="3"
                rx="1"
                fill="#ffffff"
              />
            </g>

            <animateMotion
              dur="20s"
              repeatCount="indefinite"
              rotate="auto"
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="linear"
            >
              <mpath href="#bakuCarRoute" />
            </animateMotion>
          </g>

          {/* Path for the animated car */}
          <path
            id="bakuCarRoute"
            d={trackPath}
            fill="none"
            stroke="none"
          />

          <text
            x="270"
            y="153"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="17"
            fontWeight="bold"
            letterSpacing="3"
          >
            BAKU
          </text>

          <text
            x="270"
            y="170"
            textAnchor="middle"
            fill="#c0c5d8"
            fontSize="9"
            letterSpacing="2"
          >
            CITY CIRCUIT
          </text>
        </svg>

        <div className="circuit-lap-badge">
          <span>CURRENT LAP</span>
          <strong>
            {currentLap} <small>/ {totalLaps}</small>
          </strong>
        </div>

        <div className="circuit-pit-badge">
          <span>NEXT PIT STOP</span>
          <strong>Lap {pitLap}</strong>
        </div>
      </div>

      {/* Race progress */}
      <div className="live-circuit-progress">
        <div className="live-circuit-progress-label">
          <span>Race progress</span>
          <strong>{progress.toFixed(0)}%</strong>
        </div>

        <div className="live-progress-track">
          <div
            className="live-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Telemetry cards */}
      <div className="live-circuit-stats">
        <div>
          <span>FUEL REMAINING</span>
          <strong>{fuel}%</strong>
          <div className="telemetry-bar">
            <div
              className="telemetry-bar-fill fuel-fill"
              style={{ width: `${Math.max(0, Math.min(100, fuel))}%` }}
            />
          </div>
        </div>

        <div>
          <span>TYRE WEAR</span>
          <strong>{tyreWear}%</strong>
          <div className="telemetry-bar">
            <div
              className="telemetry-bar-fill wear-fill"
              style={{
                width: `${Math.max(0, Math.min(100, tyreWear))}%`,
              }}
            />
          </div>
        </div>

        <div>
          <span>PLANNED PIT LAP</span>
          <strong>Lap {pitLap}</strong>
          <small>Strategy estimate</small>
        </div>
      </div>

      <p className="live-circuit-note">
        Simulated circuit visualization. The animated car moves
        independently of the selected lap and does not use live F1
        telemetry.
      </p>
    </section>
  );
}
