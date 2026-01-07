import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function JoinGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameCode, setGameCode] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Get username from URL params if coming from home page
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlUsername = params.get("username");
    if (urlUsername) {
      setUsername(decodeURIComponent(urlUsername));
    }
  }, [location]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    if (!gameCode.trim()) {
      setError("Please enter a game code");
      return;
    }

    const formattedCode = gameCode.toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(formattedCode)) {
      setError("Game code must be 6 letters/numbers");
      return;
    }

    setIsJoining(true);

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Check if game exists
      const gameData = localStorage.getItem(
        `kelmat-multiplayer-${formattedCode}`
      );
      if (!gameData) {
        setError("Game not found. Check the game code and try again.");
        setIsJoining(false);
        return;
      }

      // Parse game data to check if it's still active
      const gameInfo = JSON.parse(gameData);
      const gameCreatedAt = new Date(gameInfo.createdAt);
      const now = new Date();
      const hoursSinceCreation = (now - gameCreatedAt) / (1000 * 60 * 60);

      // Games expire after 24 hours
      if (hoursSinceCreation > 24) {
        setError("This game has expired. Please create or join a new game.");
        setIsJoining(false);
        return;
      }

      // Save player info
      localStorage.setItem(
        "kelmat-current-player",
        JSON.stringify({
          username: username.trim(),
          isHost: false,
          gameId: formattedCode,
        })
      );

      // Navigate to game
      navigate(`/game/${formattedCode}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsJoining(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="join-container">
      <div className="join-card">
        <div className="join-header">
          <h1 className="join-title">Join Game</h1>
          <p className="join-subtitle">
            Enter the game code to join your friends
          </p>
        </div>

        <div className="player-avatar-section">
          <div className="join-avatar">
            <div className="avatar-initial">
              {username.charAt(0).toUpperCase() || "?"}
            </div>
          </div>
          <div className="join-welcome">
            {username
              ? `Ready to join, ${username}?`
              : "Enter your details to join"}
          </div>
        </div>

        <form onSubmit={handleJoin} className="join-form">
          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <span>{error}</span>
            </div>
          )}

          <div className="config-section">
            <label className="config-label" htmlFor="username">
              Player Name
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your display name..."
                required
                maxLength={20}
                className="game-input"
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          <div className="config-section">
            <label className="config-label" htmlFor="gameCode">
              Game Code
            </label>
            <div className="input-wrapper code-input-wrapper">
              <input
                type="text"
                id="gameCode"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF"
                required
                maxLength={6}
                pattern="[A-Z0-9]{6}"
                className="game-input game-code-input"
                style={{ textTransform: "uppercase" }}
                autoComplete="off"
              />
              <div className="code-hint">
                6-character code (letters & numbers)
              </div>
            </div>
          </div>

          <div className="action-buttons join-actions">
            <button
              type="submit"
              className="btn-join-game-action"
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <span className="btn-spinner"></span>
                  Joining Game...
                </>
              ) : (
                <>
                  <span className="btn-icon">🎮</span>
                  Join Game
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToHome}
              className="btn-back-home"
            >
              <span className="btn-icon">←</span>
              Back to Home
            </button>
          </div>

          <div className="game-code-info">
            <div className="info-icon">ℹ️</div>
            <p>
              Ask the game host for the 6-character code. It's usually something
              like <strong>ABC123</strong>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinGame;
