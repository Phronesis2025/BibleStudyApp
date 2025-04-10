import React from "react";

export default function CommentarySkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Commentary and Themes Skeleton */}
      <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
        <h3 className="text-lg font-semibold text-white mb-2">Commentary</h3>
        <div className="h-12 bg-gray-700 animate-pulse rounded mb-4"></div>
        <div className="p-2 bg-gray-700/50 rounded-lg">
          <p className="text-sm font-bold text-white mb-2">Key Themes:</p>
          <div className="flex gap-2 mt-2">
            <div className="h-8 w-20 bg-gray-600 animate-pulse rounded-full"></div>
            <div className="h-8 w-20 bg-gray-600 animate-pulse rounded-full"></div>
            <div className="h-8 w-20 bg-gray-600 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Reading it Right Title */}
      <h2 className="text-2xl font-semibold text-gray-100 mt-6 mb-4 border-b-2 border-sky-400">
        Reading it Right
      </h2>

      {/* Historical Context Skeleton */}
      <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
        <h3 className="text-lg font-semibold text-white mb-2">
          Historical Context
        </h3>
        <div className="h-20 bg-gray-700 animate-pulse rounded"></div>
      </div>

      {/* Commentary Details Skeleton */}
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
      </div>

      {/* Denominational Perspectives Skeleton */}
      <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
        <h3 className="text-lg font-semibold text-white mb-2">
          Denominational Perspectives
        </h3>
        <p className="text-gray-300 italic text-sm mb-2">
          How do different denominations view this verse?
        </p>
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

      {/* Application Skeleton */}
      <h2 className="text-2xl font-semibold text-gray-100 mt-6 mb-4 border-b-2 border-sky-400">
        Applying This Verse in Today's World
      </h2>
      <div className="p-4 bg-gray-800/50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700/50 transition card-with-lines">
        <div className="h-20 bg-gray-700 animate-pulse rounded"></div>
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
