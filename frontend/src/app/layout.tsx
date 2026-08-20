import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
