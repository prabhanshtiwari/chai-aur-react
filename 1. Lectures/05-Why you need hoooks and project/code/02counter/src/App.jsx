import { useState } from "react";

const styles = {
  body: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fdf6eb",
    fontFamily: "'DM Mono', monospace",
    margin: 0,
  },
  card: {
    background: "white",
    border: "1px solid #e8d5b0",
    borderRadius: "4px",
    padding: "56px 64px",
    width: "400px",
    position: "relative",
    boxShadow: "8px 8px 0px #f0d4a6, 16px 16px 40px rgba(196,123,43,0.08)",
  },
  label: {
    fontSize: "10px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#c47b2b",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  labelLine: {
    flex: 1,
    height: "1px",
    background: "#f0d4a6",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "32px",
    fontWeight: 900,
    color: "#1a1208",
    lineHeight: 1.1,
    marginBottom: "40px",
    letterSpacing: "-0.02em",
  },
  titleSpan: {
    color: "#c47b2b",
  },
  counterLabel: {
    fontSize: "10px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#b0956a",
    marginBottom: "12px",
  },
  counterDisplay: (animClass) => ({
    fontFamily: "'Playfair Display', serif",
    fontSize: "80px",
    fontWeight: 700,
    color: animClass === "bump" ? "#c47b2b" : animClass === "dip" ? "#c94a1e" : "#1a1208",
    lineHeight: 1,
    letterSpacing: "-0.04em",
    display: "inline-block",
    transform: animClass === "bump" ? "scale(1.15)" : animClass === "dip" ? "scale(0.9)" : "scale(1)",
    transition: "all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
  }),
  progressTrack: {
    height: "3px",
    background: "#e8d5b0",
    borderRadius: "2px",
    marginTop: "16px",
    overflow: "hidden",
  },
  progressFill: (count) => ({
    height: "100%",
    background: "linear-gradient(90deg, #8b5210, #c47b2b)",
    borderRadius: "2px",
    width: `${(count / 20) * 100}%`,
    transition: "width 0.3s ease",
  }),
  progressBounds: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "9px",
    color: "#c0a87a",
    letterSpacing: "0.1em",
    marginTop: "6px",
  },
  maxTag: (show) => ({
    fontSize: "9px",
    letterSpacing: "0.15em",
    color: "#c94a1e",
    opacity: show ? 1 : 0,
    transition: "opacity 0.2s",
    fontFamily: "'DM Mono', monospace",
    textTransform: "uppercase",
  }),
  buttons: {
    display: "flex",
    gap: "12px",
    marginTop: "40px",
  },
  btnIncrease: (disabled) => ({
    flex: 1,
    padding: "14px 20px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Mono', monospace",
    fontSize: "12px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    borderRadius: "2px",
    background: "#c47b2b",
    color: "white",
    boxShadow: "3px 3px 0 #8b5210",
    opacity: disabled ? 0.3 : 1,
    transition: "all 0.15s ease",
  }),
  btnDecrease: (disabled) => ({
    flex: 1,
    padding: "14px 20px",
    border: "1px solid #e8d5b0",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Mono', monospace",
    fontSize: "12px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    borderRadius: "2px",
    background: "white",
    color: "#1a1208",
    boxShadow: "3px 3px 0 #e8d5b0",
    opacity: disabled ? 0.3 : 1,
    transition: "all 0.15s ease",
  }),
};

function App() {
  const [counter, setCounter] = useState(0);
  const [anim, setAnim] = useState("");

  const triggerAnim = (type) => {
    setAnim(type);
    setTimeout(() => setAnim(""), 300);
  };

  const increase = () => {
    if (counter < 20) {
      setCounter((c) => c + 1);
      triggerAnim("bump");
    }
  };

  const decrease = () => {
    if (counter > 0) {
      setCounter((c) => c - 1);
      triggerAnim("dip");
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div style={styles.body}>
        <div style={styles.card}>
          <div style={styles.label}>
            React Project
            <span style={styles.labelLine} />
          </div>

          <h1 style={styles.title}>
            Chai aur <span style={styles.titleSpan}>React</span>
          </h1>

          <div>
            <div style={styles.counterLabel}>Counter Value</div>
            <div style={styles.counterDisplay(anim)}>{counter}</div>

            <div style={styles.progressTrack}>
              <div style={styles.progressFill(counter)} />
            </div>

            <div style={styles.progressBounds}>
              <span>0</span>
              <span style={styles.maxTag(counter >= 20)}>MAX</span>
              <span>20</span>
            </div>
          </div>

          <div style={styles.buttons}>
            <button
              style={styles.btnDecrease(counter <= 0)}
              onClick={decrease}
              disabled={counter <= 0}
            >
              − Decrease
            </button>
            <button
              style={styles.btnIncrease(counter >= 20)}
              onClick={increase}
              disabled={counter >= 20}
            >
              + Increase
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;