"use client";
import Image from "next/image";
import { Lift } from "@/components/Lift";
import { Navbar } from "@/components/Navbar";

const ROOM_H = 196;
const LABEL_H = 30;

function Label({ text, members = 0, income = 0 }: { text: string; members?: number; income?: number }) {
  return (
    <div style={{
      height: LABEL_H,
      background: "linear-gradient(180deg, #6688CC 0%, #4466AA 100%)",
      borderTop: "3px solid #99AADD",
      borderBottom: "3px solid #223366",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 8px",
    }}>
      <span style={{ fontFamily: "var(--font-pixel), monospace", fontSize: 9, color: "#88EEFF", letterSpacing: 2, textShadow: "1px 1px 0 #001133" }}>
        {text}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* income */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFD700", border: "1px solid #B8860B" }} />
          <span style={{ fontFamily: "var(--font-pixel), monospace", fontSize: 7, color: "#FFD700" }}>{income}</span>
        </div>
        {/* active members */}
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#44FF88", boxShadow: "0 0 4px #00FF66" }} />
          <span style={{ fontFamily: "var(--font-pixel), monospace", fontSize: 7, color: "#AAFFCC" }}>{members}</span>
        </div>
      </div>
    </div>
  );
}

function Door({ h, w = 58 }: { h: number; w?: number }) {
  return (
    <div style={{
      position: "absolute", left: "50%", transform: "translateX(-50%)",
      bottom: 0, width: w, height: h, zIndex: 2,
      background: "#0C0806",
      borderLeft: "4px solid #6A4018",
      borderRight: "4px solid #6A4018",
      borderTop: "4px solid #6A4018",
    }}>
      <div style={{ position: "absolute", right: 8, top: "55%", width: 7, height: 7, borderRadius: "50%", background: "#C8A020", boxShadow: "0 0 3px #FFD040" }} />
    </div>
  );
}

function FortuneTeller() {
  const H = ROOM_H - LABEL_H;
  return (
    <div style={{ display: "flex", flexDirection: "column", borderBottom: "3px solid #1A1A2A" }}>
      <Label text="FORTUNE TELLER" members={1} income={320} />
      <div style={{
        height: H, position: "relative", overflow: "hidden",
        background: "#3E3060",
        backgroundImage: "repeating-linear-gradient(90deg, rgba(120,90,180,0.25) 0px, rgba(120,90,180,0.25) 10px, transparent 10px, transparent 20px)",
      }}>
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
        <div style={{ position: "absolute", left: 76, bottom: 45 }}>
          <div style={{ width: 6, height: 10, background: "#FFD700", borderRadius: "50% 50% 20% 20%", margin: "0 auto", boxShadow: "0 0 8px #FF8800, 0 0 16px #FF440044" }} />
          <div style={{ width: 8, height: 32, background: "#F8F0DC", margin: "0 auto" }} />
          <div style={{ width: 16, height: 6, background: "#B8920C", marginLeft: -4 }} />
        </div>
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 12, width: 96, height: 12, background: "#5A3015", border: "3px solid #3A1A08" }} />
        <div style={{ position: "absolute", left: "50%", transform: "translate(calc(-50% - 24px), 0)", bottom: 0, width: 12, height: 12, background: "#3A1A08" }} />
        <div style={{ position: "absolute", left: "50%", transform: "translate(calc(-50% + 24px), 0)", bottom: 0, width: 12, height: 12, background: "#3A1A08" }} />
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
        <div style={{ position: "absolute", right: 40, bottom: 45 }}>
          <div style={{ width: 6, height: 10, background: "#FFD700", borderRadius: "50% 50% 20% 20%", margin: "0 auto", boxShadow: "0 0 8px #FF8800" }} />
          <div style={{ width: 8, height: 32, background: "#F8F0DC", margin: "0 auto" }} />
          <div style={{ width: 16, height: 6, background: "#B8920C", marginLeft: -4 }} />
        </div>
        <div style={{ position: "absolute", right: 8, top: 18, width: 44, height: 62, background: "#18102A", border: "4px solid #5A3015" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", width: 4, height: "100%", background: "#5A3015", transform: "translateX(-50%)" }} />
          <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 4, background: "#5A3015", transform: "translateY(-50%)" }} />
        </div>
        <Image src="/apple.png" alt="apple" width={110} height={110} style={{ position: "absolute", left: 76, bottom: -8, objectFit: "contain", zIndex: 10 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, background: "#2E200E" }} />
        <Door h={Math.floor(H * 0.67)} w={58} />
      </div>
    </div>
  );
}

function Laundromat() {
  const H = ROOM_H - LABEL_H;
  return (
    <div style={{ display: "flex", flexDirection: "column", borderBottom: "3px solid #1A1A2A" }}>
      <Label text="LAUNDROMAT" members={2} income={180} />
      <div style={{
        height: H, position: "relative", overflow: "hidden",
        background: "#D4D8E0",
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 18px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 18px)",
      }}>
        <div style={{ position: "absolute", left: 10, top: 10, width: 30, height: 30, borderRadius: "50%", background: "#DD1100", border: "3px solid #AA0800", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 20, height: 4, background: "#FFFFFF", transform: "rotate(45deg)", borderRadius: 2 }} />
        </div>
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
        <div style={{ position: "absolute", left: 48, bottom: 8, width: 32, height: 96, background: "#1A5A28", border: "3px solid #0A3015" }}>
          <div style={{ position: "absolute", top: 7, left: 4, right: 4, height: 7, background: "#2A7A38" }} />
          <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: "#0A3015" }} />
          <div style={{ position: "absolute", top: 48, left: 4, right: 4, height: 4, background: "#0A3015" }} />
          <div style={{ position: "absolute", top: 56, left: 4, right: 4, bottom: 4, background: "#103A1C" }} />
        </div>
        <div style={{ position: "absolute", right: 8, bottom: 8, display: "grid", gridTemplateColumns: "repeat(3, 56px)", gridTemplateRows: "repeat(2, 50px)", gap: 3 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: "#AAAEC0", border: "2px solid #7A80A0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: "4px solid #505880", background: "#7AAEC8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#5A8AB0", border: "2px solid #3A6890" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", right: 185, bottom: 8, width: 34, height: 28, background: "#CC4477", border: "2px solid #AA2255" }}>
          {[6,13,20,27].map(x => <div key={x} style={{ position: "absolute", left: x, top: 0, width: 3, bottom: 0, background: "rgba(255,255,255,0.18)" }} />)}
        </div>
        <div style={{ position: "absolute", right: 8, top: 10, width: 64, height: 32, background: "#7788CC", border: "2px solid #5566AA" }}>
          <div style={{ display: "flex", gap: 3, padding: 4 }}>
            <div style={{ width: 22, height: 22, background: "#4455AA" }} />
            <div style={{ width: 22, height: 22, background: "#3344BB" }} />
            <div style={{ width: 14, height: 22, background: "#5566CC" }} />
          </div>
        </div>
        <Image src="/cucumber1.png"   alt="cucumber"   width={110} height={110} style={{ position: "absolute", left: 76,  bottom: -8, objectFit: "contain", zIndex: 10 }} />
        <Image src="/strawberry.png" alt="strawberry" width={110} height={110} style={{ position: "absolute", left: 180, bottom: -8, objectFit: "contain", zIndex: 10 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: "#9AA0B2" }} />
        <Door h={Math.floor(H * 0.62)} w={56} />
      </div>
    </div>
  );
}

function SushiBar() {
  const H = ROOM_H - LABEL_H;
  return (
    <div style={{ display: "flex", flexDirection: "column", borderBottom: "3px solid #1A1A2A" }}>
      <Label text="SUSHI BAR" members={2} income={540} />
      <div style={{ height: H, position: "relative", overflow: "hidden", background: "#BFA070" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 28, background: "rgba(255,210,130,0.18)" }} />
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 10, width: 30, height: 30, borderRadius: "50%", background: "#EEE8D0", border: "3px solid #5A3A18", zIndex: 3 }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 2, height: 10, background: "#222", transformOrigin: "bottom center", transform: "translate(-50%, -100%) rotate(-30deg)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 2, height: 8, background: "#222", transformOrigin: "bottom center", transform: "translate(-50%, -100%) rotate(90deg)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 4, height: 4, borderRadius: "50%", background: "#333", transform: "translate(-50%, -50%)" }} />
        </div>
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
        <div style={{ position: "absolute", left: 100, bottom: 35 }}>
          <div style={{ width: 2, height: 22, background: "#3A6A18", margin: "0 auto" }} />
          <div style={{ width: 18, height: 14, borderRadius: "50%", background: "#EE5577", marginLeft: -8, marginTop: -10, boxShadow: "3px -4px 0 #DD3366, -4px -2px 0 #FF77AA" }} />
        </div>
        <div style={{ position: "absolute", left: 98, bottom: 28, width: 12, height: 10, background: "#C89040", border: "2px solid #8A5A20" }} />
        <div style={{ position: "absolute", left: 80, bottom: 20, width: 20, height: 16, background: "#D4A820", border: "2px solid #9A7010" }} />
        <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, height: 28, background: "#5A3010", border: "2px solid #3A1A08" }} />
        <div style={{ position: "absolute", bottom: 34, left: 0, right: 0, height: 6, background: "#7A5028" }} />
        {[28, 62, 96, 220, 252, 285].map(x => (
          <div key={x} style={{ position: "absolute", left: x, bottom: 40 }}>
            <div style={{ width: 22, height: 5, background: "#1A0E06" }} />
            <div style={{ width: 3, height: 14, background: "#140A04", margin: "0 auto" }} />
            <div style={{ width: 12, height: 4, background: "#140A04", margin: "0 auto" }} />
          </div>
        ))}
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
        <div style={{ position: "absolute", right: 110, bottom: 40 }}>
          <div style={{ width: 2, height: 22, background: "#3A6A18", margin: "0 auto" }} />
          <div style={{ width: 18, height: 14, borderRadius: "50%", background: "#EE5577", marginLeft: -8, marginTop: -10, boxShadow: "3px -4px 0 #DD3366, -4px -2px 0 #FF77AA" }} />
        </div>
        <Image src="/tung1.png"     alt="tung"     width={160} height={160} style={{ position: "absolute", left: 76,  bottom: -8, objectFit: "contain", zIndex: 10 }} />
        <Image src="/eggplant1.png" alt="eggplant" width={110} height={110} style={{ position: "absolute", left: 186, bottom: -8, objectFit: "contain", zIndex: 10 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: "#7A5028" }} />
        <Door h={Math.floor(H * 0.68)} w={56} />
      </div>
    </div>
  );
}

function CoffeeHouse() {
  const H = ROOM_H - LABEL_H;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Label text="COFFEE HOUSE" members={1} income={290} />
      <div style={{ height: H, position: "relative", overflow: "hidden", background: "#484858" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 160,
          background: "#7A3A20",
          backgroundImage: [
            "repeating-linear-gradient(0deg, transparent 0px, transparent 13px, rgba(0,0,0,0.4) 13px, rgba(0,0,0,0.4) 15px)",
            "repeating-linear-gradient(90deg, transparent 0px, transparent 26px, rgba(0,0,0,0.2) 26px, rgba(0,0,0,0.2) 28px)",
          ].join(", "),
        }} />
        {[85, 210, 330].map((x, i) => (
          <div key={i} style={{ position: "absolute", left: x }}>
            <div style={{ width: 2, height: 34, background: "#888", margin: "0 auto" }} />
            <div style={{ width: 30, height: 18, borderRadius: "0 0 50% 50%", background: "#EAE0C8", marginLeft: -14, border: "2px solid #C0B090", boxShadow: "0 4px 16px rgba(255,235,160,0.5)" }} />
          </div>
        ))}
        <div style={{ position: "absolute", left: 12, bottom: 55, width: 48, height: 48, borderRadius: "50%", background: "#1A6A1A", border: "4px solid #0A4A0A" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2A8A2A", margin: "6px auto" }}>
            <div style={{ width: 16, height: 12, background: "#F0F0F0", margin: "5px auto", borderRadius: "0 0 4px 4px" }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 58, bottom: 18, width: 70, height: 30, background: "#5A3018", border: "3px solid #3A1A08" }} />
        <div style={{ position: "absolute", left: 63, bottom: 8, width: 10, height: 10, background: "#3A1A08" }} />
        <div style={{ position: "absolute", left: 112, bottom: 8, width: 10, height: 10, background: "#3A1A08" }} />
        <div style={{ position: "absolute", left: 58, top: 50, width: 68, height: 52, background: "#3A2010", border: "2px solid #1A0A04" }}>
          {[16, 32].map(y => <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 3, background: "#5A3018" }} />)}
          {[0,1,2].map(row => (
            <div key={row} style={{ position: "absolute", top: row * 16 + 2, left: 3, right: 3, height: 12, display: "flex", gap: 2 }}>
              {[0,1,2].map(col => <div key={col} style={{ flex: 1, background: "#1A0A04" }} />)}
            </div>
          ))}
        </div>
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
        <div style={{ position: "absolute", right: 146, top: 46, width: 52, height: 88, background: "#3A2410", border: "2px solid #1A0A04" }}>
          {[22, 44, 66].map(y => <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 3, background: "#5A3818" }} />)}
          {[0,1,2].map(row => (
            <div key={row} style={{ position: "absolute", top: row * 22 + 2, left: 3, right: 3, height: 18, display: "flex", gap: 2 }}>
              <div style={{ flex: 1, background: "#5A3818", border: "1px solid #3A2010" }} />
              <div style={{ flex: 1, background: "#4A2C14", border: "1px solid #3A2010" }} />
            </div>
          ))}
        </div>
        <Image src="/hudim1.png" alt="hudim" width={110} height={110} style={{ position: "absolute", left: 76, bottom: 2, objectFit: "contain", zIndex: 10 }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 18, background: "#6A5030" }} />
        <Door h={Math.floor(H * 0.75)} w={56} />
      </div>
    </div>
  );
}

const px = "var(--font-pixel), monospace";
const FLOOR_LABELS = ["F4","F3","F2","F1"];
const TOTAL_H = ROOM_H * 4;

export default function HotelPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000000", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", boxShadow: "0 0 80px #00000099" }}>

        {/* ── BUILDING ── */}
        <div style={{ display: "flex", alignItems: "stretch" }}>

          {/* brick column with floor numbers */}
          <div style={{
            width: 52, background: "#5A5A60", position: "relative",
            backgroundImage: [
              "repeating-linear-gradient(0deg, transparent 0px, transparent 13px, rgba(0,0,0,0.35) 13px, rgba(0,0,0,0.35) 15px)",
              "repeating-linear-gradient(90deg, transparent 0px, transparent 26px, rgba(0,0,0,0.18) 26px, rgba(0,0,0,0.18) 28px)",
            ].join(", "),
            borderRight: "4px solid #3A3A40",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 6, background: "rgba(255,255,255,0.08)" }} />
            {FLOOR_LABELS.map((label, i) => (
              <div key={label} style={{
                position: "absolute", top: i * ROOM_H, left: 0, width: "100%", height: ROOM_H,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <span style={{ fontFamily: px, fontSize: 13, color: "#DDDDEE", textShadow: "1px 1px 0 #000", letterSpacing: 1 }}>{label}</span>
                <div style={{ width: 28, height: 2, background: "#3A3A44" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#44FF88", boxShadow: "0 0 5px #00FF66" }} />
                  <span style={{ fontFamily: px, fontSize: 6, color: "#88CCAA" }}>OPEN</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── LIFT ── */}
          <Lift />

          {/* rooms */}
          <div style={{ width: 410, display: "flex", flexDirection: "column" }}>
            <FortuneTeller />
            <Laundromat />
            <SushiBar />
            <CoffeeHouse />
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{
          height: 46, background: "linear-gradient(180deg, #111133 0%, #0A0A22 100%)",
          border: "3px solid #334466",
          display: "flex", alignItems: "center", padding: "0 12px", gap: 14,
        }}>
          {/* coins */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FFD700", border: "2px solid #B8860B", boxShadow: "0 0 6px #FFD70066" }} />
            <span style={{ fontFamily: px, fontSize: 9, color: "#FFD700" }}>1,330</span>
          </div>

          <div style={{ width: 1, height: 20, background: "#334466" }} />

          {/* visitor count */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#44AAFF" }} />
            <span style={{ fontFamily: px, fontSize: 8, color: "#88CCFF" }}>6 VISITORS</span>
          </div>

          <div style={{ width: 1, height: 20, background: "#334466" }} />

          {/* rating stars */}
          <div style={{ display: "flex", gap: 3 }}>
            {[1,2,3,4,5].map(s => (
              <div key={s} style={{ width: 10, height: 10, background: s <= 4 ? "#FFD700" : "#333355", clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }} />
            ))}
          </div>

          {/* spacer */}
          <div style={{ flex: 1 }} />

          {/* action buttons */}
          {["BUILD","UPGRADE","MENU"].map((btn, i) => (
            <div key={btn} style={{
              padding: "5px 10px",
              background: i === 2 ? "#2A7A2A" : "#1A2A5A",
              border: `2px solid ${i === 2 ? "#1A5A1A" : "#334488"}`,
              cursor: "pointer",
            }}>
              <span style={{ fontFamily: px, fontSize: 8, color: i === 2 ? "#AAFFAA" : "#88AAFF", letterSpacing: 1 }}>{btn}</span>
            </div>
          ))}
        </div>

      </div>
      </div>
    </div>
  );
}
