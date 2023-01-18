import { Center, Heading } from "@chakra-ui/react";

function LetterTile({ letter }) {
  const state = letter.state;
  let bg = "";
  if (state === "wrongLetter") bg = "gray.600";
  if (state === "wrongPos") bg = "yellow.600";
  if (state === "rightPos") bg = "green.600";
  return (
    <Center
      w="50px"
      h="50px"
      borderColor="gray.600"
      borderWidth={state === "init" ? "2px" : "0px"}
      bg={bg}
    >
      <Heading color="white">{letter.letter}</Heading>
    </Center>
  );
}

export default LetterTile;
