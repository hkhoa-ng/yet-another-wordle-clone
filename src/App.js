import {
  Spacer,
  Center,
  HStack,
  Text,
  VStack,
  Button,
  useToast,
  Heading,
} from "@chakra-ui/react";
import LetterTile from "./components/LetterTile";
import KeyboardTile from "./components/KeyboardTile";

import { useState } from "react";
import { nanoid } from "nanoid";

const wordList = require("./words/valid_solutions.json");
const validGuesses = require("./words/valid_guess.json");

const KEYBOARD = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"],
];

function setEmptyBoard() {
  const emptyBoard = [];
  for (let i = 0; i <= 5; i++) {
    const newLetter = {
      letter: "",
      state: "init",
    };
    emptyBoard.push([newLetter, newLetter, newLetter, newLetter, newLetter]);
  }
  return emptyBoard;
}
const emptyBoard = setEmptyBoard();

function setEmptyKeyboard() {
  const emptyKeyboard = [[], [], []];
  for (let i = 0; i < 3; i++) {
    KEYBOARD[i].forEach((char) => {
      emptyKeyboard[i].push({
        state: "init",
        letter: char,
      });
    });
  }
  return emptyKeyboard;
}
const emptyKeyboard = setEmptyKeyboard();

function App() {
  // Game state manager
  // Word to be guessed
  const [wordToGuess, setWordToGuess] = useState(
    wordList[Math.floor(Math.random() * wordList.length)].word.toUpperCase()
  );
  // Current state of the game board
  const [board, setBoard] = useState(emptyBoard);
  // Current state of the game keyboard
  const [keyboard, setKeyboard] = useState(emptyKeyboard);
  // Row counting starts from 0 to 5
  const [currentRow, setCurrentRow] = useState(0);
  // Letter counting starts from 0 to 4
  const [currentLetter, setCurrentLetter] = useState(0);
  // ChakraUI's toast to announce game state
  const toast = useToast();

  // Functions of the game: pressing the keyboard buttons
  function pressLetter(letter) {
    let currentBoard = [...board];
    if (currentLetter < 5) {
      currentBoard[currentRow][currentLetter] = {
        letter: letter,
        state: "init",
      };
      setCurrentLetter((prev) => prev + 1);
      setBoard(currentBoard);
    }
  }

  function pressEnter() {
    if (currentLetter === 5) {
      const guessedWord = board[currentRow]
        .map((l) => l.letter)
        .join("")
        .toUpperCase();
      const isInValidGuesses = [...validGuesses, ...wordList].findIndex(
        (o) => o.word.toUpperCase() === guessedWord
      );
      if (isInValidGuesses >= 0) {
        // Word checking
        board[currentRow].forEach((c, iOfGuess) => {
          const guessedChar = c.letter;
          const iOfWordToGuess = wordToGuess.indexOf(guessedChar);
          const currentBoard = [...board];
          const currentKeyboard = [...keyboard];

          const updateLetterBoards = (letterToUpdate) => {
            currentBoard[currentRow][iOfGuess] = letterToUpdate;
            for (let j = 0; j < 3; j++) {
              const indexToUpdate = currentKeyboard[j].findIndex(
                (ch) => ch.letter === guessedChar
              );
              currentKeyboard[j][indexToUpdate] = letterToUpdate;
            }
          };

          if (iOfWordToGuess < 0) {
            const letterToUpdate = {
              state: "wrongLetter",
              letter: c.letter,
            };
            updateLetterBoards(letterToUpdate);
          }
          if (iOfWordToGuess >= 0) {
            if (wordToGuess[iOfGuess] === c.letter) {
              const letterToUpdate = {
                state: "rightPos",
                letter: c.letter,
              };
              updateLetterBoards(letterToUpdate);
            } else {
              const letterToUpdate = {
                state: "wrongPos",
                letter: c.letter,
              };
              updateLetterBoards(letterToUpdate);
            }
          }
        });
        setCurrentLetter(0);

        if (guessedWord === wordToGuess)
          toast({
            title: "Great Job!",
            position: "top",
            description: `You got the word in ${currentRow + 1} turns.`,
            duration: 2000,
          });
        if (currentRow < 5) setCurrentRow((prev) => prev + 1);
      } else {
        toast({
          title: "Not in word list!",
          position: "top",
          description: `Your word is not in the word list! Choose again.`,
          duration: 2000,
          status: "warning",
        });
      }
    } else {
      toast({
        title: "Word too short!",
        position: "top",
        description: `Your word is too short`,
        duration: 2000,
        status: "warning",
      });
    }
  }

  function pressBackspace() {
    let currentBoard = [...board];
    if (currentLetter >= 1) {
      currentBoard[currentRow][currentLetter - 1] = {
        state: "init",
        letter: "",
      };
      setCurrentLetter((prev) => prev - 1);
      setBoard(currentBoard);
    }
  }

  // Elements to render the game: the letter board and keyboard
  const gameBoard = (
    <VStack>
      {board.map((row) => {
        return (
          <HStack key={nanoid()}>
            {row.map((letter) => (
              <LetterTile letter={letter} key={nanoid()} />
            ))}
          </HStack>
        );
      })}
    </VStack>
  );
  const gameKeyBoard = (
    <VStack>
      {keyboard.map((row) => {
        return (
          <HStack key={nanoid()}>
            {row.map((letter) => {
              if (letter.letter === "ENTER")
                return (
                  <KeyboardTile
                    letter={letter}
                    clickHandler={pressEnter}
                    key={nanoid()}
                  />
                );
              if (letter.letter === "←")
                return (
                  <KeyboardTile
                    letter={letter}
                    clickHandler={pressBackspace}
                    key={nanoid()}
                  />
                );
              return (
                <KeyboardTile
                  letter={letter}
                  clickHandler={() => pressLetter(letter.letter)}
                  key={nanoid()}
                />
              );
            })}
          </HStack>
        );
      })}
    </VStack>
  );

  return (
    <Center h="100vh">
      <VStack h="100%" gap="20px">
        <Spacer />
        <Heading>Yet Another Wordle 📚</Heading>
        <Text color="gray.500">Word to guess: {wordToGuess}</Text>
        {gameBoard}
        {gameKeyBoard}
        <Button
          onClick={() => {
            setWordToGuess(
              wordList[
                Math.floor(Math.random() * wordList.length)
              ].word.toUpperCase()
            );
            setBoard(setEmptyBoard());
            setKeyboard(setEmptyKeyboard());
            setCurrentRow(0);
            setCurrentLetter(0);
          }}
          colorScheme="red"
          w="100%"
        >
          RESTART
        </Button>
        <Spacer />
      </VStack>
    </Center>
  );
}

export default App;
