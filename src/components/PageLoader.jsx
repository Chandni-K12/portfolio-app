function PageLoader() {
  return (
    <div className="single-page loading-page-wrapper">
      <section className="card loading-card">
        <h2 className="loading-title">Loading...</h2>
        <p className="loading-subtitle">
          Please wait while repositories are being fetched.
        </p>
      </section>
    </div>
  );
}

export default PageLoader;
