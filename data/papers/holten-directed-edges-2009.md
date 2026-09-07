# A User Study on Visualizing Directed Edges in Graphs

- **id:** holten-directed-edges-2009
- **list:** frontend
- **authors:** Danny Holten, Jarke J. van Wijk
- **year:** 2009
- **venue:** Computer Graphics Forum (EuroVis 2009)
- **oa_url:** https://www.win.tue.nl/~vanwijk/directed_edges.pdf
- **arxiv:** n/a
- **local_pdf:** n/a

## Extracted text (local RAG ingest)

Holten and van Wijk compare encodings for directed graph edges. Closed arrowheads at the target are a common default, but they occupy the node pad, occlude the vertex, and lose in user studies against **tapered edges** (thicker at the source, thinner toward the target) and other mid-edge cues. The takeaway for this site: do not park a fat SVG marker on the node. Direction lives in a uniform skinny stroke plus small mid-path chevrons (about 72px apart), not a taper ribbon.
