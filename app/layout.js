import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Workspace Dashboard",
  description: "Next.js 15 App Router dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="d-md-flex min-vh-100">
          <Navbar />
          <main className="flex-grow-1 p-3">{children}</main>
        </div>
      </body>
    </html>
  );
}
