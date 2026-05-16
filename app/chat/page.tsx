"use client";

import { useEffect, useState } from "react";
import CharacterBoard from "./CharacterBoard";
import { Navbar } from "@/components/Navbar";

const ROOM_H = 196;
const LABEL_H = 30;

// ── shared: floor label ──────────────────────────────────────────
function Label({ text }: { text: string }) {
  return (
    <div style={{
      height: LABEL_H,
      background: "linear-gradient(180deg, #6688CC 0%, #4466AA 100%)",
      borderTop: "3px solid #99AADD",
      borderBottom: "3px solid #223366",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{
        fontFamily: "var(--font-pixel), monospace",
        fontSize: 11, color: "#88EEFF",
        letterSpacing: 3,
        textShadow: "1px 1px 0 #001133, -1px -1px 0 #003366",
      }}>
        {text}
      </span>
    </div>
  );
}

// ── shared: center door ──────────────────────────────────────────
function Door({ h, w = 58 }: { h: number; w?: number }) {
  return (
    <div style={{
      position: "absolute", left: "50%", transform: "translateX(-50%)",
      bottom: 0, width: w, height: h, zIndex: 6,
      background: "#0C0806",
      borderLeft: "4px solid #6A4018",
      borderRight: "4px solid #6A4018",
      borderTop: "4px solid #6A4018",
    }}>
      <div style={{ position: "absolute", right: 8, top: "55%", width: 7, height: 7, borderRadius: "50%", background: "#C8A020", boxShadow: "0 0 3px #FFD040" }} />
    </div>
  );
}

// ── FORTUNE TELLER ───────────────────────────────────────────────
function FortuneTeller() {
  const H = ROOM_H - LABEL_H;
  return (
    <div style={{ flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column", borderBottom: "3px solid #1A1A2A" }}>
      <Label text="FORTUNE TELLER" />
      <div style={{
        flex: 1, minHeight: 0, position: "relative", overflow: "hidden",
        background: "#3E3060",
        backgroundImage: "repeating-linear-gradient(90deg, rgba(120,90,180,0.25) 0px, rgba(120,90,180,0.25) 10px, transparent 10px, transparent 20px)",
      }}>
        {/* ── left bookshelf ── */}
        <div style={{ position: "absolute", left: 8, top: 8, width: 60, height: 128, background: "#5A3015", border: "3px solid #3A1A08" }}>
          {[38, 76].map(y => <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 5, background: "#7A5020" }} />)}
          {[4, 42, 80].map((y, si) => (
            <div key={si} style={{ position: "absolute", top: y, left: 4, right: 4, height: 32, display: "flex", gap: 2, alignItems: "flex-end" }}>
              {["#991A1A","#1A4A99","#1A8833","#887700","#881A88","#CC4400","#338888"].map((c, j) => (
                <div key={j} style={{ width: 6, height: 26 - (j % 3) * 4, background: c }} />
              ))}
            </div>
          ))}
        </div>

        {/* ── left candle on stand ── */}
        <div style={{ position: "absolute", left: 76, bottom: 45 }}>
          <div style={{ width: 6, height: 10, background: "#FFD700", borderRadius: "50% 50% 20% 20%", margin: "0 auto", boxShadow: "0 0 8px #FF8800, 0 0 16px #FF440044" }} />
          <div style={{ width: 8, height: 32, background: "#F8F0DC", margin: "0 auto" }} />
          <div style={{ width: 16, height: 6, background: "#B8920C", marginLeft: -4 }} />
        </div>

        {/* ── center table ── */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 12, width: 96, height: 12, background: "#5A3015", border: "3px solid #3A1A08" }} />
        <div style={{ position: "absolute", left: "50%", transform: "translate(calc(-50% - 24px), 0)", bottom: 0, width: 12, height: 12, background: "#3A1A08" }} />
        <div style={{ position: "absolute", left: "50%", transform: "translate(calc(-50% + 24px), 0)", bottom: 0, width: 12, height: 12, background: "#3A1A08" }} />

        {/* ── crystal ball ── */}
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 24,
          width: 38, height: 38, borderRadius: "50%", zIndex: 3,
          background: "radial-gradient(circle at 35% 30%, #F0D0FF 0%, #CC88EE 40%, #8840AA 100%)",
          border: "3px solid #DDAAFF",
          boxShadow: "0 0 14px #AA44CC88, 0 0 4px #EE88FF",
        }} />

        {/* ── right bookshelf ── */}
        <div style={{ position: "absolute", right: 56, top: 8, width: 60, height: 128, background: "#5A3015", border: "3px solid #3A1A08" }}>
          {[38, 76].map(y => <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 5, background: "#7A5020" }} />)}
          {[4, 42, 80].map((y, si) => (
            <div key={si} style={{ position: "absolute", top: y, left: 4, right: 4, height: 32, display: "flex", gap: 2, alignItems: "flex-end" }}>
              {["#CC3300","#224499","#228833","#AA7700","#883399","#CC6600"].map((c, j) => (
                <div key={j} style={{ width: 8, height: 28 - (j % 2) * 5, background: c }} />
              ))}
            </div>
          ))}
        </div>

        {/* ── right candle ── */}
        <div style={{ position: "absolute", right: 40, bottom: 45 }}>
          <div style={{ width: 6, height: 10, background: "#FFD700", borderRadius: "50% 50% 20% 20%", margin: "0 auto", boxShadow: "0 0 8px #FF8800" }} />
          <div style={{ width: 8, height: 32, background: "#F8F0DC", margin: "0 auto" }} />
          <div style={{ width: 16, height: 6, background: "#B8920C", marginLeft: -4 }} />
        </div>

        {/* ── window far right ── */}
        <div style={{ position: "absolute", right: 8, top: 18, width: 44, height: 62, background: "#18102A", border: "4px solid #5A3015" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", width: 4, height: "100%", background: "#5A3015", transform: "translateX(-50%)" }} />
          <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 4, background: "#5A3015", transform: "translateY(-50%)" }} />
        </div>

        {/* floor */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, background: "#2E200E" }} />
        <Door h={Math.floor(H * 0.67)} w={58} />
      </div>
    </div>
  );
}

// ── LAUNDROMAT ───────────────────────────────────────────────────
function Laundromat() {
  const H = ROOM_H - LABEL_H;
  return (
    <div style={{ flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column", borderBottom: "3px solid #1A1A2A" }}>
      <Label text="LAUNDROMAT" />
      <div style={{
        flex: 1, minHeight: 0, position: "relative", overflow: "hidden",
        background: "#D4D8E0",
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 18px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 18px)",
      }}>

        {/* ── no smoking sign ── */}
        <div style={{ position: "absolute", left: 10, top: 10, width: 30, height: 30, borderRadius: "50%", background: "#DD1100", border: "3px solid #AA0800", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 20, height: 4, background: "#FFFFFF", transform: "rotate(45deg)", borderRadius: 2 }} />
        </div>

        {/* ── vending machine (blue) ── */}
        <div style={{ position: "absolute", left: 8, bottom: 8, width: 36, height: 96, background: "#2244BB", border: "3px solid #1133AA" }}>
          <div style={{ position: "absolute", left: 2, top: 2, width: 5, bottom: 2, background: "rgba(255,255,255,0.12)" }} />
          {[0,1,2,3].map(row => (
            <div key={row} style={{ display: "flex", gap: 2, padding: "3px 4px", marginTop: row === 0 ? 4 : 0 }}>
              {["#CC3322","#22AA44","#EE8800"].map((c, col) => (
                <div key={col} style={{ width: 8, height: 11, background: c, border: "1px solid rgba(0,0,0,0.4)" }} />
              ))}
            </div>
          ))}
          <div style={{ position: "absolute", bottom: 5, left: "50%", transform: "translateX(-50%)", width: 16, height: 4, background: "#1133AA" }} />
        </div>

        {/* ── green cabinet ── */}
        <div style={{ position: "absolute", left: 48, bottom: 8, width: 32, height: 96, background: "#1A5A28", border: "3px solid #0A3015" }}>
          <div style={{ position: "absolute", top: 7, left: 4, right: 4, height: 7, background: "#2A7A38" }} />
          <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: "#0A3015" }} />
          <div style={{ position: "absolute", top: 48, left: 4, right: 4, height: 4, background: "#0A3015" }} />
          <div style={{ position: "absolute", top: 56, left: 4, right: 4, bottom: 4, background: "#103A1C" }} />
        </div>

        {/* ── washing machines 2×3 ── */}
        <div style={{ position: "absolute", right: 8, bottom: 8, display: "grid", gridTemplateColumns: "repeat(3, 56px)", gridTemplateRows: "repeat(2, 50px)", gap: 3 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: "#AAAEC0", border: "2px solid #7A80A0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: "4px solid #505880", background: "#7AAEC8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#5A8AB0", border: "2px solid #3A6890" }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── pink laundry basket bottom right ── */}
        <div style={{ position: "absolute", right: 185, bottom: 8, width: 34, height: 28, background: "#CC4477", border: "2px solid #AA2255" }}>
          {[6,13,20,27].map(x => <div key={x} style={{ position: "absolute", left: x, top: 0, width: 3, bottom: 0, background: "rgba(255,255,255,0.18)" }} />)}
        </div>

        {/* ── blue shelf top right ── */}
        <div style={{ position: "absolute", right: 8, top: 10, width: 64, height: 32, background: "#7788CC", border: "2px solid #5566AA" }}>
          <div style={{ display: "flex", gap: 3, padding: 4 }}>
            <div style={{ width: 22, height: 22, background: "#4455AA" }} />
            <div style={{ width: 22, height: 22, background: "#3344BB" }} />
            <div style={{ width: 14, height: 22, background: "#5566CC" }} />
          </div>
        </div>

        {/* floor */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: "#9AA0B2" }} />
        <Door h={Math.floor(H * 0.62)} w={56} />
      </div>
    </div>
  );
}

// ── SUSHI BAR ────────────────────────────────────────────────────
function SushiBar() {
  const H = ROOM_H - LABEL_H;
  return (
    <div style={{ flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column", borderBottom: "3px solid #1A1A2A" }}>
      <Label text="SUSHI BAR" />
      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", background: "#BFA070" }}>
        {/* warm ceiling glow */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 28, background: "rgba(255,210,130,0.18)" }} />

        {/* ── clock (center top) ── */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 10, width: 30, height: 30, borderRadius: "50%", background: "#EEE8D0", border: "3px solid #5A3A18", zIndex: 3 }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 2, height: 10, background: "#222", transformOrigin: "bottom center", transform: "translate(-50%, -100%) rotate(-30deg)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 2, height: 8, background: "#222", transformOrigin: "bottom center", transform: "translate(-50%, -100%) rotate(90deg)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 4, height: 4, borderRadius: "50%", background: "#333", transform: "translate(-50%, -50%)" }} />
        </div>

        {/* ── left shelving unit ── */}
        <div style={{ position: "absolute", left: 6, top: 6, width: 90, height: 100, background: "#7A5028", border: "2px solid #5A3010" }}>
          {[32, 64, 96].map(y => <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 4, background: "#9A6838" }} />)}
          {[0,1,2].map(row => (
            <div key={row} style={{ position: "absolute", top: row * 32 + 4, left: 2, right: 2, height: 26, display: "flex", gap: 2 }}>
              {[0,1,2,3].map(col => (
                <div key={col} style={{ flex: 1, background: "#C8A868", border: "1px solid #7A5028" }}>
                  {row === 1 && col === 1 && <div style={{ width: "60%", height: "55%", background: "#8B6040", margin: "4px auto" }} />}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── left flower vase ── */}
        <div style={{ position: "absolute", left: 100, bottom: 35 }}>
          <div style={{ width: 2, height: 22, background: "#3A6A18", margin: "0 auto" }} />
          <div style={{ width: 18, height: 14, borderRadius: "50%", background: "#EE5577", marginLeft: -8, marginTop: -10, boxShadow: "3px -4px 0 #DD3366, -4px -2px 0 #FF77AA" }} />
        </div>
        <div style={{ position: "absolute", left: 98, bottom: 28, width: 12, height: 10, background: "#C89040", border: "2px solid #8A5A20" }} />

        {/* ── yellow item bottom left ── */}
        <div style={{ position: "absolute", left: 80, bottom: 20, width: 20, height: 16, background: "#D4A820", border: "2px solid #9A7010" }} />

        {/* ── bar counter ── */}
        <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, height: 28, background: "#5A3010", border: "2px solid #3A1A08" }} />
        <div style={{ position: "absolute", bottom: 34, left: 0, right: 0, height: 6, background: "#7A5028" }} />

        {/* ── bar stools ── */}
        {[28, 62, 96, 220, 252, 285].map(x => (
          <div key={x} style={{ position: "absolute", left: x, bottom: 40 }}>
            <div style={{ width: 22, height: 5, background: "#1A0E06" }} />
            <div style={{ width: 3, height: 14, background: "#140A04", margin: "0 auto" }} />
            <div style={{ width: 12, height: 4, background: "#140A04", margin: "0 auto" }} />
          </div>
        ))}

        {/* ── right shelving unit ── */}
        <div style={{ position: "absolute", right: 6, top: 6, width: 100, height: 100, background: "#7A5028", border: "2px solid #5A3010" }}>
          {[32, 64, 96].map(y => <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 4, background: "#9A6838" }} />)}
          {[0,1,2].map(row => (
            <div key={row} style={{ position: "absolute", top: row * 32 + 4, left: 2, right: 2, height: 26, display: "flex", gap: 2 }}>
              {[0,1,2,3,4].map(col => (
                <div key={col} style={{ flex: 1, background: "#C8A868", border: "1px solid #7A5028" }} />
              ))}
            </div>
          ))}
        </div>

        {/* ── right flower ── */}
        <div style={{ position: "absolute", right: 110, bottom: 40 }}>
          <div style={{ width: 2, height: 22, background: "#3A6A18", margin: "0 auto" }} />
          <div style={{ width: 18, height: 14, borderRadius: "50%", background: "#EE5577", marginLeft: -8, marginTop: -10, boxShadow: "3px -4px 0 #DD3366, -4px -2px 0 #FF77AA" }} />
        </div>

        {/* floor */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: "#7A5028" }} />
        <Door h={Math.floor(H * 0.68)} w={56} />
      </div>
    </div>
  );
}

// ── COFFEE HOUSE ─────────────────────────────────────────────────
function CoffeeHouse() {
  const H = ROOM_H - LABEL_H;
  return (
    <div style={{ flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <Label text="COFFEE HOUSE" />
      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", background: "#484858" }}>

        {/* ── left brick wall section ── */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 160,
          background: "#7A3A20",
          backgroundImage: [
            "repeating-linear-gradient(0deg, transparent 0px, transparent 13px, rgba(0,0,0,0.4) 13px, rgba(0,0,0,0.4) 15px)",
            "repeating-linear-gradient(90deg, transparent 0px, transparent 26px, rgba(0,0,0,0.2) 26px, rgba(0,0,0,0.2) 28px)",
          ].join(", "),
        }} />

        {/* ── pendant lights ── */}
        {[85, 210, 330].map((x, i) => (
          <div key={i} style={{ position: "absolute", left: x }}>
            <div style={{ width: 2, height: 34, background: "#888", margin: "0 auto" }} />
            <div style={{ width: 30, height: 18, borderRadius: "0 0 50% 50%", background: "#EAE0C8", marginLeft: -14, border: "2px solid #C0B090", boxShadow: "0 4px 16px rgba(255,235,160,0.5)" }} />
          </div>
        ))}

        {/* ── coffee cup logo (green circle) ── */}
        <div style={{ position: "absolute", left: 12, bottom: 55, width: 48, height: 48, borderRadius: "50%", background: "#1A6A1A", border: "4px solid #0A4A0A" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2A8A2A", margin: "6px auto" }}>
            <div style={{ width: 16, height: 12, background: "#F0F0F0", margin: "5px auto", borderRadius: "0 0 4px 4px" }} />
          </div>
        </div>

        {/* ── left wood table ── */}
        <div style={{ position: "absolute", left: 58, bottom: 18, width: 70, height: 30, background: "#5A3018", border: "3px solid #3A1A08" }} />
        <div style={{ position: "absolute", left: 63, bottom: 8, width: 10, height: 10, background: "#3A1A08" }} />
        <div style={{ position: "absolute", left: 112, bottom: 8, width: 10, height: 10, background: "#3A1A08" }} />

        {/* ── left small shelf ── */}
        <div style={{ position: "absolute", left: 58, top: 50, width: 68, height: 52, background: "#3A2010", border: "2px solid #1A0A04" }}>
          {[16, 32].map(y => <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 3, background: "#5A3018" }} />)}
          {[0,1,2].map(row => (
            <div key={row} style={{ position: "absolute", top: row * 16 + 2, left: 3, right: 3, height: 12, display: "flex", gap: 2 }}>
              {[0,1,2].map(col => <div key={col} style={{ flex: 1, background: "#1A0A04" }} />)}
            </div>
          ))}
        </div>

        {/* ── right display case (glass shelves + items) ── */}
        <div style={{ position: "absolute", right: 6, top: 46, bottom: 18, width: 136, background: "#2A1A0C", border: "2px solid #1A0804" }}>
          <div style={{ height: 10, background: "rgba(140,180,220,0.45)", borderBottom: "2px solid #4A3020" }} />
          {[0,1,2].map(row => (
            <div key={row} style={{ padding: "3px 4px" }}>
              <div style={{ height: 3, background: "#4A3018", marginBottom: 2 }} />
              <div style={{ display: "flex", gap: 2 }}>
                {[0,1,2,3,4,5].map(col => (
                  <div key={col} style={{ flex: 1, height: 14, background: ["#C8A060","#D4B070","#BC9850","#E0C080","#C09050","#DDB870"][(row*6+col)%6], border: "1px solid rgba(0,0,0,0.2)" }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── right wood shelving ── */}
        <div style={{ position: "absolute", right: 146, top: 46, width: 52, height: 88, background: "#3A2410", border: "2px solid #1A0A04" }}>
          {[22, 44, 66].map(y => <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 3, background: "#5A3818" }} />)}
          {[0,1,2].map(row => (
            <div key={row} style={{ position: "absolute", top: row * 22 + 2, left: 3, right: 3, height: 18, display: "flex", gap: 2 }}>
              <div style={{ flex: 1, background: "#5A3818", border: "1px solid #3A2010" }} />
              <div style={{ flex: 1, background: "#4A2C14", border: "1px solid #3A2010" }} />
            </div>
          ))}
        </div>

        {/* floor */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 18, background: "#6A5030" }} />
        <Door h={Math.floor(H * 0.75)} w={56} />
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function Home() {
  const [boardOpen, setBoardOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTyping = tagName === "INPUT" || tagName === "TEXTAREA" || target?.isContentEditable;

      if (!isTyping && event.key.toLowerCase() === "w") {
        event.preventDefault();
        setBoardOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div style={{
      minHeight: "100dvh",
      height: "100dvh",
      overflow: "hidden",
      background: "radial-gradient(circle at 20% 20%, #1B1722 0%, #0A0807 42%, #070604 100%)",
      position: "relative",
    }}>
      <Navbar />
      <main style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 0,
        paddingRight: 0,
      }}>
        <div style={{
          height: "100dvh",
          display: "flex",
          alignItems: "stretch",
          transformOrigin: "center center",
	          transform: boardOpen ? "translateX(calc(-50vw + 275px)) scale(1)" : "translateX(0) scale(1)",
	          transition: "transform 1120ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 820ms ease",
	          boxShadow: boardOpen ? "18px 0 70px rgba(7,6,4,0.58)" : "0 0 60px rgba(7,6,4,0.6)",
	        }}>

        {/* left grey brick column */}
        <div style={{
          width: 88,
          background: "#5A5A60",
          backgroundImage: [
            "repeating-linear-gradient(0deg, transparent 0px, transparent 13px, rgba(0,0,0,0.35) 13px, rgba(0,0,0,0.35) 15px)",
            "repeating-linear-gradient(90deg, transparent 0px, transparent 26px, rgba(0,0,0,0.18) 26px, rgba(0,0,0,0.18) 28px)",
          ].join(", "),
          borderRight: "4px solid #3A3A40",
          position: "relative",
        }}>
          {/* left highlight edge */}
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 6, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* building */}
        <div style={{ width: 410, height: "100dvh", display: "flex", flexDirection: "column" }}>
          <FortuneTeller />
          <Laundromat />
          <SushiBar />
          <CoffeeHouse />
        </div>

        </div>
      </main>

      <CharacterBoard open={boardOpen} onToggle={() => setBoardOpen((current) => !current)} />
    </div>
  );
}
