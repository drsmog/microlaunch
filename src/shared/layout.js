import { usePageState } from "@src/shared/state";
import { ChakraProvider, Progress, Box, useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import theme from "@src/shared/theme";
import NavigationBar from "@src/shared/navigation";
import { useAccount } from "wagmi";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@src/shared/error/ErrorFallback";
import useErrorHandler from "@src/shared/error/useErrorHandler";

export default function Layout({ children }) {
  const errorHandler = useErrorHandler();
  const [state, methods] = usePageState();
  const [{ data, error, loading }, disconnect] = useAccount({
    fetchEns: true,
  });

  useEffect(() => {
    window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
      errorHandler(
        new Error(errorMsg),
        ["global-unhandeled"],
        {
          errorPath: url,
          lineNumber,
        },
        false
      );
    };
  }, []);

  useEffect(() => {
    if (data?.address) {
      methods.setCurrentAddress(data.address);
    } else {
      methods.setCurrentAddress(null);
    }
    if (error) {
      console.log("error>", error);
    }
  }, [data, error, loading, methods]);

  const errorBoundaryHandler = (error, info) => {
    errorHandler(
      error,
      "global-error-boundary",
      {
        errorPath: url,
        lineNumber,
        componentStack: info?.componentStack,
      },
      false
    );
  };

  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={errorBoundaryHandler}
      >
        <Progress
          size="xs"
          isIndeterminate
          display={state.isApiInProgress ? "block" : "none"}
          position="fixed"
          top={0}
          width="100%"
          zIndex="9999"
        />

        <NavigationBar />
        {children}
      </ErrorBoundary>
    </ChakraProvider>
  );
}
