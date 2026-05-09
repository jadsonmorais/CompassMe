import dotenv from "dotenv";
import { createApp } from "./app.js";

dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const app = createApp();

app.listen(port, () => {
  console.log(`[CompassMe API] Listening on http://localhost:${port}`);
});
