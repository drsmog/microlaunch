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
        backgroundColor: "#FCFCFC",
        fontFamily: `"freigeist", sans-serif`,
        fontSize: "14.4px",
      },
    },
  },
});

export default theme;
