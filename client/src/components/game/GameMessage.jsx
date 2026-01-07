// GameMessage.jsx
function GameMessage({ message, gameStatus, onClose }) {
  if (!message) return null;

  return (
    <div className={`game-message ${gameStatus}`}>
      <span>{message}</span>
    </div>
  );
}

export default GameMessage;
