import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import increaseIcon from "../assets/img/increase.svg";
import decreaseIcon from "../assets/img/decrease.svg";
import joinIcon from "../assets/img/join.svg";
import helpIcon from "../assets/img/help.svg";

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [useTimer, setUseTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(120);
  const [language, setLanguage] = useState("english");
  const [letterLength, setLetterLength] = useState(5); // Default to 5 letters
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState("");
  const [gameMode, setGameMode] = useState(""); // "", "create", or "join"
  const sliderTrackRef = useRef(null);

  useEffect(() => {
    // Update slider position on timer duration change
    if (sliderTrackRef.current) {
      sliderTrackRef.current.style.setProperty(
        "--time-percentage",
        timerDuration
      );
    }
  }, [timerDuration]);

  const generateGameId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    setIsCreatingGame(true);

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Generate a unique game ID
      const gameId = generateGameId();

      // Save user preferences to localStorage for the game
      localStorage.setItem(
        `kelmat-multiplayer-${gameId}`,
        JSON.stringify({
          host: username,
          timerEnabled: useTimer,
          timerDuration: timerDuration,
          language: language,
          letterLength: letterLength, // Save letter length preference
          createdAt: new Date().toISOString(),
        })
      );

      // Save current player info
      localStorage.setItem(
        "kelmat-current-player",
        JSON.stringify({
          username,
          isHost: true,
          gameId,
        })
      );

      // Navigate to game page with game ID
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError("Failed to create game. Please try again.");
      setIsCreatingGame(false);
    }
  };

  const handleJoinGame = async (e) => {
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

    setIsJoiningGame(true);

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Check if game exists
      const gameData = localStorage.getItem(
        `kelmat-multiplayer-${formattedCode}`
      );
      if (!gameData) {
        setError("Game not found. Check the game code and try again.");
        setIsJoiningGame(false);
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
        setIsJoiningGame(false);
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
      setIsJoiningGame(false);
    }
  };

  const handleCreateNewGameClick = () => {
    if (!username.trim()) {
      setError("Please enter your username first");
      return;
    }
    setGameMode("create");
    setError("");
  };

  const handleJoinExistingGameClick = () => {
    if (!username.trim()) {
      setError("Please enter your username first");
      return;
    }
    setGameMode("join");
    setError("");
  };

  const handleBackToGameType = () => {
    setGameMode("");
    setError("");
  };

  const timerOptions = [
    { seconds: 30, label: "30s" },
    { seconds: 60, label: "1m" },
    { seconds: 120, label: "2m" },
    { seconds: 180, label: "3m" },
    { seconds: 300, label: "5m" },
  ];

  const letterLengthOptions = [3, 4, 5, 6];

  useEffect(() => {
    if (language === "arabic") {
      setLetterLength(5);
    }
  }, [language]);

  const handleTimerChange = (seconds) => {
    setTimerDuration(seconds);
  };

  const handleSliderChange = (e) => {
    setTimerDuration(parseInt(e.target.value));
  };

  const handleLetterLengthChange = (length) => {
    setLetterLength(length);
  };

  return (
    <div className="home-container" lang={language}>
      <div className="home-card">
        <h1 className="game-title">
          {language === "arabic" ? "ألـفَـــاظ" : "Alfaz"}
        </h1>
        <p className="game-tagline">
          {language === "arabic"
            ? "تحدى أصدقائك في الوقت الحقيقي!"
            : "Challenge your friends in real-time!"}
        </p>

        <div className="player-card">
          <div className="player-card-header">
            <div className="player-avatar">
              <div className="avatar-initial">
                {username.charAt(0).toUpperCase() || "?"}
              </div>
            </div>
            <h2 className="player-welcome">
              {username
                ? language === "arabic"
                  ? `مرحباً، ${username}!`
                  : `Welcome, ${username}!`
                : language === "arabic"
                ? "أدخل اسمك"
                : "Enter Your Name"}
            </h2>
          </div>

          <div className="game-config">
            {/* Username Input - Always shown */}
            <div className="config-section">
              <label className="config-label">
                {language === "arabic" ? "اسم اللاعب" : "Player Name"}
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder={
                    language === "arabic"
                      ? "أدخل اسمك..."
                      : "Enter your display name..."
                  }
                  required
                  maxLength={20}
                  className="game-input"
                  autoFocus
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <div className="error-icon">⚠️</div>
                <span>{error}</span>
              </div>
            )}

            {/* Game Type Selection - Only shown when no mode is selected */}
            {!gameMode && (
              <div className="config-section">
                <div className="game-type-buttons">
                  <button
                    type="button"
                    className="game-type-btn"
                    onClick={handleJoinExistingGameClick}
                    disabled={!username.trim()}
                  >
                    <div className="btn-icon">
                      <img src={joinIcon} alt="" />
                    </div>
                    <div className="btn-content">
                      <div className="btn-title">Join Existing Game</div>
                      <div className="btn-subtitle">
                        {language === "arabic"
                          ? "العب مع الأصدقاء باستخدام كود"
                          : "Play with friends using a code"}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="game-type-btn"
                    onClick={handleCreateNewGameClick}
                    disabled={!username.trim()}
                  >
                    <div className="btn-icon">
                      <img src={increaseIcon} alt="" />
                    </div>
                    <div className="btn-content">
                      <div className="btn-title">Create New Game</div>
                      <div className="btn-subtitle">
                        Host a new game and invite friends
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Game Code Input - Only shown when joining game */}
            {gameMode === "join" && (
              <form onSubmit={handleJoinGame}>
                <div className="config-section">
                  <label className="config-label">Game Code</label>
                  <div className="input-wrapper code-input-wrapper">
                    <input
                      type="text"
                      value={gameCode}
                      onChange={(e) =>
                        setGameCode(e.target.value.toUpperCase())
                      }
                      placeholder="ABC123"
                      required
                      maxLength={6}
                      className="game-input game-code-input"
                      style={{ textTransform: "uppercase" }}
                      autoComplete="off"
                      autoFocus
                    />
                    <div className="code-hint">
                      6-character code (letters & numbers)
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    type="submit"
                    className="btn-primary-action"
                    disabled={isJoiningGame}
                  >
                    {isJoiningGame ? (
                      <>
                        <span className="btn-spinner"></span>
                        Joining Game...
                      </>
                    ) : (
                      <>Join Game</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToGameType}
                    className="btn-secondary-action"
                  >
                    <span className="btn-icon">←</span>
                    Back
                  </button>
                </div>

                <div className="game-code-info">
                  <div className="info-icon"><img src={helpIcon} alt="Help" /></div>
                  <p>
                    Ask the game host for the 6-character code. It's usually
                    something like <strong>D4P3FN</strong>
                  </p>
                </div>
              </form>
            )}

            {/* Game Settings - Only shown when creating new game */}
            {gameMode === "create" && (
              <form onSubmit={handleCreateGame}>
                {/* Language Selection */}
                <div className="config-section">
                  <label className="config-label">Game Language</label>
                  <div className="language-buttons">
                    <button
                      type="button"
                      className={`language-btn ${
                        language === "english" ? "active" : ""
                      }`}
                      onClick={() => setLanguage("english")}
                    >
                      <span className="flag">🇺🇸</span>
                      <span>English</span>
                      {language === "english" && (
                        <div className="active-indicator"></div>
                      )}
                    </button>
                    <button
                      type="button"
                      className={`language-btn ${
                        language === "arabic" ? "active" : ""
                      }`}
                      onClick={() => setLanguage("arabic")}
                    >
                      <span className="flag">🇸🇦</span>
                      <span>العربية</span>
                      {language === "arabic" && (
                        <div className="active-indicator"></div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Letter Length Selection */}
                <div className="config-section">
                  <label className="config-label">Word Length</label>
                  <div className="length-buttons">
                    {letterLengthOptions.map((length) => (
                      <button
                        key={length}
                        type="button"
                        className={`length-btn ${
                          letterLength === length ? "active" : ""
                        }`}
                        onClick={() => handleLetterLengthChange(length)}
                        disabled={language === "arabic" && length !== 5}
                      >
                        <div className="length-number">{length}</div>
                        <div className="length-label">
                          {length === 1 ? "letter" : "letters"}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="length-hint">
                    {letterLength === 3 && "Easy - Short words"}
                    {letterLength === 4 && "Moderate - Balanced challenge"}
                    {letterLength === 5 && "Classic - Standard Wordle length"}
                    {letterLength === 6 && "Hard - Longer words for experts"}
                  </div>
                </div>

                {/* Timer Toggle */}
                <div className="config-section">
                  <div className="toggle-wrapper">
                    <label className="toggle-label">
                      Enable Timer Challenge
                    </label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="useTimer"
                        checked={useTimer}
                        onChange={(e) => setUseTimer(e.target.checked)}
                        className="toggle-input"
                      />
                      <label htmlFor="useTimer" className="toggle-slider">
                        <span className="toggle-knob"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Timer Duration (only shown if timer is enabled) */}
                {useTimer && (
                  <div className="config-section">
                    <div className="chrono-toggle-container">
                      <div className="chrono-toggle-header">
                        <label className="chrono-toggle-label">
                          Time Pressure
                        </label>
                        <div className="chrono-time-display">
                          {timerDuration <= 60
                            ? `${timerDuration}s`
                            : `${Math.floor(timerDuration / 60)}m${
                                timerDuration % 60 !== 0
                                  ? ` ${timerDuration % 60}s`
                                  : ""
                              }`}
                        </div>
                      </div>

                      {/* Quick Timer Options */}
                      <div className="chrono-presets">
                        {timerOptions.map((option) => (
                          <button
                            key={option.seconds}
                            type="button"
                            className={`chrono-preset-btn ${
                              timerDuration === option.seconds ? "active" : ""
                            }`}
                            onClick={() => handleTimerChange(option.seconds)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      {/* Elastic Slider */}
                      <div className="chrono-slider">
                        <input
                          type="range"
                          min="30"
                          max="300"
                          step="30"
                          value={timerDuration}
                          onChange={handleSliderChange}
                          className="chrono-slider-input"
                        />
                        <div
                          className="chrono-slider-track"
                          ref={sliderTrackRef}
                        >
                          <div
                            className="chrono-slider-fill"
                            style={{
                              width: `${
                                ((timerDuration - 30) / (300 - 30)) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="chrono-slider-labels">
                          <span>Fast (30s)</span>
                          <span>Relaxed (5m)</span>
                        </div>
                      </div>

                      {/* Manual Input Controls */}
                      <div className="chrono-manual-input">
                        <button
                          type="button"
                          className="chrono-input-btn"
                          onClick={() =>
                            handleTimerChange(Math.max(30, timerDuration - 30))
                          }
                          disabled={timerDuration <= 30}
                        >
                          <img src={decreaseIcon} alt="Decrease time" />
                        </button>
                        <div className="chrono-input-display">
                          {timerDuration <= 60
                            ? `${timerDuration} seconds`
                            : `${Math.floor(timerDuration / 60)} minute${
                                timerDuration > 60 ? "s" : ""
                              }`}
                        </div>
                        <button
                          type="button"
                          className="chrono-input-btn"
                          onClick={() =>
                            handleTimerChange(Math.min(300, timerDuration + 30))
                          }
                          disabled={timerDuration >= 300}
                        >
                          <img src={increaseIcon} alt="Increase time" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="action-buttons">
                  <button
                    type="submit"
                    className="btn-primary-action"
                    disabled={isCreatingGame}
                  >
                    {isCreatingGame ? (
                      <>
                        <span className="btn-spinner"></span>
                        Creating Game...
                      </>
                    ) : (
                      <>Create Game</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToGameType}
                    className="btn-secondary-action"
                  >
                    <span className="btn-icon">←</span>
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Instructions Panel */}
        <div className="instructions-panel">
          <h3 className="instructions-title">How to Play Multiplayer</h3>
          <div className="instructions-grid">
            <div className="instruction-step">
              <div className="step-number">1</div>
              <p>Enter your username to get started</p>
            </div>
            <div className="instruction-step">
              <div className="step-number">2</div>
              <p>Choose to join or create a game</p>
            </div>
            <div className="instruction-step">
              <div className="step-number">3</div>
              <p>If creating, configure your game settings</p>
            </div>
            <div className="instruction-step">
              <div className="step-number">4</div>
              <p>Share the game code with friends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
