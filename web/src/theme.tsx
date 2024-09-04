import { extendTheme } from "@chakra-ui/react";

const disabledStyles = {
  _disabled: {
    backgroundColor: "ui.main",
  },
};

const theme = extendTheme({
  colors: {
    ui: {
      main: "#2762e7", // 将主题色改为蓝色
      secondary: "#EDF2F7",
      success: "#48BB78",
      danger: "#E53E3E",
      white: "#FFFFFF",
      dark: "#1A202C",
      darkSlate: "#252D3D",
      bgMain: "#f2f4f7",
      bgMainDark: "#f2f4f7",

      hoverColor: "#e0e0e0",
      hoverColorDark: "#e0e0e0",
      selctedColor: "#e0e0e0",
      selctedColorDark: "#e0e0e0",
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          backgroundColor: "ui.main",
          color: "ui.white",
          _hover: {
            backgroundColor: "#1C86EE", // 蓝色变体
          },
          _disabled: {
            ...disabledStyles,
            _hover: {
              ...disabledStyles,
            },
          },
        },
        danger: {
          backgroundColor: "ui.danger",
          color: "ui.white",
          _hover: {
            backgroundColor: "#E32727",
          },
        },
      },
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: {
            _selected: {
              color: "ui.main",
            },
          },
        },
      },
    },
  },
});

export default theme;
