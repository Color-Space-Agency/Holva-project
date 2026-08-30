import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bo'limlar",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
