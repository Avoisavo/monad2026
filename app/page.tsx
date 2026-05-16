"use client";
import { useRouter } from "next/navigation";

// Hotel dimensions (matches /hotel layout exactly)
const COL_W = 88;
const BUILDING_W = 410;
const TOTAL_W = COL_W + BUILDING_W; // 498px
const TOTAL_H = 196 * 4;            // 784px — 4 floors

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#000000",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: TOTAL_W, height: TOTAL_H,
        display: "flex", alignItems: "stretch",
        boxShadow: "0 0 60px #00000099",
        overflow: "hidden",
      }}>
        {/* left grey brick column — same as hotel */}
        <div style={{
          width: COL_W, minWidth: COL_W,
          background: "#5A5A60",
          backgroundImage: [
            "repeating-linear-gradient(0deg, transparent 0px, transparent 13px, rgba(0,0,0,0.35) 13px, rgba(0,0,0,0.35) 15px)",
            "repeating-linear-gradient(90deg, transparent 0px, transparent 26px, rgba(0,0,0,0.18) 26px, rgba(0,0,0,0.18) 28px)",
          ].join(", "),
          borderRight: "4px solid #3A3A40",
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 6, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* video fills the building area */}
        <video
          autoPlay
          muted
          playsInline
          style={{ width: BUILDING_W, height: TOTAL_H, objectFit: "cover", display: "block" }}
          onEnded={() => router.push("/hotel")}
        >
          <source src="/land.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
