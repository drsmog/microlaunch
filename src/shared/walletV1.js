// import erc721POF from "@src/shared/erc721-pof.json";
import { providers, Contract, ethers, utils } from "ethers";
import { LENS_HUB_ABI, MockProfileCreationProxyABI } from "@src/shared/ABIs";
import { useState, useEffect } from "react";
import { useContract, useProvider, useSigner, useAccount } from "wagmi";

export const useWallet = () => {
  const [{ data: account }] = useAccount();
  const [signer, setSigner] = useState();

  useEffect(() => {
    (async () => {
      try {
        const res = await account?.connector?.getSigner();
        setSigner(res);
      } catch (e) {
        setSigner(undefined);
      }
    })();
  }, [account?.connector]);

  const contract = useContract({
    addressOrName: "0x39c9Bc23B1F993B94dEC69B7Ac11C95145EC4e15",
    contractInterface: MockProfileCreationProxyABI,
    signerOrProvider: signer,
  });
  const lensContract = useContract({
    addressOrName: "0x4BF0c7AD32Fd2d32089790a54485e23f5C7736C0",
    contractInterface: LENS_HUB_ABI,
    signerOrProvider: signer,
  });

  const provider = useProvider();
  const [, getSigner] = useSigner();

  const resolveAddress = async (address) => {
    const contractRegex = new RegExp(/^0x[a-fA-F0-9]{40}$/);
    const ethRegex = new RegExp(
      /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/
    );
    if (contractRegex.test(address)) {
      return address;
    }
    if (ethRegex.test(address)) {
      return provider.resolveName(address);
    }
    throw new Error("Invalid Address Format");
  };

  const followProfileForFree = async () => {
    try {
      const result = await lensContract.functions.follow([282], [[]]);
      return result;
    } catch (error) {
      console.log(error);
    }
  };

  const followProfile = async () => {
    try {
      const abi = new utils.AbiCoder();
      const followModuleData = abi.encode(
        ["uint256", "address", "address"],
        [
          1000000,
          "0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e",
          "0x6Cf6A0384be2e95179c692047361F8Fa944a8BdA",
        ]
      );
      console.log(followModuleData);
      // console.log(followModuleData);
      // var byteArray = [];
      // for (var i = 2; i < followModuleData.length; i++) {
      //   byteArray.push(Number(followModuleData.charAt(i)));
      // }
      // console.log(byteArray);

      const result = await contract.functions.proxyCreateProfile({
        to: "0x7A4D89DE9d662c5949B31Ad5ae63195D101E7E1C",
        handle: "follower3",
        imageURI:
          "https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan",
        followModule: "0x286c330beFfC157139ffCc32e97aC2f1fC7D1092",
        followModuleData:
          "00000000000000000000000000000000000000000000000000000000000f42400000000000000000000000002d7882bedcbfddce29ba99965dd3cdf7fcb10a1e0000000000000000000000006cf6a0384be2e95179c692047361f8fa944a8bda",
        followNFTURI:
          "https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan",
      });
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
    }
    console.log("follow");
  };
  // const followProfile = async () => {
  // };

  return {
    followProfile,
    followProfileForFree,
    resolveAddress,
  };
};
