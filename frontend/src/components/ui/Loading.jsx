export default function Loading({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-6 text-gray-400">
      <div className="flex items-center gap-2">
        
        {/* spinner */}
        <div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>

        <span>{text}</span>
      </div>
    </div>
  );
}