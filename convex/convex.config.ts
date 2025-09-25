import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import workflow from "@convex-dev/workflow/convex.config";
import agent from "@convex-dev/agent/convex.config";
import r2 from "@convex-dev/r2/convex.config";
import workpool from "@convex-dev/workpool/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(workflow);
app.use(agent);
app.use(r2);
app.use(workpool, { name: "podcastWorkpool" });
app.use(workpool, { name: "emailWorkpool" });

export default app;
