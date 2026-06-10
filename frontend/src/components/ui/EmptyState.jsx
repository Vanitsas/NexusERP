export default function EmptyState({ text = "No data found" }) {
  return (
    <div className="text-center py-6 text-gray-400">
      {text}
    </div>
  );
}