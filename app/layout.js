import "bootstrap/dist/css/bootstrap.min.css";
// import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Project Workspace Dashboard",
  description:
    "Next.js App Router dashboard for managing projects, tasks, and people.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* <Navbar /> */}
        <main className="p-3">{children}</main>
      </body>
    </html>
  );
}
