// Keyboard.jsx
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useMemo } from "react";

export default function WordleKeyboard({
  onKeyPress,
  keyStates,
  disabled = false,
  language = "english",
}) {
  const getKeyboardLayout = () => {
    if (language === "arabic") {
      return {
        default: [
          "ض ص ث ق ف غ ع ه خ ح ج د",
          "ش س ي ب ل ا ت ن م ك ط",
          "{enter} ء ئ ؤ ر لا ى ة و ز ظ {bksp}",
        ],
      };
    }

    // Default English layout
    return {
      default: [
        "Q W E R T Y U I O P",
        "A S D F G H J K L",
        "{enter} Z X C V B N M {bksp}",
      ],
    };
  };

  const buttonTheme = useMemo(() => {
    const themes = [];

    const correctKeys = Object.keys(keyStates)
      .filter((k) => keyStates[k] === "correct")
      .join(" ");
    const presentKeys = Object.keys(keyStates)
      .filter((k) => keyStates[k] === "present")
      .join(" ");
    const absentKeys = Object.keys(keyStates)
      .filter((k) => keyStates[k] === "absent")
      .join(" ");

    // Only add themes that have keys
    if (correctKeys) {
      themes.push({
        class: "key-correct",
        buttons: correctKeys,
      });
    }

    if (presentKeys) {
      themes.push({
        class: "key-present",
        buttons: presentKeys,
      });
    }

    if (absentKeys) {
      themes.push({
        class: "key-absent",
        buttons: absentKeys,
      });
    }

    return themes;
  }, [keyStates]); // Recompute only when keyStates changes

  const handleKeyPress = (key) => {
    if (!disabled) {
      onKeyPress(key);
    }
  };

  return (
    <div className={`keyboard-container ${disabled ? "disabled" : ""}`}>
      <Keyboard
        layout={getKeyboardLayout()}
        display={{
          "{enter}": language === "arabic" ? "إدخال" : "ENTER",
          "{bksp}": language === "arabic" ? "⌫" : "⌫",
        }}
        onKeyPress={handleKeyPress}
        buttonTheme={buttonTheme}
        theme="hg-theme-default hg-layout-default"
      />
    </div>
  );
}
