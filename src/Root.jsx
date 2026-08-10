import React from "react";
import { Composition } from "remotion";
import { QuestVideo } from "./QuestVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="QuestVideo"
      component={QuestVideo}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        quest: "BUY A PS5 🎮",
        previousBalance: 120,
        todaysLoot: 5,
        newBalance: 125,
        target: 500,
        progress: 25,
      }}
    />
  );
};
