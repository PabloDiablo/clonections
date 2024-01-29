import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import styled, { css } from 'styled-components';

const getData = async (gameId: string) => {
  if (!gameId) {
    throw new Error('Game is not defined');
  }

  const res = await fetch(`/data/${gameId}.json`);

  if (res.status === 200) {
    const data = await res.json();
    return data;
  }

  if (res.status === 404) {
    throw new Error('Game not found');
  }

  throw new Error(`Error ${res.status} returned from server`);
};

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(24px + 4 * 22.5vw);
  height: calc(24px + 4 * 22.5vw);
  margin: auto;
  flex-wrap: wrap;
  position: relative;
  gap: 8px;

  @media (min-width: 768px) {
    width: calc(24px + 4 * 150px);
    height: calc(24px + 4 * 80px);
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const getBannerColor = (group: number) => {
  switch (group) {
    case 0:
      return '#f9df6d';
    case 1:
      return '#a0c35a';
    case 2:
      return '#b0c4ef';
    case 3:
      return '#ba81c5';
  }
};

const Banner = styled.div<{ group: number }>`
  color: black;
  width: 100%;
  font-size: 16px;
  min-height: 70px;
  height: 22.5vw;
  max-height: 22.5vw;
  border-radius: 6px;
  display: flex;
  place-content: center;
  align-content: center;
  flex-direction: column;
  align-items: center;

  background-color: ${({ group }) => getBannerColor(group)};

  @media (min-width: 768px) {
    font-size: 20px;
    z-index: 2;
    margin: auto;
    min-height: 70px;
    height: 80px;
  }

  & > div:first-child {
    font-weight: bold;
  }

  & > div:nth-child(2) {
    gap: 10px;
    display: flex;
  }
`;

const Cell = styled.div<{ isSelected: boolean; isInvalid: boolean; isCorrect: boolean }>`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 16px;
  width: 22.5vw;
  max-width: 22.5vw;
  min-width: 20px;
  min-height: 70px;
  height: 22.5vw;
  max-height: 22.5vw;
  font-size: 15px;
  background-color: ${({ isSelected }) => (isSelected ? '#5a594e' : '#efefe6')};
  color: ${({ isSelected }) => (isSelected ? 'white' : 'black')};
  outline: none;
  text-align: center;
  font-weight: bold;
  border-radius: 6px;
  z-index: 0;
  transition: opacity 0.4s ease;

  @media (min-width: 768px) {
    font-size: 20px;
    z-index: 2;
    margin: auto;
    width: 150px;
    max-width: 200px;
    min-height: 70px;
    height: 80px;
  }

  ${({ isInvalid, isSelected }) =>
    isInvalid &&
    isSelected &&
    css`
      animation: shake ease-in 0.2s 1.5;
      background-color: rgb(90 89 78 / 75%);
    `}

  ${({ isCorrect }) =>
    isCorrect &&
    css`
      animation: flyOut ease-in 0.2s 1.5;
    `}
`;

const ActionBar = styled.div`
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  font-size: 16px;
  font-weight: 600;
  display: flex;
  min-width: 5.5em;
  height: 3em;
  text-align: center;
  justify-content: center;
  align-items: center;
  padding: 15px 0;
  max-width: 80vw;
  border-radius: 32px;
  line-height: 1.5em;
  cursor: pointer;
  border: black solid 1px;
  width: 120px;
  background-color: white;
  color: black;
`;

const Life = styled.div`
  opacity: 100;
  background-color: #5a594e;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
`;

const OneAway = styled.div`
  background-color: black;
  color: white;
  position: absolute;
  top: 100px;
  left: 100px;
  font-size: 24px;
  padding: 20px;
  border-radius: 9px;
`;

const BetterLuck = styled.div`
  display: flex;
  justify-content: center;
  font-size: 18px;
`;

type RemoteGroup = Record<string, { level: number; members: string[] }>;
type Answer = { connection: string; level: number; members: string[] };

type Props = { gameId: string };

const Game = ({ gameId }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [groups, setGroups] = useState<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [isInvalid, setIsInvalid] = useState(false);
  const [lives, setLives] = useState(4);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correct, setCorrect] = useState<Answer[]>([]);
  const [isOneAway, setIsOneAway] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        const remoteData = await getData(gameId);

        if (remoteData) {
          setGroups(remoteData.startingGroups);
          setRemainingWords(remoteData.startingGroups.flat());
          setAnswers(
            Object.entries(remoteData.groups as RemoteGroup).map(([connection, { level, members }]) => ({
              connection,
              level,
              members,
            }))
          );
        } else {
          setError('No data returned');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const changeSelectedCell = (cell: string) => {
    if (isInvalid) {
      setIsInvalid(false);
    }

    if (selectedCells.includes(cell)) {
      setSelectedCells(selectedCells.filter((c) => c !== cell));
    } else if (selectedCells.length < 4) {
      setSelectedCells([...selectedCells, cell]);
    }
  };

  const rebuildGroups = (words: string[]) => {
    const newGroups = [];
    const numOfGroups = words.length / 4;

    for (let counter = 0; counter < numOfGroups; counter++) {
      const offset = counter * 4;
      newGroups.push(words.slice(offset, offset + 4));
    }

    setGroups(newGroups);
  };

  const submitGuess = () => {
    if (lives === 0 || isInvalid || selectedCells.length < 4) {
      return;
    }

    const commonAnswers = answers.map((ans) => ({ ...ans, members: ans.members.filter((word) => selectedCells.includes(word)) }));

    const correctAnswer = commonAnswers.find((ans) => ans.members.length === 4);
    const isOneAway = commonAnswers.some((ans) => ans.members.length === 3);

    if (!correctAnswer) {
      setIsInvalid(true);

      const newLives = lives - 1;

      if (newLives === 0) {
        setTimeout(() => {
          setCorrect(answers);
          setLives(0);
        }, 800);
      } else {
        setLives(newLives);
      }

      if (isOneAway) {
        setIsOneAway(true);

        setTimeout(() => setIsOneAway(false), 800);
      }
    } else {
      setIsCorrect(true);

      setTimeout(() => {
        setIsCorrect(false);
        setCorrect([...correct, correctAnswer]);
        setSelectedCells([]);

        const newRemainingWords = remainingWords.filter((word) => !correctAnswer.members.includes(word));

        setRemainingWords(newRemainingWords);
        rebuildGroups(newRemainingWords);
      }, 800);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoading && error) {
    return <div>{error}</div>;
  }

  if (!isLoading && !error) {
    return (
      <div>
        <Grid>
          {correct.map((cor) => (
            <Row key={cor.connection}>
              <Banner group={cor.level}>
                <div>{cor.connection}</div>
                <div>
                  {cor.members.map((word) => (
                    <span key={word}>{word}</span>
                  ))}
                </div>
              </Banner>
            </Row>
          ))}
          {lives > 0 &&
            groups.map((row, index) => (
              <Row key={`row-${index}`}>
                {row.map((cell) => (
                  <Cell
                    key={cell}
                    isSelected={selectedCells.includes(cell)}
                    isInvalid={isInvalid}
                    isCorrect={isCorrect}
                    onClick={() => changeSelectedCell(cell)}
                  >
                    {cell}
                  </Cell>
                ))}
              </Row>
            ))}
          {isOneAway && <OneAway>One away!</OneAway>}
        </Grid>
        <ActionBar>
          {Array(lives)
            .fill(0)
            .map((_, index) => (
              <Life key={index} />
            ))}
        </ActionBar>
        {lives === 0 && <BetterLuck>Better luck next time!</BetterLuck>}
        <ActionBar>
          <ActionButton onClick={() => setSelectedCells([])} disabled={isCorrect}>
            Deselect all
          </ActionButton>
          <ActionButton onClick={() => submitGuess()} disabled={isCorrect}>
            Submit
          </ActionButton>
        </ActionBar>
      </div>
    );
  }
};

export default Game;
