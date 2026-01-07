// ResumeScreen.jsx
import React from "react";

function ResumeScreen({ onResume, onNewGame, hasSavedGame }) {
  return (
    <div className="resume-screen-overlay">
      <div className="resume-screen-content">
        <h2>Welcome to Kelmat</h2>

        {hasSavedGame && (
          <div className="resume-options">
            <button className="resume-button primary-button" onClick={onResume}>
              Resume Game
            </button>
            <p className="resume-note">You have a game in progress</p>
          </div>
        )}

        <button
          className="new-game-button secondary-button"
          onClick={onNewGame}
        >
          {hasSavedGame ? "Start New Game" : "Play"}
        </button>

        <span>The game will start once everyone is ready.</span>
      </div>
    </div>
  );
}

export default ResumeScreen;
