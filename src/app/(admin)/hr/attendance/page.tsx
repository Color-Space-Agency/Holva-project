import { Metadata } from "next";
import { AttendanceClient } from "@/components/hr/attendance-client";

export const metadata: Metadata = {
  title: "Attendance | Holva Factory CRM",
  description: "Manage HR employee attendance",
};

export default function AttendancePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
      </div>
      <AttendanceClient />
    </div>
  );
}
