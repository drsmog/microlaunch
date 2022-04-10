import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    special: {
      jeka: "blue",
    },
    gray: {
      jeka: "red",
    },
  },
  styles: {
    global: {
      "html, body": {
        backgroundColor: "#282828",
        fontFamily: `"freigeist", sans-serif`,
      },
    },
  },
});

export default theme;
