// useGameMessage.js
import { useState, useCallback } from "react";

export function useGameMessage() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const showMessage = useCallback((text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
    setMessageType("info");
  }, []);

  const showTemporaryMessage = useCallback(
    (text, type = "info", duration = 3000) => {
      showMessage(text, type);
      setTimeout(() => clearMessage(), duration);
    },
    [showMessage, clearMessage]
  );

  return {
    message,
    messageType,
    showMessage,
    clearMessage,
    showTemporaryMessage,
  };
}
