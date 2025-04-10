import React from "react";

export default function CommentarySkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Historical Context Skeleton */}
      <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
        <h3 className="text-lg font-semibold text-white mb-2">
          Historical Context
        </h3>
        <div className="h-20 bg-gray-700 animate-pulse rounded"></div>
      </div>

      {/* Commentary Skeleton */}
      <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
        <h3 className="text-lg font-semibold text-white mb-2">Commentary</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-200 font-semibold">Summary:</p>
            <div className="h-10 bg-gray-700 animate-pulse rounded mt-1"></div>
          </div>
          <div>
            <p className="text-sm text-gray-200 font-semibold">Expose:</p>
            <div className="h-10 bg-gray-700 animate-pulse rounded mt-1"></div>
          </div>
          <div>
            <p className="text-sm text-gray-200 font-semibold">Change:</p>
            <div className="h-10 bg-gray-700 animate-pulse rounded mt-1"></div>
          </div>
          <div>
            <p className="text-sm text-gray-200 font-semibold">Prepare:</p>
            <div className="h-10 bg-gray-700 animate-pulse rounded mt-1"></div>
          </div>
        </div>
        <div className="h-12 bg-gray-700 animate-pulse rounded mt-4"></div>
        <div className="p-2 bg-gray-700/50 rounded-lg mt-4">
          <p className="text-sm font-bold text-white">Key Themes:</p>
          <div className="flex gap-2 mt-2">
            <div className="h-8 w-20 bg-gray-600 animate-pulse rounded-full"></div>
            <div className="h-8 w-20 bg-gray-600 animate-pulse rounded-full"></div>
            <div className="h-8 w-20 bg-gray-600 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Denominational Perspectives Skeleton */}
      <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
        <h3 className="text-lg font-semibold text-white mb-2">
          Denominational Perspectives
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-200 font-semibold">Protestant:</p>
            <div className="h-10 bg-gray-700 animate-pulse rounded mt-1"></div>
          </div>
          <div>
            <p className="text-sm text-gray-200 font-semibold">Baptist:</p>
            <div className="h-10 bg-gray-700 animate-pulse rounded mt-1"></div>
          </div>
          <div>
            <p className="text-sm text-gray-200 font-semibold">Catholic:</p>
            <div className="h-10 bg-gray-700 animate-pulse rounded mt-1"></div>
          </div>
        </div>
      </div>

      {/* Reflection Question Skeleton */}
      <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
        <h3 className="text-lg font-semibold text-white mb-2">
          Reflection Question
        </h3>
        <div className="h-10 bg-gray-700 animate-pulse rounded"></div>
        <div className="h-32 bg-gray-700 animate-pulse rounded mt-4"></div>
        <div className="h-20 bg-gray-700 animate-pulse rounded mt-2"></div>
        <div className="h-12 bg-gray-700 animate-pulse rounded mt-4"></div>
      </div>
    </div>
  );
}
