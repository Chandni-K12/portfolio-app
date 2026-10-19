function Header({ name, user, handleLogout }) {
  return (
    <header className="header">
      {user ? (
        <button type="button" className="header-logout-button" onClick={handleLogout}>
          Logout
        </button>
      ) : null}

      <div className="header-content">
        <span className="eyebrow">Student Portfolio</span>
        <h1>{name}</h1>
        <p className="subtitle">
          Exploring React, Machine Learning, and creative problem solving through project-driven learning.
        </p>
      </div>
    </header>
  );
}

export default Header;
