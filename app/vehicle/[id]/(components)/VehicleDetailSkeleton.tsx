"use client";

export default function VehicleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0A1B] pb-24 max-w-[430px] mx-auto">
      {/* Image Slider Skeleton */}
      <div className="px-4 mt-2">
        <div className="relative w-full h-[346px] bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden">
          {/* Image skeleton */}
          <div className="absolute left-[12.92px] top-[72px] w-[calc(100%-24px)] h-[218px] bg-gray-300 dark:bg-gray-700 rounded-lg skeleton" />
          
          {/* Back button skeleton */}
          <div className="absolute left-4 top-4 w-9 h-9 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 skeleton" />
          
          {/* Share/Favorite buttons skeleton */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 skeleton" />
            <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 skeleton" />
          </div>
          
          {/* Dot indicators skeleton */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 skeleton" />
            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 skeleton" />
            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 skeleton" />
          </div>
        </div>
      </div>

      {/* Vehicle Info Card Skeleton */}
      <div className="bg-white dark:bg-[#191B27] rounded-[30px] p-6 shadow-lg mx-4 -mt-8 relative z-10">
        {/* Brand skeleton */}
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded skeleton mb-2" />
        
        {/* Model and Price skeleton */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded skeleton mb-2" />
          </div>
          <div className="text-right">
            <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded skeleton mb-1" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
          </div>
        </div>

        {/* Features row skeleton */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
        </div>
      </div>

      {/* Pickup & Drop Section Skeleton */}
      <div className="px-4 mt-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded skeleton mb-4" />
        
        <div className="flex flex-col gap-4">
          {/* Pickup card skeleton */}
          <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-800">
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded skeleton mb-3" />
            <div className="space-y-3">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
            </div>
          </div>

          {/* Divider skeleton */}
          <div className="flex items-center justify-center my-2">
            <div className="flex items-center w-full">
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 skeleton" />
              <div className="flex-1 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700 skeleton" />
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 skeleton" />
            </div>
          </div>

          {/* Drop card skeleton */}
          <div className="bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-800">
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded skeleton mb-3" />
            <div className="space-y-3">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section Skeleton */}
      <div className="mt-6">
        <div className="bg-[#F4AA05] rounded-3xl p-6 mx-4">
          <div className="h-6 w-40 bg-yellow-600/30 rounded skeleton mb-4" />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-w-[280px] bg-white dark:bg-[#191B27] rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-800"
              >
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded skeleton mb-2" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded skeleton mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded skeleton" />
                  <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section Skeleton */}
      <div className="px-4 mt-6">
        <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded skeleton mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#191B27] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
            >
              <div className="p-4">
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#191B27] border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-4 max-w-[430px] mx-auto">
          <div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded skeleton mb-1" />
            <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
          </div>
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-full skeleton" />
        </div>
      </div>
    </div>
  );
}

