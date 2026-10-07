import { useTheme } from "../context/ThemeContext";

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="relative shrink-0 inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={theme === "dark"}
        onChange={toggleTheme}
      />

      <div className="w-16 h-8 rounded-full bg-neutral-900 peer-checked:bg-blue-600 transition-colors flex items-center justify-between px-2 text-sm select-none">
        <span>🌙</span>
        <span className="text-yellow-800">☀️</span>
      </div>

      <span className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform peer-checked:translate-x-8" />
    </label>
  );
}

export default ThemeButton;
