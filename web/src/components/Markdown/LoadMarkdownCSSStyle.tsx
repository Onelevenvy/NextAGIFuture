import { useEffect } from "react";
import { useColorMode } from "@chakra-ui/react"; // 假设你使用的是 @chakra-ui/react 来处理 colorMode

const LoadMarkdownCSSStyle = () => {
  const { colorMode } = useColorMode();

  useEffect(() => {
    const loadCSS = async () => {
      if (colorMode === "dark") {
        await import("highlight.js/styles/github-dark.css");
      } else {
        await import("highlight.js/styles/github.css");
      }
    };

    loadCSS();
  }, [colorMode]);

  return null;
};

export default LoadMarkdownCSSStyle;
