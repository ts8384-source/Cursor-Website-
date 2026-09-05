# fidyll-conlen-2022.md

# Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations

- **id:** fidyll-conlen-2022
- **list:** frontend
- **authors:** Matt Conlen, Jeffrey Heer
- **year:** 2022
- **venue:** arXiv preprint (IDL)
- **oa_url:** https://idl.cs.washington.edu/files/2022-Fidyll-arXiv.pdf
- **arxiv:** 2205.09858
- **local_pdf:** pdf/fidyll-conlen-2022.pdf

## Extracted text (local RAG ingest)

Fidyll: A Compiler for Cross-Format
Data Stories & Explorable Explanations
M. Conlen†1
and J. Heer2
1Our World in Data
2University of Washington
Figure 1: Fidyll supports serializing ﬁve different output formats from a single source document. Here different versions of the case study
Quantifying Political Ideology are shown. The different formats each have their own strengths and weaknesses.
Abstract
Narrative visualization is a powerful communicative tool that can take on various formats such as interactive articles,
slideshows, and data videos. These formats each have their strengths and weaknesses, but existing authoring tools only support
one output target. We conducted a series of formative interviews with seven domain experts to understand needs and practices
around cross-format data stories, and developed Fidyll, a cross-format compiler for authoring interactive data stories and ex-
plorable explanations. Our open-source tool can be used to rapidly create formats including static articles, low-motion articles,
interactive articles, slideshows, and videos. We evaluate our system through a series of real-world usage scenarios, showing
how it beneﬁts authors in the domains of data journalism, scientiﬁc publishing, and nonproﬁt advocacy. We show how Fidyll
provides expressive leverage by reducing the amount of non-narrative markup that authors need to write by 80-90% compared
to Idyll, an existing markup language for authoring interactive articles.
1. Introduction
Interactive articles [HCHC20] are a powerful medium for convey-
ing complex, data-driven stories to wide audiences in engaging and
understandable ways. The format is used by major news outlets like
the New York Times (e.g. [PKSP∗20]), non-proﬁts and other ad-
† Work done at the University of Washington
vocacy groups [RSP∗16], and scientiﬁc communicators [DJS∗19,
OC17]. These visual narratives can utilize dynamic techniques
like personalization [AGBH17] and self-reﬂection [KRH17] to in-
crease audience engagement [CKH19] and improve learning out-
comes [May02]. However, they tend to be time consuming and dif-
ﬁcult to produce [HCHC20].
Moreover, there are other formats (or genres) of narrative
visualization [SH10]—such as slide shows [MHRL∗17], lec-
arXiv:2205.09858v1  [cs.HC]  19 May 2022

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
2
tures [Ros01], data videos [AHRL∗15], and comics [BRCP17]—
each of which may be more appropriate for use with certain audi-
ences or contexts. For example, while a rich interactive narrative
like Snowfall [Bra12] may be engaging to some audience mem-
bers [MHRL∗17], others may ﬁnd the extensive use of animation
to be distracting or even disorienting
[FMVG15]. A researcher
who publishes a new ﬁnding as an interactive article may wish to
deliver the same results in the form of an interactive presentation
(e.g., [CH18b]); a data journalist who publishes an interactive data
story online may need to create a static version of that same article
for publication in a print newspaper or in animated format to be
shared on social media (e.g., [CH19]).
While it is clear that there is no “one-size-ﬁts-all” format for
narrative visualization, authoring tools don’t take this into account:
existing tools like Ellipsis [SH14] and Idyll [CH18a] focus on pro-
ducing a single artifact—whether it be an interactive article or
slideshow, or an annotated visualization—and offer limited support
for authors to produce alternative versions. In this work, we explore
an authoring tool that facilitates the re-targeting of interactive, data-
driven content across multiple formats. With Fidyll, authors write
their data story in a high-level markup language and the system
compiles this into a standard data schema that can then be used
to produce a number of different formats including interactive ar-
ticles, interactive slideshows, videos, static PDFs, and low-motion
web pages. Our contributions include:
• We conduct semi-structured interviews with seven domain ex-
perts to understand the requirements and workﬂows associated
with multi-format interactive articles. We synthesize ﬁndings
through an open coding process and use these results to construct
motivating usage scenarios.
• We build Fidyll, a cross-format compiler for interactive data
stories and explorable explanations. Fidyll produces interac-
tive articles, slideshows, PDFs, and videos from a single input
source. Fidyll is open source and available for use at https:
//github.com/idyll-lang/fidyll.
• We produce three articles, each of which corresponds to a moti-
vating scenario. Through these case studies we show that Fidyll
provides a large amount of expressive leverage by allowing au-
thors to produce multi-format articles while reducing the overall
amount of non-narrative markup by up to 90%.
2. Background
Our work builds directly on research in narrative visualization and
interactive visualization authoring tools. We draw inspiration from
past work on adaptive layout and re-targeting of content across dif-
ferent display sizes and modalities. Our work is also related to ac-
cessibility, archiving, and personalization in narrative visualization.
2.1. Narrative Visualization & Interactive Articles
Segel & Heer [SH10] identiﬁed a set of seven genres of narrative
visualization (magazine style, annotated chart, partitioned poster,
ﬂow chart, comic strip, slide show, and ﬁlm/video/animation).
The set of genres has since been expanded to include additional
techniques like interactive articles which use scroll-based trig-
gers [MHRL∗17]. Segel & Heer note that the genres “vary pri-
marily in terms of (a) the number of frames and [...] (b) the or-
dering of their visual elements.” We leverage this insight in or-
der to support targeting multiple narrative visualization genres as
output from a single input source. Victor described explorable ex-
planations [Vic11a] as a technique to combine text and interactive
graphics to promote active reading behaviors [AVD14].
Interactive articles [HCHC20] are useful because they support
animation and interactivity, allowing authors to take advantage of
multimedia learning techniques [May02]. However, they are not
preferable in all situations or contexts (see Table 1). Researchers
have found that individual preferences play a key role in au-
dience engagement. For example, McKenna et al. [MHRL∗17]
found that some readers prefer slideshows to scroll-based arti-
cles and engaged more if articles were presented in the format
of their preference. Interactivity and animation also present chal-
lenges in accessibility: some readers of websites which utilize
scroll-based interactivity and parallax will experience motion sick-
ness [FMVG15]; interactive graphics require additional develop-
ment to support screen readers and may not be beneﬁcial for vi-
sually impaired users [KJRK21]. Additionally interactive articles
present a challenge for preservation and archiving; while preser-
vation tools [KW12] and formats [MKS08] for rich interactive web
content exist, they are seldom incorporated as part of the publishing
process [BB18] and are not as well supported as static document
formats like PDF [GMC11].
Tools like Ellipsis [SH14], Idyll [CH18a, CVTH21], and
VizFlow [SCBL21] were created to aid authors in the narrative
visualization production process. Ellipsis and VizFlow are rela-
tively high-level but target a limited range of outputs; Idyll is more
expressive but requires more markup to achieve similar results;
the relationship between Fidyll and Idyll is akin to that of Vega-
Lite [SMWH16] and Vega [SRHH15], with Fidyll serializing much
of the low-level Idyll code necessary to implement common design
patterns. Like Ellipsis, Fidyll utilizes a scene-based data model;
however, our model generalizes to support an arbitrary number of
parameterized graphics embedded within a larger narrative struc-
ture. In contrast to VizFlow, our tool supports output targets across
multiple formats, and interactive graphics, which can be manip-
ulated by readers beyond scroll input. Because data stories tend to
written by collaborators of varying technical proﬁciency [LRIC15],
simple markup languages like ArchieML [STEG15] have been
adopted by many of the major newsrooms [arc17]. ArchieML
can be embedded in existing collaborative word processors like
Google Docs. Our system utilizes a novel markup language based
on ArchieML and of similar syntactical complexity.
2.2. Adaptive Layout of User Generated Content
Given the prevalence of mobile devices [CKH19], the question of
how to adapt content for various display sizes and layouts is of ma-
jor importance. Hoffswell et al. [HLL20] described techniques for
ﬂexible responsive visualization design, allowing authors to pro-
duce visualizations that gracefully adapt between mobile, table, and
desktop screens. In this work we treat graphics as parameterizable
black-boxes, with the assumption that they can gracefully respond
to variously sized displays. More generally, the problem of adaptive
document layout has been of great interest to researchers in the HCI

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
3
Format
Interaction
Animation
Beneﬁts
References
Scroller
✓
✓
Highly polished designs may elicit more engagement from
readers.
Gruessing & Boomgaarden [GB19];
Conlen et al. [CKH19]
Stepper
✓
✓
Supports both synchronous (live presentation) and asyn-
chronous (reading slides as web page) communication.
McKenna et al. [MHRL∗17]; Zhi et
al. [ZOM19]
Low-motion
✓
x
Graphics are distributed over space instead of time. May sup-
port interactivity. Limits motino sickness.
Frederick et al. [FMVG15]
Video
x
✓
Well-supported format with powerful distribution platforms
like YouTube.
Amini et al. [AHRL∗15]; Bradbury &
Guadagno [BG20]
Scientiﬁc Paper
x
x
Archivable, standardized format
Tversky et al. [TMB02]
Table 1: Interactive document formats like scrollers and steppers are useful because they can support both animation and user interaction,
but other formats for narrative visualization may be more appropriate depending on the context and audience.
community [HLM09]. Jacobs et al. [JLS∗04] developed a method
of grid-based document layout building on the fundamental visual
grid-system from the Swiss school of design [MB81]. In this work
we also utilize grid-based templates, but don’t attempt to automate
ﬁne-grained placement of components. Instead we allow authors
to modify the placement of text and associated graphics in terms of
the grid when necessary. In the future an automated adaptive layout
algorithm could be incorporated.
3. Formative Interviews
To understand the needs and practices of interactive article authors
we conducted semi-structured interviews with seven domain ex-
perts, including a data visualization practitioner and educator (P1),
a data journalist and academic researcher (P2), an artist and scien-
tiﬁc communicator who uses data visualization and physicalization
as their medium (P3), a machine learning and human-computer in-
teraction researcher (P4), a data journalist and human-centered ar-
tiﬁcial intelligence researcher (P5), a librarian specializing in phys-
ical and digital maps (P6), and a machine-learning researcher (P7).
3.1. Methods
To source the interview participants we directly emailed three peo-
ple who were known to be domain experts. We also posted a call
for participants in a Slack channel dedicated to explorable expla-
nations [Vic11b], and on Twitter, where the authors are followed
by a number of data journalists and visualization researchers. The
interviews took place remotely over a video call, and lasted about
thirty minutes. Our interview script (available in the supplemen-
tary material) served as a general guideline for the interviews, but
we engaged in open discussion with the interviewees, guiding the
conversations based on their interests and expertise to better under-
stand their needs. After the interviews were completed we used an
open coding procedure to analyze the interviews and identify the
most salient themes, presented below.
3.2. Qualitative Results
Format is determined by intrinsic and extrinsic factors. Re-
spondents discussed a variety of formats that they had used to
present narrative data visualizations, including web articles, slide
shows, Power Point presentations, Google Docs, PDFs, data phys-
icalizations, magazine articles, print newspaper stories, and inter-
active maps. The choices for which format to use were driven by
a variety of factors, including format affordances (“How do we
educate and teach people the capabilities and limitations of ma-
chine learning? One way to do that is through interactive articles,
through play, education, and other explorable-type interfaces” P4),
audience preferences (“I try to do things as simple as possible...
especially for journalistic audiences it’s not in your best interest to
make a very complicated data visualization”, P2), author expertise
& resources (“We are all in different backgrounds, but we aren’t
scientists. We don’t have a certain workﬂow to work with.” P3),
author goals & preferences (“There are some things that research
papers don’t encourage... I don’t know why reviewers don’t like
empty space, no matter how pedagogical or good the diagram is.
These restrictions are good at times, but if you want to write for an
audience that wants to learn I feel slideshows or what Distill does...
those things are nice for reaching a wider audience.” P7), and ex-
ternally imposed constraints (“At [national publisher] I would make
charts for the web and then have to put them in the magazine... It
sometimes went the other way too where they had a feature mag-
azine article, some illustrator would have a graphic that works in
print, and then we’d make an interactive version of it.” P5).
Visualizations from exploratory tools are often repurposed
for use in a narrative context. While many authors used
JavaScript to create custom web-based interactive visualizations (
“The tools are your standard web-development tools” P4), it was
also common for authors to create graphics using exploratory ana-
lytics tools like R and Python (“We mostly use R and R Studio. But
it depends on the story.” P3, “We do the interactive version where
we don’t know what we’re looking for and its very exploratory and
then we make an explanatory version” P5.). These graphics may be
included directly in articles without additional modiﬁcation or ex-
ported in a vector format for additional manipulation and annota-
tion ( “I tend to use R for most of the things that I do and will polish
in Adobe Photoshop or Illustrator if needed” P2; “The assets, the
coupling between them, you have some representation of your in-
teractive thing, you save that out once, and then you work with it in
another program: you have your SVG crowbar, pull it out, open it
up in Illustrator and hope it mostly works.” P5). In some cases this
approach makes it difﬁcult to add interactivity post-hoc (P2, P7).

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
4
It is common to create static and interactive versions of the
same content. Most interviewees had experience adapting mate-
rials from an interactive resource to a static one (“For [project] it
was visualizing principal component analysis. One of them is in
JavaScript on the client, another one is in Python in Deepnote, and
then its a PNG in the ﬁnal report. Three different renderings of the
same—it’s a huge pain.” P1). This was done for a variety of rea-
sons, including academic publishing requirements (“The disserta-
tion format required a PDF at the end of the day.” P4), to create an
long-living archive of the interactive resource (“Not knowing how
long its going to last for, if they’re going to have access to the soft-
ware they used to create it, if they have to present in other formats
like a paper, or if they want to go out into the community and work
with people who don’t have access to digital tools and methodol-
ogy, how do we show it as a PDF?”), or to create short executive
summaries of the main points of their interactive article (P1 “We
want the raw data and a data scientist might, but I don’t want to
hand you that. What I want to hand you is maybe an interactive re-
port you can scroll through, but the mayor doesn’t want that. The
mayor wants the last thing which is ‘here are a few bullet points,
who cares what the methodology is, what’s the takeaway?”’).
Graphics are reused across formats with little modiﬁcation,
but may be omitted from static materials; text may be rewritten
to better suit different audiences. When authors needed to adapt
graphics for different formats, they typically did so without making
signiﬁcant changes to the underlying graphic (“There’s no special
treatment or augmentation [when translating graphics from a static
to an interactive version]” P4). When changes were made, it was
typically to add annotations (“We’ll take screenshots of the graph-
ics, paste them in slides, and write some annotations on top of it”
P5), or to capture some interactive aspect of a graphic, for example
by recording a video or taking a screenshot (“Authoring interactive
graphics, primarily for the web but secondarily for a keynote or
slide deck... same annoying problem of how do I capture the exam-
ple, but at least its not a PDF so you can take screenshots or GIFs
or videos to show the interactions more in depth” P4, “To preserve
the interactivity you can record a video and add a transcript to show
off what the tool once did and provide contextual information about
why you made the choices that you did.” P6). Interactive graphics
may be replaced by small multiples in a static environment (“there
were only two states [in the interactive graphic] and you can cap-
ture it in a screenshot and show them side-by-side” P4), or they
may be omitted altogether due to the lack of support for adapting
to the new environment (“we did a web-only version that was a
Leaﬂet map that people could click on; we couldn’t ﬁgure out a
way to make that easily navigable in print” P4). Authors frequently
changed the text of their articles to better ﬁt the expected audience
of that particular format (“Delivering a narrative summary based on
the data science results remains a big problem. How do you go from
displaying a bunch of raw data and visualizations to constructing a
narrative at different levels of abstraction and expertise.” P1).
Authors want to produce more cross-platform content but
may not have the capacity to do so. Most of the authors had am-
bitions to create more cross-format content (“It’s very important
for our organization to be able to deliver narrative summaries of
data science in an automated way... right now there are four assets
that we produce.” P1). They noted that they understood how dif-
ferent formats are beneﬁcial for different audiences and contexts
(“The interaction should facilitate a faster understanding or learn-
ing compared to reading a 10 page PDF. How do we give someone
an interactive summary to come away with most of the important
stuff? The details we can leave somewhere else...” P4). However,
participants noted that due to time, resource, and format constraints
they often don’t do this in practice (“We are not technical people.
We are not programmers” P3; “It’s work that is not even seen. If
you look at it, I don’t think that it matters to you what colors I used
or how the elements are arranged.” P7; P5 “We’re making a nice in-
teractive interface for exploring GAN outputs. It works well.. I can
imagine a nice blog post about it, but I’m unsure about how to boil
it down to a research paper... it seems so much worse than the blog
post version in terms of reading. Why would anyone read this PDF
if we could make the version with inline [interactive] examples?”).
Existing tools don’t promote accessibility or archivability of
interactive content. While many interactive article authors were
focused mainly on what they could do to improve the effectiveness
of their publications work (“It should be very precise... the data
representation should be accurate. If there’s an interaction it should
only help the person engage with the results, come away with a
technical insight, or learn something new.” P4), others were con-
cerned about the longevity of these materials however they were
lacking resources and guidance. (“We’ll have a student who spent a
semester creating a really snazzy data project... and they’re realis-
ing that its hard to preserve that type of work as a portfolio piece...
This is the type of question that I get. I have been approaching
things on a case-by-case basis as there aren’t great best-practices
established, its really thinking about the goals of the particular re-
searcher and their situation.” P6) or how they work for users who
may be vision impaired or prefer reduced motion.
4. Motivating Scenarios
Based on our interviews with domain experts, as well as the au-
thors’ own experience working on data journalism and scientiﬁc
communication projects, we developed a set of three motivating
scenarios grounded in current real-world practices. While not ex-
haustive, these scenarios are meant to represent the breadth of do-
mains and tasks which demand that authors of interactive narrative
data visualizations need to produce content that lives in multiple
formats. In §6.1 we use Fidyll to implement a cross-platform arti-
cle corresponding to each of the motivating scenarios.
MS1. Data Journalism. A data journalist wants to use a statis-
tical model as an aide in explaining the voting records of mem-
bers of the United States House of Representatives. She works
with a data scientist to identify various parameters of the model
that would make a compelling story. The journalist then writes text
that guides readers through these various parameters. The journalist
works with a graphics editor to create a visualization that presents
the output of the model. The story needs to work on desktop, mo-
bile, and tablet devices, and related static renditions of assets need
to be created for a print version of the news paper as well as for use
on social media and the paper’s homepage.
MS2. Non-proﬁt Advocacy. A watchdog organization regularly
publishes reports online discussing the efﬁcacy of various climate

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
5
change mitigation approaches. These reports are highly technical,
consisting of charts, tables, references, and occasionally interac-
tivity. The writers are experts in climate science, policy, and data
analysis but they are not experts in web development or graphic
design. The organization wishes that all of their stakeholders can
participate in the creation of these articles, but currently all of the
work falls on to the shoulders of one team member, who happens to
have some web development experience. They wish to more easily
incorporate the results of statistical models written in R and Python
without writing JavaScript and HTML.
MS3. Scientiﬁc Publishing. A researcher has identiﬁed methods
to make a kernel density estimation algorithm signiﬁcantly faster,
but with certain trade-offs in the ﬁdelity of the algorithm’s out-
put. The researcher has submitted this work to be published at an
academic conference, and needs to write a paper including static
images of the output. The researcher will also need to create a
slideshow with which to give a presentation, which will be de-
livered via a pre-recorded video. The slideshow will include ani-
mated versions of the graphics used in the paper. In addition, the
researcher wishes to publish a digital blog post covering the same
topic so that their work can be seen by a wider audience.
5. Fidyll
Fidyll is a cross-genre compiler for data stories and explorable ex-
planations. Authors create a single speciﬁcation which is then used
to generate multiple different output formats including interactive
articles, dynamic slideshows, data videos, and static documents.
5.1. Data Model
A crucial piece of Fidyll is the data model (Figure 2) used to repre-
sent interactive narrative visualizations. By leveraging a expressive
and ﬂexible schema, all of the constituent narrative pieces can be
speciﬁed, independent from their arrangement and layout on the
page.
Narrative. The top-level element is the narrative. The narrative
consists of document metadata such as authors, title, subtitle, etc.,
along with document-wide information such as pointers to datasets.
A narrative consists of a series of scenes, which can optionally be
book-ended by an introduction and a conclusion.
Scenes. A scene is the primary constituent of Fidyll data-
stories. Each scene consists of a reference to a parameterizable data
graphic, along with a list of stages. Scenes may include additional
conﬁguration information such as ﬂags to include or exclude par-
ticular scenes from particular output genres, allowing authors to
customize content on a per-genre basis.
Stages. A stage represents a particular conﬁguration of the data
graphic associated with a scene. Each stage speciﬁes a particular
conﬁguration of domain-speciﬁc parameters for the data graphic,
along with corresponding narrative text. Parameters can either be
stationary—in which case they take on a speciﬁc value as soon as
the stage comes into view—or animated, in which case they can
loop through a series of values on a timer, or interpolate between
two values at the start and end of the stage. Similar to scenes, au-
thors can also use ﬁlters to include or exclude particular stages from
Figure 2: Fidyll’s data model centers on the notion of giving read-
ers a tour through a high-dimensional parameter space. Each scene
deﬁnes its own parameter space, and each stage within the scene
deﬁnes a set of parameter values. Controls give readers leeway to
explore parts of this space that aren’t directly visited by a stage.
particular output genres. Stages can include a set of controls, which
allow readers to interact with the data graphic.
Controls. A control allows readers to interactively adjust the
domain-speciﬁc parameters that drive the data graphics embedded
in each scene. To add a control, authors specify which parameter
it corresponds to, along with the domain of allowed values which
readers should be able to specify. Fidyll will then infer which type
of widget is appropriate and add it to the document.
Animations. Authors can deﬁne animations for each parameter
at each stage by providing a start and end value, and conﬁguration
options (e.g. duration and loopcount); if the start value is not pro-
vided the previous value of the parameter is used. In formats that

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
6
don’t support animation, a series of static frames are generated; au-
thors can deﬁne the number and arrangement of static frames with
the frames (number of frames to generate) and columns (the num-
ber of columns in the resulting grid) options.
Filters. Authors can provide ﬁlters for any scene or stage to spec-
ify in which formats the contents will appear. There are four ﬁlter
keywords that are supported: include, exclude, only and skip. The
include and exclude options each expect a list of formats, to specify
that a stage or scene will only be included in those formats (include)
or that it will not be included in those formats (exclude). The only
and skip keywords are intended for use during article development,
and are boolean ﬂags which allow an author to specify that only
one particular scene or stage should be rendered (only) or that a
particular scene or stage should not be rendered during develop-
ment (skip); we include these based on experience developing long
interactive articles, it is often necessary to use such functionality to
focus on developing a particular subset of the article.
5.1.1. Output Targets
The primary tasks of Fidyll are (1) to parse the author-provided
markup into a machine-readable JSON data structure, and then (2)
for each of the desired output targets, to transform this normalized
data into an Idyll abstract syntax tree corresponding to the respec-
tive format. Fidyll supports ﬁve output formats: interactive article,
low-motion article, PDF, interactive slideshow, and video.
Scroller. The interactive article target implements the popular
scrollytelling layout and reﬂows to support viewing across display
sizes such as on mobile, tablet, and desktop devices. Each scene is
displayed with the data graphic ﬁxed to the screen while the text
associated with each stage scrolls over top. As each section of text
appears on the screen, the parameters associated with that scene are
applied to the graphic, which updates its display in response. If a
stage has controls associated with it, then the appropriate widgets
are displayed beneath the text and readers can manipulate them.
Low-motion HTML. The static article is laid out as a single
column of text interspersed with data graphics. For each stage in
a scene, the text is displayed with the data graphic rendered with
the relevant parameters. Interactive controls are still included, but
animations are converted to a series of still frames.
Static Paper. The static article is laid out in one or two columns
of text interspersed with data graphics. No widgets for controls are
displayed; instead, an appendix is constructed which renders the
relevant data graphic with each of the possible conﬁgurations of pa-
rameters deﬁned by the cross product of controls. To avoid a com-
binatorial explosion in the where there are many controls, authors
can deﬁne a subset of conﬁgurations which are to be included in this
appendix. Animations are displayed as a series of static frames.
Interactive Slideshow. The interactive slideshow implements
the popular stepper layout and can be used in an asynchronous
manner (where the audience reads through the slideshow at their
own pace), or a synchronous manner where a presenter uses the
slides as support during a live presentation. Each slide corresponds
to a stage within a scene, with the data graphic rendering in a full-
screen manner, and the corresponding text (or a summary of the
text) displayed above it. A presenter view is also generated, which
contains the relevant controls for the currently displayed slide; a
WebRTC connection is established between the presenter’s web
browser and the browser of each audience member, allowing view-
ers to see the data graphics update interactively as the presenter
manipulates the controls.
Data Video. The data video target utilizes the same layout as the
interactive slideshow. An MPEG-4 video is generated by recording
the slideshow played from beginning to end; voiceover is generated
by converting the text for each slide to audio via a text-to-speech
API and subtitles are generated using the same text in the SRT ﬁle
format [Bra]. This output target does not support interactive control
but does include all animations.
5.2. Syntax & Implementation
Fidyll is implemented as a Node.js package which can be in-
stalled and used via the command line on Linux, MacOS, and
Windows. The markup that authors write is based on ArchieML,
a markup language designed to be human-readable and easy for
writers and editors to use. ArchieML is used by both technical and
non-technical staff across a number of newsrooms, including at the
New York Times and Washington Post, and so we believe that our
variant could be similarly used by authors without a strong pro-
gramming background. Example Fidyll markup is shown below:
--
title: My Great Article
authors: Matthew Conlen, Jeffrey Heer
datasets:
penguins: penguins.csv
--
Some introductory text...
{scene}
graphic: ExampleDataGraphic
parameters:
booleanVariable: false
continuousVariable: 0
This text is shown near the ExampleData-
Graphic with both variables in their ini-
tial state...
{stage}
parameters:
booleanVariable: true
The boolean variable is now true, the Example-
DataGraphic has updated to reflect this.
{stage}
animations:
continuousVariable:
start: 0
end: 1
duration: 750
controls:
continuousVariable:
range: [0, 5, 0.1]

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
7
Figure 3: Fidyll’s software architecture. Authors write narrative text in a markup format and provide parameterized graphics. The markup
is parsed and normalized into our schema, which then is used to collect parameter values, generate code, audio, and graphics, and ultimately
produce various formats which can be published on the web or elsewhere.
The boolean variable is true and the continu-
ous variable animates from zero to one. Read-
ers can manipulate a range slider to mod-
ify the continuous variable after the an-
imation has played, or click a play but-
ton to watch the animation play again.
Parsing & Normalization. We built a custom parser to handle
the new markup format. It reads the YAML-style markup associ-
ated with each stage of the article and builds a JSON data structure
to represent the schema shown in Figure 3. Because the parameters
that authors provide at each stage may be under-speciﬁed (authors
only need to specify the parameters that change), a normalization
step occurs after parsing to ensure that the parameter set associated
with each stage of each scene fully speciﬁes all relevant parameters.
Parameter Collection. Once the data has been normalized into
the expected schema, the parameter collector walks through the
scenes and stages to identify all of the possible conﬁgurations of pa-
rameters that could occur while readers progress through an article.
These conﬁgurations include not only the parameter values speci-
ﬁed at each scene and stage, but also the range of parameter values
that could be reached by manipulating interactive controls. This set
of possible parameter conﬁgurations is used to generate any graph-
ics that are created as images on the server-side, and to create static
renditions of interactive graphics to be included as appendices in
static versions of the article, allowing us to achieve content parity
between the static and interactive output formats.
Graphic Generation. While many graphics are generated in the
browser using web-based libraries like React and D3, we found that
many authors also like to create graphics using server-side scripts
written in languages like Python, Julia, or R. The graphic generator
calls these scripts with all relevant possible parameter values and
generates images which can then be embedded in the interactive
article. The image ﬁlenames encode the parameter values so that
interactivity can be maintained through control manipulation (e.g.
as a reader manipulates a slider, the slider’s value is used to update
the path to the image). The graphic generator is also responsible for
making static image versions of interactive graphics that ultimately
get included as part of an appendix in a static PDF.
Code Generation. The bulk of the cross-format logic occurs in
the code generator, which is responsible for taking in a Fidyll nar-
rative and producing Idyll markup as output. For each output tar-
get, the code generator will iterate through each scene and scaf-
fold the necessary code to generate the relevant layout (e.g. a
Scroller). Fidyll serializes reactive variables corresponding to pa-
rameters (each scene deﬁnes its own variable scope) and input
widgets and animation playback buttons where appropriate. Fidyll
also deﬁnes parameter updates via event handlers; the onEnterView
event, for example, is used to update parameters when a new stage
scrolls into view. Much of the code generation logic can be reused
across formats, although each has their own unique way of struc-
turing how the content appears on the page. In the static layout,
multiple graphical components are embedded in the article, each
with their own ﬁxed set of parameters, rather than a single compo-
nent being embedded which utilizes updating parameters. The code
generator ultimately produces an abstract syntax tree representing
an Idyll program which is then serialized as markup corresponding
to interactive slideshows, scrolling articles, and low-motion arti-
cles. This markup is then transformed by the Idyll compiler into
HTML and JavaScript that runs in web browsers. It is also used as
input to the PDF and Video generators in order to produce static
formats. Examples of the compiled Idyll markup are available as
part of the supplementary material.
Video Generation. The video generator takes as input the
Fidyll narrative and runs the text through a text-to-speech API to

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
8
Figure 4: We used Fidyll to create three interactive articles. In the interactive article version of Quantifying Political Ideology, sections of
text scroll on the left half of the screen (A) while graphics remain ﬁxed in place on the right (B); graphics update as the reader scrolls and
respond to interactions with controls embedded in the text. The presentation version of Climate and Economic Modeling provides high-level
text summaries of visualizations and embedded controls (C), which can be used to manipulate full-screen graphics (D). In the low-motion
HTML version of Fast & Accurate Gaussian Kernel Density Estimation, graphics are repeatedly embedded in a single text column with
various parameters (E); readers can still manipulate controls to further explore the parameter space (F).
create a series of audio snippets, one corresponding to each slide in
the interactive slideshow. We use the Text-to-Speech service pro-
vided by Google Cloud. Once the audio is created, the interactive
slideshow is recorded via a headless web browser [pup]. The du-
ration of each audio snippet is use to determine the length of each
slide in the interactive slideshow as well as the timings for the gen-
erated subtitles. The audio clips and screen recording are compos-
ited together to produce an MP4 video and an SRT subtitle ﬁle is
serialized.
PDF Generation. The PDF generator leverages the low-motion
interactive web article as well as the document converter Pan-
doc [Mac13]. Each graphic in the low-motion article is converted
into an image and an HTML ﬁle is serialized with the interactive
graphics replaced by static images. The HTML ﬁle is processed by
the Pandoc converter, which produces a PDF using LATEX.
6. Evaluation
We consider this work to be a form of user interface systems re-
search and turn to Olsen’s criteria for evaluation [OJ07]. In Sections
1 & 2 we showed the importance of the work and in Sections 3 & 4
we identiﬁed speciﬁc situations, tasks and users. In this section we
show the generality of our work through a set of three case studies,
and show how it reduces solution viscosity compared to existing
tools by affording authors expressive leverage: Fidyll signiﬁcantly
reduces the amount of non-narrative markup that authors need to
write to generate cross-format interactive articles.
6.1. Case Studies
We used Fidyll to develop three cross-platform interactive arti-
cles (Figure 4). These articles were designed so that each would

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
9
map directly on to one of the motivating scenarios provided in §4.
The articles cover a range of topics (spatial models of politics; an
economic-climate model; an optimization for kernel density esti-
mation) using a variety of commonly used narrative visualization
techniques such as a martini glass structure and drill-down sto-
ries [SH10]. Each of the articles was developed with the intention
that it would serve as a useful educational artifact separate from
the publication of this paper, which helps ensure that they provide
“authentic and realistic motivation” for this evaluation [CKH19].
The articles are available online at https://idyll-lang.
github.io/fidyll-examples/ and a video demo is pro-
vided as supplementary material.
6.1.1. Quantifying Political Ideology
In Quantifying Political Ideology we provide an interactive expla-
nation of the NOMINATE family of spatial models of rollcall vot-
ing for the U.S. legislative branch [PR85,Poo05]. DW-NOMINATE
scores are frequently cited by journalists who use them as a tool for
interpreting political behaviors. The article is written from the per-
spective of a data journalist who wants to provide their audience
with a high-level and intuitive explanation of a topic that is typi-
cally presented in a highly technical way. The article consists of
three scenes: an introduction which explains the basic properties of
spatial voting models and provides a high-level motivation for why
they are built; real world examples, in which the voting behavior
and ideological positions of members of the 116th U.S. Congress
is explored (readers can interactively select votes which they are
interested in learning more about); and a technical explainer of the
inner-workings of the optimization algorithm used to derive the ide-
ological NOMINATE scores.
6.1.2. MARGO Climate Modeling
MARGO Climate Modeling was designed to match the motivating
scenario MS2, where a non-proﬁt organization uses open datasets
and scientiﬁc models in order to advocate for certain policy actions.
In this article we utilize the MARGO model [DRDE20] which al-
lows users to specify constraints (e.g. “keep warming below two
degrees celcius”) and will provide an optimized path for adhering
to those constraints through the use of climate controls including
mitigation of greenhouse gas emissions, adaptation to climate im-
pacts, removal of carbon dioxide, and geoengineering. The article is
a straightforward application of the martini glass narrative structure
in which an author-driven narrative is ﬁrst presented to the reader,
walking them through the a series of important points pertaining
to the MARGO model, and then allowing them to explore freely
within a predeﬁned space of model parameters. Because the model
runs in Julia, Fidyll determined the multidimensional space of pos-
sible parameter values that a reader could reach at any point in the
article, and for each possible conﬁgurations, ran the model ahead
of publication to generate corresponding graphics. In the ﬁnal ver-
sion there were 22 possible parameter conﬁgurations, which took
just under an hour to generate on a 2018 MacBook Air with a 1.6
GHz dual-core processor and 16 GB of ram.
6.1.3. Fast Kernel Density Estimation
The Fast Kernel Density Estimation article was developed to rep-
resent MS3, the scientiﬁc publishing scenario, and was adapted
from a presentation given by the ﬁnal author of this paper at the
2021 IEEE Visualization Conference [Hee21]. The original pre-
sentation was created by having the presenter give the talk into
his webcam while screen recording software captured slides pro-
duced in Keynote. The slides contained multiple graphics which
were developed in JavaScript using D3 [BOH11] and utilizing both
Observable [obs] and a standard (non-notebook) web development
environment. The graphics were interactive, but for the purposes of
the presentation multiple video recordings were made with screen
recording software and then added to the slides. We were able to
adopt these graphics for use within Fidyll and reproduce the con-
tent of presentation as a cross-platform explorable explanation, in-
cluding an interactive slideshow in which the graphics can be ma-
nipulated in realtime by the presenter. To do so we needed to make
small modiﬁcations to the code of the graphics (approx. 10 lines of
code changes in each graphic) so that they adhered to our compo-
nent API and can adapt to different screen sizes (the graphics are
displayed at a different resolutions in different formats, e.g. in the
static article they are shown at the width of the text column; in the
interactive slideshow they are shown at full screen width).
6.2. Expressive Leverage
To assess the extent to which Fidyll assists in facilitating the
rapid creation of cross-format interactive articles we analyzed the
source code of the three case study articles, including both the
Fidyll markup that authors produced as well as the intermediate
Idyll ﬁles which get created and ultimately compiled into HTML
and JavaScript. We compare the Fidyll markup to the intermediate
Idyll markup rather than the ﬁnal HTML and JavaScript because
Idyll represents a more realistic baseline in terms of what authors
currently use for the task of authoring interactive articles. We com-
puted relevant counts and ratios of the lines of code (LOC) asso-
ciated with each case study and with the three intermediate Idyll
formats which ultimately generate the ﬁve ﬁnal artifacts. Table 2
shows the results of this analysis. To make the comparison valid
across the articles and formats we break each sentence of narrative
text onto its own line and ignore any whitespace. The Idyll markup
that is generated is idiomatic markup that is produced by calling the
idyll-ast package’s toMarkup(ast) function. We consider a narrative
line of code to be any line in which the majority of the markup is
rendered directly on-screen as narrative text; the % reduction met-
ric is deﬁned as one minus the lines of non-narrative Fidyll code
divided by the lines of non-narrative Idyll code.
We found that Fidyll reduced the amount of non-narrative code
by 82–90% compared to writing the Idyll markup for each of the
three Idyll formats directly. Compared to writing the Idyll markup,
for a just a single format Fidyll still reduced the amount of code
written by 33–82% (mean 60%; median 57%). Fidyll also improved
the ratio of narrative to non-narrative code that authors had to write:
the Fidyll markup consisted of 30% narrative code on average,
while this number was 15% on average for a single format drafted
in Idyll and 5% for the combined Idyll markup, indicating that the
authors would have had to write about 20 lines of non-narrative
markup for every sentence in the data story.

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
10
Example
Scenes
Stages
Target
Markup
Narrative
LOC
Non-narrative
LOC
Total
LOC
% Narrative
% Reduction
(Non-narrative)
Fast KDE
18
54
ﬁdyll
109
320
429
25.41%
static
idyll
109
1518
1627
6.70%
78.92%
slideshow
idyll
109
1083
1192
9.14%
70.45%
scroller
idyll
109
736
845
12.90%
56.52%
combined
idyll
109
3337
3446
3.16%
90.41%
MARGO
2
14
ﬁdyll
33
95
128
25.78%
static
idyll
33
179
212
15.57%
46.93%
slideshow
idyll
33
219
252
13.10%
56.62%
scroller
idyll
33
142
175
18.86%
33.10%
combined
idyll
33
540
573
5.76%
82.41%
QPI
2
13
ﬁdyll
57
90
147
38.78%
static
idyll
57
495
552
10.33%
81.82%
slideshow
idyll
57
256
313
18.21%
64.84%
scroller
idyll
57
190
247
23.08%
47.37%
combined
idyll
57
941
998
5.71%
90.44%
Table 2: Fidyll reduces solution viscosity by providing authors with expressive leverage. Authors using Fidyll write considerably less non-
narrative code than with existing markup languages, freeing them to focus on the narrative aspects of their data story.
7. Discussion
We discuss the limitations of our system and study and highlight
points of interest to the research community.
Limitations of this work. While we grounded the situations,
tasks, and users of our system through formative expert interviews
and created a set of realistic case studies, we haven’t directly ob-
served our system in the hands of end users. Because our markup
language is a dialect of ArchieML, a widely used markup language
in newsrooms, we don’t anticipate users having an issue learning
the syntax. In the future we would like to observe the strengths and
weaknesses of Fidyll through observation of real world use. While
Fidyll can express a wide range of common narrative visualization
design devices, there are designs that it does not support. For ex-
ample, the tool expects that readers will progress through content
in linear fashion and does not support non-linear choose-your-own-
adventure-style text. The tool only supports a subset of possible
formats and doesn’t yet support highly-visual genres of narrative
visualization such as data comics or infographics.
The Role of Automation in Data Storytelling. While our
system drastically reduces the LOC needed to produce multi-
format data stories, there are challenges to the automated ap-
proach [Hee19]. For example, the audio narration (generated by
a text-to-speech model) frequently mispronounces technical words
(e.g. “Gaussian”) and in practice we expect that authors will prefer
to add voiceover from a human narrator. We attempted to automate
other tasks, such as using a language model [BMR∗20] to summa-
rize text from long form articles to shorter snippets that would be
appropriate in formats like a slideshow. We achieved poor results;
however, this may be useful to develop further in the future. Our
system gives authors access to all of the generated assets so that
they can make additional manual changes if necessary.
Parity of Content Across Formats. While there are real edu-
cational beneﬁts to well-designed interactive content [HCHC20],
there are still situations where static or non-interactive animated
content will be preferred. In these cases we believe it is important to
still give readers access to the same information content [TMB02].
For this reason we ensure that static versions always included addi-
tional still images of graphics, representing all of the relevant states
that could be reached in the interactive version.
Accessibility of Interactive Articles. Fidyll supports authors in
producing accessible documents: the static and low-motion formats
are preferable for readers who experience motion sickness; the au-
dio and subtitles generated for the video format support readers
with low vision. However, there are still major challenges in adapt-
ing interactive graphics for use with assistive devices like screen
readers [KJRK21]; care needs to be taken to generate markup that
works well with these devices, and the system should create de-
scriptions of the on-screen graphics for low-vision readers.
System Expressiveness and Design Guidance. While our sys-
tem is strictly less expressive than Idyll, which our high-level
markup compiles to, we believe that this trade-off is beneﬁcial for
many authors because of the expressive leverage that it provides,
and because it provides much more structure in the resulting de-
signs, nudging authors to use common, well-established formats.
Many authors of interactive articles are not experts in design and
likely beneﬁt from the system making low-level design decisions.

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
11
8. Conclusion
We presented Fidyll, a cross-format compiler for data stories and
explorable explanations. Our system was informed by interviews
with expert users and realistic motivating scenarios. The scenarios
were operationalized in three case studies that we analyzed to show
the expressive leverage of our system, reducing the amount of non-
narrative code that needs to be written by 88% on average.
References
[AGBH17]
ADAR E., GEARIG C., BALASUBRAMANIAN A., HULL-
MAN J.: Persalog: Personalization of news article content. In Proceed-
ings of the 2017 CHI Conference on Human Factors in Computing Sys-
tems (2017), pp. 3188–3200. 1
[AHRL∗15]
AMINI F., HENRY RICHE N., LEE B., HURTER C., IRANI
P.:
Understanding data videos: Looking at narrative visualization
through the cinematography lens. In Proceedings of the 33rd Annual
ACM Conference on Human Factors in Computing Systems (2015),
pp. 1459–1468. 2, 3
[arc17]
Archieml,
Dec
2017.
URL:
https://awards.
journalists.org/entries/archieml/. 2
[AVD14]
ADLER M. J., VAN DOREN C.:
How to read a book: The
classic guide to intelligent reading. Simon and Schuster, 2014. 2
[BB18]
BROUSSARD M., BOSS K.: Saving data journalism: New strate-
gies for archiving interactive, born-digital news. Digital Journalism 6, 9
(2018), 1206–1221. 2
[BG20]
BRADBURY J. D., GUADAGNO R. E.: Documentary narrative
visualization: Features and modes of documentary ﬁlm in narrative visu-
alization. Information Visualization 19, 4 (2020), 339–352. 3
[BMR∗20]
BROWN T. B., MANN B., RYDER N., SUBBIAH M., KA-
PLAN J., DHARIWAL P., NEELAKANTAN A., SHYAM P., SASTRY G.,
ASKELL A., ET AL.: Language models are few-shot learners. arXiv
preprint arXiv:2005.14165 (2020). 10
[BOH11]
BOSTOCK M., OGIEVETSKY V., HEER J.: D3 data-driven doc-
uments. IEEE transactions on visualization and computer graphics 17,
12 (2011), 2301–2309. 9
[Bra]
BRAIN Z.: SubRip. URL: http://zuggy.wz.cz/. 6
[Bra12]
BRANCH J.: Snow fall. The New York Times 21 (2012), 2012. 2
[BRCP17]
BACH B., RICHE N. H., CARPENDALE S., PFISTER H.: The
emerging genre of data comics. IEEE computer graphics and applica-
tions 37, 3 (2017), 6–13. 2
[CH18a]
CONLEN M., HEER J.: Idyll: A markup language for author-
ing and publishing interactive articles on the web. In Proceedings of the
31st Annual ACM Symposium on User Interface Software and Technol-
ogy (2018), pp. 977–989. 2
[CH18b]
CONLEN M., HOHMAN F.: The beginner’s guide to dimension-
ality reduction. VISxAI at IEEE VIS (2018). 2
[CH19]
CONLEN M., HOHMAN F.: Launching the parametric press. Vi-
sualization for Communication (VisComm) at IEEE VIS (2019). URL:
https://parametric.press. 2
[CKH19]
CONLEN M., KALE A., HEER J.: Capture & analysis of ac-
tive reading behaviors for interactive articles on the web.
Computer
Graphics Forum (Proc. EuroVis) (2019).
URL: http://idl.cs.
washington.edu/papers/idyll-analytics. 1, 2, 3, 9
[CVTH21]
CONLEN M., VO M., TAN A., HEER J.:
Idyll studio: A
structured editor for authoring interactive & data-driven articles. In The
34th Annual ACM Symposium on User Interface Software and Technol-
ogy (2021), pp. 1–12. 2
[DJS∗19]
DRAGICEVIC P., JANSEN Y., SARMA A., KAY M., CHEVA-
LIER F.: Increasing the transparency of research papers with explorable
multiverse analyses. In Proceedings of the 2019 CHI Conference on Hu-
man Factors in Computing Systems (2019), pp. 1–15. 1
[DRDE20]
DRAKE H. F., RIVEST R. L., DEUTCH J., EDELMAN A.: A
multi-control climate policy process for a trusted decision maker. 9
[FMVG15]
FREDERICK
D.,
MOHLER
J.,
VORVOREANU
M.,
GLOTZBACH R.:
The effects of parallax scrolling on user experi-
ence in web design.
Journal of Usability Studies 10, 2 (2015).
2,
3
[GB19]
GREUSSING E., BOOMGAARDEN H. G.: Simply bells and whis-
tles? cognitive effects of visual aesthetics in digital longforms. Digital
Journalism 7, 2 (2019), 273–293. 3
[GMC11]
GOMES D., MIRANDA J., COSTA M.:
A survey on web
archiving initiatives. In International Conference on Theory and Prac-
tice of Digital Libraries (2011), Springer, pp. 408–420. 2
[HCHC20]
HOHMAN F., CONLEN M., HEER J., CHAU D. H. P.: Com-
municating with interactive articles. Distill 5, 9 (2020), e28. 1, 2, 10
[Hee19]
HEER J.: Agency plus automation: Designing artiﬁcial intelli-
gence into interactive systems. Proceedings of the National Academy of
Sciences 116, 6 (2019), 1844–1850. 10
[Hee21]
HEER J.:
Fast & accurate gaussian kernel density estima-
tion.
In IEEE VIS Short Papers (2021).
URL: http://idl.cs.
washington.edu/papers/fast-kde. 9
[HLL20]
HOFFSWELL J., LI W., LIU Z.: Techniques for ﬂexible respon-
sive visualization design. In Proceedings of the 2020 CHI Conference on
Human Factors in Computing Systems (2020), pp. 1–13. 2
[HLM09]
HURST N., LI W., MARRIOTT K.: Review of automatic doc-
ument formatting. In Proceedings of the 9th ACM symposium on Docu-
ment engineering (2009), pp. 99–108. 3
[JLS∗04]
JACOBS C., LI W., SCHRIER E., BARGERON D., SALESIN
D.:
Adaptive document layout.
Communications of the ACM 47, 8
(2004), 60–66. 3
[KJRK21]
KIM N., JOYNER S., RIEGELHUTH A., KIM Y.: Accessible
visualization: Design space, opportunities, and challenges. In Computer
Graphics Forum (2021), vol. 40, Wiley Online Library, pp. 173–188. 2,
10
[KRH17]
KIM Y.-S., REINECKE K., HULLMAN J.: Explaining the gap:
Visualizing one’s predictions improves recall and comprehension of data.
In Proceedings of the 2017 CHI Conference on Human Factors in Com-
puting Systems (2017), pp. 1375–1386. 1
[KW12]
KELLY M., WEIGLE M. C.:
Warcreate: create wayback-
consumable warc ﬁles from any webpage. In Proceedings of the 12th
ACM/IEEE-CS joint conference on Digital Libraries (2012), pp. 437–
438. 2
[LRIC15]
LEE B., RICHE N. H., ISENBERG P., CARPENDALE S.: More
than telling a story: Transforming data into visually shared stories. IEEE
computer graphics and applications 35, 5 (2015), 84–90. 2
[Mac13]
MACFARLANE J.:
Pandoc: a universal document converter.
URL: http://pandoc. org (2013). 8
[May02]
MAYER R. E.: Multimedia learning. In Psychology of learning
and motivation, vol. 41. Elsevier, 2002, pp. 85–139. 1, 2
[MB81]
MÜLLER-BROCKMANN J.: Grid systems in graphic design. Ver-
lag Gerd Hatje, 1981. 3
[MHRL∗17]
MCKENNA S., HENRY RICHE N., LEE B., BOY J.,
MEYER M.: Visual narrative ﬂow: Exploring factors shaping data visual-
ization story reading experiences. In Computer Graphics Forum (2017),
vol. 36, Wiley Online Library, pp. 377–387. 1, 2, 3
[MKS08]
MOHR G., KUNZE J., STACK M.: The warc ﬁle format 1.0
(iso 28500). 2
[obs]
Observable - Explore, analyze, and explain data. As a team. URL:
https://observablehq.com/. 9
[OC17]
OLAH C., CARTER S.:
Research debt.
Distill (2017).
https://distill.pub/2017/research-debt.
doi:10.23915/distill.
00005. 1

M. Conlen & J. Heer / Fidyll: A Compiler for Cross-Format Data Stories & Explorable Explanations
12
[OJ07]
OLSEN JR D. R.:
Evaluating user interface systems research.
In Proceedings of the 20th annual ACM symposium on User interface
software and technology (2007), pp. 251–258. 8
[PKSP∗20]
PARSHINA-KOTTAS
Y.,
SAGET
B.,
PATANJALI
K.,
FLEISHER O., GIANORDOLI G.: This 3-d simulation shows why social
distancing is so important. New York Times (2020). 1
[Poo05]
POOLE K. T.: Spatial models of parliamentary voting. Cam-
bridge University Press, 2005. 9
[PR85]
POOLE K. T., ROSENTHAL H.: A spatial model for legislative
roll call analysis. American journal of political science (1985), 357–384.
9
[pup]
Puppeteer. URL: https://pptr.dev/. 8
[Ros01]
ROSLING H.: Hans rosling shows the best stats you’ve ever seen.
2
[RSP∗16]
RALL K., SATTERTHWAITE M. L., PANDEY A. V., EMER-
SON J., BOY J., NOV O., BERTINI E.: Data visualization for human
rights advocacy. Journal of Human Rights Practice 8, 2 (2016), 171–
197. 1
[SCBL21]
SULTANUM N., CHEVALIER F., BYLINSKII Z., LIU Z.:
Leveraging text-chart links to support authoring of data-driven articles
with vizﬂow. In Proceedings of the 2021 CHI Conference on Human
Factors in Computing Systems (2021), pp. 1–17. 2
[SH10]
SEGEL E., HEER J.: Narrative visualization: Telling stories with
data. IEEE transactions on visualization and computer graphics 16, 6
(2010), 1139–1148. 1, 2, 9
[SH14]
SATYANARAYAN A., HEER J.: Authoring narrative visualiza-
tions with ellipsis. In Computer Graphics Forum (2014), vol. 33, Wiley
Online Library, pp. 361–370. 2
[SMWH16]
SATYANARAYAN A., MORITZ D., WONGSUPHASAWAT K.,
HEER J.: Vega-lite: A grammar of interactive graphics. IEEE transac-
tions on visualization and computer graphics 23, 1 (2016), 341–350. 2
[SRHH15]
SATYANARAYAN A., RUSSELL R., HOFFSWELL J., HEER
J.: Reactive vega: A streaming dataﬂow architecture for declarative in-
teractive visualization. IEEE transactions on visualization and computer
graphics 22, 1 (2015), 659–668. 2
[STEG15]
STRICKLAND M., TSE A., ERICSON M., GIRATIKANON T.:,
2015. URL: http://archieml.org/. 2
[TMB02]
TVERSKY B., MORRISON J. B., BETRANCOURT M.: Anima-
tion: can it facilitate? International journal of human-computer studies
57, 4 (2002), 247–262. 3, 10
[Vic11a]
VICTOR
B.:
Explorable
explanations.
http:
//worrydream.com/ExplorableExplanations/,
2011.
2
[Vic11b]
VICTOR B.:
Explorable explorations.
URL: http://
worrydream.com/ExplorableExplanations/. 3
[ZOM19]
ZHI Q., OTTLEY A., METOYER R.: Linking and layout: Ex-
ploring the integration of text and visualization in storytelling. In Com-
puter Graphics Forum (2019), vol. 38, Wiley Online Library, pp. 675–
685. 3
