// MenuToggle.jsx
function MenuToggle({ isOpen, onClick }) {
  return (
    <button
      className={`menu-toggle ${isOpen ? "open" : ""}`}
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <span className="menu-line menu-line-top"></span>
      <span className="menu-line menu-line-bottom"></span>
    </button>
  );
}

export default MenuToggle;
