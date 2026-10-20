import { CharacterScreen } from '../screens/CharacterScreen';
import { useGame } from '../context/GameContext';

export default function CharacterRoute() {
  const { game } = useGame();
  if (!game) return null;
  return <CharacterScreen game={game} />;
}
