import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import EditorPage from "./pages/EditorPage";
import GeneratorPage from "./pages/GeneratorPage";
import BulkPage from "./pages/BulkPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ flex: 1, padding: "24px" }}>
        <Routes>
          <Route path="/" element={<EditorPage />} />
          <Route path="/generate" element={<GeneratorPage />} />
          <Route path="/bulk" element={<BulkPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
