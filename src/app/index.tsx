import { ModulePager } from '../components/ModulePager';
import { useGame } from '../context/GameContext';

export default function HomeRoute() {
  const { game, updateGame } = useGame();
  if (!game) return null;
  return <ModulePager game={game} onUpdate={updateGame} />;
}
