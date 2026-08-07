export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-200" style={{ aspectRatio: '4/3' }} />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded-full w-1/3" />
        <div className="h-4 bg-gray-200 rounded-full w-5/6" />
        <div className="h-3 bg-gray-200 rounded-full w-full" />
        <div className="h-3 bg-gray-200 rounded-full w-4/6" />
        <div className="h-3 bg-gray-200 rounded-full w-1/4" />
        <div className="flex justify-between items-end pt-2">
          <div className="h-5 bg-gray-200 rounded-full w-1/3" />
          <div className="h-4 bg-gray-200 rounded-full w-1/5" />
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-full mt-1" />
      </div>
    </div>
  )
}
