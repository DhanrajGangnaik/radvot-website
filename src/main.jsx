import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./experience-transitions.css";

const DemoApp = lazy(() => import("./features/cinematic-story/StoryDemoEntry"));
const CinematicStory = lazy(() => import("./features/cinematic-story/CinematicStory"));
const isDemo = window.location.pathname.replace(/\/$/, "") === "/demo";

// Keep old experience bookmarks useful without retaining a third destination.
if (!isDemo && window.location.pathname !== "/") {
  window.history.replaceState(null, "", "/" + window.location.search + window.location.hash);
}

createRoot(document.getElementById("root")).render(
  <Suspense fallback={<p role="status" className="experience-loading">
    {isDemo ? "Opening RADVOT workspace…" : "Opening The Third Force…"}
    {!isDemo && <> <a href="/demo">Product demo ↗</a></>}
  </p>}>
    {isDemo ? <DemoApp /> : <CinematicStory />}
  </Suspense>
);
