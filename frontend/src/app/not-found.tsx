import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="glass-card p-8 text-center max-w-md animate-scale-in">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h2 className="text-xl font-semibold text-white mb-2">Page not found</h2>
        <p className="text-gray-400 text-sm mb-6">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all duration-200 btn-neon inline-block"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
