import React from "react";

const CommentarySkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Verse Placeholder */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-4 animate-pulse">
        <div className="h-6 w-1/4 bg-gray-600 rounded mb-4"></div>
        <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
      </div>

      {/* Key Themes Placeholder */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-600 rounded mb-2"></div>
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 bg-gray-600 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-600 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-600 rounded-full"></div>
        </div>
      </div>

      {/* General Meaning Placeholder */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-600 rounded mb-2"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-600 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-600 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-600 rounded"></div>
        </div>
      </div>

      {/* Historical Context Placeholder */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-600 rounded mb-2"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-600 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-600 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-600 rounded"></div>
        </div>
      </div>

      {/* Reading it Right Placeholder */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-600 rounded mb-2"></div>
        <div className="space-y-4">
          {/* Summarize */}
          <div>
            <div className="h-5 w-1/4 bg-gray-600 rounded mb-1"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-600 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-600 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
            </div>
          </div>
          {/* Expose */}
          <div>
            <div className="h-5 w-1/4 bg-gray-600 rounded mb-1"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-600 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-600 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
            </div>
          </div>
          {/* Change */}
          <div>
            <div className="h-5 w-1/4 bg-gray-600 rounded mb-1"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-600 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-600 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
            </div>
          </div>
          {/* Prepare */}
          <div>
            <div className="h-5 w-1/4 bg-gray-600 rounded mb-1"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-600 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-600 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Placeholder */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-600 rounded mb-2"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-600 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-600 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-600 rounded"></div>
        </div>
      </div>

      {/* Denominational Perspectives Placeholder */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-600 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-600 rounded mb-4"></div>
        <div className="space-y-4">
          <div>
            <div className="h-4 w-1/4 bg-gray-600 rounded mb-1"></div>
            <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
          </div>
          <div>
            <div className="h-4 w-1/4 bg-gray-600 rounded mb-1"></div>
            <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
          </div>
          <div>
            <div className="h-4 w-1/4 bg-gray-600 rounded mb-1"></div>
            <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>

      {/* Reflective Question Placeholder */}
      <div className="bg-blue-900/30 border border-sky-500/20 p-4 sm:p-6 rounded-lg bg-gradient-radial from-sky-500/10 to-transparent mb-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-600 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

export default CommentarySkeleton;
