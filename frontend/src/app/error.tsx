'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="glass-card p-8 text-center max-w-md animate-scale-in">
        <div className="text-6xl mb-4">⚡</div>
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-sm mb-6">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all duration-200 btn-neon"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
