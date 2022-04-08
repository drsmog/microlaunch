// import erc721POF from "@src/shared/erc721-pof.json";
// import { providers, Contract, ethers, utils } from "ethers";
import { useContract, useProvider, useSigner } from "wagmi";

export const useWallet = () => {
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

  return {
    resolveAddress,
  };
};
