import { Box, Button, Image, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { usePageState } from "@src/shared/state";
import { useRouter } from "next/router";
import WalletConnectionTypeModal from "@src/shared/navigation/WalletConnectionTypeModal";
import ProfileMenu from "@src/shared/navigation/ProfileMenu";
import { NavLinksDesktop } from "@src/shared/navigation/NavLinksDesktop";

export default function NavigationBar({ ...props }) {
  const [state, methods] = usePageState();
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleWalletConnect = () => {
    methods.openConnectToWallet();
  };

  return (
    <Box>
      <Box
        w="100%"
        zIndex={3}
        backgroundColor={"black"}
        pl={["0px", "0px", "40px"]}
        pr={["0px", "0px", "40px"]}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          h={"56px"}
        >
          <Box
            onClick={handleLogoClick}
            cursor="pointer"
            minW={"135px"}
            ml="10px"
          >
            <Text color={"white"} fontSize="48px" fontWeight={700}>
              MicroLaunch
            </Text>
          </Box>
          <Box
            flexGrow={1}
            ml="40px"
            mr="40px"
            display={["none", "none", "flex"]}
            justifyContent="center"
          ></Box>
          <Box
            display={["none", "none", "none", "flex"]}
            justifyContent="end"
            alignItems="end"
            // flexGrow={1}
          >
            <NavLinksDesktop />
          </Box>
          <Box display="flex" justifyContent="end" alignItems="center">
            {state.currentAddress && <ProfileMenu mr="10px" />}
            {!state.currentAddress && (
              <Box display={"flex"} alignItems="center" p={2}>
                <Button
                  onClick={handleWalletConnect}
                  borderRadius="30px"
                  pl="40px"
                  pr="40px"
                  fontSize="20px"
                  fontWeight={700}
                >
                  Login
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <WalletConnectionTypeModal isOpen={state.isWalletModalOpen} />
    </Box>
  );
}
