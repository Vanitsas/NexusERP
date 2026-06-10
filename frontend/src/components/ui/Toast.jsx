import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const colors =
    type === "error"
      ? "bg-red-500"
      : "bg-green-500";

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className={`${colors} text-white px-4 py-2 rounded shadow`}>
        {message}
      </div>
    </div>
  );
}