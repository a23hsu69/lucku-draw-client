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

  const [firstWinner, setFirstWinner] = useState(null); // null allows random spins locally
  const [firstWinnerUsed, setFirstWinnerUsed] = useState(false);

  const spinSound = useRef(null);
  const celebrateSound = useRef(null);

  // Update window size
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch first winner from server if exists
  useEffect(() => {
    async function fetchWinner() {
      try {
        const res = await fetch("/get-winner");
        const data = await res.json();
        if (data.number) {
          setFirstWinner(data.number.padStart(4, "0"));
        }
      } catch (err) {
        console.log("No backend or first winner yet, continuing locally.");
      }
    }
    fetchWinner();
  }, []);

  const validateRange = () => {
    if (minNumber > maxNumber) {
      setRangeError("Min cannot be greater than Max");
      return false;
    }
    if (minNumber < 0 || maxNumber > 9999) {
      setRangeError("Values must be between 0 and 9999");
      return false;
    }
    setRangeError("");
    return true;
  };

  const setRange = () => {
    if (validateRange()) {
      alert(`Range set: ${minNumber} - ${maxNumber}`);
    }
  };

  const spin = async () => {
    if (spinning) return;
    if (!validateRange()) return;

    setSpinning(true);
    setCelebrate(false);

    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play();
    }

    try {
      // Try backend first
      let finalNumber = currentNumber;
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

      setCurrentNumber(finalNumber);

      setTimeout(() => {
        setSpinning(false);
        setCelebrate(true);
        setHistory((prev) => [finalNumber, ...prev]);

        if (celebrateSound.current) {
          celebrateSound.current.currentTime = 0;
          celebrateSound.current.play();
        }

        setTimeout(() => setCelebrate(false), 2500);
      }, 3000);
    } catch (err) {
      // Local fallback if backend not available
      const randomNum = String(
        Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber)
      ).padStart(4, "0");
      setCurrentNumber(randomNum);

      setTimeout(() => {
        setSpinning(false);
        setCelebrate(true);
        setHistory((prev) => [randomNum, ...prev]);
        if (celebrateSound.current) {
          celebrateSound.current.currentTime = 0;
          celebrateSound.current.play();
        }
        setTimeout(() => setCelebrate(false), 2500);
      }, 3000);
    }
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
            numberOfPieces={500}
            gravity={0.8}
          />
          <Poppers active={celebrate} />
        </>
      )}

      <h1 className="title">Lucky Draw</h1>

      <div className="range-inputs">
        <label>
          Min:
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
          Max:
          <input
            type="number"
            value={maxNumber}
            onChange={(e) => setMaxNumber(Number(e.target.value))}
            min="0"
            max="9999"
            disabled={spinning}
          />
        </label>
        <button onClick={setRange} disabled={spinning}>
          Set Range
        </button>
        {rangeError && <div className="error">{rangeError}</div>}
      </div>

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
          <h3>Previous Spins:</h3>
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

// Digit animation
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
            ? `transform 2s cubic-bezier(.17,.67,.83,.67) ${index * 0.4}s`
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

// Popper animation
function Poppers({ active }) {
  if (!active) return null;
  const popperCount = 25;
  const popperEmojis = ["🎉", "🎊", "🥳"];

  return (
    <>
      {Array.from({ length: popperCount }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1;
        const duration = 2 + Math.random() * 1.5;
        const emoji = popperEmojis[Math.floor(Math.random() * popperEmojis.length)];
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
