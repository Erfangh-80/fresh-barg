import { Metadata } from "next";

export const metadata: Metadata = {
  title: "آموزش نرم‌افزار",
  description: "صفحه آموزش گام به گام نرم‌افزار",
};

import TutorialPage from "@/components/pages/tutorial/TutorialPage";

export default function Tutorials() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <TutorialPage />
    </div>
  );
}
