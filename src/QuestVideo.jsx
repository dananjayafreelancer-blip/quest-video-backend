import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const QuestVideo = ({
  quest,
  previousBalance,
  todaysLoot,
  newBalance,
  target,
  progress,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progressValue = interpolate(
    frame,
    [60, 150],
    [0, progress],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const balanceValue = interpolate(
    frame,
    [180, 240],
    [previousBalance, newBalance],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const lootOpacity = interpolate(
    frame,
    [120, 145, 180],
    [0, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const lootY = interpolate(
    frame,
    [120, 180],
    [40, -20],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const progressBlocks = 10;
  const filledBlocks = Math.round(
    (progressValue / 100) * progressBlocks
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#05070d",
        color: "white",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Animated background */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(40,100,255,0.18), transparent 35%), radial-gradient(circle at 80% 70%, rgba(0,255,150,0.10), transparent 35%)",
          transform: `translate(${Math.sin(frame / 35) * 15}px, ${
            Math.cos(frame / 45) * 15
          }px) scale(1.08)`,
        }}
      />

      {/* Grid */}
      <AbsoluteFill
        style={{
          opacity: 0.12,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          transform: `translateY(${(frame * 0.5) % 80}px)`,
        }}
      />

      {/* Main UI */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 70,
        }}
      >
        <div style={{ width: "100%" }}>

          {/* Quest */}
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              letterSpacing: 2,
              marginBottom: 25,
            }}
          >
            QUEST: {quest}
          </div>

          {/* Progress */}
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              marginBottom: 45,
            }}
          >
            PROGRESS: [
            {"█".repeat(filledBlocks)}
            {"▒".repeat(progressBlocks - filledBlocks)}
            ] {Math.round(progressValue)}%
          </div>

          <div
            style={{
              height: 2,
              backgroundColor: "rgba(255,255,255,0.25)",
              marginBottom: 40,
            }}
          />

          {/* Previous */}
          <div
            style={{
              fontSize: 38,
              marginBottom: 28,
            }}
          >
            Previous Balance: ${previousBalance}
          </div>

          {/* Loot */}
          <div
            style={{
              fontSize: 38,
              position: "relative",
            }}
          >
            Today's Loot:{" "}
            <span style={{ color: "#32ff72" }}>
              +${todaysLoot}
            </span>

            <span
              style={{
                position: "absolute",
                left: 250,
                top: lootY,
                opacity: lootOpacity,
                color: "#32ff72",
                fontWeight: 900,
                fontSize: 44,
                textShadow: "0 0 15px #32ff72",
              }}
            >
              +${todaysLoot} XP
            </span>
          </div>

          <div
            style={{
              height: 2,
              backgroundColor: "rgba(255,255,255,0.25)",
              marginTop: 45,
              marginBottom: 40,
            }}
          />

          {/* New balance */}
          <div
            style={{
              fontSize: 46,
              fontWeight: 900,
            }}
          >
            New Balance: ${Math.round(balanceValue)} / ${target}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
