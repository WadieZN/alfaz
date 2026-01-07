import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import JoinGame from "./components/JoinGame";
import Game from "./components/game/Game";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/game/:gameId?" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App; 
