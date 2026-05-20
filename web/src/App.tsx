import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Churn from "./pages/Churn";
import Ltv from "./pages/Ltv";
import DataQuality from "./pages/DataQuality";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/churn" element={<Churn />} />
        <Route path="/ltv" element={<Ltv />} />
        <Route path="/data-quality" element={<DataQuality />} />
      </Routes>
    </Layout>
  );
}
