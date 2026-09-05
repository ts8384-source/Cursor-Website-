# Confirmed loop from Cursor

Confirmed architecture (Cursor + iPad):

Inputs: Papers + Code (internet Fetch) + Scribbling (iPad) + Cursor
→ Hybrid RAG → output → ask → Diagram → md ↔ Fetch vector DB
Also: Save and Book keep into vector DB
Right side: Wikipedia + 3Blue1Brown-like visual UI, local website,
coding agent (handles scripts), web coding agent.

Pad host: npm run dev on port 5174. Do not steal 5173 from original iPad Cursor.
Retrieve is Co-Assistant HybridIndex (Chroma + BM25 + RRF), isolated grounds,
labeled merge only.
