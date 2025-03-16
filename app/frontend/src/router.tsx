import { Route, Routes } from "react-router-dom";

import QueryPageWithProvider from "@/pages/queries/query";
import QueryInterface from "@/pages/queries";
import AnalyticsInterface from "@/pages/analytics/index";
import PredictInterface from "./pages/predict";

function App() {
  return (
    <Routes>
      <Route element={<QueryInterface />} path="/query" />
      <Route element={<QueryPageWithProvider />} path="/query/result" />
      <Route element={<AnalyticsInterface />} path="/analytics" />
      <Route element={<PredictInterface />} path="/predict" />
    </Routes>
  );
}

export default App;
