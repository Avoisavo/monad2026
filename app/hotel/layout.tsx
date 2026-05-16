import { Navbar } from "@/components/Navbar";

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
