
import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Flag,
  Fuel,
  Gauge,
  Radio,
  RotateCcw,
  Settings2,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import BakuCircuit from "./Bakucircuit.jsx";
import "./App.css";

const initialComments = [
  {
    id: 1,
    author: "Race Engineer",
    time: "DEMO",
    message:
      "Monitor tyre degradation before committing to the next stop.",
  },
  {
    id: 2,
    author: "Strategy AI",
    time: "ANALYSIS",
    message:
      "A safety car could create an opportunity to reduce pit-stop losses.",
  },
];

const baseTelemetry = [
  { lap: "10", pace: 99.8, wear: 18 },
  { lap: "15", pace: 100.4, wear: 25 },
  { lap: "20", pace: 101.2, wear: 33 },
  { lap: "25", pace: 102.1, wear: 42 },
  { lap: "30", pace: 103.4, wear: 51 },
  { lap: "35", pace: 104.2, wear: 62 },
  { lap: "40", pace: 105.6, wear: 73 },
];

function StatCard({ icon: Icon, label, value, detail, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-icon">
          <Icon size={19} />
        </span>
        <span className="stat-label">{label}</span>

        {trend && (
          <span
            className={`stat-trend ${
              trend === "up" ? "trend-up" : "trend-down"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={15} />
            ) : (
              <ArrowDownRight size={15} />
            )}
          </span>
        )}
      </div>

      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </div>
  );
}

function SectionHeading({ eyebrow, title, right }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {right}
    </div>
  );
}

export default function App() {
  const [currentLap, setCurrentLap] = useState(25);
  const [tyreWear, setTyreWear] = useState(42);
  const [fuel, setFuel] = useState(35);
  const [rain, setRain] = useState("Dry");
  const [safetyCar, setSafetyCar] = useState("No");
  const [tyre, setTyre] = useState("Medium");
  const [driver, setDriver] = useState("Driver 1");

  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const strategy = useMemo(() => {
    let pitLap = Math.min(currentLap + 4, 50);
    let compound = "Hard";
    let risk = "LOW";

    let explanation =
      "Tyre wear is manageable. Continue the current stint and plan a hard-tyre stop for the final part of the race.";

    if (tyreWear >= 70) {
      pitLap = Math.min(currentLap + 1, 50);
      risk = "HIGH";
      explanation =
        "Tyre wear is high. Consider an early pit stop to reduce the risk of losing lap time.";
    } else if (tyreWear >= 50) {
      pitLap = Math.min(currentLap + 2, 50);
      risk = "MEDIUM";
      explanation =
        "Tyre degradation is increasing. Prepare for a pit stop soon.";
    }

    if (safetyCar === "Yes") {
      pitLap = currentLap;
      risk = "LOW";
      explanation =
        "Safety car selected. Consider this opportunity to pit after checking tyre condition and competitor strategies.";
    }

    if (rain === "Wet") {
      compound = "Intermediate";
      explanation += " Wet conditions suggest intermediate tyres.";
    } else if (rain === "Heavy rain") {
      compound = "Wet";
      explanation += " Heavy rain suggests full wet tyres.";
    }

    if (fuel < 15) {
      risk = "HIGH";
      explanation += " Fuel reserve is low; review the fuel target.";
    }

    return { pitLap, compound, risk, explanation };
  }, [currentLap, tyreWear, fuel, rain, safetyCar]);

  const predictionResult = useMemo(() => {
    const remainingLaps = Math.max(0, 51 - currentLap);
    const pitLoss = safetyCar === "Yes" ? 12.5 : 22.0;

    let timeGain = 0.7;

    if (tyreWear >= 70) {
      timeGain = 2.4;
    } else if (tyreWear >= 50) {
      timeGain = 1.6;
    }

    if (rain !== "Dry") {
      timeGain += 0.3;
    }

    let action = "STAY OUT";
    let reason = "Tyre condition is currently manageable.";

    if (currentLap >= 50) {
      action = "FINAL LAP";
      reason = "The race is nearly complete.";
    } else if (fuel < 15) {
      action = "CHECK FUEL";
      reason = "Fuel is below the demonstration threshold.";
    } else if (safetyCar === "Yes") {
      action = "PIT NOW";
      reason = "The safety car may provide a lower-loss pit-stop opportunity.";
    } else if (tyreWear >= 70) {
      action = "PIT SOON";
      reason = "High tyre wear suggests considering an early stop.";
    } else if (tyreWear >= 50 || currentLap >= strategy.pitLap) {
      action = "PIT WINDOW";
      reason = "Prepare for a stop and compare estimated benefit with pit loss.";
    }

    let confidence = 80;

    if (tyreWear >= 70) {
      confidence = 91;
    } else if (tyreWear >= 50) {
      confidence = 86;
    }

    if (safetyCar === "Yes") confidence = 88;
    if (rain !== "Dry") confidence -= 5;
    if (fuel < 15) confidence = 65;

    confidence = Math.max(50, Math.min(95, confidence));

    return {
      remainingLaps,
      pitLoss,
      timeGain,
      action,
      reason,
      pitWindowStart: Math.max(1, strategy.pitLap - 1),
      pitWindowEnd: Math.min(50, strategy.pitLap + 1),
      confidence,
    };
  }, [currentLap, tyreWear, fuel, rain, safetyCar, strategy.pitLap]);

  const chartData = useMemo(
    () =>
      baseTelemetry.map((item) => ({
        ...item,
        wear: Math.max(
          0,
          Math.min(100, item.wear + (tyreWear - 42))
        ),
        pace: Number(
          (item.pace + (tyreWear - 42) * 0.025).toFixed(1)
        ),
      })),
    [tyreWear]
  );

  const lapEstimates = useMemo(() => {
    let fuelPerLap = 2.0;

    if (safetyCar === "Yes") {
      fuelPerLap = 1.2;
    } else if (rain !== "Dry") {
      fuelPerLap = 2.2;
    }

    let wearPerLap =
      currentLap > 0 ? tyreWear / currentLap : 0;

    if (rain !== "Dry") wearPerLap *= 0.85;
    if (safetyCar === "Yes") wearPerLap *= 0.6;

    return {
      fuelPerLap,
      fuelLapsRemaining: Math.floor(fuel / fuelPerLap),
      wearPerLap,
      predictedWearNext5: Math.min(
        100,
        tyreWear + wearPerLap * 5
      ),
    };
  }, [currentLap, tyreWear, fuel, rain, safetyCar]);

  function resetScenario() {
    setCurrentLap(25);
    setTyreWear(42);
    setFuel(35);
    setRain("Dry");
    setSafetyCar("No");
    setTyre("Medium");
    setDriver("Driver 1");
  }

  function addComment(event) {
    event.preventDefault();

    const message = newComment.trim();
    if (!message) return;

    setComments((previous) => [
      {
        id: Date.now(),
        author: "You",
        time: "JUST NOW",
        message,
      },
      ...previous,
    ]);

    setNewComment("");
  }

  function deleteComment(id) {
    setComments((previous) =>
      previous.filter((comment) => comment.id !== id)
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="GridBrain home">
          <span className="brand-mark">
            <Flag size={22} />
          </span>
          <span>
            <strong>GRIDBRAIN</strong>
            <small>F1 STRATEGY INTELLIGENCE</small>
          </span>
        </a>

        <nav className="main-nav">
          <a className="active" href="#home">Dashboard</a>
          <a href="#telemetry">Telemetry</a>
          <a href="#strategy">Strategy</a>
          <a href="#comments">Comments</a>
        </nav>

        <div className="topbar-status">
          <span className="live-dot" />
          <span>SIMULATION MODE</span>
        </div>
      </header>

      <main id="home" className="dashboard">
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="live-pill">LIVE SIMULATION</span>
              <span className="muted">ROUND 04 / RACE CONTROL</span>
            </div>

            <h1>
              THINK FASTER.
              <br />
              <span>RACE SMARTER.</span>
            </h1>

            <p>
              Your virtual pit wall. Adjust race conditions, analyse
              telemetry, and explore data-driven pit-stop decisions.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#strategy">
                <Zap size={17} />
                View Strategy
              </a>
              <a className="secondary-button" href="#telemetry">
                <Activity size={17} />
                Explore Telemetry
              </a>
            </div>

            <div className="hero-metrics">
              <div>
                <strong>01</strong>
                <span>STRATEGY ENGINE</span>
              </div>
              <div>
                <strong>04</strong>
                <span>SCENARIO INPUTS</span>
              </div>
              <div>
                <strong>∞</strong>
                <span>RACE POSSIBILITIES</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-grid" />
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-number">01</div>

            <div className="hero-car-label">
              <span className="live-dot" />
              STRATEGY CAR / {driver.toUpperCase()}
            </div>

            <img
              className="hero-car"
              src="/f1-car.png"
              alt="Formula racing car"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <div className="hero-visual-bottom">
              <span>RACE CONTROL</span>
              <strong>OPTIMISE EVERY LAP.</strong>
            </div>
          </div>
        </section>

        <section className="race-strip">
          <div className="race-strip-item">
            <span className="strip-icon"><Flag size={17} /></span>
            <span>
              <small>SESSION</small>
              <strong>Grand Prix Simulation</strong>
            </span>
          </div>

          <div className="race-strip-item">
            <span className="strip-icon"><Gauge size={17} /></span>
            <span>
              <small>CIRCUIT</small>
              <strong>Baku City Circuit</strong>
            </span>
          </div>

          <div className="race-strip-item">
            <span className="strip-icon"><Radio size={17} /></span>
            <span>
              <small>TRACK STATUS</small>
              <strong className="green-text">Operational</strong>
            </span>
          </div>

          <div className="race-strip-item">
            <span className="strip-icon"><Timer size={17} /></span>
            <span>
              <small>CURRENT LAP</small>
              <strong>{currentLap} / 51</strong>
            </span>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            icon={Timer}
            label="CURRENT LAP"
            value={`${currentLap} / 51`}
            detail="Race progress"
          />
          <StatCard
            icon={Activity}
            label="TYRE WEAR"
            value={`${tyreWear}%`}
            detail={tyreWear >= 70 ? "Critical degradation" : "Estimated wear"}
            trend={tyreWear >= 50 ? "up" : undefined}
          />
          <StatCard
            icon={Fuel}
            label="FUEL REMAINING"
            value={`${fuel}%`}
            detail={fuel < 15 ? "Low fuel reserve" : "Estimated fuel"}
          />
          <StatCard
            icon={Zap}
            label="STRATEGY RISK"
            value={strategy.risk}
            detail="Scenario-based estimate"
          />
        </section>

        <section className="content-grid">
          <BakuCircuit
            currentLap={currentLap}
            totalLaps={51}
            tyreWear={tyreWear}
            fuel={fuel}
            pitLap={strategy.pitLap}
          />

          <section className="panel scenario-panel" id="strategy">
            <SectionHeading
              eyebrow="RACE CONTROL"
              title="Scenario Simulator"
              right={<Settings2 size={20} className="heading-icon" />}
            />

            <p className="panel-description">
              Change the conditions to see how the suggested strategy responds.
            </p>

            <div className="control-group">
              <div className="control-title">
                <label htmlFor="lap">Current lap</label>
                <strong>{currentLap}</strong>
              </div>
              <input
                id="lap"
                type="range"
                min="1"
                max="50"
                value={currentLap}
                onChange={(event) =>
                  setCurrentLap(Number(event.target.value))
                }
              />
              <div className="range-labels">
                <span>Lap 1</span>
                <span>Lap 50</span>
              </div>
            </div>

            <div className="control-group">
              <div className="control-title">
                <label htmlFor="wear">Tyre wear</label>
                <strong>{tyreWear}%</strong>
              </div>
              <input
                id="wear"
                type="range"
                min="0"
                max="100"
                value={tyreWear}
                onChange={(event) =>
                  setTyreWear(Number(event.target.value))
                }
              />
              <div className="range-labels">
                <span>Fresh tyres</span>
                <span>Worn tyres</span>
              </div>
            </div>

            <div className="control-group">
              <div className="control-title">
                <label htmlFor="fuel">Fuel remaining</label>
                <strong>{fuel}%</strong>
              </div>
              <input
                id="fuel"
                type="range"
                min="0"
                max="100"
                value={fuel}
                onChange={(event) =>
                  setFuel(Number(event.target.value))
                }
              />
              <div className="range-labels">
                <span>Empty</span>
                <span>Full</span>
              </div>
            </div>

            <div className="two-controls">
              <div className="select-control">
                <label htmlFor="rain">Weather</label>
                <select
                  id="rain"
                  value={rain}
                  onChange={(event) => setRain(event.target.value)}
                >
                  <option>Dry</option>
                  <option>Wet</option>
                  <option>Heavy rain</option>
                </select>
              </div>

              <div className="select-control">
                <label htmlFor="safety">Safety car</label>
                <select
                  id="safety"
                  value={safetyCar}
                  onChange={(event) => setSafetyCar(event.target.value)}
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>

            <div className="two-controls">
              <div className="select-control">
                <label htmlFor="tyre">Current tyre</label>
                <select
                  id="tyre"
                  value={tyre}
                  onChange={(event) => setTyre(event.target.value)}
                >
                  <option>Soft</option>
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Intermediate</option>
                  <option>Wet</option>
                </select>
              </div>

              <div className="select-control">
                <label htmlFor="driver">Driver</label>
                <select
                  id="driver"
                  value={driver}
                  onChange={(event) => setDriver(event.target.value)}
                >
                  <option>Driver 1</option>
                  <option>Driver 2</option>
                </select>
              </div>
            </div>

            <button
              className="reset-button"
              onClick={resetScenario}
              type="button"
            >
              <RotateCcw size={16} />
              Reset scenario
            </button>
          </section>
        </section>

        <section className="telemetry-section" id="telemetry">
          <SectionHeading
            eyebrow="PERFORMANCE ANALYTICS"
            title="Race Telemetry"
            right={
              <span className="chart-tag">
                <span className="live-dot" />
                SIMULATED DATA
              </span>
            }
          />

          <div className="chart-grid">
            <section className="panel chart-panel">
              <div className="chart-heading">
                <div>
                  <h3>Lap Pace Evolution</h3>
                  <p className="muted">Illustrative lap pace across the race</p>
                </div>
                <span className="chart-unit">SECONDS</span>
              </div>

              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="#27272f" strokeDasharray="4 4" />
                    <XAxis dataKey="lap" stroke="#777986" tickLine={false} />
                    <YAxis
                      stroke="#777986"
                      tickLine={false}
                      domain={["dataMin - 1", "dataMax + 1"]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#15151b",
                        border: "1px solid #393943",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pace"
                      name="Lap pace"
                      stroke="#ff3939"
                      strokeWidth={3}
                      dot={{ fill: "#ff3939", r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="panel chart-panel">
              <div className="chart-heading">
                <div>
                  <h3>Tyre Degradation</h3>
                  <p className="muted">Estimated tyre wear progression</p>
                </div>
                <span className="chart-unit">WEAR %</span>
              </div>

              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="wearGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#ff3939" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#ff3939" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#27272f" strokeDasharray="4 4" />
                    <XAxis dataKey="lap" stroke="#777986" tickLine={false} />
                    <YAxis
                      stroke="#777986"
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#15151b",
                        border: "1px solid #393943",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="wear"
                      name="Tyre wear"
                      stroke="#ff3939"
                      fill="url(#wearGradient)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </section>

        <section className="strategy-results">
          <SectionHeading
            eyebrow="DECISION SUPPORT"
            title="Pit Wall Recommendation"
            right={
              <span className="ai-tag">
                <Zap size={14} />
                RULE-BASED AI DEMO
              </span>
            }
          />

          <div className="recommendation-grid">
            <div className="panel recommendation-main">
              <div className="recommendation-top">
                <span className="recommendation-icon">
                  <Trophy size={22} />
                </span>
                <span className="recommendation-status">
                  RECOMMENDED ACTION
                </span>
              </div>

              <h3>
                {safetyCar === "Yes"
                  ? "Consider pitting now"
                  : `Plan pit stop on lap ${strategy.pitLap}`}
              </h3>

              <p>{strategy.explanation}</p>

              <div className="recommendation-stats">
                <div>
                  <small>PLANNED PIT LAP</small>
                  <strong>{strategy.pitLap}</strong>
                </div>
                <div>
                  <small>NEXT TYRE</small>
                  <strong>{strategy.compound}</strong>
                </div>
                <div>
                  <small>RISK LEVEL</small>
                  <strong
                    className={
                      strategy.risk === "HIGH"
                        ? "red-text"
                        : strategy.risk === "MEDIUM"
                          ? "amber-text"
                          : "green-text"
                    }
                  >
                    {strategy.risk}
                  </strong>
                </div>
              </div>

              <div className="dummy-results">
                <div className="dummy-results-heading">
                  <div>
                    <p className="eyebrow">INPUT-BASED PREDICTION</p>
                    <h3>Predicted Race Outcome</h3>
                  </div>
                  <span className="ai-tag">DEMO MODEL</span>
                </div>

                <div className="dummy-status">
                  <span>Recommended action</span>
                  <strong>{predictionResult.action}</strong>
                </div>

                <p className="prediction-reason">
                  {predictionResult.reason}
                </p>

                <div className="dummy-results-grid">
                  <div className="dummy-result-card">
                    <span>Current lap</span>
                    <strong>{currentLap} / 51</strong>
                    <small>{predictionResult.remainingLaps} laps remaining</small>
                  </div>

                  <div className="dummy-result-card">
                    <span>Estimated fuel per lap</span>
                    <strong>{lapEstimates.fuelPerLap.toFixed(2)}%</strong>
                    <small>Of fuel capacity per lap</small>
                  </div>

                  <div className="dummy-result-card">
                    <span>Estimated fuel range</span>
                    <strong>{lapEstimates.fuelLapsRemaining} laps</strong>
                    <small>At estimated consumption</small>
                  </div>

                  <div className="dummy-result-card">
                    <span>Estimated tyre wear per lap</span>
                    <strong>{lapEstimates.wearPerLap.toFixed(2)}%</strong>
                    <small>Tyre life lost per lap</small>
                  </div>

                  <div className="dummy-result-card">
                    <span>Tyre wear after 5 laps</span>
                    <strong>{lapEstimates.predictedWearNext5.toFixed(1)}%</strong>
                    <small>Projected total tyre wear</small>
                  </div>

                  <div className="dummy-result-card">
                    <span>Recommended pit lap</span>
                    <strong>{strategy.pitLap}</strong>
                    <small>Suggested stop lap</small>
                  </div>

                  <div className="dummy-result-card">
                    <span>Next tyre compound</span>
                    <strong>{strategy.compound}</strong>
                    <small>Based on weather rules</small>
                  </div>

                  <div className="dummy-result-card">
                    <span>Estimated pit loss</span>
                    <strong>{predictionResult.pitLoss.toFixed(1)} s</strong>
                    <small>Illustrative time loss</small>
                  </div>

                  <div className="dummy-result-card">
                    <span>Potential time benefit</span>
                    <strong>+{predictionResult.timeGain.toFixed(1)} s</strong>
                    <small>Estimated per-lap benefit</small>
                  </div>

                  <div className="dummy-result-card">
                    <span>Prediction confidence</span>
                    <strong>{predictionResult.confidence}%</strong>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${predictionResult.confidence}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="prediction-window">
                  <span>Suggested pit window</span>
                  <strong>
                    Lap {predictionResult.pitWindowStart}–{predictionResult.pitWindowEnd}
                  </strong>
                </div>

                <p className="disclaimer">
                  These results use simplified rules and illustrative values.
                  Confidence is not a validated probability.
                </p>
              </div>

              <p className="disclaimer">
                Educational prototype only. This is a simplified simulation,
                not live F1 telemetry or a professional race strategy model.
              </p>
            </div>

            <div className="panel strategy-checklist">
              <h3>Strategist Checklist</h3>

              <div className="checklist-item">
                <span className={`check-dot ${tyreWear >= 70 ? "danger" : ""}`} />
                <div>
                  <strong>Tyre condition</strong>
                  <small>
                    {tyreWear >= 70
                      ? "Critical — consider stopping"
                      : "Continue monitoring degradation"}
                  </small>
                </div>
              </div>

              <div className="checklist-item">
                <span className={`check-dot ${fuel < 15 ? "danger" : ""}`} />
                <div>
                  <strong>Fuel reserve</strong>
                  <small>
                    {fuel < 15
                      ? "Low — review fuel target"
                      : "Fuel within demo threshold"}
                  </small>
                </div>
              </div>

              <div className="checklist-item">
                <span className={`check-dot ${safetyCar === "Yes" ? "warning" : ""}`} />
                <div>
                  <strong>Safety car</strong>
                  <small>
                    {safetyCar === "Yes"
                      ? "Active — pit window may change"
                      : "No safety car selected"}
                  </small>
                </div>
              </div>

              <div className="checklist-item">
                <span className={`check-dot ${rain !== "Dry" ? "warning" : ""}`} />
                <div>
                  <strong>Weather</strong>
                  <small>
                    {rain === "Dry" ? "Dry track selected" : `${rain} conditions selected`}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel radio-panel" id="comments">
          <SectionHeading
            eyebrow="COMMUNITY & FEEDBACK"
            title="Comments & Feedback"
            right={
              <span className="radio-status">
                <Radio size={14} />
                LOCAL DEMO
              </span>
            }
          />

          <p className="panel-description">
            Share race strategy ideas, feedback, or suggestions for improving
            the GridBrain F1 dashboard.
          </p>

          <form className="comment-form" onSubmit={addComment}>
            <input
              type="text"
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Write your comment or feedback..."
              aria-label="Write your comment or feedback"
              maxLength={240}
              required
            />
            <button type="submit">Post Comment</button>
          </form>

          <div className="comments-summary">
            <strong>{comments.length} Comments</strong>
            <span>Strategy discussion</span>
          </div>

          <div className="comment-list">
            {comments.length === 0 ? (
              <div className="empty-comments">
                <Radio size={25} />
                <h3>No comments yet</h3>
                <p>Be the first to share your feedback!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <article className="comment-item" key={comment.id}>
                  <div className="comment-avatar">
                    {comment.author === "You"
                      ? "Y"
                      : comment.author === "Strategy AI"
                        ? "AI"
                        : "RE"}
                  </div>

                  <div className="comment-body">
                    <div className="comment-meta">
                      <strong>{comment.author}</strong>
                      <span>{comment.time}</span>
                    </div>
                    <p>{comment.message}</p>

                    {comment.author === "You" && (
                      <button
                        type="button"
                        className="delete-comment"
                        onClick={() => deleteComment(comment.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <footer className="footer">
          <a className="footer-brand" href="#home">
            GRIDBRAIN <span>F1</span>
          </a>
          <p>Built for racing strategy exploration and hackathon demonstration.</p>
          <span className="footer-rights">
            © {new Date().getFullYear()} GridBrain F1. All Rights Reserved.
          </span>
        </footer>
      </main>
    </div>
  );
}
