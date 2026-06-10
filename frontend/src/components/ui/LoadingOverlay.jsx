export default function LoadingOverlay({ show }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col items-center gap-3">

        {/* spinner */}
        <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin" />

        <p className="text-gray-300 text-sm">
          Loading...
        </p>

      </div>

    </div>
  );
}