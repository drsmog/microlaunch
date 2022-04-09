import "isomorphic-unfetch";
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
import { ethers, Wallet, utils, BigNumber } from "ethers";
import { NFTStorage, File } from "nft.storage";

import mime from "mime";

import fs from "fs";

import path from "path";

import { createClient, createRequest, gql } from "@urql/core";
import omitDeep from "omit-deep";
import { LENS_HUB_ABI } from "./ABIs.mjs";
const LENS_HUB_CONTRACT = "0x4BF0c7AD32Fd2d32089790a54485e23f5C7736C0";

const NFT_STORAGE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGJlRDA0QmZkMzQxZmYxRWE1NERCNGYzOUU4NDMwODA0MzA3NGZlY2YiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0OTQ4ODgxOTE2MiwibmFtZSI6ImRldiJ9.ObTcLnn53afQG0YapbP28J_sO24u7X0XqEyUESyjad4";

const APIURL = "https://api-mumbai.lens.dev/";

const PROJECT_OWNER_ADDRESS = "0x7A4D89DE9d662c5949B31Ad5ae63195D101E7E1C";
const PROJECT_OWNER_PROFILE_HANDLE = "bankless1";
const PROJECT_OWNER_PROFILE_ID = "0xf3";
const PROJECT_LENS_PUBLICATION_ID = "0x0b";
const PROJECT_IPFS_URI =
  "https://ipfs.io/ipfs/bafyreig2d6p3b6atorjhjv62uoxx6zuei55unyz5s54ixehx4arnct2ydq/metadata.json";
const PROJECT_OWNER_ADDRESS_PRIVATE_KEY =
  "a544578cc0e6977f9d15e1b71e74dbc58edd512e12bef701b6cc49d3351582c7";

const ethersProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc-mumbai.maticvigil.com"
);

const getSigner = () => {
  return new Wallet(PROJECT_OWNER_ADDRESS_PRIVATE_KEY, ethersProvider);
};

const signedTypeData = (domain, types, value) => {
  const signer = getSigner();
  // remove the __typedname from the signature!
  return signer._signTypedData(
    omitDeep(domain, "__typename"),
    omitDeep(types, "__typename"),
    omitDeep(value, "__typename")
  );
};

async function fileFromPath(filePath) {
  const content = await fs.promises.readFile(filePath);
  const type = mime.getType(filePath);
  return new File([content], path.basename(filePath), { type });
}

async function storeNFT(imagePath, name, description, metadata) {
  const image = await fileFromPath(imagePath);
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });
  return nftstorage.store({
    image,
    name,
    description,
    ...metadata,
  });
}

const uploadFile = async (imagePath, name, description, metadata) => {
  const result = await storeNFT(imagePath, name, description, metadata);
  return `https://ipfs.io/ipfs/${result.ipnft}/metadata.json`;
  // const response = await fetch(
  //   `https://ipfs.io/ipfs/${result.ipnft}/metadata.json`,
  //   {
  //     headers: {
  //       accept: "application/json",
  //     },
  //   }
  // );
  // return response.json();
};

const uploadProjectJson = async () => {
  let rawdata = fs.readFileSync("scripts/project.json");
  let projectJson = JSON.parse(rawdata);
  console.log("============= PROJECT ================");
  const projectIpfsLink = await uploadFile(
    "scripts/project.png",
    "bankless-podcast",
    "creating podcast",
    { project: projectJson }
  );
  console.log("--- IPFS Link");
  console.log(projectIpfsLink);
  console.log("============= END PROJECT ================");
};

const login = async (address) => {
  console.log(">>> API LOGIN");
  const client = new createClient({
    url: APIURL,
  });
  const wallet = new Wallet(PROJECT_OWNER_ADDRESS_PRIVATE_KEY);
  const QUERY = gql`
    query ($request: ChallengeRequest!) {
      challenge(request: $request) {
        text
      }
    }
  `;

  let response = await client
    .query(QUERY, {
      request: { address },
    })
    .toPromise();
  const challenge = response.data.challenge.text;
  const signature = await wallet.signMessage(challenge);

  const AUTHENTICATION = gql`
    mutation ($request: SignedAuthChallenge!) {
      authenticate(request: $request) {
        accessToken
        refreshToken
      }
    }
  `;
  response = await client
    .mutation(AUTHENTICATION, {
      request: { address, signature },
    })
    .toPromise();
  const { accessToken, refreshToken } = response.data.authenticate;
  return { accessToken, refreshToken };
};

const createProfile = async (address, handle) => {
  const token = await login(address);
  const client = new createClient({
    url: APIURL,
    fetchOptions: () => {
      return {
        headers: {
          "x-access-token": token ? `Bearer ${token.accessToken}` : "",
        },
      };
    },
  });
  const QUERY = gql`
    mutation ($request: CreateProfileRequest!) {
      createProfile(request: $request) {
        ... on RelayerResult {
          txHash
        }
        ... on RelayError {
          reason
        }
        __typename
      }
    }
  `;

  let response = await client
    .mutation(QUERY, {
      request: {
        handle: handle,
        profilePictureUri: null,
        followNFTURI: null,
        followModule: {
          // emptyFollowModule: true,
          feeFollowModule: {
            amount: {
              currency: "0x3C68CE8504087f89c640D02d133646d98e64ddd9",
              value: "0.01",
            },
            recipient: address,
          },
        },
        // followModule: {
        //   feeFollowModule: {
        //     amount: {
        //       currency: "0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e",
        //       value: "0.01",
        //     },
        //     recipient: "0x6Cf6A0384be2e95179c692047361F8Fa944a8BdA",
        //   },
        // },
      },
    })
    .toPromise();
  console.log(response);
};

const HAS_TX_BEEN_INDEXED = gql`
  query ($request: HasTxHashBeenIndexedRequest!) {
    hasTxHashBeenIndexed(request: $request) {
      ... on TransactionIndexedResult {
        indexed
        txReceipt {
          to
          from
          contractAddress
          transactionIndex
          root
          gasUsed
          logsBloom
          blockHash
          transactionHash
          blockNumber
          confirmations
          cumulativeGasUsed
          effectiveGasPrice
          byzantium
          type
          status
          logs {
            blockNumber
            blockHash
            transactionIndex
            removed
            address
            data
            topics
            transactionHash
            logIndex
          }
        }
        metadataStatus {
          status
          reason
        }
      }
      ... on TransactionError {
        reason
        txReceipt {
          to
          from
          contractAddress
          transactionIndex
          root
          gasUsed
          logsBloom
          blockHash
          transactionHash
          blockNumber
          confirmations
          cumulativeGasUsed
          effectiveGasPrice
          byzantium
          type
          status
          logs {
            blockNumber
            blockHash
            transactionIndex
            removed
            address
            data
            topics
            transactionHash
            logIndex
          }
        }
      }
      __typename
    }
  }
`;
const hasTxBeenIndexed = async (txHash, accessToken) => {
  const client = new createClient({
    url: APIURL,
    fetchOptions: () => {
      return {
        headers: {
          "x-access-token": `Bearer ${accessToken}`,
        },
      };
    },
  });
  let response = await client
    .query(HAS_TX_BEEN_INDEXED, {
      request: {
        txHash,
      },
    })
    .toPromise();
  return response;
};

const pollUntilIndexed = async (txHash, accessToken) => {
  while (true) {
    const result = await hasTxBeenIndexed(txHash, accessToken);
    console.log("pool until indexed: result", result.data);
    console.log("txHash", txHash);

    const response = result.data.hasTxHashBeenIndexed;
    if (response.__typename === "TransactionIndexedResult") {
      console.log("pool until indexed: indexed", response.indexed);
      console.log(
        "pool until metadataStatus: metadataStatus",
        response.metadataStatus
      );

      if (response.indexed) {
        return response;
      }
      if (response.metadataStatus) {
        if (response.metadataStatus.status === "SUCCESS") {
          return response;
        }

        if (response.metadataStatus.status === "METADATA_VALIDATION_FAILED") {
          throw new Error(response.metadataStatus.reason);
        }
      }
      console.log(
        "pool until indexed: sleep for 1500 milliseconds then try again"
      );
      // sleep for a second before trying again
      await sleep(1500);
    } else {
      // it got reverted and failed!
      throw new Error(response.reason);
    }
  }
};

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const createPost = async (address) => {
  const token = await login(address);
  const client = new createClient({
    url: APIURL,
    fetchOptions: () => {
      return {
        headers: {
          "x-access-token": token ? `Bearer ${token.accessToken}` : "",
        },
      };
    },
  });
  const QUERY = gql`
    mutation ($request: CreatePublicPostRequest!) {
      createPostTypedData(request: $request) {
        id
        expiresAt
        typedData {
          types {
            PostWithSig {
              name
              type
            }
          }
          domain {
            name
            chainId
            version
            verifyingContract
          }
          value {
            nonce
            deadline
            profileId
            contentURI
            collectModule
            collectModuleData
            referenceModule
            referenceModuleData
          }
        }
      }
    }
  `;

  let response = await client
    .mutation(QUERY, {
      request: {
        profileId: PROJECT_OWNER_PROFILE_ID,
        contentURI: PROJECT_IPFS_URI,
        collectModule: {
          revertCollectModule: true,
        },
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      },
    })
    .toPromise();

  const typedData = response.data.createPostTypedData.typedData;
  console.log("create post: typedData", typedData);

  const signature = await signedTypeData(
    typedData.domain,
    typedData.types,
    typedData.value
  );
  console.log("create post: signature", signature);

  const { v, r, s } = utils.splitSignature(signature);

  const lensHub = new ethers.Contract(
    LENS_HUB_CONTRACT,
    LENS_HUB_ABI,
    getSigner()
  );

  const tx = await lensHub.postWithSig({
    profileId: typedData.value.profileId,
    contentURI: typedData.value.contentURI,
    collectModule: typedData.value.collectModule,
    collectModuleData: typedData.value.collectModuleData,
    referenceModule: typedData.value.referenceModule,
    referenceModuleData: typedData.value.referenceModuleData,
    sig: {
      v,
      r,
      s,
      deadline: typedData.value.deadline,
    },
  });
  console.log("create post: poll until indexed");
  const indexedResult = await pollUntilIndexed(tx.hash, token.accessToken);

  console.log("create post: profile has been indexed", response);

  const logs = indexedResult.txReceipt.logs;

  console.log("create post: logs", logs);

  const topicId = utils.id(
    "PostCreated(uint256,uint256,string,address,bytes,address,bytes,uint256)"
  );
  console.log("topicid we care about", topicId);

  const profileCreatedLog = logs.find((l) => l.topics[0] === topicId);
  console.log("create post: created log", profileCreatedLog);

  let profileCreatedEventLog = profileCreatedLog.topics;
  console.log("create post: created event logs", profileCreatedEventLog);

  const publicationId = utils.defaultAbiCoder.decode(
    ["uint256"],
    profileCreatedEventLog[2]
  )[0];

  console.log(
    "create post: contract publication id",
    BigNumber.from(publicationId).toHexString()
  );
  console.log(
    "create post: internal publication id",
    PROJECT_OWNER_PROFILE_ID + "-" + BigNumber.from(publicationId).toHexString()
  );

  return response;
};

const getPost = async (publicationId) => {
  // const token = await login(address);
  const client = new createClient({
    url: APIURL,
    // fetchOptions: () => {
    //   return {
    //     headers: {
    //       "x-access-token": token ? `Bearer ${token.accessToken}` : "",
    //     },
    //   };
    // },
  });
  const QUERY = gql`
    query ($request: PublicationQueryRequest!) {
      publication(request: $request) {
        __typename
        ... on Post {
          ...PostFields
        }
        ... on Comment {
          ...CommentFields
        }
        ... on Mirror {
          ...MirrorFields
        }
      }
    }

    fragment MediaFields on Media {
      url
      mimeType
    }

    fragment ProfileFields on Profile {
      id
      name
      bio
      location
      website
      twitterUrl
      handle
      picture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          verified
        }
        ... on MediaSet {
          original {
            ...MediaFields
          }
        }
      }
      coverPicture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          verified
        }
        ... on MediaSet {
          original {
            ...MediaFields
          }
        }
      }
      ownedBy
      depatcher {
        address
      }
      stats {
        totalFollowers
        totalFollowing
        totalPosts
        totalComments
        totalMirrors
        totalPublications
        totalCollects
      }
      followModule {
        ... on FeeFollowModuleSettings {
          type
          amount {
            asset {
              name
              symbol
              decimals
              address
            }
            value
          }
          recipient
        }
      }
    }

    fragment PublicationStatsFields on PublicationStats {
      totalAmountOfMirrors
      totalAmountOfCollects
      totalAmountOfComments
    }

    fragment MetadataOutputFields on MetadataOutput {
      name
      description
      content
      media {
        original {
          ...MediaFields
        }
      }
      attributes {
        displayType
        traitType
        value
      }
    }

    fragment Erc20Fields on Erc20 {
      name
      symbol
      decimals
      address
    }

    fragment CollectModuleFields on CollectModule {
      __typename
      ... on FeeCollectModuleSettings {
        type
        amount {
          asset {
            ...Erc20Fields
          }
          value
        }
        recipient
        referralFee
      }
      ... on LimitedFeeCollectModuleSettings {
        type
        collectLimit
        amount {
          asset {
            ...Erc20Fields
          }
          value
        }
        recipient
        referralFee
      }
      ... on LimitedTimedFeeCollectModuleSettings {
        type
        collectLimit
        amount {
          asset {
            ...Erc20Fields
          }
          value
        }
        recipient
        referralFee
        endTimestamp
      }
      ... on RevertCollectModuleSettings {
        type
      }
      ... on TimedFeeCollectModuleSettings {
        type
        amount {
          asset {
            ...Erc20Fields
          }
          value
        }
        recipient
        referralFee
        endTimestamp
      }
    }

    fragment PostFields on Post {
      id
      profile {
        ...ProfileFields
      }
      stats {
        ...PublicationStatsFields
      }
      metadata {
        ...MetadataOutputFields
      }
      createdAt
      collectModule {
        ...CollectModuleFields
      }
      referenceModule {
        ... on FollowOnlyReferenceModuleSettings {
          type
        }
      }
      appId
    }

    fragment MirrorBaseFields on Mirror {
      id
      profile {
        ...ProfileFields
      }
      stats {
        ...PublicationStatsFields
      }
      metadata {
        ...MetadataOutputFields
      }
      createdAt
      collectModule {
        ...CollectModuleFields
      }
      referenceModule {
        ... on FollowOnlyReferenceModuleSettings {
          type
        }
      }
      appId
    }

    fragment MirrorFields on Mirror {
      ...MirrorBaseFields
      mirrorOf {
        ... on Post {
          ...PostFields
        }
        ... on Comment {
          ...CommentFields
        }
      }
    }

    fragment CommentBaseFields on Comment {
      id
      profile {
        ...ProfileFields
      }
      stats {
        ...PublicationStatsFields
      }
      metadata {
        ...MetadataOutputFields
      }
      createdAt
      collectModule {
        ...CollectModuleFields
      }
      referenceModule {
        ... on FollowOnlyReferenceModuleSettings {
          type
        }
      }
      appId
    }

    fragment CommentFields on Comment {
      ...CommentBaseFields
      mainPost {
        ... on Post {
          ...PostFields
        }
        ... on Mirror {
          ...MirrorBaseFields
          mirrorOf {
            ... on Post {
              ...PostFields
            }
            ... on Comment {
              ...CommentMirrorOfFields
            }
          }
        }
      }
    }

    fragment CommentMirrorOfFields on Comment {
      ...CommentBaseFields
      mainPost {
        ... on Post {
          ...PostFields
        }
        ... on Mirror {
          ...MirrorBaseFields
        }
      }
    }
  `;
  let response = await client
    .query(QUERY, {
      request: {
        publicationId,
        // txHash:
        //   "0x00f9d9ec10c921605802a4d6ef76856e6af7b5fb4757ff513bd3514137082f8f",
      },
    })
    .toPromise();
  return response;
};

const getPosts = async (address) => {
  const token = await login(address);
  const client = new createClient({
    url: APIURL,
    fetchOptions: () => {
      return {
        headers: {
          "x-access-token": token ? `Bearer ${token.accessToken}` : "",
        },
      };
    },
  });
  const QUERY = gql`
    query ($request: PublicationsQueryRequest!) {
      publications(request: $request) {
        items {
          __typename
          ... on Post {
            ...PostFields
          }
          ... on Comment {
            ...CommentFields
          }
          ... on Mirror {
            ...MirrorFields
          }
        }
        pageInfo {
          prev
          next
          totalCount
        }
      }
    }

    fragment MediaFields on Media {
      url
      mimeType
    }

    fragment ProfileFields on Profile {
      id
      name
      bio
      location
      website
      twitterUrl
      handle
      picture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          verified
        }
        ... on MediaSet {
          original {
            ...MediaFields
          }
        }
      }
      coverPicture {
        ... on NftImage {
          contractAddress
          tokenId
          uri
          verified
        }
        ... on MediaSet {
          original {
            ...MediaFields
          }
        }
      }
      ownedBy
      depatcher {
        address
      }
      stats {
        totalFollowers
        totalFollowing
        totalPosts
        totalComments
        totalMirrors
        totalPublications
        totalCollects
      }
      followModule {
        ... on FeeFollowModuleSettings {
          type
          amount {
            asset {
              name
              symbol
              decimals
              address
            }
            value
          }
          recipient
        }
      }
    }

    fragment PublicationStatsFields on PublicationStats {
      totalAmountOfMirrors
      totalAmountOfCollects
      totalAmountOfComments
    }

    fragment MetadataOutputFields on MetadataOutput {
      name
      description
      content
      media {
        original {
          ...MediaFields
        }
      }
      attributes {
        displayType
        traitType
        value
      }
    }

    fragment Erc20Fields on Erc20 {
      name
      symbol
      decimals
      address
    }

    fragment CollectModuleFields on CollectModule {
      __typename
      ... on FeeCollectModuleSettings {
        type
        amount {
          asset {
            ...Erc20Fields
          }
          value
        }
        recipient
        referralFee
      }
      ... on LimitedFeeCollectModuleSettings {
        type
        collectLimit
        amount {
          asset {
            ...Erc20Fields
          }
          value
        }
        recipient
        referralFee
      }
      ... on LimitedTimedFeeCollectModuleSettings {
        type
        collectLimit
        amount {
          asset {
            ...Erc20Fields
          }
          value
        }
        recipient
        referralFee
        endTimestamp
      }
      ... on RevertCollectModuleSettings {
        type
      }
      ... on TimedFeeCollectModuleSettings {
        type
        amount {
          asset {
            ...Erc20Fields
          }
          value
        }
        recipient
        referralFee
        endTimestamp
      }
    }

    fragment PostFields on Post {
      id
      profile {
        ...ProfileFields
      }
      stats {
        ...PublicationStatsFields
      }
      metadata {
        ...MetadataOutputFields
      }
      createdAt
      collectModule {
        ...CollectModuleFields
      }
      referenceModule {
        ... on FollowOnlyReferenceModuleSettings {
          type
        }
      }
      appId
    }

    fragment MirrorBaseFields on Mirror {
      id
      profile {
        ...ProfileFields
      }
      stats {
        ...PublicationStatsFields
      }
      metadata {
        ...MetadataOutputFields
      }
      createdAt
      collectModule {
        ...CollectModuleFields
      }
      referenceModule {
        ... on FollowOnlyReferenceModuleSettings {
          type
        }
      }
      appId
    }

    fragment MirrorFields on Mirror {
      ...MirrorBaseFields
      mirrorOf {
        ... on Post {
          ...PostFields
        }
        ... on Comment {
          ...CommentFields
        }
      }
    }

    fragment CommentBaseFields on Comment {
      id
      profile {
        ...ProfileFields
      }
      stats {
        ...PublicationStatsFields
      }
      metadata {
        ...MetadataOutputFields
      }
      createdAt
      collectModule {
        ...CollectModuleFields
      }
      referenceModule {
        ... on FollowOnlyReferenceModuleSettings {
          type
        }
      }
      appId
    }

    fragment CommentFields on Comment {
      ...CommentBaseFields
      mainPost {
        ... on Post {
          ...PostFields
        }
        ... on Mirror {
          ...MirrorBaseFields
          mirrorOf {
            ... on Post {
              ...PostFields
            }
            ... on Comment {
              ...CommentMirrorOfFields
            }
          }
        }
      }
    }

    fragment CommentMirrorOfFields on Comment {
      ...CommentBaseFields
      mainPost {
        ... on Post {
          ...PostFields
        }
        ... on Mirror {
          ...MirrorBaseFields
        }
      }
    }
  `;
  let response = await client
    .query(QUERY, {
      request: {
        profileId: PROJECT_OWNER_PROFILE_ID,
        publicationTypes: ["POST"],
        limit: 10,
      },
    })
    .toPromise();
  return response;
};

const getProfile = async (address) => {
  const token = await login(address);
  const client = new createClient({
    url: APIURL,
    fetchOptions: () => {
      return {
        headers: {
          "x-access-token": token ? `Bearer ${token.accessToken}` : "",
        },
      };
    },
  });
  const QUERY = gql`
    query ($request: ProfileQueryRequest!) {
      profiles(request: $request) {
        items {
          id
          name
          handle
        }
      }
    }
  `;
  let response = await client
    .query(QUERY, {
      request: {
        ownedBy: [address],
      },
    })
    .toPromise();
  return response.data.profiles.items;
};

const getFollowers = async (profileId) => {
  // const token = await login(address);
  const client = new createClient({
    url: APIURL,
    // fetchOptions: () => {
    //   return {
    //     headers: {
    //       "x-access-token": token ? `Bearer ${token.accessToken}` : "",
    //     },
    //   };
    // },
  });
  const QUERY = gql`
    query ($request: FollowersRequest!) {
      followers(request: $request) {
        items {
          wallet {
            address
            defaultProfile {
              id
              name
              bio
              location
              website
              twitterUrl
              handle
              picture {
                ... on NftImage {
                  contractAddress
                  tokenId
                  uri
                  verified
                }
                ... on MediaSet {
                  original {
                    url
                    mimeType
                  }
                }
              }
              coverPicture {
                ... on NftImage {
                  contractAddress
                  tokenId
                  uri
                  verified
                }
                ... on MediaSet {
                  original {
                    url
                    mimeType
                  }
                }
              }
              ownedBy
              depatcher {
                address
                canUseRelay
              }
              stats {
                totalFollowers
                totalFollowing
                totalPosts
                totalComments
                totalMirrors
                totalPublications
                totalCollects
              }
              followModule {
                ... on FeeFollowModuleSettings {
                  type
                  contractAddress
                  amount {
                    asset {
                      name
                      symbol
                      decimals
                      address
                    }
                    value
                  }
                  recipient
                }
              }
            }
          }
          totalAmountOfTimesFollowed
        }
        pageInfo {
          prev
          next
          totalCount
        }
      }
    }
  `;
  let response = await client
    .query(QUERY, {
      request: {
        profileId,
        limit: 10,
      },
    })
    .toPromise();
  return response;
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

async function main() {
  //--- Step 1 ----
  // preparing IPFS link. uploads project image and data from project.json
  // you need this link in step
  // await uploadProjectJson();
  //--- Step 2 ----
  // optional: if profile doesnt exists we can create one
  // await createProfile(PROJECT_OWNER_ADDRESS, PROJECT_OWNER_PROFILE_HANDLE);
  //--- Step 3 ----
  //creates post for project with IPFS link
  //it will log in console postId and profileId
  //only this two params needs to be used in api endpoint to fetch a project post (until admin interface will be ready)
  await createPost(PROJECT_OWNER_ADDRESS);

  //====== OTHER TEST METHODS TO EXPLORE LENS
  // await uploadProjectImage();
  // get profiles
  // const profiles = await getProfile(PROJECT_OWNER_ADDRESS);
  // console.log(profiles);
  // console.log("PROFILE ID -- ", parseInt(Number(profiles[1].id)));
  // create post
  // const postResult = await createPost(PROJECT_OWNER_ADDRESS);
  // console.log("POST ID --- ", postResult.data.createPostTypedData);
  // fetch posts of profile
  //0xf3-0x0a
  // const lensPost = await getPost("0xf3-0x0a");
  // console.log(lensPost);

  // const followers = await getFollowers("0xE1");
  // console.log(followers.data.followers.items);
  // const postFromContract = await getPostContentURIFromContract(
  //   PROJECT_OWNER_PROFILE_ID,
  //   PROJECT_LENS_PUBLICATION_ID
  // );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

//LAST RESULT

//project
//https://ipfs.io/ipfs/bafybeiebeq7xc7wt6dl6k3oaxk5s3q3flzdmrshz42wgw4jp5rrwvermni/project.json

//image
//https://ipfs.io/ipfs/bafybeiavqmguhekts2x6wjvlfddscaflh74np4pibjy3uduxszx4pbetqe/project.png
