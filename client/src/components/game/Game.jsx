// Game.jsx
import { useEffect, useCallback, useState, useRef } from "react";
import WordleKeyboard from "./Keyboard";
import GameControls from "./GameControls";
import GameMessage from "./GameMessage";
import WordGrid from "./WordGrid";
import ChronoDisplay from "./ChronoDisplay";
import MenuToggle from "./MenuToggle";
import SideMenu from "./SideMenu";
import MenuContent from "./MenuContent";
import { useGameLogic } from "../hooks/useGameLogic";
import { useGameMessage } from "../hooks/useGameMessage";
import { useChrono } from "../hooks/useChrono";
import { useMenu } from "../hooks/useMenu";
import ResumeScreen from "./ResumeScreen";

function Game() {
  const gameLogic = useGameLogic();
  const {
    currentGuess,
    setCurrentGuess,
    guesses,
    guessStatus,
    keyStates,
    currentRow,
    gameStatus,
    shakeRow,
    isLoading,
    isAnimating,
    revealedLetters,
    finalColors,
    solution,
    submitGuess,
    resetGame: resetGameLogic,
    saveGameState,
    loadGameState,
    setGameLost,
    letterLength,
    language,
  } = gameLogic;

  const [gameSettings, setGameSettings] = useState(null);
  const [username, setUsername] = useState("");

  const messageLogic = useGameMessage();
  const { message, messageType, showTemporaryMessage, clearMessage } =
    messageLogic;

  // Initialize chronometer with 2 minutes
  const chrono = useChrono(
    gameSettings?.timerEnabled ? gameSettings.timerDuration : 120
  );

  const {
    formattedTime,
    isTimeUp,
    isRunning,
    hasWon,
    startChrono,
    pauseChrono,
    resetChrono,
    resetForNewGuess,
    stopOnWin,
    getTimePercentage,
    timeLeft,
  } = chrono;

  // Menu state
  const { isMenuOpen, toggleMenu, closeMenu } = useMenu();

  // Game stats state - Load from localStorage if available
  const [gameStats, setGameStats] = useState(() => {
    const savedStats = localStorage.getItem("kelmat-stats");
    return savedStats
      ? JSON.parse(savedStats)
      : {
          gamesPlayed: 0,
          gamesWon: 0,
          winPercentage: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageTime: 0,
          totalTime: 0,
        };
  });

  // Theme state - Load from localStorage or system preference
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem("kelmat-theme");
    if (savedTheme) return savedTheme === "dark";

    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // State to track if we should show the solution
  const [showSolution, setShowSolution] = useState(false);

  const [chronoEnabled, setChronoEnabled] = useState(() => {
    const saved = localStorage.getItem("kelmat-chrono-enabled");
    return saved ? JSON.parse(saved) : false;
  });

  const [chronoTimeLimit, setChronoTimeLimit] = useState(() => {
    const saved = localStorage.getItem("kelmat-time-limit");
    return saved ? parseInt(saved) : 120;
  });

  const [showResumeScreen, setShowResumeScreen] = useState(false);
  const [hasLoadedSavedGame, setHasLoadedSavedGame] = useState(false);
  const [isCheckingSavedGame, setIsCheckingSavedGame] = useState(true);

  // Handle chrono enabled change
  const handleChronoEnabledChange = useCallback(
    (enabled) => {
      setChronoEnabled(enabled);
      localStorage.setItem("kelmat-chrono-enabled", JSON.stringify(enabled));
      if (!enabled) {
        pauseChrono();
      }
    },
    [pauseChrono]
  );

  // Handle time limit change
  const handleTimeLimitChange = useCallback(
    (limit) => {
      setChronoTimeLimit(limit);
      localStorage.setItem("kelmat-time-limit", limit.toString());
      resetChrono();
    },
    [resetChrono]
  );

  // Resume game function
  const handleResumeGame = useCallback(() => {
    const loaded = loadGameState();
    if (loaded) {
      setShowResumeScreen(false);
      setHasLoadedSavedGame(true);

      // If the game was in progress, start chrono if enabled
      if (gameStatus === "playing" && chronoEnabled && !isTimeUp) {
        setTimeout(() => {
          startChrono();
        }, 100);
      }
    }
  }, [loadGameState, gameStatus, chronoEnabled, isTimeUp, startChrono]);

  // Start new game function
  const handleNewGame = useCallback(() => {
    resetGameLogic(true); // true = get new word
    setShowResumeScreen(false);
    setHasLoadedSavedGame(false);
    resetChrono();
    clearMessage();
    closeMenu();
    setShowSolution(false);

    // Delay starting chrono slightly to ensure game is fully reset
    setTimeout(() => {
      if (chronoEnabled && !isTimeUp) {
        startChrono();
      }
    }, 100);
  }, [
    resetGameLogic,
    resetChrono,
    clearMessage,
    closeMenu,
    chronoEnabled,
    isTimeUp,
    startChrono,
  ]);

  const prevRowRef = useRef(currentRow);

  useEffect(() => {
    // Get current player info
    const currentPlayer = localStorage.getItem("kelmat-current-player");
    if (currentPlayer) {
      const playerInfo = JSON.parse(currentPlayer);
      setUsername(playerInfo.username || "Player");
    }

    // Get game settings
    const currentPlayerObj = currentPlayer ? JSON.parse(currentPlayer) : null;
    if (currentPlayerObj && currentPlayerObj.gameId) {
      const gameData = localStorage.getItem(
        `kelmat-multiplayer-${currentPlayerObj.gameId}`
      );
      if (gameData) {
        const settings = JSON.parse(gameData);
        setGameSettings(settings);

        // Set chrono settings from game settings
        if (settings.timerEnabled !== undefined) {
          setChronoEnabled(settings.timerEnabled);
          localStorage.setItem(
            "kelmat-chrono-enabled",
            JSON.stringify(settings.timerEnabled)
          );
        }

        if (settings.timerDuration !== undefined) {
          setChronoTimeLimit(settings.timerDuration);
          localStorage.setItem(
            "kelmat-time-limit",
            settings.timerDuration.toString()
          );
        }
      }
    }
  }, []);

  useEffect(() => {
    // Check if we just moved to a new row (guess was completed)
    if (
      currentRow > prevRowRef.current &&
      gameStatus === "playing" &&
      chronoEnabled
    ) {
      resetForNewGuess();

      // Start chrono after a brief delay
      const timer = setTimeout(() => {
        if (!isTimeUp && !hasWon && !isMenuOpen) {
          startChrono();
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    // Update the ref
    prevRowRef.current = currentRow;
  }, [
    currentRow,
    gameStatus,
    chronoEnabled,
    resetForNewGuess,
    isTimeUp,
    hasWon,
    isMenuOpen,
    startChrono,
  ]);

  // Save game progress on changes - FIXED: Removed gameLogic from dependencies
  useEffect(() => {
    if (!isLoading && !showResumeScreen && gameStatus === "playing") {
      saveGameState();
    }
  }, [isLoading, showResumeScreen, gameStatus, saveGameState]);

  // Apply theme on initial render
  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDarkTheme);
    document.body.classList.toggle("light-theme", !isDarkTheme);
  }, []);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem("kelmat-stats", JSON.stringify(gameStats));
  }, [gameStats]);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem("kelmat-theme", isDarkTheme ? "dark" : "light");
    document.body.classList.toggle("dark-theme", isDarkTheme);
    document.body.classList.toggle("light-theme", !isDarkTheme);
  }, [isDarkTheme]);

  // Check for saved game on mount
  useEffect(() => {
    const hasSavedGame =
      localStorage.getItem("kelmat-game-in-progress") === "true";
    setShowResumeScreen(hasSavedGame);
    setIsCheckingSavedGame(false);
  }, []);

  // Don't start chrono when resume screen is showing
  useEffect(() => {
    if (
      !isLoading &&
      gameStatus === "playing" &&
      !isRunning &&
      !hasWon &&
      !showResumeScreen &&
      chronoEnabled &&
      currentRow === 0
    ) {
      startChrono();
    }
  }, [
    isLoading,
    gameStatus,
    isRunning,
    hasWon,
    showResumeScreen,
    chronoEnabled,
    currentRow,
    startChrono,
  ]);

  // Pause chronometer during animations or when menu is open
  useEffect(() => {
    if ((isAnimating || hasWon) && isRunning) {
      pauseChrono();
    } else if (
      !isAnimating &&
      !hasWon &&
      gameStatus === "playing" &&
      !isRunning &&
      !isTimeUp &&
      !showResumeScreen &&
      chronoEnabled
    ) {
      startChrono();
    }
  }, [
    isAnimating,
    isRunning,
    gameStatus,
    isTimeUp,
    hasWon,
    showResumeScreen,
    chronoEnabled,
    pauseChrono,
    startChrono,
  ]);

  // Update stats on game end
  const updateStats = useCallback(
    (result) => {
      setGameStats((prev) => {
        const gamesPlayed = prev.gamesPlayed + 1;
        const gamesWon = result === "won" ? prev.gamesWon + 1 : prev.gamesWon;
        const winPercentage = gamesPlayed
          ? Math.round((gamesWon / gamesPlayed) * 100)
          : 0;
        const currentStreak = result === "won" ? prev.currentStreak + 1 : 0;
        const bestStreak = Math.max(prev.bestStreak, currentStreak);

        // Calculate actual time used
        const timeUsed = 120 - timeLeft;
        const totalTime = prev.totalTime + timeUsed;
        const averageTime = gamesPlayed
          ? Math.round(totalTime / gamesPlayed)
          : 0;

        return {
          gamesPlayed,
          gamesWon,
          winPercentage,
          currentStreak,
          bestStreak,
          averageTime,
          totalTime,
        };
      });
    },
    [timeLeft]
  );

  useEffect(() => {
    if (isTimeUp && gameStatus === "playing") {
      pauseChrono();
      setGameLost(); // Set game status to lost
      showTemporaryMessage("Time's up! Game over.", "error");
      updateStats("lost");
      setShowSolution(true); // Show the solution permanently
    }
  }, [
    isTimeUp,
    gameStatus,
    showTemporaryMessage,
    pauseChrono,
    updateStats,
    setGameLost,
  ]);

  // Handle key press
  const handleKeyPress = useCallback(
    (key) => {
      if (
        isAnimating ||
        isTimeUp ||
        isMenuOpen ||
        hasWon ||
        gameStatus !== "playing" ||
        showResumeScreen
      ) {
        if (key === "{enter}") {
          showTemporaryMessage("Game is not active", "error");
        }
        return;
      }

      if (key === "{enter}") {
        if (currentGuess.length === letterLength) {
          const errorMessage = submitGuess();
          if (errorMessage) {
            showTemporaryMessage(errorMessage, "error");
          }
        } else {
          showTemporaryMessage(`Word must be ${letterLength} letters`, "error");
        }
        return;
      }

      if (key === "{bksp}") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      // Check if key is allowed based on language
      let isValidKey = false;
      if (language === "english") {
        isValidKey = /^[A-Z]$/.test(key) && currentGuess.length < letterLength;
      } else if (language === "arabic") {
        // Allow Arabic characters
        isValidKey =
          /^[\u0600-\u06FF]$/.test(key) && currentGuess.length < letterLength;
      }

      if (isValidKey) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [
      currentGuess,
      gameStatus,
      letterLength,
      language,
      isAnimating,
      isTimeUp,
      isMenuOpen,
      hasWon,
      showResumeScreen,
      submitGuess,
      showTemporaryMessage,
      setCurrentGuess,
    ]
  );

  // Handle physical keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Close menu on escape
      if (e.key === "Escape") {
        if (isMenuOpen) {
          closeMenu();
        }
        return;
      }

      // Open menu with Ctrl+M or Cmd+M
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        toggleMenu();
        return;
      }

      // Don't process during animation, time's up, or if menu is open
      if (
        isAnimating ||
        isTimeUp ||
        isMenuOpen ||
        hasWon ||
        gameStatus !== "playing" ||
        showResumeScreen
      ) {
        if (e.key.toUpperCase() === "ENTER") {
          showTemporaryMessage("Game is not active", "error");
        }
        return;
      }

      const key = e.key;

      if (key === "Enter") {
        handleKeyPress("{enter}");
      } else if (key === "Backspace") {
        handleKeyPress("{bksp}");
      } else {
        // Check if key is valid based on language
        let isValidKey = false;
        let processedKey = key;

        if (language === "english") {
          processedKey = key.toUpperCase();
          isValidKey =
            /^[A-Z]$/.test(processedKey) && currentGuess.length < letterLength;
        } else if (language === "arabic") {
          // Keep original Arabic character
          isValidKey =
            /^[\u0600-\u06FF]$/.test(key) && currentGuess.length < letterLength;
          processedKey = key;
        }

        if (isValidKey) {
          setCurrentGuess((prev) => prev + processedKey);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentGuess,
    gameStatus,
    letterLength,
    language,
    isAnimating,
    isTimeUp,
    isMenuOpen,
    hasWon,
    showResumeScreen,
    closeMenu,
    toggleMenu,
    handleKeyPress,
    showTemporaryMessage,
    setCurrentGuess,
  ]);

  // Handle game status changes
  useEffect(() => {
    if (gameStatus === "won") {
      pauseChrono();
      stopOnWin();
      showTemporaryMessage("You won!", "success");
      updateStats("won");
      setShowSolution(true);
    } else if (gameStatus === "lost") {
      pauseChrono();
      showTemporaryMessage("Game over!", "error");
      updateStats("lost");
      setShowSolution(true);
    }
  }, [gameStatus, showTemporaryMessage, pauseChrono, stopOnWin, updateStats]);

  // Reset game with chronometer and stats
  const handleReset = useCallback(() => {
    resetGameLogic();
    resetChrono();
    clearMessage();
    closeMenu();
    setShowSolution(false); // Hide solution on reset

    // Start chrono if enabled
    setTimeout(() => {
      if (chronoEnabled && !isTimeUp) {
        startChrono();
      }
    }, 100);
  }, [
    resetGameLogic,
    resetChrono,
    clearMessage,
    closeMenu,
    chronoEnabled,
    isTimeUp,
    startChrono,
  ]);

  // Clear all stats
  const handleClearStats = useCallback(() => {
    setGameStats({
      gamesPlayed: 0,
      gamesWon: 0,
      winPercentage: 0,
      currentStreak: 0,
      bestStreak: 0,
      averageTime: 0,
      totalTime: 0,
    });
    showTemporaryMessage("Statistics cleared", "info");
  }, [showTemporaryMessage]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prev) => !prev);
  }, []);

  // Show loading screen while checking for saved game
  if (isCheckingSavedGame) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <>
      {showResumeScreen && (
        <ResumeScreen
          onResume={handleResumeGame}
          onNewGame={handleNewGame}
          hasSavedGame={hasLoadedSavedGame}
        />
      )}
      <div
        id="game"
        className={`${gameStatus} ${
          language === "arabic" ? "arabic-mode" : ""
        }`}
        dir={language === "arabic" ? "rtl" : "ltr"}
        lang={language}
        style={{
          display: showResumeScreen ? "none" : "block",
        }}
      >
        {/* Menu Toggle Button */}
        <div className="menu-toggle-container">
          <MenuToggle isOpen={isMenuOpen} onClick={toggleMenu} />
        </div>

        <h1>Alfaz</h1>

        <div className="game-header-controls">
          {chronoEnabled && !isLoading && gameStatus === "playing" && (
            <ChronoDisplay
              formattedTime={formattedTime}
              isTimeUp={isTimeUp}
              hasWon={hasWon}
              getTimePercentage={getTimePercentage}
            />
          )}

          {/* Show chrono even when game is over to display winning time */}
          {chronoEnabled &&
            !isLoading &&
            gameStatus !== "playing" &&
            !isTimeUp && (
              <ChronoDisplay
                formattedTime={formattedTime}
                isTimeUp={isTimeUp}
                hasWon={hasWon}
                getTimePercentage={getTimePercentage}
              />
            )}
        </div>

        <GameMessage
          message={message}
          gameStatus={messageType}
          onClose={clearMessage}
        />

        {(gameStatus !== "playing" || isTimeUp) && showSolution && (
          <div className="solution-display">
            <div className="solution-label">
              {language === "arabic"
                ? "الـكـلـمـة كــانـت"
                : "The word was"}
            </div>
            <div className="solution-word">{solution.toUpperCase()}</div>
          </div>
        )}

        <GameControls
          gameStatus={gameStatus}
          isAnimating={isAnimating}
          onReset={handleReset}
        />

        <div className="users-grids">
          <div className="word-grids">
            <span className="username">{username || "Player"} (You)</span>
            {Array(6)
              .fill(null)
              .map((_, rowIndex) => (
                <WordGrid
                  key={rowIndex}
                  rowIndex={rowIndex}
                  guesses={guesses}
                  currentRow={currentRow}
                  currentGuess={currentGuess}
                  guessStatus={guessStatus}
                  finalColors={finalColors}
                  revealedLetters={revealedLetters}
                  isAnimating={isAnimating}
                  shakeRow={shakeRow}
                  letterLength={gameLogic.letterLength || 5}
                />
              ))}
          </div>
        </div>

        <WordleKeyboard
          onKeyPress={handleKeyPress}
          keyStates={keyStates}
          disabled={
            gameStatus !== "playing" ||
            isTimeUp ||
            isMenuOpen ||
            hasWon ||
            showResumeScreen
          }
          language={gameLogic.language || "english"}
        />
      </div>
      {/* Side Menu */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        style={{ display: showResumeScreen ? "none" : "block" }}
      >
        <MenuContent
          stats={gameStats}
          onReset={handleReset}
          onToggleTheme={toggleTheme}
          currentTheme={isDarkTheme ? "dark" : "light"}
          isGameActive={gameStatus === "playing"}
          onChronoEnabledChange={handleChronoEnabledChange}
          onTimeLimitChange={handleTimeLimitChange}
          chronoEnabled={chronoEnabled}
          chronoTimeLimit={chronoTimeLimit}
          onClearStats={handleClearStats}
        />
      </SideMenu>
    </>
  );
}

export default Game;
