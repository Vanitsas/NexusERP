export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-gray-800/60 border border-gray-700 rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}