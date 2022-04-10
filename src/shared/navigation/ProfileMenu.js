import {
  Box,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChevronRight,
  faPowerOff,
} from "@fortawesome/free-solid-svg-icons";
import { usePageState } from "@src/shared/state";
import frontUtils from "@src/shared/front-utils";
import { useAccount } from "wagmi";
import Avatar from "../Avatar";

export default function ProfileMenu({ ...props }) {
  const [, disconnect] = useAccount({
    fetchEns: true,
  });
  const [state, methods] = usePageState();
  return (
    <Menu>
      <MenuButton
        {...props}
        as={Button}
        borderRadius={"150px"}
        border="solid 3px #84A6D8"
        backgroundColor="#F8E430"
        w="90px"
        height={"40px"}
        p={0}
      >
        <Flex justifyContent={"center"} alignItems={"center"} w="100%">
          <Avatar
            address={state.currentAddress}
            w="32px"
            h="32px"
            minW="32px"
            minH="32px"
            mr="10px"
          />

          <FontAwesomeIcon icon={faBars} color={"black"} size="sm" />
        </Flex>
      </MenuButton>
      <MenuList
        border="1px solid #041439"
        backgroundColor="#FFE200"
        borderRadius={"8px"}
      >
        <MenuItem
          minW={"300px"}
          fontWeight={700}
          fontSize="20px"
          display={"flex"}
          justifyContent={"space-between"}
          color="#041439"
          _hover={{ backgroundColor: "#FFE200" }}
          _active={{ backgroundColor: "#FFE200" }}
          _focus={{ backgroundColor: "#FFE200" }}
        >
          <Box display={"flex"} alignItems={"center"}>
            <Box
              mr="10px"
              borderRadius={"150px"}
              border="solid 3px #84A6D8"
              backgroundColor="#F8E430"
            >
              <Avatar
                address={state.currentAddress}
                w="32px"
                h="32px"
                minW="32px"
                minH="32px"
              />
            </Box>
            <Link isExternal={false} href="/">
              View Profile
            </Link>
          </Box>
          <FontAwesomeIcon icon={faChevronRight} />
        </MenuItem>
        <MenuItem
          fontWeight={700}
          fontSize="20px"
          display={"flex"}
          justifyContent={"space-between"}
          color="#041439"
          _hover={{ backgroundColor: "#FFE200" }}
          _active={{ backgroundColor: "#FFE200" }}
          _focus={{ backgroundColor: "#FFE200" }}
          onClick={disconnect}
        >
          <Box display={"flex"} alignItems={"center"}>
            <Box mr="10px" p="8px">
              <FontAwesomeIcon icon={faPowerOff} />
            </Box>
            <Link isExternal={false}>Disconnect</Link>
          </Box>
          <FontAwesomeIcon icon={faChevronRight} />
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
