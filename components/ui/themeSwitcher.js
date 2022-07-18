import React from "react";
import { Button } from "reactstrap";
import { useTheme } from "next-themes";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {theme=="dark" && <Button onClick={() => setTheme("light")}>Light Theme</Button>}
      {theme=="light" && <Button onClick={() => setTheme("dark")}>Dark Theme</Button>}
    </>
  );
};

export default ThemeSwitcher;