import { QuestsScreen } from '../screens/QuestsScreen';
import { useGame } from '../context/GameContext';

export default function QuestsRoute() {
  const { game, updateGame } = useGame();
  if (!game) return null;
  return <QuestsScreen game={game} onUpdate={updateGame} />;
}
