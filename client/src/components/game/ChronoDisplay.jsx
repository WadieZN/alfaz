// ChronoDisplay.jsx
import chronoIcon from "../../assets/img/chrono.svg";

function ChronoDisplay({
  formattedTime,
  isTimeUp,
  hasWon,
  getTimePercentage,
  showProgressBar = true,
}) {
  const percentage = getTimePercentage();
  let timeClass = "chrono-time";

  if (hasWon) {
    timeClass += " chrono-won"; 
  } else if (percentage <= 25) {
    timeClass += " chrono-critical";
  } else if (percentage <= 50) {
    timeClass += " chrono-warning";
  }

  return (
    <div className="chrono-container">
      <div className={timeClass}>
        <img className="chrono-icon" src={chronoIcon} alt="Chrono" />
        <span className="chrono-text">{formattedTime}</span>
        {isTimeUp && <span className="chrono-alert">TIME'S UP!</span>}
        {hasWon && <span className="chrono-success">WINNER!</span>}
      </div>

      {showProgressBar && !hasWon && (
        <div className="chrono-progress-bar">
          <div
            className="chrono-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {hasWon && showProgressBar && (
        <div className="chrono-progress-bar">
          <div
            className="chrono-progress-fill chrono-fill-won"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default ChronoDisplay;
