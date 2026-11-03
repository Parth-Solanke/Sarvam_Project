import "./globals.css";
import ThemeInitializer from "@/components/ThemeInitializer";

export const metadata = {
  title: "SarvOSINT — Investigation Workspace",
  description: "Multilingual OSINT Fusion Platform powered by Sarvam AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-workbench-bg text-workbench-text min-h-screen w-full antialiased transition-colors duration-200 select-none">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
