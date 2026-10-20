import { AchievementsScreen } from '../screens/AchievementsScreen';
import { useGame } from '../context/GameContext';

export default function AchievementsRoute() {
  const { game } = useGame();
  if (!game) return null;
  return <AchievementsScreen game={game} />;
}
