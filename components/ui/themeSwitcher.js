import React from "react";
import { Button } from "reactstrap";
import { useTheme } from "next-themes";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {theme=="dark" && <Button onClick={() => setTheme("light")}><i className="fas fa-sun"></i> Light Theme</Button>}
      {theme=="light" && <Button onClick={() => setTheme("dark")}><i className="fas fa-moon"></i> Dark Theme</Button>}
    </>
  );
};

export default ThemeSwitcher;