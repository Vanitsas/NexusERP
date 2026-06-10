import Skeleton from "../../components/ui/Skeleton";

export default function ProductSkeleton() {
  return (
    <div className="space-y-3">

      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex justify-between items-center p-3 bg-gray-900/40 rounded-lg border border-gray-800"
        >

          {/* LEFT */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* PRICE */}
          <Skeleton className="h-4 w-16" />

          {/* BUTTON */}
          <Skeleton className="h-8 w-20" />

        </div>
      ))}

    </div>
  );
}