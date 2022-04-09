// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const PROJECT_OWNER_PROFILE_ID = "0xf3";
const PROJECT_LENS_PUBLICATION_ID = "0x0b";

//call contract
//fetch ipfs link
//send data back

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const existingUsername = await repository.findOneDoc(
        COLLECTIONS.USERNAMES,
        { username: req.body.username }
      );
      if (existingUsername) {
        throw new Error("such username already exists please take another one");
      }
      const savedUsername = await repository.saveDoc(
        COLLECTIONS.USERNAMES,
        req.body
      );
      res.status(200).json({ data: { userName: savedUsername } });
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
