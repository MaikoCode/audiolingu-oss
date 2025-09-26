import React from "react";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import MainPage from "@/components/pages/MainPage";

const page = async () => {
  const preloadedGreedting = await preloadQuery(api.workflows.myGreeting, {});
  const preloadedRecent = await preloadQuery(api.episodes.myRecentEpisodes, {
    limit: 5,
  });
  return (
    <>
      <MainPage
        preloadedGreedting={preloadedGreedting}
        preloadedRecent={preloadedRecent}
      />
    </>
  );
};

export default page;
