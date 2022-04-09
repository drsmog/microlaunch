// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import "isomorphic-unfetch";
const PROJECT_OWNER_PROFILE_ID = "0x011a";
import { createClient, gql } from "@urql/core";
const APIURL = "https://api-mumbai.lens.dev/";

const getFollowers = async (profileId) => {
  const client = new createClient({
    url: APIURL,
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
        limit: 40,
      },
    })
    .toPromise();
  return response;
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      //get followers of project owner
      const followersData = await getFollowers(PROJECT_OWNER_PROFILE_ID);

      //retrun project json
      res.status(200).json({ data: { followers: followersData.data } });
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
