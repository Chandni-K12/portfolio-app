function Highlights({ highlights }) {
  return (
    <section className="card highlight-card">
      <h2>Highlights</h2>

      <div className="highlights-grid">
        {highlights.map((item) => (
          <article key={item.title} className="highlight-item">
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Highlights;
