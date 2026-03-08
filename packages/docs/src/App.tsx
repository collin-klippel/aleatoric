import { Route, Routes } from 'react-router-dom';
import AleatoricApp from './apps/aleatoric/AleatoricApp';
import DocsChrome from './layout/DocsChrome';

export default function App() {
  return (
    <Routes>
      <Route element={<DocsChrome />}>
        <Route path="/" element={<AleatoricApp />} />
      </Route>
    </Routes>
  );
}
