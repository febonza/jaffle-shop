import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Churn from "./pages/Churn";
import Ltv from "./pages/Ltv";
import DataQuality from "./pages/DataQuality";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/churn" element={<Churn />} />
        <Route path="/ltv" element={<Ltv />} />
        <Route path="/data-quality" element={<DataQuality />} />
      </Routes>
    </Layout>
  );
}
