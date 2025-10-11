import express from "express";
import cors from "cors";
import { TITLES } from "./data.js";

const app = express();
const PORT = 3001;
const DELAY_MS = 1000; // 1초 지연 (요구사항)

// CORS 허용 설정
app.use(cors());
app.use(express.json());

// GET /api/search?q=키워드
app.get("/api/search", (req, res) => {
  const q = req.query.q ? req.query.q.toLowerCase() : "";

  // 검색 로직
  const result = TITLES.filter(t => t.name.toLowerCase().includes(q));

  // 1초 지연 후 응답
  setTimeout(() => {
    res.json({ 
      items: result, 
      total: result.length,
      query: q,
      babo: "you are a babo"
    });
  }, DELAY_MS);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});