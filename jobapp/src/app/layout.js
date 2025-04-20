import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/usercontext";
import ChatBox from "./common/chatbox";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Job Seeker and Hiring Website",
  description: "Find or post job opportunities with ease",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          {children}
          <ChatBox />
        </UserProvider>
      </body>
    </html>
  );
}

