import { Image, chakra, Tooltip, Link } from "@chakra-ui/react";
import Blockies from "react-blockies";
const BlockiesChakra = chakra(Blockies);

const Avatar = ({ address, hasHoverEffect = false, ...props }) => {
  const hoverEffectStyle = {
    transition: "all .2s ease-in-out",
    _hover: { transform: "scale(1.4)" },
  };
  return (
    <Image
      borderRadius={"50%"}
      backgroundColor="#eaeaea"
      border="1px solid black"
      src={`https://stamp.fyi/avatar/${address}`}
      alt="avatar"
      fallback={
        <BlockiesChakra
          borderRadius={"50%"}
          seed={address || "random"}
          size={9}
          scale={4}
          className="avatar"
          {...props}
          {...(hasHoverEffect && hoverEffectStyle)}
        />
      }
      {...props}
      {...(hasHoverEffect && hoverEffectStyle)}
    />
  );
};

export default Avatar;
