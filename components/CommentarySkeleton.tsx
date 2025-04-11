import React from "react";

export default function CommentarySkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Commentary and Themes Skeleton */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-8">
        <div className="h-8 w-48 bg-gray-700 animate-pulse rounded mb-4"></div>
        <div className="h-16 bg-gray-700 animate-pulse rounded mb-4"></div>
        <div className="h-6 w-32 bg-gray-700 animate-pulse rounded mb-2"></div>
        <div className="flex flex-row gap-2 mt-2">
          <div className="h-8 w-20 bg-gray-600 animate-pulse rounded-full"></div>
          <div className="h-8 w-20 bg-gray-600 animate-pulse rounded-full"></div>
          <div className="h-8 w-20 bg-gray-600 animate-pulse rounded-full"></div>
        </div>
      </div>

      {/* Historical Context Skeleton */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-8">
        <div className="h-6 w-40 bg-gray-700 animate-pulse rounded mb-2"></div>
        <div className="h-20 bg-gray-700 animate-pulse rounded"></div>
      </div>

      {/* Reading it Right Skeleton */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-8">
        <div className="h-6 w-36 bg-gray-700 animate-pulse rounded mb-4"></div>
        <div className="space-y-4">
          <div>
            <div className="h-5 w-20 bg-gray-700 animate-pulse rounded mb-1"></div>
            <div className="h-10 bg-gray-700 animate-pulse rounded"></div>
          </div>
          <div>
            <div className="h-5 w-20 bg-gray-700 animate-pulse rounded mb-1"></div>
            <div className="h-10 bg-gray-700 animate-pulse rounded"></div>
          </div>
          <div>
            <div className="h-5 w-20 bg-gray-700 animate-pulse rounded mb-1"></div>
            <div className="h-10 bg-gray-700 animate-pulse rounded"></div>
          </div>
          <div>
            <div className="h-5 w-20 bg-gray-700 animate-pulse rounded mb-1"></div>
            <div className="h-10 bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
      </div>

      {/* Application Skeleton */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-8">
        <div className="h-6 w-72 bg-gray-700 animate-pulse rounded mb-4"></div>
        <div className="h-20 bg-gray-700 animate-pulse rounded"></div>
      </div>

      {/* Denominational Perspectives Skeleton */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-8">
        <div className="h-6 w-64 bg-gray-700 animate-pulse rounded mb-4"></div>
        <div className="h-4 w-48 bg-gray-700 animate-pulse rounded mb-4"></div>
        <div className="space-y-4">
          <div>
            <div className="h-5 w-24 bg-gray-700 animate-pulse rounded mb-1"></div>
            <div className="h-10 bg-gray-700 animate-pulse rounded"></div>
          </div>
          <div>
            <div className="h-5 w-20 bg-gray-700 animate-pulse rounded mb-1"></div>
            <div className="h-10 bg-gray-700 animate-pulse rounded"></div>
          </div>
          <div>
            <div className="h-5 w-22 bg-gray-700 animate-pulse rounded mb-1"></div>
            <div className="h-10 bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
      </div>

      {/* Reflection Question Skeleton */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-8">
        <div className="h-6 w-48 bg-gray-700 animate-pulse rounded mb-4"></div>
        <div className="h-12 bg-gray-700 animate-pulse rounded mb-4"></div>
        <div className="h-32 bg-gray-700 animate-pulse rounded mt-4"></div>
        <div className="h-20 bg-gray-700 animate-pulse rounded mt-2"></div>
        <div className="h-12 bg-gray-700 animate-pulse rounded mt-4"></div>
      </div>
    </div>
  );
}
