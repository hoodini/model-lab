import "./globals.css";
import { LabProvider } from "@/components/providers";

export const metadata = {
  title: "Model Lab — train AI from scratch",
  description: "Train real AI models on your own GPU, explained line by line — beginner to advanced, English & Hebrew.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LabProvider>{children}</LabProvider>
      </body>
    </html>
  );
}
