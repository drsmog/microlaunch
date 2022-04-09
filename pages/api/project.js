// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
import { ethers, Wallet, utils, BigNumber } from "ethers";
import { LENS_HUB_ABI } from "@src/shared/ABIs";

const LENS_HUB_CONTRACT = "0x4BF0c7AD32Fd2d32089790a54485e23f5C7736C0";
const PROJECT_OWNER_ADDRESS_PRIVATE_KEY =
  "a544578cc0e6977f9d15e1b71e74dbc58edd512e12bef701b6cc49d3351582c7";
const PROJECT_OWNER_PROFILE_ID = "0x011a";
const PROJECT_LENS_PUBLICATION_ID = "0x01";
const ethersProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc-mumbai.maticvigil.com"
);

const getSigner = () => {
  return new Wallet(PROJECT_OWNER_ADDRESS_PRIVATE_KEY, ethersProvider);
};

const getPostContentURIFromContract = async (profileId, postId) => {
  const lensHub = new ethers.Contract(
    LENS_HUB_CONTRACT,
    LENS_HUB_ABI,
    getSigner()
  );
  const profile = BigNumber.from(profileId).toNumber();
  const post = BigNumber.from(postId).toNumber();
  const data = await lensHub.getPub(profile, post);

  return data.contentURI;
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      //get contetURI from lens contract by profileId and pubId
      const url = await getPostContentURIFromContract(
        PROJECT_OWNER_PROFILE_ID,
        PROJECT_LENS_PUBLICATION_ID
      );
      //fetch IPFS json file
      const ipfsResponse = await fetch(url, {
        headers: {
          accept: "application/json",
        },
      });
      const ipfsData = await ipfsResponse.json();

      //retrun project json
      res.status(200).json({ data: { project: ipfsData } });
    } catch (error) {
      res
        .status(500)
        .json({ error: "API Error", internalMessage: error.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
