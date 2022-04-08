import { Link, Box, HStack } from "@chakra-ui/react";
import { usePageState } from "../state";

export const NavLinksDesktop = () => {
  const [state] = usePageState();
  return (
    <HStack spacing={"38px"} ml="20px" mr="20px">
      {/* <Box>
        <Link
          isExternal={false}
          href="/browse"
          fontWeight={700}
          fontSize="20px"
        >
          Explore
        </Link>
      </Box> */}
    </HStack>
  );
};
