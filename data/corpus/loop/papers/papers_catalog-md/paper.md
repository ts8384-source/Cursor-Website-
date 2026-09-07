# CATALOG.md

# Paper shortlist catalog (OA ingest, 2026-09-05)

Local PDFs live in `data/papers/pdf/`. Extracted text is sibling `*.md` so `rag.cli` seed can ingest (drop folder ignores PDF).

## Frontend / visual IA

1. living-papers-heer-2023 — Living Papers (UIST 2023). Markdown → web + PDF + extraction API.
2. fidyll-conlen-2022 — Fidyll (arXiv 2022). Explorable explanations / scrollytelling from one source.
3. scrollyvis-2023 — ScrollyVis (TVCG). Scientific scrollytelling authoring and export.
4. dashboard-design-patterns-2022 — Dashboard Design Patterns (TVCG). Information-dense overview / filter / detail-on-demand patterns.
5. semantic-reader-project-2023 — Semantic Reader Project (arXiv 2023). AI reading UI for scholarly docs.
6. paper-plain-august-2023 — Paper Plain (TOCHI 2023). Gists, key questions, dense paper chrome.
7. inreactable-2025 — InReAcTable (UIST 2025). LLM + insight graph + RAG for visual data stories.
8. vadis-2025 — VADIS (arXiv 2025). Query-conditioned document map; iterative visual information seeking.
9. treereader-2025 — TreeReader (arXiv 2025). Hierarchical Wikipedia-like paper reader.
10. holten-directed-edges-2009 — Holten & van Wijk (EuroVis 2009). Tapered / mid-edge cues beat fat arrowheads.

## Backend / agent-connect + local vector / diagrams

1. colpali-2024 — ColPali (ICLR 2025). Page-as-image retrieval; diagram-aware local vectors.
2. vidorag-2025 — ViDoRAG (arXiv 2025). Multi-agent visual-document RAG.
3. hm-rag-2025 — HM-RAG (arXiv 2025). Hierarchical agents over vector + graph + web stores.
4. heta-rag-2025 — HetaRAG (arXiv 2025 tech report). Heterogeneous stores (vector, KG, full-text, SQL).
5. ma-rag-2025 — MA-RAG (arXiv 2025). Planner/extractor agent chain for RAG.
6. graphrag-2024 — GraphRAG (Microsoft, arXiv 2024). Content graph vs flat chunks.
7. webarena-2024 — WebArena (ICLR 2024). Why unstructured sites fail agents; need gym-like APIs.
8. mind2web-2023 — Mind2Web (NeurIPS 2023). HTML too big; filter then act.
9. swe-agent-2024 — SWE-agent (NeurIPS 2024). Agent-computer interface design.
10. agent-workflow-memory-2024 — Agent Workflow Memory (arXiv 2024). Reusable workflows on web tasks.
11. gorilla-2023 — Gorilla (arXiv 2023). LLM + massive structured APIs (MCP ancestor conceptually).

## Research-agent notes (OA ingest 2026-09-05)

MUST — heading-aware chunking / cite-or-fetch / memory override:

1. arxiv-2512-05411 — MetaRAG / LLM-generated metadata (IEEE CAI 2026; 82.5% precision). arXiv 2512.05411.
2. arxiv-2410-13070 — Is Semantic Chunking Worth the Computational Cost? (NAACL 2025 / Vectara). arXiv 2410.13070.
3. knowrag-2026 — KnowRAG (IJACSA 2026). Author/journal OA PDF.
4. arxiv-2505-16067 — Experience-following memory (ACL 2026). arXiv 2505.16067.
5. arxiv-2601-18642 — FadeMem. arXiv 2601.18642.
6. arxiv-2305-10250 — MemoryBank. arXiv 2305.10250.
7. arxiv-2604-12034 — Memory as Metabolism (Miteski). arXiv 2604.12034.

Other named studies:

8. arxiv-2502-18864 — Towards an AI co-scientist (Gottweis et al.). arXiv 2502.18864.
9. arxiv-2408-06292 — The AI Scientist. arXiv 2408.06292.
10. arxiv-2504-08066 — The AI Scientist-v2. arXiv 2504.08066.
11. arxiv-2509-19349 — ShinkaEvolve. arXiv 2509.19349.
12. arxiv-2506-13131 — AlphaEvolve. arXiv 2506.13131.
13. arxiv-2503-22708 — CodeScientist. arXiv 2503.22708.
14. arxiv-2603-15914 — The Agentic Researcher. arXiv 2603.15914.
15. arxiv-2605-18661 — Research-agent creation-phase / idea vs grounded. arXiv 2605.18661.
16. arxiv-2512-06749 — DoVer. arXiv 2512.06749.
17. arxiv-2602-06875 — TraceCoder. arXiv 2602.06875.
18. arxiv-2601-16206 — LLM-in-Sandbox. arXiv 2601.16206.
19. arxiv-2606-30653 — The Consistency Dilemma. arXiv 2606.30653.
20. arxiv-2411-17673 — SketchAgent (CVPR 2025). Abstract only; PDF over 20MB fetch cap. arXiv 2411.17673.
21. arxiv-2601-20622 — CHI 2026 sketch-intent. arXiv 2601.20622.
22. notate-arawjo-2022 — Notate / Notational Programming (UIST 2022). Author PDF tap2k.org.
23. arxiv-2604-21284 — Spatial Metaphors for LLM Memory (MemPalace analysis). arXiv 2604.21284.

## Paywalled / skipped PDF

- CiteSee (CHI 2023, ACM 10.1145/3544548.3580847) — citation-context reading UI. No reliable author PDF grabbed this pass.
- ScrollyVis IEEE Xplore HTML is paywalled; we used arXiv 2207.03616 instead.
- arxiv-2604-22861 — arXiv Query: search_query=&amp;id_list=2604.22861&amp;start=0&amp;max_results=10 (on-demand fetch)
- arxiv-2411-00816 — arXiv Query: search_query=&amp;id_list=2411.00816&amp;start=0&amp;max_results=10 (on-demand fetch)
- arxiv-2602-12430 — arXiv Query: search_query=&amp;id_list=2602.12430&amp;start=0&amp;max_results=10 (on-demand fetch)
- arxiv-2608-07645 — arXiv Query: search_query=&amp;id_list=2608.07645&amp;start=0&amp;max_results=10 (on-demand fetch)
- arxiv-2604-20855 — arXiv Query: search_query=&amp;id_list=2604.20855&amp;start=0&amp;max_results=10 (on-demand fetch)
- arxiv-2601-08079 — MemoBrain: Executive Memory as an Agentic Brain for Reasoning. arXiv 2601.08079.
- arxiv-2604-10352 — ClawVM: Harness-Managed Virtual Memory for Stateful Tool-Using LLM Agents. arXiv 2604.10352.
- arxiv-2602-05728 — CompactRAG: Reducing LLM Calls and Token Overhead in Multi-Hop Question Answering. arXiv 2602.05728.
- arxiv-2602-05965 — Learning to Share: Selective Memory for Efficient Parallel Agentic Systems. arXiv 2602.05965.
