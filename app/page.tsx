"use client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "0px" }}>
      <div style={{ position: "relative", marginTop: "-110px", width: "45%" }}>
        <video
          style={{ width: "100%", height: "auto", display: "block" }}
          autoPlay
          muted
          playsInline
          onEnded={() => router.push("/hotel")}
        >
          <source src="/land.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "growText 3s ease-out forwards",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}>
          <span style={{
            fontFamily: "var(--font-pixel), monospace",
            fontSize: "3.2rem",
            color: "#1e3a8a",
            WebkitTextStroke: "3px #000",
            paintOrder: "stroke fill",
            textShadow: "0 0 20px #facc15, 0 0 40px #facc15, 0 0 80px #f59e0b, 0 0 120px #f59e0b",
            letterSpacing: "0.05em",
          }}>
            Brain Hotel
          </span>
        </div>
      </div>
      <style>{`
        @keyframes growText {
          0% { transform: translate(-50%, -50%) scale(0.05); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
