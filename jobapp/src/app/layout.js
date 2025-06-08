import "./globals.css";
import { Inter } from "next/font/google";
import ChatBox from "./common/chatbox";
import ClientProviders from "./components/ClientProviders";
import { NotificationProvider } from './context/notificationContext';
import NotificationInitializer from './common/notificationinitializer';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Job Seeking App",
  description: "Find your dream job",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          <NotificationProvider>
            <NotificationInitializer />
            {children}
            <ChatBox />
          </NotificationProvider>
        </ClientProviders>
      </body>
    </html>
  );
}

