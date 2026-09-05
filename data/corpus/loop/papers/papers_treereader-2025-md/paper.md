# treereader-2025.md

# TreeReader: A Hierarchical Academic Paper Reader Powered by Language Models

- **id:** treereader-2025
- **list:** frontend
- **authors:** Zijian Zhang, Pan Chen, Fangshi Du, Runlong Ye, Oliver Huang, Michael Liut, Alán Aspuru-Guzik
- **year:** 2025
- **venue:** arXiv preprint
- **oa_url:** https://arxiv.org/pdf/2507.18945.pdf
- **arxiv:** 2507.18945
- **local_pdf:** pdf/treereader-2025.pdf

## Extracted text (local RAG ingest)

TreeReader: A Hierarchical Academic Paper Reader
Powered by Language Models
Zijian Zhang1,2, Pan Chen1,2, Fangshi Du1, Runlong Ye1, Oliver Huang1, Michael Liut4, Alán
Aspuru-Guzik1,2,3,5,6,7,8,9,∗
1Department of Computer Science, University of Toronto, Sandford Fleming Building, 10 King’s
College Road, ON M5S 3G4, Toronto, Canada
2Vector Institute for Artificial Intelligence, 661 University Ave. Suite 710, ON M5G 1M1, Toronto,
Canada
3Department of Chemistry, University of Toronto, Lash Miller Chemical Laboratories, 80 St. George
Street, ON M5S 3H6, Toronto, Canada
4Department of Mathematical and Computational Sciences, University of Toronto Mississauga, 3359
Mississauga Road, Deerfield Hall, ON L5L 1C6, Mississauga, Canada
5Department of Materials Science & Engineering, University of Toronto, 184 College St., M5S 3E4,
Toronto, Canada
6Department of Chemical Engineering & Applied Chemistry, University of Toronto, 200 College St.
ON M5S 3E5, Toronto, Canada
7Acceleration Consortium, 700 University Ave., M7A 2S4, Toronto, Canada
8Senior Fellow, Canadian Institute for Advanced Research (CIFAR), 661 University Ave., M5G 1M1,
Toronto, Canada
9NVIDIA, 431 King St W #6th, M5V 1K4, Toronto, Canada
Efficiently navigating and understanding academic papers is crucial for scientific progress. Traditional
linear formats like PDF and HTML can cause cognitive overload and obscure a paper’s hierarchical
structure, making it difficult to locate key information. While LLM-based chatbots offer summarization,
they often lack nuanced understanding of specific sections, may produce unreliable information, and
typically discard the document’s navigational structure. Drawing insights from a formative study on
academic reading practices, we introduce TreeReader, a novel language model-augmented paper
reader. TreeReader decomposes papers into an interactive tree structure where each section is
initially represented by an LLM-generated concise summary, with underlying details accessible on
demand. This design allows users to quickly grasp core ideas, selectively explore sections of interest,
and verify summaries against the source text. A user study was conducted to evaluate TreeReader’s
impact on reading efficiency and comprehension. TreeReader provides a more focused and efficient
way to navigate and understand complex academic literature by bridging hierarchical summarization
with interactive exploration.
Date: July 28, 2025
Correspondence: Alán Aspuru-Guzik at aspuru@nvidia.com
Code: https://github.com/aspuru-guzik-group/TreeReader
1
arXiv:2507.18945v1  [cs.HC]  25 Jul 2025

1
Introduction
2. Navigation 
column
1. Main contents
3. Context 
column
1.1 Key point 
summary
1.2 Navigation 
buttons
1.3 Source of 
summary
Figure 1 User interface of TreeReader. 1. (Main contents) TreeReader presents subsections and paragraphs in
a section by their key point summaries (see 1.1) instead of linearly displaying all their sub-content. The user can
view the details of a subsection on demand or view the summary of the whole section by clicking “→” or “←” in the
Navigation buttons (see 1.2). The users can also check the quality of the summary by viewing their source texts on
demand (see 1.3). 2. (Navigation tree) The users can also quickly view and navigate to a certain section or paragraph
through an interactive tree view on the left. 3. (Contextual information) When the user focuses on a subsection or
paragraph in the Main contents, TreeReader will display additional information, such as the figures in the section.
Academic publications (papers) are the primary medium for communicating scholarly knowledge, making
their reading an essential, yet often time-consuming, part of scientific research across all disciplines. With
the ever-increasing volume and complexity of scientific literature, the ability to efficiently navigate and
comprehend these documents is paramount for accelerating scientific progress. However, the predominant
formats for academic papers, PDF and standard HTML, present content in a linear fashion, where each section
is displayed in its entirety one after another. This linear presentation, despite papers typically adhering to an
inherent hierarchical section structure, poses significant challenges for the users.
The undifferentiated stream of linear content can lead to cognitive overload. Extensive cognitive research
demonstrates that human working memory is limited, processing only a few pieces of information effectively
at once (Miller, 1956), and that performance improves when information is grouped into meaningful “chunks”
(Thalmann et al., 2019). Linear formats, by presenting all details irrespective of their immediate relevance to
the user’s goals, make it difficult to discern these chunks or quickly grasp the core arguments. Consequently,
users must often manually skip over content to find key information, a process that is both inefficient and
prone to missing crucial details. Experiments have shown that reorganizing material into an explicit outline
yields significantly higher recall and comprehension (McKoon, 1977; Abdelshaheed, 2023), highlighting the
measurable cognitive benefits of hierarchical representations over unaided linear prose.
Recent advancements in large language models (LLMs) (OpenAI, 2023; Team et al., 2023; Anthropic, 2024)
have offered new avenues for relieving the burden of paper reading. LLM-based chatbots, for instance, can
quickly generate abstract-length overviews or summaries of papers (Lenharo, 2024), often employing strategies
like long context windows or retrieval-augmented generation (RAG) (Lewis et al., 2020; Karpukhin et al., 2020)
to handle lengthy documents. While these tools can be useful for initial summarization, they often fall short
in supporting deeper, section-specific understanding. Users may find it difficult to obtain accurate answers
2

for questions pertaining to specific sections, frequently needing to copy-paste paragraphs, and the generated
responses can sometimes include fabricated references (Walters and Wilder, 2023) or errors in bibliographic
details (Chelli et al., 2024). Furthermore, these flat summaries typically omit the paper’s inherent section
structure, thereby eliminating crucial navigational cues that users rely on for verification and further in-depth
analysis.
Researchers in human–computer interaction (HCI) and machine learning (ML) have begun to address these
shortcomings. Systems like Sensecape (Suh et al., 2023) facilitate multilevel abstraction and fluid transitions
in complex information tasks, while ScholarPhi (Head et al., 2021b) augments the local comprehension of
scientific PDFs with just-in-time definitions of terms and symbols. LLM-based methods, such as RAPTOR for
multi-level summary trees for information retrieval (Sarthi et al., 2024), and CHANGES for mapping papers
into hierarchical structures to highlight key arguments and their contrasts for better summarization(Zhang
et al., 2023), further attest to the value of hierarchical structure. However, a gap remains: these powerful
algorithmic techniques have not yet been fully translated into user-centric interfaces that seamlessly unite
hierarchical navigation with verifiable, LLM-generated summaries at multiple granularities.
To bridge this gap, we introduce TreeReader, a novel language model-augmented paper reader designed to
enhance the efficiency and effectiveness of academic reading. TreeReader transforms a traditional linear
paper into an interactive, hierarchical tree structure. Each section and subsection is initially represented by
a concise, LLM-generated summary, with an option to reveal the full underlying content on demand. This
design empowers users to: (i) Quickly grasp the core ideas of a paper by reading the key points for each
section and paragraph; (ii) Selectively and recursively explore sections of interest, focusing on information
most relevant to their goals; (iii) Verify information easily, as every summary node is linked to its dedicated
source within the original text.
By integrating hierarchical summarization with an interactive tree view, TreeReader transforms dense
articles into navigable, verifiable maps of ideas. We demonstrate through a within-subject user study comparing
TreeReader with a standard PDF reader that our approach improves users’ efficiency and effectiveness in
skimming and goal-directed reading tasks. Finally, TreeReader is publicly available as a Chrome extension1,
and we plan to collect additional feedback from real-world users to guide future iterations and improvements.
2
Related work
Scientific reading is an inherently goal-driven activity, yet existing AI-powered tools often provide limited
support for how researchers engage with academic texts. Many current interfaces do not adequately reflect the
hierarchical nature of scholarly writing, forcing users to mentally reconstruct this structure. In this section,
we explore the landscape of related work across three key areas and highlight the need for a unified system
that bridges advanced LLM capabilities with a user-centric, structure-aware design.
2.1
AI-Assisted Reading Tools
A primary focus of AI-assisted reading tools has been to enhance local comprehension and streamline aspects
of the reading process. For instance, tools like ScholarPhi provide just-in-time definitions of terms (Head
et al., 2021a), while Papeos overlays talk videos to explain dense content (Kim et al., 2023). While these
systems support understanding at the sentence or paragraph level, they typically do not surface the global
structure necessary for synthesis or comparison across a document.
Other tools are geared towards literature discovery and managing citation context. including CiteSee (Chang
et al., 2023), Relatedly (Palani et al., 2023), and ComLittee (Kang et al., 2023a), which help researchers
find relevant works or organize related papers. While powerful for the foraging stage of research, these tools
offer minimal support once a user begins to read a specific paper in-depth. Similarly, systems like Scim (Fok
et al., 2023), and PaperWave (Yahagi et al., 2024) aim to assist skimming by selecting salient passages or
translating papers into audio, often lack fine-grained user control over summary detail and may not provide
robust mechanisms for verifying summarized content against the original source.
1https://chromewebstore.google.com/detail/treereader/nhgffkcciononplndadobbkoomkjknkm
3

Recent research has also investigated how device interfaces and content rendering impact reading behaviour.
Studies highlighting the differences between deep and skim reading across devices (Chen et al., 2023) and the
cognitive burden of interface overload, such as from excessive browser tabs (Hwong et al., 2021), emphasize
the need for cognitively supportive reading interfaces. However, even systems that restructure content layout,
like SideNoter (Abekawa and Aizawa, 2016) for PDF annotation and browsing, or AI-Resilient Text Rendering
(Li et al., 2024), which adapts text presentation, often fall short of simultaneously supporting high-level
navigation and deep, verifiable comprehension. In contrast, TreeReader is designed to seamlessly support
both skimming and deep reading of a single paper, adapting to varied user goals while prioritizing reliability
and traceability through its hierarchical summarization and source-linking.
2.2
Hierarchical and Cognitive Visualization Interfaces
The value of non-linear representations in improving text comprehension and recall is well-established
in cognitive and educational research. Studies consistently show that non-linear text structures enhance
performance, especially when users need to navigate complex information or synthesize content across different
sections (Muttalib, 2010; McEneaney, 1994). These findings resonate strongly with sensemaking frameworks
in HCI, which characterize reading as an active process of constructing hierarchical mental representations
(Pirolli and Card, 2005).
Informed by this, the HCI community has been developing AI-assisted tools that support ideation and synthesis,
with a notable shift towards systems that scaffold human sensemaking rather than fully automating it (Ye
et al., 2025b). Several tools exemplify this by enabling users to externalize cognitive structures and support
hierarchical reasoning. Scholastic (Hong et al., 2022) introduces hierarchical clustering into interpretive text
analysis, helping users identify and navigate emergent themes through interactive visualizations. Building
further on structural representation, IdeaSynth (Pu et al., 2024) visualizes research ideas as modular, connected
nodes, enabling users to iteratively develop and refine their ideas within a spatial and hierarchical canvas.
Furthering this mixed-initiative approach, ScholarMate enables researchers to arrange text snippets on a
non-linear canvas, leveraging AI for theme suggestion and multi-level summarization while ensuring human
oversight and traceability to aid complex sensemaking tasks (Ye et al., 2025a).
Other tools have specifically focused on structuring literature synthesis across multiple documents. Synergi
(Kang et al., 2023b) and Threddy (Kang et al., 2022) empower researchers to organize and interactively
explore academic content by creating personalized hierarchical structures of literature. While these systems are
powerful for synthesis across multiple sources, TreeReader’s primary focus is on enhancing the navigation
and comprehension within a single, often complex, academic paper.
3
Formative study
To capture a diverse range of perspectives and ensure the generalizability of our tool design, we interviewed
participants from various academic disciplines, including chemistry, artificial intelligence, and human-computer
interaction. Our goal was to understand three key dimensions of academic paper reading: (1) the challenges
researchers encounter when engaging with papers in their field, (2) how they currently use LLM-based tools
to support their reading and comprehension, and (3) their perceptions of the reliability and potential roles
of LLMs in academic practices, such as peer review, literature review synthesis and research grant review.
These insights informed our system design by highlighting critical user pain points and expectations around
AI-assisted reading.
We conducted semi-structured interviews with six graduate researchers (5 men, 1 woman). The interviews
were structured around open-ended questions aligned with our three dimensions of interest: reading challenges,
use of LLM-based tools, and attitudes toward LLMs in high-stakes context. To ground the discussion, we
used peer review as a concrete example when exploring participants’ opinions.
C1: Information Targeting. A primary challenge identified by participants was the difficulty in efficiently locating
the most relevant and novel information within academic papers. All six interviewees expressed frustration
with the need to sift through extensive content to extract key insights. They noted that much of a paper often
reiterates familiar background or less critical details, while the core contributions are sparsely distributed
throughout the text. One participant explained, “There is too much information that is not interesting, and
4

Selective Reading by User
Summary by LLM
Introduction
Result
…
Conclusion
Paragraph
Subsection
Paragraph
Figure
Paragraph
Table
Subsection
Abstract
Method
Subsection
Figure 2 Section tree. TreeReader uses the section tree as the structural backbone for presenting a paper’s content.
Each node in the tree represents a paragraph, table, figure, or section, with the contents of a section as child nodes.
TreeReader displays only the summaries of its children when displaying a section, which reduces the amount of
texts the user need to read for targeting the useful child nodes.
the interesting content is distributed over 10 pages.”
C2: Information Summary. Reading summaries was a common strategy participants used to improve efficiency.
Many participants expressed dissatisfaction with author-written abstracts and conclusions, stating that these
often missed the key information needed to understand the actual contribution. Nearly all participants (n = 5)
reported using LLM-based tools to generate concise summaries, with three mentioning NotebookLM2 for
audio-based comprehension. However, they noted that such tools were mainly useful for papers outside their
core field, as the generated summaries were often too verbose for familiar topics.
C3: LLM Reliability in High-Stakes Contexts. As noted earlier, nearly all participants reported using LLM-based
tools for paper comprehension, particularly for summarization. However, when asked about the potential use
of LLMs in peer review, a context where reliability is important, all participants expressed varying degrees
of skepticism regarding the quality of information provided by these models. Most participants believed
that LLMs could provide limited support in reviewing manuscripts, such as identifying superficial issues like
formatting or grammar. However, a majority (n = 4) raised concerns that using LLMs for peer reviews might
degrade their overall quality. In contrast, two participants saw potential for LLMs to complement human
reviewers by providing more objective assessments. This mixed perspective on the role of LLM-based tools in
peer review indicates that LLMs’ reliability is still a significant concern, preventing their widespread adoption
in high-stakes tasks like peer review.
3.1
Design goals
To ensure our system meaningfully addresses the real-world needs of academic users, we established three
corresponding design goals to guide the development of our system:
DG1: Enable hierarchical information exploration. To support the users targeting the information they need
(C1), the system should present information hierarchically, allowing users to efficiently filter, navigate, and
prioritize content. Users should be able to quickly grasp the structure of a paper and choose to expand or
collapse sections of content based on relevance, thereby reducing the cognitive load associated with deciding
what to read in detail.
DG2: Provide summaries at multiple levels. To address the difficulty participants faced in information summaries
(C2), the system should provide summaries not only for the entire paper but also for individual sections and
2https://notebooklm.google/
5

paragraphs. This will allow users to access the right level of detail depending on their needs, whether they are
skimming quickly or seeking a specific part. These summaries also serve as cues to help users focus on key
content, which complements the goal of helping users find information efficiently (C1).
DG3: Enhance reliability of LLM outputs. Given participants’ concerns about the reliability of LLM-generated
content (C3), the system should avoid using LLMs to the scope where their knowledge does not cover. The
system should also incorporate mechanisms to help the user verify the output generated by LLMs.
4
Design of TreeReader
Building upon these design goals, we designed TreeReader, a paper reader which presents the contents of
papers in a hierarchical way (See Figure 1), following the section tree structure of the paper (See Figure 2).
When displaying a section, instead of immediately displaying the original text of paragraphs and subsections,
TreeReader initially presents LLM-generated summaries that wrap the underlying content. Users can then
choose to reveal finer details via the user interface as needed. This approach significantly reduces the volume
of information shown at each level, helping users navigate papers more efficiently and focus their attention on
the most relevant parts.
4.1
User interface & Features
The user interface of TreeReader is organized into three columns as described below.
Navigation Tree (Left Column): This column presents a traditional section tree view of the paper. Users can
select a specific node to focus on, expand or collapse parent nodes to view their children. Besides quick
navigation, this column is designed to help the user have a sense of the location of the current node they are
reading.
Main contents (Middle Column): The middle column displays the content of the section the user is currently
viewing. The nodes (including paragraphs, sections, figures, and tables) appear as cards arranged linearly in a
column, which the user can scroll through. For paragraph and section nodes, a summary of key points is
shown for quick reading. In this way, we achieve DG2 and provide a summary at multiple levels to the user.
Based on the information presented in the view, the user can adjust the level of detail they wish to view.
At the bottom of the card list, a navigation button (“←”) allows the user to return to the parent section
if they choose not to explore further details. For section nodes that have child nodes, a navigation button
(“→”) is available, letting the user view those child nodes to access the full content beyond the summaries. By
selectively entering the view of the sections, the user only reads the information that is important to them
and reads other information only in the form of a high-level summary. In this way, we enable a hierarchical
information exploration and achieve DG1.
Contextual Information (Right Column): The rightmost column displays contextual information for the currently
selected node. The top portion shows all figures from the node’s sub-tree, while the bottom portion presents
either the original paragraph text (for paragraph nodes) or the titles and summaries of each sub-section and
paragraph (for section nodes).
4.2
LLM-based hierarchical summary
As revealed in our formative study, concerns about LLM reliability present a significant barrier to their use in
assisting with paper reading. To address this issue and achieve DG3, we focus on two key characteristics of
LLMs: (1) LLMs often lack access to the most up-to-date knowledge; (2) LLMs tend to overlook details when
processing long inputs.
These observations guided our design decisions. First, we constrain the role of the LLM to information
summarization only, avoiding reliance on potentially outdated or inaccurate domain knowledge. Second, we
implement a recursive summarization approach to manage input length: rather than summarizing all content
at once, the LLM summarizes the summaries of child nodes at each hierarchical level. This significantly
reduces input size, especially for top-level sections.
6

Additionally, we instruct the LLM to attach source references to each key point in the summary. The source
reference is displayed to the user when the user hovers the cursor on the end of each key point, enabling users
to easily review the original content and identify potential errors.
4.3
Other implementation Details
TreeReader is built with the React framework and uses OpenAI’s GPT-4o to process the HTML extracted
from Springer Nature publications 3.
5
User evaluation
We conducted a within-subject, semi-structured study to evaluate the effectiveness of TreeReader compared
to a standard PDF reader. Five graduate-level Computer Science researchers (3 men, 1 woman, 1 non-binary)
participated in the 80-minute study. None of the participants had taken part in the earlier formative study.
Each participant was compensated $20. The study protocol was approved by the institution’s research ethics
board.
Each participant completed two conditions: using a PDF Reader (C1) and using TreeReader (C2), to read
two different scientific papers (P1, P2) in counterbalanced order. For each paper, participants had up to 30
minutes total: 5 minutes for skimming and up to 25 minutes for deep reading.
We designed two comprehension tasks to reflect common academic reading practices: skimming for quick
insight and deep reading for detailed understanding. After each condition, participants completed self-report
questionnaires and preference interviews comparing both tools.
SkimmingActivity: This task assessed participants’ ability to quickly locate key information. Skimming, defined
as sacrificing depth for speed (Just and Carpenter, 1987), was tested with a 5-minute reading period followed
by multiple-choice and short-answer questions (Table 1). The questions targeted high-level understanding and
the identification of central contributions.
Deep Reading Activity: Following the skimming task, participants engaged in a deeper reading session of up
to 25 minutes. They answered 8 open-ended questions (Appendix.E) designed to require close reading and
information retrieval. All questions were shown upfront, and both accuracy and time to completion were
recorded.
Cognitive Load: After participants finished reading each paper, they completed the standard NASA Task Load
Index (NASA-TLX) (Table 3), which we used to measure cognitive load following the use of both tools for
[P1, P2].
6
Results
We analyzed participants’ experiences with TreeReader along three key dimensions: its support for efficient
skimming, its effectiveness in deep reading tasks, and its impact on cognitive load. While the study involved
a small number of participants, their qualitative feedback revealed promising directions for improving and
refining TreeReader.
TreeReader shows potential to support efficient skimming. Participants expressed positive initial reactions
toward TreeReader, highlighting its usefulness for quickly reviewing papers. One participant remarked, "I
would definitely use TreeReader every day for my initial literature review (P3)." Others noted that the
system’s concise summaries and structured navigation made it easier to identify relevant sections, particularly
in unfamiliar topics. These findings suggest that TreeReader could streamline literature review workflows
by helping users grasp objectives, structure, and key contributions more efficiently.
Participants had mixed experiences with deep reading tasks. As shown in Figure 3, using TreeReader improved
deep reading performance on average. However, individual responses varied: some found that TreeReader
3https://www.springernature.com/
7

Helps understand papers
Easy to find info
Easy to sense paper structure
0
1
2
3
4
5
Average
2.60
2.40
2.60
3.60
3.20
4.20
Baseline: PDF Reader
Treatment: Tree Reader
Figure 3 User feedback. After the deep reading activity, participants were asked whether (i) they understand the paper
efficiently, (ii) it is easy to find information, (iii) it is easy to make sense of a section before looking at the details. On
average, participants gave more positive responses to all three aspects when using TreeReader. Please see Figure 6,
7 for more details.
aided sense-making and navigation, while others encountered difficulty retrieving specific details. These
perspectives indicate that while TreeReader supports structured exploration, it may benefit from refinements
for in-depth reading. Despite this, several participants suggested enhancements like keyword-based search and
dynamic subtree generation, reflecting enthusiasm for TreeReader’s interactive potential.
TreeReader may help reduce cognitive load over time.
Participants reported that TreeReader felt less
cognitively demanding than traditional PDF readers once they became accustomed to its structure (Figure 8,
9). Although some experienced initial unfamiliarity, they acknowledged that continued use could reduce effort
when engaging with complex academic texts.
7
Conclusion
We introduced TreeReader, a novel tree-structured paper reader designed to enhance the efficiency of
academic reading. Users can navigate through a hierarchical structure of sections using buttons, guided by
LLM-generated summaries provided at both the section and paragraph levels. By presenting summaries
within a tree structure, TreeReader reduces the amount of text users need to read, while also helping them
locate relevant information more effectively through informative preview cues. Finally, we conducted a user
study to evaluate how TreeReader impacts users’ performance in both skimming and deep reading tasks.
The results provide evidence that TreeReader can reduce cognitive load when reading long review papers.
This work has several limitations. Firstly, user responses may have been influenced by the novelty effect or
unfamiliarity with TreeReader compared to their extensive experience with PDF readers. Second, the
study excluded common interaction features such as Ctrl+F, and omitted many real-world functionalities,
potentially limiting the assessment of TreeReader’s practical utility; a field study could address this and the
Hawthorne effect. Lastly, the small and homogeneous group of five participants constrains the generalizability
of our findings across diverse academic disciplines, reading habits, and LLM tool usage patterns.
Acknowledgments
A.A.-G. thanks Anders G. Frøseth for his generous support. A.A.-G. also acknowledges the generous support
of Natural Resources Canada and the Canada 150 Research Chairs program. This research is part of the
University of Toronto’s Acceleration Consortium, which receives funding from the Canada First Research
8

Excellence Fund (CFREF). We also acknowledge the support of the Natural Sciences and Engineering Research
Council of Canada (NSERC), [funding reference number RGPIN-2024-04348 and RGPIN-2024-06005].
9

References
Bothina S. M. Abdelshaheed. Student versus expert outlines in reading comprehension: The effect of collaborative
construction. SAGE Open, 13(3):21582440231191795, 2023. doi:10.1177/21582440231191795. https://doi.org/10.1
177/21582440231191795.
Takeshi Abekawa and Akiko Aizawa. Sidenoter: Scholarly paper browsing system based on pdf restructuring and text
annotation. In Proceedings of the 26th International Conference on Computational Linguistics, pages 1–10. ACL,
2016.
Anthropic. The claude 3 model family: Opus, sonnet, haiku. 2024. https://www-cdn.anthropic.com/de8ba9b01c9ab
7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf.
Joseph Chee Chang, Amy X. Zhang, Jonathan Bragg, Andrew Head, Kyle Lo, Doug Downey, and Daniel S. Weld. Citesee:
Augmenting citations in scientific papers with persistent and personalized historical context. In Proceedings of the 2023
CHI Conference on Human Factors in Computing Systems, pages 1–15. ACM, 2023. doi:10.1145/3544548.3580847.
Mikaël Chelli, Jules Descamps, Vincent Lavoué, Christophe Trojani, Michel Azar, Marcel Deckert, Jean-Luc Raynier,
Gilles Clowez, Pascal Boileau, and Caroline Ruetsch-Chelli. Hallucination rates and reference accuracy of chatgpt
and bard for systematic reviews: Comparative analysis. J Med Internet Res, 26:e53164, May 2024. ISSN 1438-8871.
doi:10.2196/53164. https://www.jmir.org/2024/1/e53164.
Xiuge Chen, Namrata Srivastava, Rajiv Jain, and Jennifer Marlow. Characteristics of deep and skim reading on
smartphones vs. desktop: A comparative study. In Proceedings of the 2023 CHI Conference on Human Factors in
Computing Systems, pages 1–13. ACM, 2023. doi:10.1145/3544548.3581174.
Raymond Fok, Hita Kambhamettu, Luca Soldaini, Jonathan Bragg, Kyle Lo, Andrew Head, Marti A. Hearst, and
Daniel S. Weld. Scim: Intelligent skimming support for scientific papers. In Proceedings of the 28th International
Conference on Intelligent User Interfaces (IUI ’23), pages 476–490, New York, NY, USA, 2023. Association for
Computing Machinery. ISBN 979-8-4007-0106-1. doi:10.1145/3581641.3584034. https://doi.org/10.1145/3581641.
3584034.
Andrew Head, Kyle Lo, Dongyeop Kang, Raymond Fok, Sam Skjonsberg, Daniel S. Weld, and Marti A. Hearst.
Scholarphi: Augmenting scientific papers with just-in-time, position-sensitive definitions of terms and symbols.
In Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems, pages 1–12. ACM, 2021a.
doi:10.1145/3411764.3445648.
Andrew Head, Kyle Lo, Dongyeop Kang, Raymond Fok, Sam Skjonsberg, Daniel S. Weld, and Marti A. Hearst.
Augmenting scientific papers with just-in-time, position-sensitive definitions of terms and symbols. In Proceedings
of the 2021 CHI Conference on Human Factors in Computing Systems, CHI ’21, New York, NY, USA, 2021b.
Association for Computing Machinery. ISBN 9781450380966. doi:10.1145/3411764.3445648. https://doi.org/10.114
5/3411764.3445648.
Matt-Heun Hong, Lauren A. Marsh, Jessica L. Feuston, Janet Ruppert, Jed R. Brubaker, and Danielle Albers Szafir.
Scholastic: Graphical human-ai collaboration for inductive and interpretive text analysis. In Proceedings of the
35th Annual ACM Symposium on User Interface Software and Technology, pages 1–12. Association for Computing
Machinery, 2022. doi:10.1145/3526113.3545681. https://dl.acm.org/doi/10.1145/3526113.3545681.
John Hwong, Benjamin A. Klein, Austin Z. Henley, and Aniket Kittur. When the tab comes due: Challenges in the
cost structure of browser tab usage. In Proceedings of the 2021 CHI Conference on Human Factors in Computing
Systems, pages 1–14. ACM, 2021. doi:10.1145/3411764.3445585.
Marcel Adam Just and Patricia Ann Carpenter. The psychology of reading and language comprehension. Allyn &
Bacon, 1987.
Hyeonsu Kang, Joseph Chee Chang, Yongsung Kim, and Aniket Kittur.
Threddy: An interactive system for
personalized thread-based exploration and organization of scientific literature. In Proceedings of the 35th Annual
ACM Symposium on User Interface Software and Technology, pages 1–15. Association for Computing Machinery,
2022. doi:10.1145/3526113.3545660. https://dl.acm.org/doi/10.1145/3526113.3545660.
Hyeonsu B. Kang, Nouran Soliman, Matt Latzke, Joseph Chee Chang, and Jonathan Bragg. Comlittee: Literature
discovery with personal elected author committees. In Proceedings of the 2023 CHI Conference on Human Factors
in Computing Systems, pages 1–13. ACM, 2023a. doi:10.1145/3544548.3581264.
Hyeonsu B Kang, Tongshuang Wu, Joseph Chee Chang, and Aniket Kittur. Synergi: A mixed-initiative system
for scholarly synthesis and sensemaking. In Proceedings of the 36th Annual ACM Symposium on User Interface
10

Software and Technology, pages 1–19. Association for Computing Machinery, 2023b. doi:10.1145/3586183.3606759.
https://dl.acm.org/doi/10.1145/3586183.3606759.
Vladimir Karpukhin, Barlas Oğuz, Sewon Min, Patrick Lewis, Ledell Wu, Sergey Edunov, Danqi Chen, and Wen-tau
Yih. Dense passage retrieval for open-domain question answering. arXiv preprint arXiv:2004.04906, 2020.
Tae Soo Kim, Matt Latzke, Jonathan Bragg, Amy X. Zhang, and Joseph Chee Chang. Papeos: Augmenting research
papers with talk videos. In Proceedings of the 36th Annual ACM Symposium on User Interface Software and
Technology, pages 1–12. ACM, 2023. doi:10.1145/3586183.3606770.
Mariana Lenharo. Chatgpt turns two: How the ai chatbot has changed scientists’ lives. Nature, 636(8042):281–282,
2024.
Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler,
Mike Lewis, Wen-tau Yih, Tim Rocktäschel, et al. Retrieval-augmented generation for knowledge-intensive nlp tasks.
Advances in Neural Information Processing Systems, 33:9459–9474, 2020.
Zhuoyan Li, Chen Liang, Jing Peng, and Ming Yin. An ai-resilient text rendering technique for reading and skimming
documents. In Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems, pages 1–12. ACM,
2024. doi:10.1145/3613904.3642699.
John E. McEneaney. Cognitive processing of hyperdocuments: When does nonlinearity help? In Proceedings of the
SIGCHI Conference on Human Factors in Computing Systems, pages 57–63, 1994. doi:10.1145/168466.168508.
https://dl.acm.org/doi/10.1145/168466.168508.
Gail McKoon. Organization of information in text memory. Journal of Verbal Learning and Verbal Behavior, 16:
247–260, 1977. https://api.semanticscholar.org/CorpusID:144071803.
George A Miller. The magical number seven, plus or minus two: Some limits on our capacity for processing information.
Psychological review, 63(2):81, 1956.
Sharifah Amani Abdul Muttalib. The effects of linear and non-linear text on students’ performance in reading, 2010.
OpenAI. Gpt-4 technical report, 2023.
Srishti Palani, Aakanksha Naik, Doug Downey, Amy X. Zhang, Jonathan Bragg, and Joseph Chee Chang. Relatedly:
Scaffolding literature reviews with existing related work sections. In Proceedings of the 2023 CHI Conference on
Human Factors in Computing Systems, pages 1–14. ACM, 2023. doi:10.1145/3544548.3580954.
Peter Pirolli and Stuart Card. The sensemaking process and leverage points for analyst technology as identified through
cognitive task analysis. In Proceedings of international conference on intelligence analysis, volume 5, pages 2–4.
McLean, VA, USA, 2005.
Kevin Pu, K. J. Kevin Feng, Tovi Grossman, Tom Hope, Bhavana Dalvi Mishra, Matt Latzke, Jonathan Bragg,
Joseph Chee Chang, and Pao Siangliulue. Ideasynth: Iterative research idea development through evolving and
composing idea facets with literature-grounded feedback, 2024. https://arxiv.org/abs/2410.04025.
Parth Sarthi, Salman Abdullah, Aditi Tuli, Shubh Khanna, Anna Goldie, and Christopher D. Manning. Raptor:
Recursive abstractive processing for tree-organized retrieval, 2024. https://arxiv.org/abs/2401.18059.
Sangho Suh, Bryan Min, Srishti Palani, and Haijun Xia. Sensecape: Enabling multilevel exploration and sensemaking
with large language models. In Proceedings of the 36th Annual ACM Symposium on User Interface Software and
Technology, UIST ’23, New York, NY, USA, 2023. Association for Computing Machinery. ISBN 9798400701320.
doi:10.1145/3586183.3606756. https://doi.org/10.1145/3586183.3606756.
Gemini Team, Rohan Anil, Sebastian Borgeaud, Yonghui Wu, Jean-Baptiste Alayrac, Jiahui Yu, Radu Soricut, Johan
Schalkwyk, Andrew M Dai, Anja Hauth, et al. Gemini: a family of highly capable multimodal models. arXiv
preprint arXiv:2312.11805, 2023.
Mirko Thalmann, Alessandra S Souza, and Klaus Oberauer. How does chunking help working memory? J Exp Psychol
Learn Mem Cogn, 45(1):37–55, Jan 2019. ISSN 1939-1285 (Electronic); 0278-7393 (Linking). doi:10.1037/xlm0000578.
William H. Walters and Esther Isabelle Wilder. Fabrication and errors in the bibliographic citations generated by chatgpt.
Scientific Reports, 13(1):14045, 2023. doi:10.1038/s41598-023-41032-5. https://doi.org/10.1038/s41598-023-41032-5.
Yuchi Yahagi, Rintaro Chujo, Yuga Harada, Changyo Han, Kohei Sugiyama, and Takeshi Naemura. Paperwave:
Listening to research papers as conversational podcasts scripted by llm. arXiv preprint arXiv:2410.15023, 2024.
11

Runlong Ye, Patrick Yung Kang Lee, Matthew Varona, Oliver Huang, and Carolina Nobre. Scholarmate: A mixed-
initiative tool for qualitative knowledge work and information sensemaking, 2025a. https://arxiv.org/abs/2504.144
06.
Runlong Ye, Matthew Varona, Oliver Huang, Patrick Yung Kang Lee, Michael Liut, and Carolina Nobre. The
design space of recent ai-assisted research tools for ideation, sensemaking, and scientific creativity, 2025b. https:
//arxiv.org/abs/2502.16291.
Haopeng Zhang, Xiao Liu, and Jiawei Zhang.
Contrastive hierarchical discourse graph for scientific document
summarization, 2023. https://arxiv.org/abs/2306.00177.
12

A
Prompts to language models
When processing a paper into a tree, we use the following prompt to convert the paragraphs in the tree
into key points and the corresponding evidence. In the prompts for generating the key points of a section,
we provide the key points of the children nodes of the section as the input to the prompt with some minor
adjustments to the prompt.
Prompts for summarizing paragraphs
Here
i s
an
abstract
of
a
s c i e n t i f i c
paper and a
s p e c i f i c
paragraph
from
the same paper .
Please
read
both and then
summarize
the
paragraph
in
the
context
of
the
abstract .
<Abstract>
{ abstract }
</Abstract>
<Paragraph>
{node . content }
</Paragraph>
<Requirement>
You are
required
to
output a summary of
the
paragraph
in
the
format
of
2~5 key
points .
The key
points
should
not be more than 70 words
in
t o t a l .
The key
points
should summary the
o r i g i n a l
content
comprehensively .
Return
your summary in
with a JSON with a
s i n g l e
key " points " ,
whose
value
i s
a
l i s t
with 2~5 JSON o b j e c t s
with
the
f o l l o w i n g
keys :
" point " ( s t r ) : A key
point
of
the
paragraph .
The key
point
should
be
a complete
sentence
s t a t i n g
an important
f a c t s .
" evidence " ( s t r ) : A copy
of
the
o r i g i n a l
text
that
support
the
point .
</Requirement>
B
Detail of Responses to Post-Skimming self-reported questions
For each paper, participants were given 5 minutes to skim the paper using the assigned tool, followed by five
self-reported questions (Table 1). We have provided participants’ responses to these questions in this section.
Note that when we analyzed the data, we mapped Strongly disagreement to 1, Disagree to 2, Neutral to 3,
Agree to 4, and Strongly agree to 5.
Table 1 Survey questions on review paper understanding after five-minute skimming.
Question/Response
Strongly disagree
Disagree
Neutral
Agree
Strongly agree
I felt like that I understood the objective of this review
paper.
I felt like that I understood how the review paper was
organized.
I felt like that I understood the key messages of this
review paper.
I felt like that I understood the strengths and weak-
nesses of this review paper.
I felt like that I understood the challenges in the field
this review paper is talking about.
13

Objective
Organization
Key messages
Strengths/weaknesses
Field challenges
0
1
2
3
4
5
Average
3.60
4.00
3.40
2.20
3.20
3.80
4.20
3.80
2.80
3.40
Baseline: PDF Reader
Treatment: Tree Reader
Figure 4 The average responses from participants on the post-skimming questions. Participants used both PDF Reader
and TreeReader, and this figure shows that on average participants had a higher score on every post-skimming
question with TreeReader.
0
20
40
60
80
100
Percentage
Field challenges
Strengths/weaknesses
Key messages
Organization
Objective
N=2
N=4
N=1
N=1
N=3
N=1
N=3
N=2
N=3
N=4
N=1
Baseline: PDF Reader
0
20
40
60
80
100
Percentage
N=1
N=2
N=1
N=1
N=2
N=1
N=1
N=3
N=1
N=4
N=2
N=3
N=2
N=1
Treatment: Tree Reader
Strongly disagree
Disagree
Neutral
Agree
Strongly agree
Figure 5 The side-by-side comparison between PDF Reader and TreeReader, we reported the number of each
response for each post-skimming question.
C
Detail of Responses to Post-Activity self-reported questions
For each paper, after five-minute skimming skimming and at most 25 minutes deep reading, participants were
asked five self-reported questions regarding their understandings of the paper and the overall experience with
TreeReader (Table 2). We have provided participants’ responses to these questions in this section.
Note that when we analyzed the data, we mapped Strongly disagreement to 1, Disagree to 2, Neutral to 3,
14

Agree to 4, and Strongly agree to 5.
Table 2 Survey questions on review paper understanding after both skimming and deep reading activities
Question/Response
Strongly disagree
Disagree
Neutral
Agree
Strongly agree
I am confident about my answers to Q1 - Q4.
I am confident about my answers to Q5 - Q8.
This tool is very reliable. I can count on it to be
correct all the time
It is easy for me to find the information I need
It is easy to sense making a sections of the scientific
papers before looking at the details of this sections
Confident (q1 q4)
Confident (q5 q8)
Tool is reliable
Helps understand papers
Easy to find info
Easy to sense paper structure
0
1
2
3
4
5
Average
3.20
3.20
3.00
2.60
2.40
2.60
3.40
3.40
3.40
3.60
3.20
4.20
Baseline: PDF Reader
Treatment: Tree Reader
Figure 6 The average responses from participants on the post-activity questions. Participants used both PDF Reader
and TreeReader, and this figure shows that on average participants had a higher score on every post-activity
question with TreeReader, especially when it is about the difficulty to sense and understand paper structure and
find information.
15

0
20
40
60
80
100
Percentage
Easy to sense paper structure
Easy to find info
Helps understand papers
Tool is reliable
Confident (q5 q8)
Confident (q1 q4)
N=2
N=3
N=2
N=1
N=1
N=2
N=3
N=2
N=3
N=2
N=2
N=1
N=2
N=3
Baseline: PDF Reader
0
20
40
60
80
100
Percentage
N=1
N=1
N=2
N=1
N=1
N=1
N=1
N=2
N=1
N=2
N=2
N=3
N=2
N=1
N=2
Treatment: Tree Reader
Strongly disagree
Disagree
Neutral
Agree
Strongly agree
Figure 7 The side-by-side comparison between PDF Reader and TreeReader, we reported the number of each
response for each post-activity question.
D
Detail of Responses to the NASA Task Load Index (TLX) questions
For each paper, at the very end, after the post-activity questions, we showed the participants six questions from
the NASA Task Load Index (TLX) (Table 3). We have provided participants’ responses to these questions in
this section.
Note that when we analyzed the data, we mapped Very Low to 1, Below Average to 2, Average to 3, Above
Average to 4, and Very High to 5.
Table 3 Survey questions on the NASA Task Load Index (TLX). Note that except for Performance, a lower score
indicates a lower cognitive load.
Question/Response
Very Low
Below Average
Average
Above Average
Very High
Mental Demand: How mentally demanding was
the task?
Physical Demand: How physically demanding
was the task?
Temporal Demand: How hurried or rushed was
the pace of the task?
Performance: How would you rate your success
in accomplishing the assigned task?
Effort: How hard did you have to work to ac-
complish your level of performance?
Frustration:
How insecure, discouraged, irri-
tated, stressed, and annoyed</strong>am are
you?
16

Mental demand
Physical demand Temporal demand
Performance
Effort
Frustration
0
1
2
3
4
5
Average
3.60
3.33
3.75
3.33
3.80
3.00
3.40
2.00
2.60
3.40
2.60
2.60
Baseline: PDF Reader
Treatment: Tree Reader
Figure 8 The average responses from participants on the NASA TLX questions. Participants used both PDF Reader
and TreeReader, and this figure shows that on average participants had a lower cognitive load on every post-activity
question with TreeReader. However, despite the improvements by TreeReader, participants did not rate their
performance with TreeReader higher than PDF Reader. We acknowledge this limitation might be because of the
small sample size and the differences between the two papers. We encourage future work with TreeReader to be
deployed with a large sample size and more diverse papers.
0
20
40
60
80
100
Percentage
Frustration
Effort
Performance
Temporal demand
Physical demand
Mental demand
N=1
N=1
N=1
N=2
N=1
N=1
N=1
N=3
N=1
N=2
N=2
N=2
N=2
N=2
N=1
Baseline: PDF Reader
0
20
40
60
80
100
Percentage
N=1
N=1
N=1
N=2
N=1
N=2
N=2
N=2
N=1
N=3
N=1
N=3
N=1
N=1
N=2
N=1
N=1
N=1
N=3
Treatment: Tree Reader
Very High
Above Average
Average
Below Average
Very Low
Figure 9 The side-by-side comparison between PDF Reader and TreeReader, we reported the number of each
response for each NASA TLX question.
17

E
Participants’ raw responses to the tasks while doing the deep reading
The two papers used in the user evaluation are 1. Towards trustworthy LLMs: a review on debiasing and
dehallucinating in large language models4 and 2. Artificial intelligence for literature reviews: opportunities
and challenges5.
In the following, we use normal text to represent the responses made by using PDF Reader and mark the
responses made with TreeReader green.
E.1
Paper 1: Towards trustworthy LLMs: a review on debiasing and dehallucinating in large
language models
Q1: What is bias in LLMs
• P1: Bias in LLMs refers to behaviours that reinforce undesirable, offensive, or stereotypical content
from the training corpora.
• P2: the process of detecting, mitigating, or eliminating biases, especially in NLP and machine learning,
ensuring that models and algorithms neither inherit nor propagate unequal, unfair or unsuitable
information
• P3: Bias in LLms are caused due to training data.They are categorized into racial, gender, and political
biases
• P4: LLMs inherit toxic, offensive, misleading, stereotypical, and other behaviors that are harmful or
discriminatory
• P5: toxic, offensive, misleading, stereotypical, and other behaviors that are harmful or discriminatory
Q2: What are the major causes of bias in LLMs?
• P1: 2. The main cause seems to be inherited bias from vast training corpora.
• P2: Racial and religious biases, Gender and orientation biases & Political and cultural biases
• P3: The training data, they often reflect stereotypes for example: associating cooking with women and
CEOs with men
• P4: 1. bias in the data leads to LLM being biased 2. If the training process doesn’t debias the LLM
from learning these bad artifacts in the data 3. If no procedure is employed for guardrail LLMs from
generating biased contnet
• P5: trained on vast amounts of data, which are often sourced from vast and diverse online corpora
Q3: What are the major causes of hallucinations in LLMs?
• P1: 3. One cause is that training corpora can contain incorrect information or overemphasize certain
information. It can also be caused by the model itself depending on its architecture or algorithm.
• P2: Data level & Model level
• P3: Flawed training data, Weaker model architectures, Exposure bias
• P4: The model architecture, if too weak The sampling/decoding algorithm and the introduction of too
much noise The exposure of models to biased data during training
• P5: lack of knowledge or erroneous information.
Q4: Why evaluating bias is considered easier than evaluating hallucination?
• P1: Bias can be straightforwardly identified (for example, through word correlations), but hallucinations
are much harder to detect because the claim of the LLM must be evaluated on its own.
4https://link.springer.com/article/10.1007/s10462-024-10896-y
5https://link.springer.com/article/10.1007/s10462-024-10902-3
18

• P2: With human involvement, human annotators tend to look for shortcuts to make the task easier,
so they are more likely to base their judgments on surface attributes such as fluency and language
complexity, rather than expending more effort on detecting authenticity.
• P3: Traditional metrics like BLEU and ROUGE are inadequate for evaluating hallucination in generated
text. Whereas we have metrics such as Word Embedding Association Test (WEAT) and Sentence
Encoder Association Test (SEAT) can be used to evaluating bias.
• P4: Because people expect current models to be general purposed, which imposed harder metrics for
evaluation. Traditiona evaluation metrics, especially the statistics based like ROUGE, often has little
correlation with the actual amount of hallucination. And it’s also the case for model based evaluation.
Thus, most of the work require human based eval. By comparison, bias evaluation can involve using
embedding models / statistical models, which are human free.
• P5: Evaluating bias is more systematic than evaluating hallucination. biases can be analyzed from
embedding level and word level, while hallucination has to be put under context to understand, and
sometime require human labeling.
Q5: What does counterfactual data augmentation do as a debias method
• P1: CDA involves “injecting” training data that contrasts with the biases of the existing data, for
example by changing sentences to have feminine pronouns.
• P2: biases in pre-trained language models largely arise from imbalances in their training data. A
direct approach to counter these biases involves rebalancing the training data. Counterfactual data
augmentation (CDA) (Zhao et al. 2018) is a primary method for data rebalancing, which is widely used
(Zmigrod et al. 2019; Webster et al. 2020; Barikeri et al. 2021). To mitigate gender bias between male
and female demographic groups, it is essential to ensure that gender-neutral terms exhibit consistent
relationships with gender-specific terms.
• P3: Counterfactual data augmentation (CDA) is a primary method for rebalancing training data. CDA
helps mitigate gender bias by ensuring gender-neutral terms relate equally to both genders
• P4: TO generate synthetic data and balance the distribution of different types, ie, debiasing
• P5: generate more data to ensure gender-neutral terms relate equally to both genders
Q6: What type of bias is probed by the WinoBias dataset?
• P1: WinoBias focuses on gender bias with respect to occupations.
• P2: gender bias
• P3: WinoBias is a dataset designed to investigate gender bias in coreference resolution.
• P4: gender bias,
• P5: gender bias
Q7: What challenges do traditional metrics like BLEU, ROUGE, and METEOR face when evaluating hallucination?
• P1: Because they use n-gram similarity, they are not sensitive to the level of hallucination.
• P2: these metrics, which rely on n-gram to quantify the similarity between generated text and reference
text, face challenges in evaluating the level of hallucination (Dhingra et al. 2019; Durmus et al. 2020).
• P3: Conventional metrics like ROUGE and BLEU show low correlation with human judgment for
evaluating hallucinations in generated content. The PARENT metric, which uses reference text, aligns
more closely with human judgment than traditional target text metrics
• P4: It has challenge in indicating the level of hallucination, and low correlation with human evaluation
(ground truth)
• P5: they rely on n-gram to quantify the similarity between generated text and reference text, face
challenges in evaluating the level of hallucination
19

Q8: Regarding the challenge of dehallucination, what limits human feedback-based methods.
• P1: Human feedback can be unreliable due to subjectivity and human error.
• P2: With human involvement, human annotators tend to look for shortcuts to make the task easier,
so they are more likely to base their judgments on surface attributes such as fluency and language
complexity, rather than expending more effort on detecting authenticity
• P3: The human evaluation is accurate, it is labor-intensive and lacks reproducibility.
• P4: human feedback can be subjective and unreliable due to personal biases and error annotations,
making it hard fully represent authenticity.
• P5: human annotators tend to look for shortcuts to make the task easier, so they are more likely to base
their judgments on surface attributes such as fluency and language complexity, rather than expending
more effort on detecting authenticity.
E.2
Paper 2: Artificial intelligence for literature reviews: opportunities and challenges
Q1: What are the phases/stages that a systematic literature review has?
• P1: From the source content: "(i) Planning, (ii) Search, (iii) Screening, (iv) Data Extraction and
Synthesis, (v) Quality Assessment, and (vi) Reporting."
• P2: (i) Planning, (ii) Search, (iii) Screening, (iv) Data Extraction and Synthesis, (v) Quality Assessment,
and (vi) Reporting.
• P3: (i) Planning, (ii) Search, (iii) Screening, (iv) Data Extraction and Synthesis, (v) Quality Assessment,
and (vi) Reporting.
• P4: (i) Planning, (ii) Search, (iii) Screening, (iv) Data Extraction and Synthesis, (v) Quality Assessment,
and (vi) Reporting.
• P5: (i) Planning, (ii) Search, (iii) Screening, (iv) Data Extraction and Synthesis, (v) Quality Assessment,
and (vi) Reporting.
Q2: Based on previous surveys/reviews, what are the main AI features in SLR tools?
• P1: From the source text: "approach, text representation, human interaction, input, and output"
• P2: Approach’ feature
• P3: Approach,Text representation,Human interaction,Input,Output
• P4: screening and data extraction phases of SLRs
• P5: Approach, text representation, human interaction, input, output
Q3: What is the phase/stage that current AI tools help most in SLR?
• P1: The primary focus of these tools seems to be in the screening phase, as well as data extraction.
• P2: DIDN’T ANSWER
• P3: screening and data extraction phases
• P4: The screening phase
• P5: screening
Q4: Why do people do Systematic Literature Review?
• P1: An SLR objectively summarizes all of the relevant literature for a particular research topic.
• P2: to understand pros and cons
• P3: Its main goal is to meticulously identify and appraise all the relevant literature related to a specific
research question, adhering to strict protocols to minimize biases.
20

• P4: The primary aim of SLRs is to identify and assess relevant literature while minimizing biases
• P5: it helps researchers identify and appraise all the relevant literature related to a specific research
question,
Q5: What does quality assessment evaluate?
• P1: The primary focus of these tools seems to be in the screening phase, as well as data extraction.
• P2: DIDN’T ANSWER
• P3: The quality assessment phase evaluates the rigour and validity of the selected studies. This analysis
provides evidence of the overall strength and the level of trustworthiness presented in the review.
• P4: performance, usability, and transparenc
• P5: The quality assessment phase evaluates the rigour and validity of the selected studies.
Q6: What is the approach most adopted by the AI tools in the screening stage?
• P1: AI is used to apply inclusion/exclusion criteria to papers. Usually, this involves a classifier trained
on hand-picked examples with the hope of generalizing to a broader set of papers.
• P2: DIDN’T ANSWER
• P3: It usually involves employing machine learning classifiers, which are trained on an initial set of
user-selected papers and then used to identify additional relevant articles. This process frequently
involves iteration, where the user refines the automatic classifications or selects new papers, followed by
retraining the classifier to better identify further pertinent literatur
• P4: Machine learning classifiers
• P5: Support Vector Machine (SVM)
Q7: Regarding the validity of this survey, what type of validity is Snowballing method used to reduce?
• P1: I couldn’t find the name for the specific type of validity in the paper. However, snowballing was
used in Semantic Scholar to validate the originally screened set of papers. Since the new process revealed
no new relevant papers, this suggests the original methodology was comprehensive enough.
• P2: DIDN’T ANSWER
• P3: To ensure that papers arent lost/ not incorporated. Snowballing helped to find more papers.
• P4: external validity
• P5: internal validity
Q8: Regarding the search engine tools, what are the bibliographic databases they use?
• P1: They used Scopus, the SLR Toolbox, and CRAN.
• P2: Elicit, Consensus, and Perplexity use Semantic Scholar, while EvidenceHunt relies on PubMed
• P3: Scopus and Dimensions, CORE TopAI Tools
• P4: Semantic Scholar, PubMed
• P5: Semantic Scholar, PubMed, and a broader array of publishers, such as Wiley, Sage, Europe PMC,
Thieme, and Cambridge University Press
21
