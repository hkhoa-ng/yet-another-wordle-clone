import { Button } from "@chakra-ui/react";

function KeyboardTile({ letter, clickHandler }) {
  const state = letter.state;
  let bg = "gray.500";
  let hover = {
    background: "gray.600",
  };
  if (state === "wrongLetter") {
    bg = "gray.600";
    hover = {
      background: "gray.700",
    };
  }
  if (state === "wrongPos") {
    bg = "yellow.600";
    hover = {
      background: "yellow.700",
    };
  }
  if (state === "rightPos") {
    bg = "green.600";
    hover = {
      background: "green.700",
    };
  }
  return (
    <Button
      color="white"
      h="50px"
      onClick={clickHandler}
      bg={bg}
      _hover={hover}
      size={{ base: "xs", sm: "sm", md: "md", lg: "lg" }}
    >
      {letter.letter}
    </Button>
  );
}

export default KeyboardTile;
