import { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import "./index.css";

export default function App() {
  const [currentNumber, setCurrentNumber] = useState("0000");
  const [spinning, setSpinning] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const [minNumber, setMinNumber] = useState(2000);
  const [maxNumber, setMaxNumber] = useState(2500);
  const [rangeError, setRangeError] = useState("");
  const [history, setHistory] = useState([]);

  const [firstWinner, setFirstWinner] = useState(null);
  const [firstWinnerUsed, setFirstWinnerUsed] = useState(false);

  const spinSound = useRef(null);
  const celebrateSound = useRef(null);

  // Track window size for Confetti
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get first winner from backend
  useEffect(() => {
    async function fetchWinner() {
      try {
        const res = await fetch("/get-winner");
        const data = await res.json();
        if (data.number) {
          setFirstWinner(data.number.padStart(4, "0"));
        }
      } catch (err) {
        console.log("⚠️ Backend not connected, running locally.");
      }
    }
    fetchWinner();
  }, []);

  const validateRange = () => {
    if (minNumber > maxNumber) {
      setRangeError("⚠️ Min cannot be greater than Max");
      return false;
    }
    if (minNumber < 0 || maxNumber > 9999) {
      setRangeError("⚠️ Values must be between 0 and 9999");
      return false;
    }
    setRangeError("");
    return true;
  };

  const spin = async () => {
    if (spinning || !validateRange()) return;

    setSpinning(true);
    setCelebrate(false);

    spinSound.current?.play();

    try {
      let finalNumber;
      const res = await fetch("/get-winner");
      const data = await res.json();

      if (data.number && !firstWinnerUsed) {
        finalNumber = data.number.padStart(4, "0");
        setFirstWinnerUsed(true);
      } else {
        finalNumber = String(
          Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber)
        ).padStart(4, "0");
      }

      animateResult(finalNumber);
    } catch {
      const fallback = String(
        Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber)
      ).padStart(4, "0");
      animateResult(fallback);
    }
  };

  const animateResult = (finalNumber) => {
    setCurrentNumber(finalNumber);
    setTimeout(() => {
      setSpinning(false);
      setCelebrate(true);
      setHistory((prev) => [finalNumber, ...prev.slice(0, 9)]); // max 10 history
      celebrateSound.current?.play();
      setTimeout(() => setCelebrate(false), 3000);
    }, 3000);
  };

  return (
    <div className="app-container">
      <audio ref={spinSound} src="/spin.wav" preload="auto" />
      <audio ref={celebrateSound} src="/celebrate.mp3" preload="auto" />

      {celebrate && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.7}
          />
          <Poppers active={celebrate} />
        </>
      )}

      <h1 className="title">🎰 Lucky Draw 🎉</h1>

      <div className="range-inputs">
        <label>
          Min
          <input
            type="number"
            value={minNumber}
            onChange={(e) => setMinNumber(Number(e.target.value))}
            min="0"
            max="9999"
            disabled={spinning}
          />
        </label>
        <label>
          Max
          <input
            type="number"
            value={maxNumber}
            onChange={(e) => setMaxNumber(Number(e.target.value))}
            min="0"
            max="9999"
            disabled={spinning}
          />
        </label>
      </div>
      {rangeError && <div className="error">{rangeError}</div>}

      <div className="slot-frame">
        {currentNumber.split("").map((digit, index) => (
          <Digit key={index} value={digit} index={index} spinning={spinning} />
        ))}
      </div>

      <button onClick={spin} className="spin-btn" disabled={spinning}>
        {spinning ? "Spinning..." : "Spin"}
      </button>

      {history.length > 0 && (
        <div className="history-panel">
          <h3>History</h3>
          <ul>
            {history.map((num, i) => (
              <li key={i}>{num}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Each digit animation
function Digit({ value, index, spinning }) {
  const numberHeight = 120;
  const rolls = 4;
  const finalValue = parseInt(value, 10);
  const numbers = Array.from({ length: 10 * rolls }, (_, i) => i % 10);
  const transformY = (10 * (rolls - 1) + finalValue) * numberHeight;

  return (
    <div className="digit">
      <div
        className="digit-strip"
        style={{
          transform: `translateY(-${transformY}px)`,
          transition: spinning
            ? `transform 2.4s cubic-bezier(.17,.67,.83,.67) ${index * 0.3}s`
            : "none",
        }}
      >
        {numbers.map((n, i) => (
          <div key={i} className="digit-item">
            {n}
          </div>
        ))}
        <div className="digit-item">{finalValue}</div>
      </div>
    </div>
  );
}

// Emoji poppers
function Poppers({ active }) {
  if (!active) return null;
  const popperEmojis = ["🎉", "🎊", "🥳", "🍾", "✨"];

  return (
    <>
      {Array.from({ length: 25 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random();
        const duration = 2 + Math.random() * 1.5;
        const emoji =
          popperEmojis[Math.floor(Math.random() * popperEmojis.length)];
        return (
          <div
            key={i}
            className="popper"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          >
            {emoji}
          </div>
        );
      })}
    </>
  );
}
