"use client";
import { useState, useEffect } from "react";

const ROOM_H = 196;
const CAR_H = 130;

export function Lift() {
  const [floor, setFloor] = useState(0);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "e" || e.key === "E") && !moving) {
        setMoving(true);
        setFloor(f => Math.min(f + 1, 3));
        setTimeout(() => setMoving(false), 900);
      }
      if ((e.key === "d" || e.key === "D") && !moving) {
        setMoving(true);
        setFloor(f => Math.max(f - 1, 0));
        setTimeout(() => setMoving(false), 900);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moving]);

  const liftCarTop = (3 - floor) * ROOM_H + (ROOM_H - CAR_H) / 2 + 30;

  return (
    <div style={{
      width: 72,
      background: "linear-gradient(180deg, #080810 0%, #0D0D1E 100%)",
      position: "relative",
      overflow: "hidden",
      borderRight: "2px solid #1A1A3A",
      borderLeft: "2px solid #1A1A3A",
    }}>
      {/* shaft background glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent 30%, rgba(100,80,200,0.04) 50%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* cable */}
      <div style={{
        position: "absolute",
        left: "50%", top: 0,
        width: 3,
        height: liftCarTop + 6,
        background: "linear-gradient(180deg, #888 0%, #555 100%)",
        transform: "translateX(-50%)",
        transition: "height 0.85s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 2,
        boxShadow: "0 0 4px rgba(200,180,255,0.2)",
      }} />

      {/* rail left */}
      <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg, #4A4A6A, #2A2A4A)", borderRadius: 2 }} />
      {/* rail right */}
      <div style={{ position: "absolute", right: 8, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg, #4A4A6A, #2A2A4A)", borderRadius: 2 }} />

      {/* rail shine left */}
      <div style={{ position: "absolute", left: 9, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", right: 9, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.12)" }} />

      {/* cross ties every floor */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          position: "absolute", top: i * ROOM_H + ROOM_H / 2,
          left: 6, right: 6, height: 3,
          background: "linear-gradient(90deg, #2A2A4A, #4A4A6A, #2A2A4A)",
          borderRadius: 1,
        }} />
      ))}

      {/* floor indicator dots on rail */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          position: "absolute",
          top: i * ROOM_H + ROOM_H / 2 - 3,
          left: "50%", transform: "translateX(-50%)",
          width: 6, height: 6,
          borderRadius: "50%",
          background: floor === (3 - i) ? "#C8A020" : "#2A2A4A",
          boxShadow: floor === (3 - i) ? "0 0 6px #FFD700" : "none",
          transition: "background 0.3s, box-shadow 0.3s",
          zIndex: 3,
        }} />
      ))}

      {/* lift car */}
      <div style={{
        position: "absolute",
        left: 6, right: 6,
        top: liftCarTop,
        height: CAR_H,
        transition: "top 0.85s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 4,
      }}>
        {/* pulley / top bracket */}
        <div style={{
          position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
          width: 20, height: 8,
          background: "#C8A020",
          borderRadius: "3px 3px 0 0",
          boxShadow: "0 0 6px rgba(200,160,32,0.6)",
        }} />

        {/* car body */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, #B8860B 0%, #8B6010 40%, #6A4A0C 100%)",
          border: "2px solid #C8A020",
          borderRadius: 3,
          boxShadow: "0 0 12px rgba(200,160,32,0.35), inset 0 1px 0 rgba(255,220,80,0.3)",
          overflow: "hidden",
        }}>
          {/* inner shine */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "40%",
            background: "linear-gradient(180deg, rgba(255,220,80,0.15) 0%, transparent 100%)",
          }} />

          {/* door left panel */}
          <div style={{
            position: "absolute", top: 6, bottom: 6, left: 4,
            width: "calc(50% - 6px)",
            background: "linear-gradient(180deg, #9A7010 0%, #7A5010 100%)",
            border: "1px solid #C8A020",
            borderRadius: 1,
          }}>
            <div style={{ position: "absolute", top: "30%", left: 3, right: 3, height: 1, background: "rgba(200,160,32,0.4)" }} />
            <div style={{ position: "absolute", top: "65%", left: 3, right: 3, height: 1, background: "rgba(200,160,32,0.4)" }} />
          </div>

          {/* door right panel */}
          <div style={{
            position: "absolute", top: 6, bottom: 6, right: 4,
            width: "calc(50% - 6px)",
            background: "linear-gradient(180deg, #9A7010 0%, #7A5010 100%)",
            border: "1px solid #C8A020",
            borderRadius: 1,
          }}>
            <div style={{ position: "absolute", top: "30%", left: 3, right: 3, height: 1, background: "rgba(200,160,32,0.4)" }} />
            <div style={{ position: "absolute", top: "65%", left: 3, right: 3, height: 1, background: "rgba(200,160,32,0.4)" }} />
          </div>

          {/* door gap + handle dots */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, background: "#1A0A00", transform: "translateX(-50%)" }} />
          <div style={{ position: "absolute", top: "50%", left: "calc(50% - 6px)", width: 4, height: 4, borderRadius: "50%", background: "#FFD700", transform: "translate(-50%, -50%)", boxShadow: "0 0 4px #FFD700" }} />
          <div style={{ position: "absolute", top: "50%", left: "calc(50% + 6px)", width: 4, height: 4, borderRadius: "50%", background: "#FFD700", transform: "translate(-50%, -50%)", boxShadow: "0 0 4px #FFD700" }} />

          {/* floor label */}
          <div style={{
            position: "absolute", bottom: 3, left: 0, right: 0,
            display: "flex", justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "var(--font-pixel), monospace",
              fontSize: 7, color: "#FFD700",
              letterSpacing: 1,
              textShadow: "0 0 4px #FFD700",
            }}>
              F{floor + 1}
            </span>
          </div>
        </div>

        {/* bottom shadow */}
        <div style={{
          position: "absolute", bottom: -4, left: 4, right: 4, height: 4,
          background: "rgba(0,0,0,0.4)",
          filter: "blur(3px)",
          borderRadius: "50%",
        }} />
      </div>
    </div>
  );
}
