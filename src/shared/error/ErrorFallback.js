import { Text, Button, Container, Center, Stack } from "@chakra-ui/react";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Container>
      <Center>
        <Stack justifyContent={"center"}>
          <Text textAlign={"center"}>Something went wrong:</Text>
          <Text textAlign={"center"}>{error.message}</Text>
          <Center>
            <Button onClick={resetErrorBoundary}>Try Again</Button>
          </Center>
        </Stack>
      </Center>
    </Container>
  );
}

export default ErrorFallback;
