'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error.message || 'An unexpected error occurred.';
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0f172a', color: '#e2e8f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>{message}</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
          >
            Try again
          </button>
          <p style={{ marginTop: 16 }}>
            <a href="/" style={{ color: '#22d3ee' }}>Go home</a>
          </p>
        </div>
      </body>
    </html>
  );
}
