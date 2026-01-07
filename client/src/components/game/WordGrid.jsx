// WordGrid.jsx
import { memo } from "react";

const WordGrid = memo(function WordGrid({
  rowIndex,
  guesses,
  currentRow,
  currentGuess,
  guessStatus,
  finalColors,
  revealedLetters,
  isAnimating,
  shakeRow,
  letterLength = 5,
}) {
  const renderCell = (cellIndex) => {
    const isCurrentRow = rowIndex === currentRow;
    const letter = isCurrentRow
      ? currentGuess[cellIndex] || ""
      : guesses[rowIndex][cellIndex] || "";

    const permanentStatus = guessStatus[rowIndex]?.[cellIndex] || "";
    const finalColor = finalColors[rowIndex]?.[cellIndex] || "";
    const isRevealed = revealedLetters[rowIndex]?.[cellIndex] || false;
    const isAnimatingRow = isAnimating && rowIndex === currentRow;

    let cellClass = "word-letter";

    if (permanentStatus) {
      cellClass += ` ${permanentStatus}`;
    } else if (isAnimatingRow && isRevealed && finalColor) {
      cellClass += ` ${finalColor} flip`;
    } else if (isAnimatingRow && !isRevealed && finalColor) {
      cellClass += " animating";
    }

    if (isCurrentRow && letter && !isAnimating) {
      cellClass += " pop";
    }

    return (
      <span
        key={cellIndex}
        className={cellClass}
        style={{
          "--letter-index": cellIndex,
          "--delay": `${cellIndex * 0.3}s`,
        }}
      >
        {letter}
      </span>
    );
  };

  return (
    <div className={`word-grid ${shakeRow === rowIndex ? "shake" : ""}`}>
      {Array(letterLength) 
        .fill(null)
        .map((_, cellIndex) => renderCell(cellIndex))}
    </div>
  );
});

export default WordGrid;
