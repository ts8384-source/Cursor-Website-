# arxiv-2601-08079.md

# MemoBrain: Executive Memory as an Agentic Brain for Reasoning

- **id:** arxiv-2601-08079
- **list:** fetched
- **authors:** Hongjin Qian, Zhao Cao, Zheng Liu
- **year:** 2026
- **venue:** arXiv preprint
- **oa_url:** https://arxiv.org/abs/2601.08079
- **arxiv:** 2601.08079
- **local_pdf:** pdf/arxiv-2601-08079.pdf

## Extracted text (local RAG ingest)

Abstract. Complex reasoning in tool-augmented agent frameworks is inherently long-horizon, causing reasoning traces and transient tool artifacts to accumulate and strain the bounded working context of large language models. Without explicit memory mechanisms, such accumulation disrupts logical continuity and undermines task alignment. This positions memory not as an auxiliary efficiency concern, but as a core component for sustaining coherent, goal-directed reasoning over long horizons. We propose MemoBrain, an executive memory model for tool-augmented agents that constructs a dependency-aware memory over reasoning steps, capturing salient intermediate states and their logical relations. Operating as a co-pilot alongside the reasoning agent, MemoBrain organizes reasoning progress without blocking execution and actively manages the working context. Specifically, it prunes invalid steps, folds completed sub-trajectories, and preserves a compact, high-salience reasoning backbone under a fixed context budget. Together, these mechanisms enable explicit cognitive control over reasoning trajectories rather than passive context accumulation. We evaluate MemoBrain on challenging long-horizon benchmarks, including GAIA, WebWalker, and BrowseComp-Plus, demonstrating consistent improvements over strong baselines.
