import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Image,
  Text,
  Stack,
  Center,
  Link,
  Flex,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useConnect } from "wagmi";
import { usePageState } from "@src/shared/state";

function WalletConnectionTypeModal({ isOpen }) {
  const [{ data, error }, connect] = useConnect();
  const [, methods] = usePageState();

  useEffect(() => {
    console.log("wagmi::wallet connection", data.connected);
  }, [data, data.connector]);

  const handleConnectorClick = (connector) => {
    connect(connector);
    methods.onWalletModalClose();
  };

  const connectorsOptions = {
    MetaMask: {
      style: {
        background:
          "linear-gradient(90deg, #ED692C -2.07%, #F9DB52 101.76%), linear-gradient(90deg, #ED692C -2.07%, #F9DB52 101.76%)",
        _hover: {
          background:
            "linear-gradient(90deg, #ED692C -2.07%, #F9DB52 101.76%), linear-gradient(90deg, #ED692C -2.07%, #F9DB52 101.76%)",
        },
        _active: {
          background:
            "linear-gradient(90deg, #ED692C -2.07%, #F9DB52 101.76%), linear-gradient(90deg, #ED692C -2.07%, #F9DB52 101.76%)",
        },
      },
      image: "/wallet/metamask-fox.svg",
    },
    WalletConnect: {
      style: {
        background: "linear-gradient(90deg, #8326F5 -2.07%, #031AF5 101.76%)",

        _hover: {
          background: "linear-gradient(90deg, #8326F5 -2.07%, #031AF5 101.76%)",
        },
        _active: {
          background: "linear-gradient(90deg, #8326F5 -2.07%, #031AF5 101.76%)",
        },
      },
      image: "/wallet/walletconnect-logo.svg",
    },
    "Coinbase Wallet": {
      style: {
        background: "linear-gradient(90deg, #45B2D5 -2.07%, #0066B0 101.76%);",

        _hover: {
          background:
            "linear-gradient(90deg, #45B2D5 -2.07%, #0066B0 101.76%);",
        },
        _active: {
          background:
            "linear-gradient(90deg, #45B2D5 -2.07%, #0066B0 101.76%);",
        },
      },
      image: "/wallet/coin-base.png",
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={methods.onWalletModalClose}
      size={"sm"}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sign in with your crypto wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column" mb="40px">
          <Stack>
            {data.connectors
              .filter((connector) => connector.ready)
              .map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => handleConnectorClick(connector)}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  autoFocus={true}
                  color={"white"}
                  borderRadius={"20px"}
                  height={"60px"}
                  {...connectorsOptions[connector.name]?.style}
                >
                  <Flex
                    justifyContent={"space-between"}
                    w="100%"
                    alignItems={"center"}
                  >
                    <Text ml="10px" fontWeight={700}>
                      {connector.name}
                    </Text>
                    <Image
                      w="40px"
                      h="40px"
                      src={connectorsOptions[connector.name]?.image}
                      alt="wallet logo svg"
                    />
                  </Flex>
                </Button>
              ))}
          </Stack>
          <Center mt="40px">
            <Stack>
              <Text fontWeight={700} textAlign={"center"}>
                New to Ethereum?
              </Text>
              <Link
                target={"_blank"}
                fontWeight={700}
                color="grey"
                textAlign={"center"}
                href="https://help.foundation.app/en/articles/4731452-a-complete-guide-to-setting-up-a-wallet-and-getting-eth"
              >
                Learn more about wallets
              </Link>
            </Stack>
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
export default WalletConnectionTypeModal;
