import Eyebrow from "../components/Eyebrow";

export default function Churn() {
  return (
    <section className="section">
      <div className="placeholder">
        <Eyebrow number="—">Customer churn</Eyebrow>
        <h1>To do.</h1>
        <p className="lede" style={{ maxWidth: 560, margin: "24px auto 0" }}>
          A dedicated cohort-retention view will live here. The marts powering it
          will roll up from <code>dim_customers</code> and{" "}
          <code>fct_orders</code>; the design and SQL are not yet built.
        </p>
      </div>
    </section>
  );
}
