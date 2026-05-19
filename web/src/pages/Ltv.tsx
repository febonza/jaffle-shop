import Eyebrow from "../components/Eyebrow";

export default function Ltv() {
  return (
    <section className="section">
      <div className="placeholder">
        <Eyebrow number="—">Lifetime value</Eyebrow>
        <h1>To do.</h1>
        <p className="lede" style={{ maxWidth: 560, margin: "24px auto 0" }}>
          LTV by acquisition cohort, segmented by initial product and store. The
          underlying mart is sketched in <code>models/marts/customer/</code> but
          not yet implemented.
        </p>
      </div>
    </section>
  );
}
