import { useTheme } from "../context/ThemeContext";

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-md border-2 cursor-pointer bg-surface-raised text-content hover:bg-black/25"
    >
      {theme == "dark" ? "Ändra till light" : "Ändra till dark"}
    </button>
  );
}

export default ThemeButton;
