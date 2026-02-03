export default function LoadingOverlay({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-white/95 px-12 py-10 shadow-2xl ring-1 ring-black/5">
        <div className="relative h-20 w-20">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          {/* Spinning part */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>

        {/* Friendly illustration */}
        <div className="text-7xl animate-pulse">⏳</div>

        <h3 className="text-2xl font-semibold text-gray-800">{message}</h3>
        <p className="text-gray-500">Please wait a moment...</p>

        {/* Bouncing dots */}
        <div className="flex gap-3">
          <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600"></div>
        </div>
      </div>
    </div>
  );
}