import type { Metadata } from "next";

import "@/styles/tokens.css";
import "@/styles/reset.css";
import "./globals.css";

import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Quiz Builder",
  description: "Create custom quizzes, browse them and view their structure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className={styles.shell}>{children}</div>
      </body>
    </html>
  );
}
