// useGameLogic.js
import { useState, useEffect, useCallback } from "react";

export function useGameLogic() {
  // Load settings first
  const [settings, setSettings] = useState(() => {
    const currentPlayer = localStorage.getItem("kelmat-current-player");
    if (currentPlayer) {
      const playerInfo = JSON.parse(currentPlayer);
      if (playerInfo.gameId) {
        const gameData = localStorage.getItem(
          `kelmat-multiplayer-${playerInfo.gameId}`
        );
        if (gameData) {
          return JSON.parse(gameData);
        }
      }
    }
    return { letterLength: 5, language: "english" };
  });

  const { letterLength = 5, language = "english" } = settings;

  // Game state - initialize with dynamic letterLength
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState(
    Array(6)
      .fill(null)
      .map(() => Array(letterLength).fill(""))
  );
  const [guessStatus, setGuessStatus] = useState(Array(6).fill(null));
  const [keyStates, setKeyStates] = useState({});
  const [currentRow, setCurrentRow] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing");
  const [shakeRow, setShakeRow] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState(
    Array(6)
      .fill(null)
      .map(() => Array(letterLength).fill(false))
  );
  const [finalColors, setFinalColors] = useState(
    Array(6)
      .fill(null)
      .map(() => Array(letterLength).fill(""))
  );
  const [wordList, setWordList] = useState([]);
  const [validWordList, setValidWordList] = useState([]);
  const [solution, setSolution] = useState("");

  const setGameLost = useCallback(() => {
    setGameStatus("lost");
  }, []);

  useEffect(() => {
    const loadWordLists = async () => {
      try {
        // Determine which files to load based on settings
        const wordsPath =
          language === "arabic"
            ? `../../assets/words${letterLength}ar.json`
            : `../../assets/words${letterLength}.json`;

        const validPath =
          language === "arabic"
            ? `../../assets/valid${letterLength}ar.json`
            : `../../assets/valid${letterLength}.json`;

        // Dynamically import the JSON files
        const wordsModule = await import(/* @vite-ignore */ wordsPath);
        const validModule = await import(/* @vite-ignore */ validPath);

        const words =
          wordsModule.default?.words || wordsModule.default || wordsModule;
        const validWords =
          validModule.default?.words || validModule.default || validModule;

        // Combine both lists for guess validation
        const combinedWords = [...new Set([...words, ...validWords])];
        setWordList(combinedWords);
        setValidWordList(validWords);

        if (validWords.length > 0) {
          const randomWord =
            validWords[Math.floor(Math.random() * validWords.length)];
          setSolution(randomWord.toUpperCase());
          console.log(
            "Solution:",
            randomWord,
            "Length:",
            letterLength,
            "Language:",
            language
          );
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading word lists:", error);
        // Fallback to default 5-letter English
        try {
          const wordsModule = await import("../../assets/words5.json");
          const validModule = await import("../../assets/valid5.json");

          const words =
            wordsModule.default?.words || wordsModule.default || wordsModule;
          const validWords =
            validModule.default?.words || validModule.default || validModule;

          const combinedWords = [...new Set([...words, ...validWords])];
          setWordList(combinedWords);
          setValidWordList(validWords);

          if (validWords.length > 0) {
            const randomWord =
              validWords[Math.floor(Math.random() * validWords.length)];
            setSolution(randomWord.toUpperCase());
          }

          setIsLoading(false);
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          setIsLoading(false);
        }
      }
    };

    loadWordLists();
  }, [letterLength, language]);

  // Check if word is valid
  const isValidWord = useCallback(
    (word) => {
      return wordList.includes(word.toLowerCase());
    },
    [wordList]
  );

  // Check guess
  const checkGuess = useCallback(
    (guess) => {
      const solutionArray = solution.split("");
      const guessArray = guess.split("");
      const status = Array(letterLength).fill("absent");

      // First pass: check for correct letters
      guessArray.forEach((letter, i) => {
        if (letter === solutionArray[i]) {
          status[i] = "correct";
          solutionArray[i] = null;
        }
      });

      // Second pass: check for present letters
      guessArray.forEach((letter, i) => {
        if (status[i] !== "correct" && solutionArray.includes(letter)) {
          status[i] = "present";
          const index = solutionArray.indexOf(letter);
          solutionArray[index] = null;
        }
      });

      return status;
    },
    [solution, letterLength]
  );

  // Update keyboard states
  const updateKeyStates = useCallback(
    (status, guess) => {
      const tempKeyStates = { ...keyStates };
      const guessArray = guess.split("");

      guessArray.forEach((letter, i) => {
        const newState = status[i];

        if (newState === "correct") {
          tempKeyStates[letter] = "correct";
        } else if (
          newState === "present" &&
          tempKeyStates[letter] !== "correct"
        ) {
          tempKeyStates[letter] = "present";
        } else if (newState === "absent" && !tempKeyStates[letter]) {
          tempKeyStates[letter] = "absent";
        }
      });

      setKeyStates(tempKeyStates);
    },
    [keyStates]
  );

  // Reset game
  const resetGame = useCallback(
    (newWord = true) => {
      if (newWord && validWordList.length > 0) {
        const randomWord =
          validWordList[Math.floor(Math.random() * validWordList.length)];
        setSolution(randomWord.toUpperCase());
      }

      setCurrentGuess("");
      setGuesses(
        Array(6)
          .fill(null)
          .map(() => Array(letterLength).fill(""))
      );
      setGuessStatus(Array(6).fill(null));
      setFinalColors(
        Array(6)
          .fill(null)
          .map(() => Array(letterLength).fill(""))
      );
      setKeyStates({});
      setCurrentRow(0);
      setGameStatus("playing");
      setShakeRow(-1);
      setIsAnimating(false);
      setRevealedLetters(
        Array(6)
          .fill(null)
          .map(() => Array(letterLength).fill(false))
      );

      // Clear saved game when resetting
      localStorage.removeItem("kelmat-game-state");
      localStorage.setItem("kelmat-game-in-progress", "false");
    },
    [validWordList, letterLength]
  );

  // Save game state
  const saveGameState = useCallback(() => {
    const gameState = {
      currentGuess,
      guesses,
      guessStatus,
      keyStates,
      currentRow,
      gameStatus,
      finalColors,
      solution,
      revealedLetters,
      settings,
    };
    localStorage.setItem("kelmat-game-state", JSON.stringify(gameState));
    localStorage.setItem("kelmat-game-in-progress", "true");
  }, [
    currentGuess,
    guesses,
    guessStatus,
    keyStates,
    currentRow,
    gameStatus,
    finalColors,
    solution,
    revealedLetters,
    settings,
  ]);

  // Load game state
  const loadGameState = useCallback(() => {
    const savedState = localStorage.getItem("kelmat-game-state");
    if (savedState) {
      const gameState = JSON.parse(savedState);
      setCurrentGuess(gameState.currentGuess);
      setGuesses(gameState.guesses);
      setGuessStatus(gameState.guessStatus);
      setKeyStates(gameState.keyStates);
      setCurrentRow(gameState.currentRow);
      setGameStatus(gameState.gameStatus);
      setFinalColors(gameState.finalColors);
      setSolution(gameState.solution);
      setRevealedLetters(gameState.revealedLetters);
      if (gameState.settings) {
        setSettings(gameState.settings);
      }
      return true;
    }
    return false;
  }, []);

  // Animate letter reveal
  const animateGuessReveal = useCallback(
    (status, rowIndex, guess) => {
      setIsAnimating(true);

      const newFinalColors = [...finalColors];
      newFinalColors[rowIndex] = status;
      setFinalColors(newFinalColors);

      const newRevealed = [...revealedLetters];
      newRevealed[rowIndex] = Array(letterLength).fill(false);
      setRevealedLetters(newRevealed);

      status.forEach((_, index) => {
        setTimeout(() => {
          const updatedRevealed = [...revealedLetters];
          updatedRevealed[rowIndex][index] = true;
          setRevealedLetters(updatedRevealed);

          if (index === status.length - 1) {
            setTimeout(() => {
              setIsAnimating(false);

              updateKeyStates(status, guess);

              const newGuessStatus = [...guessStatus];
              newGuessStatus[rowIndex] = status;
              setGuessStatus(newGuessStatus);

              // Check win condition
              if (guess === solution) {
                setGameStatus("won");
                return;
              }

              // Check lose condition
              if (rowIndex === 5) {
                setGameStatus("lost");
                return;
              }

              setCurrentRow(rowIndex + 1);
              setCurrentGuess("");
            }, 300);
          }
        }, index * 400);
      });
    },
    [
      solution,
      finalColors,
      revealedLetters,
      guessStatus,
      updateKeyStates,
      letterLength,
    ]
  );

  // Submit guess
  const submitGuess = useCallback(() => {
    if (currentGuess.length !== letterLength) {
      return `Word must be ${letterLength} letters`;
    }

    // Convert to lowercase for validation
    const lowercaseGuess = currentGuess.toLowerCase();
    if (!isValidWord(lowercaseGuess)) {
      setShakeRow(currentRow);
      setTimeout(() => setShakeRow(-1), 1500);
      return "Not a valid word";
    }

    // Update guesses array
    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess.split("");
    setGuesses(newGuesses);

    // Check the guess
    const status = checkGuess(currentGuess);

    // Start the animation
    animateGuessReveal(status, currentRow, currentGuess);

    return null;
  }, [
    currentGuess,
    letterLength,
    currentRow,
    guesses,
    isValidWord,
    checkGuess,
    animateGuessReveal,
  ]);

  return {
    // State
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
    wordList,
    validWordList,
    letterLength,
    language,
    settings,

    // Functions
    isValidWord,
    checkGuess,
    resetGame,
    saveGameState,
    loadGameState,
    animateGuessReveal,
    submitGuess,
    updateKeyStates,
    setGameLost,
  };
}
