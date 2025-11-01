"use client";

import SAGEChat from "@/components/SAGEChat";

export default function Page() {
  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Header Section */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SAGE AI Assistant</h1>
              <p className="text-gray-600 text-lg">Your personalized freelance growth advisor powered by your data</p>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>AI Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Data Synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto h-full">
          <SAGEChat />
        </div>
      </div>
    </div>
  );
}
