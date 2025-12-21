import { Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from '@/context/GameContext';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import TutorialRoom from '@/pages/rooms/TutorialRoom';
import UploadRoom from '@/pages/rooms/UploadRoom';
import CleanRoom from '@/pages/rooms/CleanRoom';
import StoreRoom from '@/pages/rooms/StoreRoom';
import BrainRoom from '@/pages/rooms/BrainRoom';
import ScreensRoom from '@/pages/rooms/ScreensRoom';

export default function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tutorial" element={<TutorialRoom />} />
          <Route path="upload" element={<UploadRoom />} />
          <Route path="clean" element={<CleanRoom />} />
          <Route path="store" element={<StoreRoom />} />
          <Route path="brain" element={<BrainRoom />} />
          <Route path="screens" element={<ScreensRoom />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </GameProvider>
  );
}
