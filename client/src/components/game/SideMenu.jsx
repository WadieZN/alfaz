// SideMenu.jsx
import { useEffect } from "react";

function SideMenu({ isOpen, onClose, children }) {
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`menu-overlay ${isOpen ? "open" : ""}`}
        onClick={handleOverlayClick}
      />

      {/* Side Menu */}
      <aside className={`side-menu ${isOpen ? "open" : ""}`}>
        <div className="menu-header">
          <h2 className="menu-title">Menu</h2>
          <button
            className="menu-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="menu-content">{children}</div>
      </aside>
    </>
  );
}

export default SideMenu;
