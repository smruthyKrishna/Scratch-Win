import React, { useRef, useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const canvasRef = useRef(null);
  const [scratchedEnough, setScratchedEnough] = useState(false);
  const [amount, setAmount] = useState("");
  const [isAmountVisible, setIsAmountVisible] = useState(false);
  const amountLocked = useRef(false);

  useEffect(() => {
    // Check if already scratched
    const saved = localStorage.getItem("scratchAmount");
    if (saved) {
      setAmount(saved);
      setIsAmountVisible(true);
      setScratchedEnough(true);
      amountLocked.current = true;
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#c0c0c0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "24px Arial";
    ctx.fillStyle = "#808080";
    ctx.fillText("Scratch Here!", 80, 100);

    const scratch = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, 2 * Math.PI);
      ctx.fill();
    };

    const startScratch = () => {
      canvas.addEventListener("mousemove", scratch);
      canvas.addEventListener("touchmove", scratch);
    };

    const endScratch = () => {
      canvas.removeEventListener("mousemove", scratch);
      canvas.removeEventListener("touchmove", scratch);
      checkScratchPercentage();
    };

    canvas.addEventListener("mousedown", startScratch);
    canvas.addEventListener("mouseup", endScratch);
    canvas.addEventListener("touchstart", startScratch);
    canvas.addEventListener("touchend", endScratch);

    const preventRefresh = (e) => {
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r") ||
        (e.metaKey && e.key === "r")
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", preventRefresh);

    return () => {
      window.removeEventListener("keydown", preventRefresh);
      canvas.removeEventListener("mousedown", startScratch);
      canvas.removeEventListener("mouseup", endScratch);
      canvas.removeEventListener("touchstart", startScratch);
      canvas.removeEventListener("touchend", endScratch);
    };
  }, []);

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let transparentPixels = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) {
        transparentPixels++;
      }
    }
    const transparentPercent =
      (transparentPixels / (canvas.width * canvas.height)) * 100;

    if (transparentPercent > 40 && !scratchedEnough) {
      if (!amountLocked.current) {
        const winningAmount = generateAmount();
        setAmount(winningAmount);
        setIsAmountVisible(true);
        amountLocked.current = true;
        localStorage.setItem("scratchAmount", winningAmount);
      }
      setScratchedEnough(true);
    }
  };

  const generateAmount = () => {
    const random = Math.random();
    if (random < 0.5) return "₹1";
    if (random < 0.7) return "🙁 Try Again 🙁";
    if (random < 0.9) return `₹${Math.floor(Math.random() * 20) + 1}`;
    if (random < 0.95) return `₹${Math.floor(Math.random() * 50) + 1}`;
    return `₹${Math.floor(Math.random() * 100) + 1}`;
  };

  const sendWhatsApp = () => {
    const text = amount.includes("Try Again")
      ? "I scratched and got: Try Again 🙁"
      : `I scratched and won: ${amount}! 🎉`;
    const whatsappURL = `https://wa.me/+918921999041?text=${encodeURIComponent(
      text
    )}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <div className="app-container">
      <h1 className="heading">🎯 Scratch and Win 🎯</h1>

      <div className="canvas-container">
        <div className={`amount-display ${isAmountVisible ? "show" : ""}`}>
          {amount}
        </div>

        <canvas
          ref={canvasRef}
          width={300}
          height={200}
          className="scratch-canvas"
        />
      </div>

      <button
        onClick={sendWhatsApp}
        disabled={!scratchedEnough}
        className={`whatsapp-button ${
          scratchedEnough ? "enabled" : "disabled"
        }`}
      >
        Send to WhatsApp
      </button>
    </div>
  );
}
