import { useState, useEffect } from "react";
import analyticsIcon from "../../assets/img/analytics.svg";
import settingsIcon from "../../assets/img/settings.svg";
import helpIcon from "../../assets/img/help.svg";
import newIcon from "../../assets/img/new.svg";
import lightIcon from "../../assets/img/light.svg";
import darkIcon from "../../assets/img/dark.svg";
import timerIcon from "../../assets/img/chrono.svg";

function MenuContent({
  stats,
  onReset,
  onToggleTheme,
  currentTheme = "dark",
  isGameActive,
}) {
  return (
    <div className="menu-sections">
      {/* Game Settings Section */}
      <section className="menu-section">
        <h3 className="section-title">
          <img src={settingsIcon} alt="Settings" /> Game Settings
        </h3>
        <div className="controls-grid">
          <button
            className="control-btn"
            onClick={onReset}
            disabled={isGameActive}
          >
            <img className="control-icon" src={newIcon} alt="" />
            <span className="control-text">New game</span>
          </button>
          <button className="control-btn" onClick={onToggleTheme}>
            <img
              className="control-icon"
              src={currentTheme === "dark" ? lightIcon : darkIcon}
              alt={currentTheme === "dark" ? "Dark mode" : "Light mode"}
            />
            <span className="control-text">
              {currentTheme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
      </section>

      {/* Game Stats Section */}
      <section className="menu-section">
        <h3 className="section-title">
          <img src={analyticsIcon} alt="Analytics" /> Game Stats
        </h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats?.gamesPlayed || 0}</span>
            <span className="stat-label">Games</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats?.winPercentage || 0}%</span>
            <span className="stat-label">Win %</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats?.currentStreak || 0}</span>
            <span className="stat-label">Streak</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats?.bestStreak || 0}</span>
            <span className="stat-label">Best</span>
          </div>
        </div>
      </section>

      {/* Game Rules Section */}
      <section className="menu-section">
        <h3 className="section-title">
          <img src={helpIcon} alt="Help" /> How to Play
        </h3>
        <ul className="rules-list">
          <li>Guess the word in 6 tries</li>
          <li>Each guess must be a valid five letters word</li>
          <li>After each guess, colors indicate the following:</li>
          <div className="color-examples">
            <div className="color-example">
              <div className="color-box correct"></div>
              <span>Correct letter & position</span>
            </div>
            <div className="color-example">
              <div className="color-box present"></div>
              <span>Correct letter, wrong position</span>
            </div>
            <div className="color-example">
              <div className="color-box absent"></div>
              <span>Letter not in word</span>
            </div>
          </div>
        </ul>
      </section>

      {/* Footer Section */}
      <section className="menu-footer">
        <p className="footer-text">
          Built with 💚 by{" "}
          <a
            href="https://wadyzen.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            WadyZen
          </a>
        </p>
      </section>
    </div>
  );
}

export default MenuContent;
