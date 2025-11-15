// app/layout.tsx
import "@/styles/globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mt-[66px]">{/* Adjust this value based on header height */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}