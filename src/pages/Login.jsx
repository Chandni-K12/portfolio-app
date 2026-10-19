import AuthView from "../components/AuthView";

function Login({
  token,
  user,
  authMode,
  setAuthMode,
  authForm,
  handleAuthChange,
  handleAuthSubmit,
  authError,
  authSuccess,
  isAuthLoading,
  setAuthError,
  setAuthSuccess,
  handleLogout
}) {
  if (token && user) {
    return (
      <main className="loading-page-wrapper">
        <section className="loading-card">
          <h2 className="loading-title">Account Details</h2>
          <p className="loading-subtitle" style={{ marginBottom: "16px" }}>
            You are currently signed in as <strong>{user.name}</strong> ({user.email}).
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              style={{ padding: "10px 20px", fontSize: "14px" }}
            >
              Sign Out
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <AuthView
      authMode={authMode}
      setAuthMode={setAuthMode}
      authForm={authForm}
      handleAuthChange={handleAuthChange}
      handleAuthSubmit={handleAuthSubmit}
      authError={authError}
      authSuccess={authSuccess}
      isAuthLoading={isAuthLoading}
      setAuthError={setAuthError}
      setAuthSuccess={setAuthSuccess}
    />
  );
}

export default Login;
