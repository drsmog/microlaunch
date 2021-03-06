import {
  Text,
  Box,
  Button,
  Container,
  Flex,
  Image,
  Stack,
  Divider,
  Center,
} from "@chakra-ui/react";
import { usePageState } from "@src/shared/state";
import { useWallet } from "@src/shared/walletV1";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useApi } from "@src/shared/api";
import Avatar from "@src/shared/Avatar";
import frontUtils from "@src/shared/front-utils";
import useErrorHandler from "@src/shared/error/useErrorHandler";
import dynamic from "next/dynamic";
const ReactProgressMeter = dynamic(import("react-progress-meter"), {
  ssr: false,
});

import Tilt from "react-tilt";

export default function Home() {
  const errorHandler = useErrorHandler();
  const wallet = useWallet();
  const [project, setProject] = useState();
  const [followersData, setFollowersData] = useState();
  const [isAlreadyContributor, setIsAlreadyContributor] = useState(false);
  const [state, methods] = usePageState();
  const api = useApi();

  const addAddressInFollowers = (address) => {
    if (followersData.followers.items) {
      const newData = { ...followersData };
      newData.followers.items.push({
        wallet: { address },
      });
      setFollowersData(newData);
    } else {
      const newData = { followers: { items: [] } };
      newData.followers.items.push({
        wallet: { address },
      });
      setFollowersData(newData);
    }
  };

  const addSomeFakeAddresses = (addresses, followers) => {
    const newData = { ...followers };
    addresses.forEach((address) => {
      newData.followers.items.push({
        wallet: { address },
      });
    });
    return newData;
  };

  const handleFollowClick = async () => {
    try {
      if (!state.currentAddress) {
        methods.openConnectToWallet();
        return;
      }
      const res = await wallet.followProfileForFree();
      addAddressInFollowers(state.currentAddress);
    } catch (error) {
      errorHandler(error, ["Main Page"]);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      let response = await api.call("get", "/api/project");
      setProject(response.project);
      response = await api.call("get", "/api/followers");
      const followers = addSomeFakeAddresses(
        [
          "0xf0e3d5f789572f95e5b0e4f7f8ca50bfb3df7c46",
          "0xac1c5131f0a85eafaa637a1ab342ed8e7771212d",
          "0xe3c98cbd63d6142e40848d432af2971975a54f6f",
          "0x2048ec1c8ad3592124f3c6f376d79ba1a98c4228",
          "0x681cbae1c41e5eec8411dd8e009fa71f81d03f7f",
        ],
        response.followers
      );
      setFollowersData(followers);
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log(project, followersData);
  }, [project, followersData]);

  useEffect(() => {
    if (
      !followersData ||
      !followersData.followers.items ||
      !state.currentAddress
    ) {
      return;
    }
    const contributor = followersData.followers.items.find(
      (item) =>
        item.wallet.address.toLowerCase() === state.currentAddress.toLowerCase()
    );
    if (contributor) {
      setIsAlreadyContributor(true);
    } else {
      setIsAlreadyContributor(false);
    }
  }, [followersData, state.currentAddress]);

  return (
    <Box>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxW={"7xl"} pt="60px" mb="160px">
        <Text
          textAlign={"center"}
          fontWeight={700}
          fontSize="48px"
          color={"white"}
        >
          {project && project.project.name} {!project && "PROJECT"}
        </Text>
        <Flex flexWrap={"wrap"} mt="74px">
          <Flex w={["100%", "100%", "70%"]}>
            {project && (
              <Flex
                flexDirection={"column"}
                justifyContent="center"
                alignItems={"center"}
                w="100%"
              >
                <Tilt
                  className="Tilt"
                  options={{ max: 25 }}
                  style={{ height: 360, width: 360 }}
                >
                  <Image
                    src={`https://ipfs.io/ipfs/${project.image.split("//")[1]}`}
                    alt="project image"
                    borderRadius={"8px"}
                    boxShadow="5px 5px 8px 1px rgba(0,0,0,0.66)"
                    cursor={"pointer"}
                  />
                </Tilt>
                <Box color={"white"} mt="60px" w="360px">
                  <Text fontSize={"22px"}>{project.project.description}</Text>
                  <Divider color={"white"} mt="12px" mb="12px" />
                  <Text fontWeight={700}>Project Funding Goals:</Text>
                  <Text>Followers: {project.project.followerGoal}</Text>
                  <Text>Funds: {project.project.fundingGoal}</Text>
                </Box>
                {!isAlreadyContributor && (
                  <Center mt="34px">
                    <button
                      onClick={handleFollowClick}
                      className="btn-hover color-4"
                    >
                      Become Contributor
                    </button>
                  </Center>
                )}
                {isAlreadyContributor && (
                  <Center mt="34px">
                    <Text
                      fontWeight={700}
                      color="white"
                      border="solid 1px white"
                      p="5px"
                    >
                      You are already following and contributing this project
                    </Text>
                  </Center>
                )}
              </Flex>
            )}
          </Flex>
          <Flex
            w={["100%", "100%", "30%"]}
            borderLeft={["unset", "unset", "1px solid grey"]}
            flexDirection="column"
            pl={["unset", "unset", "40px"]}
            mt={["60px", "60px", "unset"]}
          >
            <Text
              fontWeight={700}
              fontSize="48px"
              color={"white"}
              textAlign="center"
            >
              Contributors
            </Text>
            {followersData && (
              <Flex flexDirection={"row"} flexWrap="wrap" mt="20px">
                {followersData.followers.items.map((follower, index) => {
                  return (
                    <Flex
                      key={`follower-${follower.wallet.address}-index`}
                      justifyContent="center"
                      alignItems={"center"}
                      flexDirection="column"
                      ml="20px"
                      mt="20px"
                    >
                      <Avatar
                        hasHoverEffect={true}
                        address={follower.wallet.address}
                        cursor="pointer"
                        w="64px"
                        h="64px"
                        minW="64px"
                        minH="64px"
                        boxShadow="5px 5px 8px 1px rgba(0,0,0,0.66)"
                      />
                      <Text
                        color={"white"}
                        mt="12px"
                        borderRadius={"32px"}
                        border="1px solid white"
                        pl="5px"
                        pr="5px"
                      >
                        {frontUtils.get6DigitOfAccount(follower.wallet.address)}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            )}
            {!isAlreadyContributor && (
              <Center mt="34px">
                <button
                  onClick={handleFollowClick}
                  className="btn-hover color-4"
                >
                  Become Contributor
                </button>
              </Center>
            )}
            {isAlreadyContributor && (
              <Center mt="34px">
                <Text
                  fontWeight={700}
                  color="white"
                  border="solid 1px white"
                  p="5px"
                >
                  You are already following and contributing this project
                </Text>
              </Center>
            )}
          </Flex>
        </Flex>
        <Stack mt="40px">
          <Text
            textAlign={"center"}
            fontWeight={700}
            fontSize="48px"
            color={"white"}
          >
            {"Funding Progress..."}
          </Text>
          <Box ml="20px" mr="20px" p="20px" pl="60px" pr="60px">
            <ReactProgressMeter
              currentProgress={64}
              showPercent={true}
              show={true}
              color="yellow"
              width="100%"
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
