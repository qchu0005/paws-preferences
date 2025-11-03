import { useEffect, useState, useRef } from "react";
import "./App.css";

export default function App() {
  const [cats, setCats] = useState([]);
  const [current, setCurrent] = useState(0);
  const [liked, setLiked] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [transition, setTransition] = useState(false);
  const [cardLoading, setCardLoading] = useState(true); // per-card loading

  const startX = useRef(null);

  // Fetch random cats from Cataas
  useEffect(() => {
    const fetchCats = async () => {
      const urls = [];
      const catCount = Math.floor(Math.random() * 11) + 10;

      for (let i = 0; i < catCount; i++) {
        // Use timestamp to avoid caching
        urls.push(`https://cataas.com/cat?timestamp=${Date.now()}-${i}`);
      }

      setCats(urls);
      setLoading(false);       // all URLs are ready
      setCardLoading(true);    // first card may take a moment to load
    };

    fetchCats();
  }, []);

  // Handle swipe
  const handleSwipe = (direction) => {
    if (direction === "right") setLiked([...liked, cats[current]]);

    const next = current + 1;
    if (next < cats.length) {
      setCurrent(next);
      setOffset(0);
      setTransition(false);
      setCardLoading(true); // show loading immediately for next card
    } else {
      setFinished(true);
    }
  };

  // Mouse / touch handling
  const handleStart = (x) => {
    startX.current = x;
    setTransition(false);
  };

  const handleMove = (x) => {
    if (startX.current === null) return;
    setOffset(x - startX.current);
  };

  const handleEnd = (x) => {
    if (startX.current === null) return;

    const diff = x - startX.current;
    setTransition(true);

    if (diff > 100) {
      setOffset(500);
      setTimeout(() => handleSwipe("right"), 200);
    } else if (diff < -100) {
      setOffset(-500);
      setTimeout(() => handleSwipe("left"), 200);
    } else {
      setOffset(0);
    }

    startX.current = null;
  };

  return (
    <div className="container">
      {/* Dynamic title */}
      <div className="title">
        <h2>{finished ? "🐾 Cat Summary 🐾" : "Paws & Preferences 😻"}</h2>
      </div>

      {finished ? (
        // Summary page
        <div className="summary-page">
          <ul className="summary-list">
            <li>
              Out of <strong>{cats.length}</strong> cats, you've liked <strong>{liked.length}</strong> of them!
            </li>
          </ul>

          {liked.length > 0 ? (
            <>
              <h3>Cats You Liked :</h3>
              <div className="liked-grid">
                {liked.map((url, i) => (
                  <img key={i} src={url} alt="Liked cat" />
                ))}
              </div>
            </>
          ) : (
            <p>No cats were liked this time 😿</p>
          )}

          <button onClick={() => window.location.reload()}>🔁 Try Again</button>
        </div>
      ) : (
        // Card swipe section
        <>
          <div
            className="card-wrapper"
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
            onMouseUp={(e) => handleEnd(e.clientX)}
            onMouseLeave={(e) => e.buttons === 1 && handleEnd(e.clientX)}
          >
            {/* Global loading while URLs fetch */}
            {loading && <div className="loading">🐱 Loading cute cats...</div>}

            {!loading && cats[current] && (
              <div
                className="card"
                style={{
                  transform: `translateX(${offset}px) rotate(${offset / 20}deg)`,
                  transition: transition ? "transform 0.3s ease" : "none",
                }}
              >
                {/* Show per-card loading */}
                {cardLoading && <div className="loading">🐱 Loading cat...</div>}

                <img
                  src={cats[current]}
                  alt="Cat"
                  draggable="false"
                  style={{ display: cardLoading ? "none" : "block" }}
                  onLoad={() => setCardLoading(false)}
                />
              </div>
            )}
          </div>

          <div className="emoji-buttons">
            <button className="x-btn" onClick={() => handleSwipe("left")}>
              ❌
            </button>
            <button className="heart-btn" onClick={() => handleSwipe("right")}>
              ❤️
            </button>
          </div>
          <p className="cat-count">
            Cat {current + 1} / {cats.length}
          </p>
        </>
      )}
    </div>
  );
}
