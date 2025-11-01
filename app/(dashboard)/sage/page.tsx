"use client";

import SAGEChat from "@/components/SAGEChat";
import { IconBrain, IconCircleCheck, IconDatabase } from "@tabler/icons-react";

export default function Page() {
  return (
    <div className="space-y-6 px-4 lg:px-6 mt-6 h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <IconBrain className="h-8 w-8 text-primary" />
            SAGE AI Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personalized freelance growth advisor powered by your data
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconCircleCheck className="h-4 w-4 text-primary" />
              AI Active
            </span>
            <span className="flex items-center gap-1">
              <IconDatabase className="h-4 w-4 text-primary" />
              Data Synced
            </span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 h-full">
        <SAGEChat />
      </div>
    </div>
  );
}
