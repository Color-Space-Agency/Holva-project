import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "To'lovlar",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
