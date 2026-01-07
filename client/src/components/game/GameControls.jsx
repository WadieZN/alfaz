// GameControls.jsx
function GameControls({ gameStatus, isAnimating, onReset }) {
  const showPlayAgain = gameStatus !== "playing";

  if (!showPlayAgain) return null;

  return (
    <div className="game-controls">
      {showPlayAgain && (
        <button onClick={onReset} className="reset-button">
          Restart
        </button>
      )}
    </div>
  );
}

export default GameControls;
