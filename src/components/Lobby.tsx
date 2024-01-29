import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import styled from 'styled-components';

const getData = async () => {
  const res = await fetch('/data/manifest.json');

  if (res.status === 200) {
    const data = await res.json();
    return data;
  }

  if (res.status === 404) {
    throw new Error('Manifest not found');
  }

  throw new Error(`Error ${res.status} returned from server`);
};

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 20px;

  & a {
    color: black;
    text-decoration: none;
  }

  & a:hover {
    text-decoration: underline;
  }

  & a:visted {
    color: black;
  }
`;

const Lobby = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [games, setGames] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        const remoteData = await getData();

        if (remoteData) {
          setGames(remoteData);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoading && error) {
    return <div>{error}</div>;
  }

  if (!isLoading && !error) {
    return (
      <Menu>
        <div>Choose a game</div>
        <div>
          {games.map((game) => (
            <div key={game}>
              <a href={`/?game=${game}`}>{game}</a>
            </div>
          ))}
          {games.length === 0 && <div>No games available</div>}
        </div>
      </Menu>
    );
  }
};

export default Lobby;
