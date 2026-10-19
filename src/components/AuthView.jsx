function AuthView({
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
}) {
  return (
    <section className="auth-wrapper">
      <div className="auth-container long-rectangle">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="auth-subtitle">
            {authMode === 'login'
              ? 'Sign in to access your task pipeline'
              : 'Register your account to manage tasks'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('login')
              setAuthError('')
              setAuthSuccess('')
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('register')
              setAuthError('')
              setAuthSuccess('')
            }}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleAuthSubmit} autoComplete="off">
          {authMode === 'register' && (
            <label>
              <span>Full Name</span>
              <input
                type="text"
                name="name"
                value={authForm.name}
                onChange={handleAuthChange}
                autoComplete="off"
                required
              />
            </label>
          )}

          <label>
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              value={authForm.email}
              onChange={handleAuthChange}
              autoComplete="off"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={authForm.password}
              onChange={handleAuthChange}
              autoComplete="new-password"
              required
            />
          </label>

          {authError && <div className="error">{authError}</div>}
          {authSuccess && <div className="success">{authSuccess}</div>}

          <button type="submit" className="auth-button" disabled={isAuthLoading}>
            {isAuthLoading
              ? 'Processing...'
              : authMode === 'register'
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default AuthView
