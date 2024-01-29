import { h, render } from 'preact';
import Lobby from './components/Lobby';
import Game from './components/Game';

const getGameIdFromQueryString = () => {
  const url = new URL(document.URL);
  return url.searchParams.get('game');
};

const Main = () => {
  const gameId = getGameIdFromQueryString();

  if (gameId) {
    return <Game gameId={gameId} />;
  }

  return <Lobby />;
};

const run = async () => {
  render(<Main />, document.getElementById('game'));
};

run();
