import {
  Spacer,
  Center,
  HStack,
  Text,
  VStack,
  Button,
  useToast,
} from "@chakra-ui/react";
import LetterTile from "./components/LetterTile";
import KeyboardTile from "./components/KeyboardTile";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

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
  // Game is over or not
  const [isOver, setIsOver] = useState(false);
  // Game is won or not
  const [isWin, setIsWin] = useState(false);
  // ChakraUI's toast to announce game state
  const toast = useToast();

  // Functions of the game: pressing the keyboard buttons
  function pressLetter(letter) {
    let currentBoard = [...board];
    if (currentLetter < 5 && !isOver) {
      currentBoard[currentRow][currentLetter] = {
        letter: letter,
        state: "init",
      };
      setCurrentLetter((prev) => prev + 1);
      setBoard(currentBoard);
    }
  }
  function pressEnter() {
    if (!isOver) {
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

          if (guessedWord === wordToGuess) {
            toast({
              title: "Great Job!",
              position: "top",
              description: `You got the word in ${currentRow + 1} turns!
               Press RESTART for a new game.`,
              duration: 4000,
              status: "success",
            });
            setIsOver(true);
            setIsWin(true);
          }
          if (currentRow === 5 && guessedWord !== wordToGuess) {
            setIsOver(true);
            toast({
              title: "Game over!",
              position: "top",
              description:
                "You ran out of guesses! Press RESTART for a new game!",
              duration: 4000,
              status: "error",
            });
          }
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
          title: "Word is too short!",
          position: "top",
          description: `Input more letters!`,
          duration: 2000,
          status: "warning",
        });
      }
    }
  }
  function pressBackspace() {
    let currentBoard = [...board];
    if (currentLetter >= 1 && !isOver) {
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
    <VStack pb="20px">
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

  const { width, height } = useWindowSize();

  return (
    <Center h="100vh" w="100vw" bg="gray.800">
      <VStack h="100%" gap="20px">
        <Spacer />
        <Text fontWeight="bold" fontSize="2rem" color="white" pb="20px">
          Yet Another Wordle 📚
        </Text>
        {/* <Text>{wordToGuess}</Text> */}
        {/* <Text>Current row: {currentRow}</Text> */}
        {/* <Text>Is Over: {isOver ? "true" : "false"}</Text> */}
        {/* <Text>Is Win: {isWin ? "true" : "false"}</Text> */}
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
            setIsOver(false);
            setIsWin(false);
          }}
          colorScheme="red"
          w="80%"
        >
          RESTART
        </Button>
        <Spacer />
      </VStack>
      {isOver && isWin && (
        <Confetti
          recycle={false}
          initialVelocityY={30}
          initialVelocityX={10}
          numberOfPieces={600}
          tweenDuration={1}
          confettiSource={{ x: width / 2 - 50, y: height, w: 100, h: 10 }}
        />
      )}
    </Center>
  );
}

export default App;
