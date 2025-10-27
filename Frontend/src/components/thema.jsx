// src/components/thema.jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
const [isDark, setIsDark] = useState(false);
const toggleDark = () => setIsDark(prev => !prev);

return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
    <div className={isDark ? "dark" : ""}>{children}</div>
    </ThemeContext.Provider>
);
};

export const useTheme = () => useContext(ThemeContext);
