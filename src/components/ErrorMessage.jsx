function ErrorMessage({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="error-message" role="alert">
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="retry-button" type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
