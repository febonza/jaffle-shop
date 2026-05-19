import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import Churn from "./pages/Churn";
import Ltv from "./pages/Ltv";
import DataQuality from "./pages/DataQuality";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/churn" element={<Churn />} />
        <Route path="/ltv" element={<Ltv />} />
        <Route path="/data-quality" element={<DataQuality />} />
      </Routes>
    </Layout>
  );
}
