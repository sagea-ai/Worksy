import { DashboardLayout } from "@/components/dashboard-layout";
import React from "react";

export default function OplovenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}