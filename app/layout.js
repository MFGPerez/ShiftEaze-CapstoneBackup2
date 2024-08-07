import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import dynamic from 'next/dynamic';

/**
 * Client-side dynamic import for the DndProvider
 */
const ClientSideDndProvider = dynamic(() => import('./components/calendarComponents/ClientSideDndProvider'), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

/**
 * Metadata for the application
 */
export const metadata = {
  title: "Shift Eaze",
  description: "",
};

/**
 * RootLayout Component
 * 
 * This component serves as the root layout for the application.
 * It includes the global styles, font settings, and wraps children components with necessary providers.
 * 
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The child components to be wrapped
 * @returns {JSX.Element} The root layout component
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSideDndProvider>
          {children}
        </ClientSideDndProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
