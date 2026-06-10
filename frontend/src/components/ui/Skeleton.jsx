export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-gray-700/40 animate-pulse rounded ${className}`}
    />
  );
}