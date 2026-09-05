# Dashboard Design Patterns

- **id:** dashboard-design-patterns-2022
- **list:** frontend
- **authors:** Benjamin Bach, Euan Freeman, Alfie Abdul-Rahman, Cagatay Turkay, Saiful Khan, Yulei Fan, Min Chen
- **year:** 2023
- **venue:** IEEE TVCG (VIS 2022)
- **oa_url:** https://arxiv.org/pdf/2205.00757.pdf
- **arxiv:** 2205.00757
- **local_pdf:** pdf/dashboard-design-patterns-2022.pdf

## Extracted text (local RAG ingest)

Dashboard Design Patterns
Benjamin Bach, Euan Freeman, Alﬁe Abdul-Rahman, Cagatay Turkay, Saiful Khan, Yulei Fan, and Min Chen
Fig. 1. Summary of our eight groups of design patterns. Detailed descriptions of each pattern can be found on our website:
https://dashboarddesignpatterns.github.io/patterns.html.
Abstract—This paper introduces design patterns for dashboards to inform dashboard design processes. Despite a growing number of
public examples, case studies, and general guidelines there is surprisingly little design guidance for dashboards. Such guidance is
necessary to inspire designs and discuss tradeoffs in, e.g., screenspace, interaction, or information shown. Based on a systematic
review of 144 dashboards, we report on eight groups of design patterns that provide common solutions in dashboard design. We
discuss combinations of these patterns in “dashboard genres” such as narrative, analytical, or embedded dashboard. We ran a 2-week
dashboard design workshop with 23 participants of varying expertise working on their own data and dashboards. We discuss the
application of patterns for the dashboard design processes, as well as general design tradeoffs and common challenges. Our work
complements previous surveys and aims to support dashboard designers and researchers in co-creation, structured design decisions,
as well as future user evaluations about dashboard design guidelines. Detailed pattern descriptions and workshop material can be
found online: https://dashboarddesignpatterns.github.io
Index Terms—Dashboards, Design Patterns, Data Visualization, Storytelling, Visual Analytics, Qualitative Evaluation, Education
1
INTRODUCTION
Dashboards offer a curated lens through which people can view large
and complex data sets at a glance [20,33]. They combine visual rep-
resentations and other graphical embellishments to provide layers of
abstraction and simpliﬁcation for numerous related data points, so that
viewers get an overview of the most important or relevant information,
in a time-efﬁcient way. Their ability to provide insight at a glance has
• Benjamin Bach is with the University of Edinburgh.
E-mail: bbach@inf.ed.ac.uk.
• Euan Freeman is with the University of Glasgow.
E-mail: euan.freeman@glasgow.ac.uk.
• Alﬁe Abdul-Rahman is with King’s College London.
E-mail: alﬁe.abdulrahman@kcl.ac.uk.
• Cagatay Turkay is with the University of Warwick.
E-mail: cagatay.turkay@warwick.ac.uk.
• Saiful Khan, Yulei Fan, and Min Chen are with the University of Oxford.
E-mail: saiful.khan@eng.ox.ac.uk, yulei.fan@eng.ox.ac.uk,
min.chen@oerc.ox.ac.uk.
Manuscript received xx xxx. 201x; accepted xx xxx. 201x. Date of Publication
xx xxx. 201x; date of current version xx xxx. 201x. For information on
obtaining reprints of this article, please send e-mail to: reprints@ieee.org.
Digital Object Identiﬁer: xx.xxxx/TVCG.201x.xxxxxxx
led to dashboards being widely used across many application domains,
such as business [20,38], nursing and hospitals [8,17,30,37,53,53], pub-
lic health [35], learning analytics [12], urban analytics [36], personal
analytics, energy [23] and more, summarized elsewhere [20,41,44,54].
These examples, designed mainly for domain experts, have since been
complemented by dashboards for public health or political elections,
designed for a more general audience and disseminated through news
media [55] or dedicated dashboard and tracker websites [5,14,48].
There are many informative high-level guidelines on dashboard
design, including advice on visual perception, reducing information
load, the use of interaction, and visualization literacy [17,20,41,54].
Despite this, we know little about effective and applicable dashboard
design, and about how to support rapid dashboard design. Dashboard
design is admittedly not straightforward: designers have access to
numerous data streams, which they can process, abstract, or simplify
as they see ﬁt; they have a wide range of visual representations at
their disposal; and they can structure and present these visualizations
in numerous ways, to take advantage of the large screens on which
they are viewed (vs. individual plots that make more economic use
of space). These choices can be overwhelming, so there is a timely
need for guidance about dashboard design—especially as dashboards
are increasingly being designed for a wider non-expert audience by
designers without a background in visualization or interface design.
arXiv:2205.00757v2  [cs.HC]  24 Aug 2022

In this work, we analyze the visual design of 144 dashboards, to bet-
ter understand the patterns and design practices used by dashboard de-
signers. By coding these dashboards, we formalized 42 design patterns
(Fig. 1) that describe common solutions to design decisions (Sect. 3).
We group the patterns into two high-level groups: content patterns
that describe what information is shown (data information, meta data,
visual representation) and composition patterns that describe how com-
ponents are laid out across one or many dashboard pages (page layout,
screenspace, structure, interaction, color). We then describe six ‘gen-
res’ of dashboard (Sect. 4) with shared characteristics and common
design patterns. These can be related to other genres of information
visualization, such as Multiple Coordinated View systems [42] or in-
fographics. Our review and pattern collection help us discuss design
tradeoffs (Sect. 5) and discuss possible design frameworks (Sect. 7).
To better understand the role these design patterns and types play
in the dashboard design process, we ran a two-week dashboard design
workshop (Sect. 6) with 23 participants. Participants were a mixture
of advanced and novice designers and span a variety of backgrounds,
both from the academic, public, and private sectors. Participants came
with their data and dashboard challenge which we used for group dis-
cussions. During the workshop and regular drop-in sessions, most
participants worked on dashboard design mockups in the collaborative
design platform Figma while others directly designed in tools such as
Tableau or Power BI. The workshop showed that our pattern collec-
tion and the associated terminology provided a useful framework to
streamline dashboard design for both novice and advanced designers
during both, individual and co-design. Discussions revealed challenges
in balancing the amount of information shown, designing for a speciﬁc
audience, and how to best contextualize the information shown.
Our ﬁndings extend prior knowledge about, e.g., dashboard data char-
acteristics [51], and the intended audience and use of dashboards [44].
We provide valuable insight into dashboard design, leading to appli-
cable design knowledge that can inform and inspire the creation of
future dashboards and dashboard creation tools, help teach dashboard
design, and potentially guide structured evaluations into the effec-
tiveness of individual dashboards. A detailed description of all our
design patterns, design guidance and the workshop are available online
https://dashboarddesignpatterns.github.io.
2
DASHBOARD DESIGN: BACKGROUND
2.1
Characterizing Dashboards
There are many deﬁnitions that describe the essential characteris-
tics of dashboards, often exposing opposing views and design guide-
lines [20,21,44]. At a high level, dashboards have been described as
tip of the iceberg, providing a birds-eye-view about what a user needs
to know [54]. Few [20] highlights four key aspects in describing dash-
boards as “a visual display of the most important information needed
to achieve one or more objectives; consolidated and arranged on a
single screen so that the information can be monitored at a glance”
(emphasis ours). Similarly, Kitchin [33] echoes that dashboards do not
simply reﬂect data, but are a purposefully created lens through which
data must be seen and can be engaged with: “a dashboard seeks to
act as a translator, not simply a mirror, setting the forms and param-
eters for how data are communicated and thus what the user can see
and engage with.”. Other deﬁnitions include the provision of metrics
resulting from data analysis, the display of dynamic information, and
the ability to provide drill-down capabilities for data exploration [41].
Elsewhere, Few [21], distinguishes between dashboards for monitoring
(usually static) and dashboards for analytical tasks (Faceted Analyti-
cal Displays) which are most similar to Multiple Coordinate Views
systems, in that they combine multiple interactive charts and tables.
This differentiation is essential because it implies a tradeoff between (i)
the amount and level of detail of information that can comfortably ﬁt
a single screen view and (ii) the effort required to access and explore
these data through interaction.
Dashboards have been reported to serve a range of purposes. They
can be designed to support decision making at an executive level (strate-
gical), summarize data about departments (tactical), and provide infor-
mation for front-line workers (operational) [40]. They can also provide
consistency with respect to key performance indicators within an or-
ganization, help monitor performance, facilitate planning, and support
communication [39]. Through an extensive survey of 83 dashboards,
Sarikaya et al. [44] grouped dashboards into interactive dashboards
(mostly from BI), static dashboards, dashboards for motivation, and
for learning and personal analytics. This diverse set of usage goals
suggests different solutions that suit the audience, context, and tasks.
Although there is a lack of consensus over what exactly should be
considered a dashboard (versus, e.g., a Faced Analytical Display [21]),
it is clear that dashboards play many roles in their viewers’ personal
or professional lives. In this work, we are open-minded about what a
dashboard can be to give wider insight into the design possibilities.
2.2
Design Guidelines
There is agreement among many case studies and scholars that a
dashboard: should not overwhelm users [54]; should avoid visual
clutter [20]; should avoid poor visual design and carefully chose
KPIs [40]; should align with existing workﬂows [19]; should not
show too much data [27]; should have both functional features (i.e.,
what the dashboard can do) and visual features (i.e., how information is
presented) [54]; should provide consistency, interaction affordances
and manage complexity [44]; and should organize charts symmet-
rically, group charts by attribute, clearly separate these groups of
charts and order charts according to time [8].
Such guidelines can help to inform design at a high level and draw
heavily from general knowledge on perception, visualization, and infor-
mation architecture. For other design decisions, there is less consensus
as they require tradeoffs. For example, When do we show number val-
ues and tables, and when do we show visualizations? [54]; How much
interaction do we include in a dashboard? [4]; How much information
to include in a single page? How to personalize a dashboard? [50]
Does all the content of a dashboard have to ﬁt a single screen size and,
if so, how do we deal with different screen sizes? We could not ﬁnd
these questions covered in the literature, and our collection of design
patterns aims to complement these high-level guidelines by providing
an actionable oversight of solutions used in the wild. Critically for HCI,
dashboards have reportedly [40] been rejected by executives on the
basis of them not having been involved in the design process, highlight-
ing the need for a user-centered, iterative design process with a shared
understanding of concrete design options.
Closest to our work is a set of visual features identiﬁed by Sarikaya
et al. [44], describing solutions such as multipage dashboards, anno-
tations, and interactive features. While the authors explicitly did not
aim for an extensive report on these features, they report on a range of
dashboard designs that take inspiration and features from infographics
and other storytelling genres. Our dashboard corpus extends theirs
with contemporary examples of dashboards and we see our work as an
extension of their pioneering work.
2.3
Design Patterns
A design pattern generally describes a common solution for a recurrent
problem. Other than design spaces or taxonomies, design patterns are
not exclusive constructs but can be combined and exist independently
from each other. Design pattern collections are often used in classrooms
and for education [1–3,18]. Pattern collections have been created for
visualization, including Card and Mackinlay [11], Chen [13], He et
al. [24], Schulz et al. [45], and Sedig et al. [46]. These collections
show the breadth of visualization design options and can support de-
signers in making deliberate choices, e.g., about tasks [45]. Design
patterns have also been identiﬁed for more specialized forms of vi-
sualization, including graphical abstracts [26], data comics [7], and
sketchnotes [56]. Our design patterns for dashboards complement these
existing collections and are speciﬁc in that they are derived from anal-
ysis of 144 dashboards. Our patterns are purely descriptive in that
they capture existing solutions and can serve as speculation tools in
the design process and discussion, as well as providing a resource for
concepts that can inform the structured evaluation of dashboards, a
current gap in the literature.

3
DASHBOARD DESIGN PATTERNS
We gathered a corpus of 144 dashboards by starting with the 83 dash-
boards collected by Sarikaya et al. [44] but discarding three due to lack
of clarity or context. We then added 64 new dashboards found on news
websites and personal applications. 36 of these dashboards were related
to Covid-19 due to recent public interest. We also included a wide
variety of applications (e.g., health and ﬁtness, personal informatics,
transport, energy, ﬁnance), but given the sheer number and contexts of
dashboards, any sampling method is necessary limited.
Three of the authors then created independent coding schemes by
qualitatively analyzing the dashboards in the corpus using the constant
comparative method [22]. Where available, we coded the interactive
version of the dashboard (61%). These schemes were reﬁned and con-
solidated with the help of another three additional coders not involved
in the initial scheme. Our focus was on coding the structure, visual
design, and interactivity of the dashboards—a key distinction between
this and prior work, which, e.g., focused on the intentions of the dash-
boards [44]. Also, our goal was not to create an exhaustive taxonomy
of dashboard design options, but for the ﬁrst time to describe the user
interface building blocks. Our ﬁnal coding describes 42 design patterns,
grouped into eight categories, which are divided as follows:
• Dashboard CONTENT (Sect. 3.1): how the data are abstracted (Data
Information), what Meta Information is included, and what Visual
Representations are used;
• Dashboard COMPOSITION (Sect. 3.2): the Page Layout of compo-
nents, solutions to ﬁt information into available Screenspace, the
Structure of information across pages, what Interactions are sup-
ported, and the purposeful use of Color.
The following section describes these groups of design patterns
(Fig. 1). Detailed description for each pattern can be found on our
website. Percentages in the following sections indicate the percentage
of dashboards where each pattern has been observed; these may not
add up to 100% since the patterns are not mutually exclusive. Numbers
preceded by a #-sign, refer to examples in our collection (see website).
3.1
Content Design Patterns
The CONTENT of a dashboard is made up of individual dashboard
elements, the crucial ‘ingredients’ relating to the data and its presenta-
tion. We identiﬁed three groups of design patterns relating to content:
data information, meta information, and visual representation of
data. We disregard visual components used purely for decoration or
embellishment, e.g., illustrative pictures, dividers, borders.
3.1.1
Data Information Patterns
This group of patterns identiﬁes the types of information presented
and the extent of abstraction used. We found that information pre-
sented roughly ranged from detailed datasets that offer a more complete
view of the data, to more abstracted forms that simplify and reduce
the amount of information shown (e.g., individual aggregated values,
trends). Starting with more complete data, we found detailed data sets
(94%) which provide the most complete view. Aggregation
(67%), ﬁltering
(42%), and derived values
(69%) provide
purposeful summaries of data using summarizing or analysis, e.g., to
calculate trends and other measures. Thresholds
(21%) indicate
states and values that bear some meaning, such as ‘good’ or ‘bad’. For
example, a threshold being passed or data within a speciﬁc band or
category. A single value
(88%) of a larger data set an be shown,
e.g., the most recent value from a time series.
3.1.2
Meta Information Patterns
Meta information patterns capture additional information used to pro-
vide context and explanation. In some cases, this is implicitly under-
stood from the context the dashboard is used in, e.g., the current date,
or data released by a speciﬁc organization. In the following, the ﬁrst
percentage values refers to only dashboards with explicit meta infor-
mation, the 2nd number includes examples where meta data can be
(a) Pictograms as data (#85, #37) and index (#102).
(b) Gauges and progress bars with accom-
panying numbers (#19, #99, #16).
(c) Miniature charts (#108, #5)
(d) Table (#93), data list (#95), text list (#93).
Fig. 2. Examples of visual language used in dashboard to show data.
implicitly understood from the dashboard context. We found 9% of
dashboards showed no meta information.
We found indications of: data sources
(41%/69%); disclaimers
(38%) informing about data processing and context; data descrip-
tions
(44%/57%) explaining what the dashboard shows; update
information
(64%/73%) with timestamps; and annotations
(10%), which includes extra graphical embellishments added by the
designer to highlight speciﬁc points, changes, developments, etc.
3.1.3
Visual Representation Patterns
We found a wide range of visual representations that, like Data In-
formation patterns can correspond to varying degrees of abstraction.
For example, tables
(42%, Fig. 2(d)-middle), lists
(9%), and
detailed visualizations
(88%) can provide very detailed informa-
tion and allow viewers to read precise values. Detailed visualizations
act as standalone components with proper axis labeling, legends, and
resolution. They can span between 1/3 to the full width or height of
a dashboard and can be accompanied by numbers and trend arrows
(see below). Miniature charts
(21%), on the contrary, are small
and concise visualizations without axis descriptions, labels, or tick-
marks. The idea is to give a quick understanding of a trend, akin
to sparklines [49], rather than allowing the reading of precise values.
Fig. 2(c) shows examples of miniature charts, all reduced versions of
common visual representations.
More abstract visual encodings include Gauges & progress bars
(17%) that visualize a single value within its context (e.g., percent-
age). Speciﬁc solutions include semi-circular gauges, linear progress
bars, thermometers (Fig. 2(b)). Some gauges come with an indication
of ‘critical’ ranges, i.e,. a threshold
indicating if values are pos-
itive/negative. Pictograms
(19%) are abstract representations or
symbols that illustrate concepts on the dashboard. Their usage can
(i) represent data (pictogram-as-data) such as the existence of a value
(Fig. 2(a)-left) and a quantity through “ﬁlled pictograms” (Fig. 2(a)-
middle); or (ii) act as indices (pictograms-as-index) that designate the
type of a data value found close to the pictogram (Fig. 2(a)-right), but
not conveying speciﬁc data information. Trend-arrows
(13%) are
small arrows pointing up/down and are used to indicate the direction
of change in a data value. They can be binary or include variations in
slope. Finally, numbers
(62%) are numerical representations of
individual values, placed prominently on a dashboard and mostly used
to indicate single values, thresholds, or derived values (Fig. 2(b)).

3.2
Composition Design Patterns
The COMPOSITION of a dashboard determines how its individual con-
tent components are combined and presented. Dashboards show multi-
ple information elements and their structure and layout on a page are
meaningful design decisions. We identiﬁed ﬁve aspects of composition:
the page layout of components, the methods used to ﬁt the dashboard
to the available screenspace, the structure of content across multiple
pages, the range of interactions supported by the dashboard, and the
color scheme used by each dashboard.
3.2.1
Page Layout Patterns
Page layout patterns describe how widgets are laid out and, often, im-
plicitly grouped in a dashboard. There are many layout classiﬁcations
for information graphics, e.g., for graphical abstracts [26] (linear, cir-
cular, zig-zag, forking, nesting, parallel, orthogonal, centric, free),
infographics [7] (large panel, annotated, tiled, grouped, grid, parallel,
network, branched, linear), or sketchnotes [56] (freeform, grid, radial,
linear). Here we identify the most prevalent page high-level layout
patterns found in our dashboard corpus.
When describing page layout patterns, we deﬁne a widget as individ-
ual layout components, usually ﬁguring one or a combination of visual
representations, a title, and possible meta information. Many dash-
boards group information and their visual representations (Sect. 3.1.3)
hierarchically and it is notoriously hard to create a clear deﬁnition of
grouping in any visual composition. For example, the ﬁrst dashboard
in Fig. 3 combines numbers, gauges, and pictograms together to form
a speciﬁc form of complementary information grouping; the pictogram,
number and gauge all relate to the same piece of information or at
least can be understood as a semantic-visual unit aiming for a speciﬁc
task. With our page layout patterns, we consider how these higher-level
widgets are organized in a single page, identifying the prominent layout
decision used to group a potentially large set of content components.
Fig. 3. Examples of different dashboard page layouts: open #19, stratiﬁed
#11, table #5, grouped #88.
Open layouts
(22%) place widgets (possibly of different sizes
and aspect ratios) in an open way without apparent speciﬁc rules. Often
widgets are aligned on a grid (Fig. 3-#1) following classical design
guidelines. There is no strong semantic associated with the location and
adjacency of widgets and each widget seems to have equal importance.
Stratiﬁed layouts
(49%) present widgets in a top-down ordering.
A stratiﬁed layout can be used to emphasize information on the top
(Fig. 3-#2) over other information. Table layouts
(19%) align wid-
gets into semantically meaningful columns and rows. They can be used
to repeat information and visual encoding, e.g., across different facets
or data items (Fig. 3-#3). Table layouts make it easy to retrieve and
relate information. Grouped layouts
(33%) group two or more
widgets with a speciﬁc relation, in many cases labeled by a common
title. Grouping can be achieved through e.g., Gestalt laws of proxim-
ity or closure. Finally, schematic layouts
(1%) place widgets in
some schematic relationship such as a physical-spatial layouts (#59),
networks (#42), or possibly process-workﬂows.
We emphasize that none of these page layout patterns are exclusive
and combinations are common. For example, the second dashboard in
Fig. 3 shows a stratiﬁed layout (pictograms on the top, visualizations
on the bottom), combined with an open layout. Similarly, the fourth
dashboard in the same ﬁgure combines a stratiﬁed layout with a grouped
layout, emphasizing the key indicators on top.
3.2.2
Screenspace Patterns
Screenspace patterns describe solutions used to ﬁt content onto a single
screen. We call these screens pages as content can be split across
multiple pages or overﬂow a screen. However, at any given time, only
a single page is visible to the viewer.
Screenﬁt
(44%) means that all content of a page ﬁts the screen
without the need for interactions like scrolling or tooltips. This is the
standard solution for concise static dashboards. Overﬂow
(22%)
allows a page to be larger than the screenspace available. Overﬂows are
usually explored through vertical scrolling and there is potentially no
limit to the size of the overﬂow. Detail on demand
(47%) shows
extra content on, e.g., mouseover through tooltips, open pop-ups on
clicking buttons or widgets, or giving access to more data without
needing to ﬁt alongside other content. Parameterization
(52%)
is a further means of deﬁning the information visible, e.g., showing
more data, or specify ﬁlters on a dataset. Parameters can be set through
sliders, checkboxes, or drop-down menus. Other than overﬂow
and
detail-on-demand
, parameterziation can show potentially very large
and multifaceted data sets, but require manual speciﬁcation and can
typically only show one state at a time. Both, detail-on-demand and
parameterization help making decisions about the use of screenspace—
notably by hiding data and revealing it back through interaction such
as exploration or drilldown, discussed in Sect. 3.2.4). Multiple pages
(42%) splits content across multiple separate pages which are ob-
tainable through navigation patterns (see Sect. 3.2.4).
Fig. 4. Example of a tabbed dashboard (#83). Tabs show a similar view
with different data (e.g., Covid-19 deaths and cases here); multiple pages
allows a screenﬁt design through reduced information on any one page.
3.2.3
Structure Patterns
Structural patterns capture relations between multiple pages
of a
dashboard, if there are multiple pages. In the most simple case, a
dashboard has a single page
(61%), which can imply the need
for screenspace patterns such as overﬂow, details-on-demand, or pa-
rameterization to ﬁt the desired content into a single page or screen.
Multiple pages can exist through relationships between these pages. A
parallel structure
(16%) can imply repetition of the layout, data,
and visual representations, e.g., across different courses in a university,
or departments in a company. A parallel structure can be combined
with hierarchical, e.g., in case of geographic regions which have a po-
litical hierarchy but otherwise show similar information. Hierarchical
structures
(19%) are used for drill-down and can result in a series
of pages, each gradually showing more detail.
Open structures
(8%) capture other kinds of structural relation-
ships.
3.2.4
Interaction Patterns
This pattern group describes common interaction approaches found
within dashboards. Interaction routines manifest themselves through in-
teractive data entities, i.e., data as the interface, user interface elements,
as well as window-level interactions. The patterns we highlight in this
group refer to common roles that interaction could play in dashboard
use, expressed through speciﬁc user interface components. These are
deﬁned broadly, to identify general usage patterns and how they can be
implemented through dashboard designs. Only 4% of dashboards in
our corpus had no interaction. We found four major uses of interaction
in dashboards, supported through an often overlapping range of UI
components, such as tabs, sliders, drop-down menus, etc.
Exploration
(89%) interactions allow users to explore data ele-
ments, obtain new data, look at data differently and explore relations
between data. Exploration can take on many forms, including brush-
ing + linking (18%) [10] that link data representations across different
views. Details of individual or groups of items can also be revealed
through interactive features, e.g., pop-ups with details, a table enlisting

data features, etc (71%). In contrast, Drilldown
(55%) allows view-
ers to ﬁnd or focus on speciﬁc data, i.e., features a user is interested in
during a speciﬁc task. Examples include searching for particular data
values or applying ﬁltering criteria so that only relevant information
remains. These interactions are typically facilitated by user interface
elements, like text ﬁelds, drop-down menus, radio buttons and check-
boxes. Navigation
(76%) enables navigation between pages of a
dashboard or screen features of the dashboard created by the dashboard
designer. Navigation can be supported through scrollbars, navigation
buttons, page tabs, hyperlinks, etc. Eventually, interactions for Per-
sonalization
(23%) allow viewers to redeﬁne and reconﬁgure the
information shown within a dashboard based on personal preferences
and task needs. Interactions can add new visual representations, e.g.,
choosing a new data feature to be visualized, resize, or reorder the
existing encodings within the dashboards, leading to more bespoke
dashboard conﬁgurations.
3.2.5
Color Patterns
Color is an important visual variable in visualization. While it can
be used for different purposes in dashboards and comes with cultural
implications, we examined the use of color at dashboard-level—i.e.,
across multiple widgets and views.
Shared color schemes
(35%) give unique recognizable colors
to groups or facets in the data. This helps maintaining consistency and
familiarity across throughout the entire dashboard (e.g., Fig. 4).
Data Encoding
(80%) color schemes use colors primarily as
a visual variable to encode categories or scales within the data, e.g.,
displaying values with color on a choropleth map (#5 in Fig. 3). Se-
mantic
(26%) colors indicate speciﬁc good-bad semantics, such
as the trafﬁc light schemes to indicate status or statuses of patients in a
health related dashboards. Semantic coloring is often in conjunction
with gauges and progressbars for indicating multiple meaningful thresh-
olds. Emotive
(6%) color schemes can add aesthetic strength and
develop an emotive response in viewers [28]. This use of color within
dashboards seems particularly common in dashboards that resemble
infographics (see next section, e.g., #19, #60).
4
DASHBOARD GENRES
During our analysis of the dashboard corpus, we realized six dashboard
types that can be seen as design genres, because they share characteris-
tics, combinations of design patterns, contexts, or speciﬁc goals. After
describing an initial set of genres and creating a respective codebook,
we again applied structured coding to cover all the dashboards in our
collection. Coding was done by two independent coders coding each
dashboard independently. We disagreed on 32 dashboards (22%) but
resolved all disagreement in discussion, reﬁning the respective genre
deﬁnitions. Similar to the storytelling genres by Segel and Heer [47],
we focus on the existence of a genre and the design tradeoffs, rather an
exclusive taxonomy. These genres can invite discussion about how a
speciﬁc pattern has been put into practice through dashboard design,
can be used in design exploration, and can inform discussion about the
‘right’ dashboard design for a given context.
Static Dashboard (21%)—By static dashboard, we refer to the
traditional notion of a dashboard as a static (no-interaction), single
page
, screenﬁt
display of information. Static dashboards often
feature concise information and representation such as single-values
and derived values
, miniature charts
, arrows
, and numbers
(Fig. 3–left (#19)). We did not ﬁnd many examples of classic static
dashboards, which we attribute to the fact that contemporary dashboards
are digital and it is easy to support interaction and drill-down tasks
through more complex structures. Likewise, there is a large range
of display sizes from desktop computers and tablets, to mobiles that
encourage responsiveness (e.g., use of overﬂow to utilize screenspace
or a multi-page structure).
Analytic dashboards (73%)—This genre is what Few would call
a Faceted Analytic Display [21]. We see parallels to the concept
of Coordinated Multiple Views (CMV) [42], while there are clear dif-
ferences between both concepts: by deﬁnition, the focus in CMVs is on
coordination and individual views react to interaction in another view
Fig. 5. Example of an infographic style dashboard (#74).
to give complementary views for the task. In contrast, a dashboard
can have multiple views without any shared data, information, or in-
teraction; each view can be entirely independent and not required for
a common task. Analytic dashboards generally use complete visual-
izations
and tables
to show larger and more detailed data sets
.
Many of these views are fully interactive, providing for exploration
,
navigation
, and drilldown
. These dashboards can also provide
parameterization
, and tabs
or other linking mechanisms to switch
between multiple pages of the dashboard. Importantly, these dash-
boards generally do not use overﬂow
pagination, since scrolling
complicates comparing visualizations.
Magazine Dashboards (2%)—Many dashboards relating to
Covid-19, climate change, politics, etc were created by news agen-
cies and similar media outlets. These dashboards are found as integral
part of journalistic articles and resemble visualizations of the magazine
genre [47]. The text provided alongside visualizations goes beyond
basic meta information to provide additional commentary and story-
telling about the data. These dashboards are often broken into several
pages and have an overﬂow
use of screenspace on a single page
,
with visualizations positioned at appropriate points in the text to tell a
story about what the data shows. Magazine dashboards can feature
very detailed visualizations
and tables
. The Economist Covid-19
tracker (#131) is an example that provides viewers with a snapshot of
Covid-19 cases and deaths across Europe, with tables, timeseries, trend
lines and spike maps interleaved with narrative text. In addition to
regular visualization updates, written content is also frequently updated
as the ‘story’ changes, e.g., responding to emerging trends, the effects
of vaccination, etc. These dashboards naturally require more effort to
design and maintain; whilst visualizations may update automatically
as the data changes, editorial oversight is necessary to ensure the story
remains consistent with the changing data and its visual representation.
Infographic Dashboards (6%)—We also found examples of
dashboards similar to infographics that include decorative graph-
ical elements and other non-data ink shown alongside data represen-
tations. Similar to magazine dashboards, they use non-data media to
annotate and embellish data. For example, Fig. 5 shows an infographic
style dashboard that uses text, annotations and other embellishments to
enhance data presentation and, in turn, help the data to convey a story.
Other examples include less artistic content, while being presented more
as posters (e.g., #33, #34). Infographic dashboard can feature catchy
gauges
, pictograms
, numbers
, and detailed visualizations
.
Infographic dashboards were mostly used to represent static
datasets; e.g., presenting snapshots of key data on a monthly or yearly
basis. Often these infographics exceeded the vertical screen-space and
could be explored through scrolling (overﬂow)
. The artistic content
of infographic dashboards may require additional design time and
chosen annotations and embellishments will be tailored to particular
data points, so are less suited for dynamic dashboard use where data
changes often. These dashboards may thus have a different intended
use, with an audience expected to discover them over a longer period
of time, rather than checking for frequent updates.

Repository Dashboards (17%)—We found several examples that list
a multitude of charts across multiple pages
, with overﬂow
struc-
ture that impedes proper analytics, i.e., comparing views. The charts
can be very detailed
and often lack any textual explanations,
except for meta data information (which is often extensive). Charts
may provide some interaction and usually provide links to explore
,
drilldown
, and eventually download open data. Data and visualiza-
tions are updated regularly, while choosing very common visualizations
and numbers, and parameterization
to select data sets. Extensive
meta information is often provided for transparency. Examples in-
clude repositories from governmental and academic institutions, like
Our-world-in data [43] or Public Health Scotland (#109).
Embedded Mini Dashboards (4%)—Some dashboards were
found to be embedded into other applications such as news web-
sites. These concise dashboards only occupied a small area on screen
and usually come with concise visualizations (
). Mini dash-
boards requires interactive features for navigation
and to parameter-
ize the content quickly
. Fig. 4 shows an example of a mini dashboard
embedded into a news page (#83); like similar mini dashboards, it is
linked to a more in-depth magazine or infographic dashboard that
invites further exploration.
5
DISCUSSING DESIGN TRADEOFFS
There are many decisions to be considered in a dashboard design pro-
cess, from high-level (e.g., selecting data and display devices) to more
low-level decisions (e.g., color palettes, plot size, pagination structure).
High-level decisions will almost always rely on sources over which
the designer has little to no agency: the intended audience, the devices,
and scenario in which a dashboard is used, or the wider team of data
analysts and developers supporting the dashboard’s creation. By provid-
ing speciﬁc solutions that seemed to have worked well in the past, our
design patterns and dashboard genres can support lower-level design
decisions that the dashboard designer actually has agency over and
which they must solve to satisfy their requirements. These decisions
include, e.g., the use of screenspace, dashboard structure, page layout,
color schemes, visual representations, etc. In this section, we reﬂect
on our own design process in creating over 7000 dashboards for Covid-
19-related data in the UK [31] as well as our discussions from both
preparing and running a dashboard design workshop (Sect. 6).
5.1
Patterns to Balance Design Parameters
From an information-theoretic perspective, a dashboard encodes a data
space that is smaller than the data space of the data to be displayed.
This requires a designer to decide which information to not show on
screen and how a user can then obtain the remaining information—if at
all. One solution is to reduce information by abstracting data and its
visual encodings. Consider a time series representing the daily number
of positive test cases for Covid-19 during a period of 500 days. Fig. 4
shows a design with four visual encodings (number
, trend-arrow
,
miniature chart
and detailed visualization
) for the same time
series data. They all lose information, but in different ways: the line
chart visualization may lose information through its limited height, and
the vertical pixel-resolution limits the range of data visible without
scrolling. The large number shows the latest ﬁgure (a single-value
),
while omitting all other data points in the time series dataset
. The
trend arrow (a derived value
) and miniature charts
are different
levels of abstraction between the number and the detailed visualization,
representing the full range of abstraction in one dashboard view.
However, information loss may also negatively cause confusion, mis-
interpretation, or erroneous judgment. At this moment, the dashboard
designer needs to counterbalance this information loss through other
means such as, e.g., adding interaction such as tooltips
, scrolling
or spread content across multiple pages
. It is clear from this example
that there are costs and beneﬁts associated with different levels of ab-
straction and their visual encodings. However, the tradeoff here is the
excessive cost of screen space when displaying several redundant visual
encodings, and the increased cognitive cost of interpreting different
levels of abstraction over the same data. It is necessary to display fewer
numbers and visual information, to reduce the visual complexity of the
dashboard. Designers thus need to ﬁnd an optimal balance between
abstraction and cost, e.g., to encode the latest data value(s) as numbers,
and rely on perceptually less-precise plots to present overviews while
reminding users of their past observations. With careful reasoning,
exploring our dashboard design space does not necessarily involve
exclusively considering many design options in a combinatory man-
ner; rather to guide dashboard design in a considered combination of
patterns.
Fig. 6. A simpliﬁed model for design tradeoffs in dashboard design.
Reducing one of the parameters (screenspace, abstraction, number of
pages, interaction) requires an increase in one of multiple of the other
parameters.
Fig. 6 illustrates a model for balancing possible parameters in a
dashboard designprocess. Such parameters can be, e.g., abstraction,
screenspace, number of pages, and interactivity. In a design process,
the goal is to minimize each of these parameters. For example, to ﬁt as
much information as possible (low abstraction) into the least amount
of screenspace, with no interaction, and to only show a single page.
Such a solution would possibly be the gold standard in dashboard
design: showing all important information at a glance, without the need
for costly interaction. The model explains that negotiating tradeoffs is
best represented through a stress function between the parameters at
hand. In the rest of this section, we discuss tradeoffs that minimize this
stress with the help of design patterns.
Increasing the screen size is an obvious way to deal with potential
information loss, as there is less need to abstract and reduce the amount
of visible content. Where large screens are available, information loss
can be minimized: e.g., dashboard #42 spans the width of a room using
multiple screens. However, large screens are not always available or
practical, especially as dashboards ﬁnd a more general audience who
browse via personal and mobile devices.
Displaying a lot of information on a ‘typical’ screen size requires
careful page layout and structure of components and information; i.e.,
deciding how many pages
are necessary, what to show on each
page, how to lay out those components. A good layout and structure
needs to consider possible facets in data (e.g., vaccinations, cases,
hospitalizations in the case of a Covid-19 dashboard), as well as the
tasks that require information across these facets (e.g., comparing
cases and vaccinations). At the same time, a layout needs to prioritize
information, e.g., showing information in different sizes or places on
each page, perhaps using stratiﬁcation
to put the most important
information at the beginning.
When multiple facets and similar/repeated information need to be
shown, table
layouts may be ideal. Likewise, a layout can use
repetition within each component, like that shown in Fig. 3–right,
which uses a number
, trend-arrow
, and signature chart
to
convey data. Repetition like this guides a viewers’ eye and helps
interpretation and retrieval of information. In contrast to structuring
information across pages, dashboard designers can opt for simpler
static dashboards, which show data concisely on a screenﬁt
page
without requiring user interaction. Static dashboards are ideal when
interaction is not possible, desired, or necessary, and are also suited to
print media. However, the trade-off associated with screen size is that

static dashboards require carefully-chosen abstraction, to make the best
use of available space (as discussed in the previous section).
Interactive parameterization
can provide balance between static
and paginated dashboards: reducing the amount of information shown
so that it ﬁts on screen, but requiring the user to indicate what informa-
tion is most relevant to their needs/tasks. Our design space encapsu-
lates many interactive components that support exploration
, (e.g.,
tooltips, ﬁltering, search) and navigation
, through multiple pages
of information (e.g., search, tabs, links). Interaction gives viewers the
ability to personalize
and use the dashboards in a way that suits their
needs. Contrast this with static dashboards that are framed by designers,
revealing strong parallels to author vs. reader-driven storytelling [47].
Especially for narrative examples of dashboards (magazine dash-
boards
, inforgraphic dashboards
) interaction can help set the
narrative structure and pace. Interaction can be utilized to streamline
the volume/velocity of information communicated, i.e., slowly reveal-
ing parts of the information/data based on interaction. The most simple
interactions to deal with more information than can ﬁt on screen are
scrolling (in an overﬂow layout
) or navigation buttons
. Those
interactions do not interfere with the individual visual encodings (i.e.,
visual encodings can be static images) and they allow designers to create
dashboards that are easily responsive across different screensizes. Other
simple options that do not interfere with the implementation of visual
encodings include use of tabs
and links
. Detail-on-demand
and parameterization
may require a more speciﬁc implementation,
but can be effective, as discussed earlier.
5.2
Curated Dashboards vs. Data Collections
The six dashboard genres presented in Sect. 4 represent different ways
that dashboard design decisions and patterns can be combined to create
usable dashboards, typically oriented towards speciﬁc contexts, tasks,
and users. In this section, we discuss differences and tradeoffs between
these, to inform their choice in future dashboard design.
We see a distinction between curated dashboards (static dashboard
, magazine dashboard
, infographic dashboard
) that are highly
selective of data and visual representation towards a speciﬁc goal, and
data collections (analytic dashboard
, repository dashboard
) that
aim to transmit large volumes of information so that viewers can seek
the information most relevant to them. Curated dashboards can be
described as author-driven storytelling, while collection dashboards
can be described as reader-driven storytelling [47].
Curated dashboards will typically ﬁt on a single screen with a
screenﬁt
or overﬂow
layout, and offer limited ability to change
the data or its visual encodings (i.e., limited parameterization
).
Creating such dashboards requires a greater extent of curation, design,
and selection, i.e., representing the right information using the right
visual encodings. These dashboards will have well-deﬁned use cases,
and the designer’s role is to ‘translate’ the data for that purpose [33].
Data collections are dashboards that provide access to lots of data,
represented in different ways for different tasks (e.g., for analytical use
or for sharing open data). Although a degree of curation is required
(i.e., the designer has made deliberate decisions about how to show
the data), there is less need to reduce the amount of visible content.
These dashboards typically use pagination
and/or overﬂow
, as
the goal is not to make the most economic use of screen space but to
maximize the amount of information available to users, so that a viewer
can quickly ﬁnd what they are most interested in. The use cases for data
collection dashboards are more open-ended and they are often aimed at
a more broad audience.
6
DASHBOARD DESIGN WORKSHOP
We ran an online dashboard design workshop to help us scrutinize
and reﬁne the design pattern collection as well as our discussion on
design tradeoffs.
In the workshop, participants applied the patterns
to their own dashboard projects. The workshop ran for 2 weeks and
was open to everyone with a dashboard design task at hand. It aimed to
guide people through the main stages and decisions of a design process
while using the design patterns for ideation and discussion. Rather than
implementing a dashboard in a tool such as Tableau or Power BI, the
course intended to ﬁnish with interactive mockups in Figma. Detailed
information as well as all material from the workshop can be found
online: https://dashboarddesignpatterns.github.io.
6.1
Setup and Participants
Outline: A (1) 3h kickoff session gave a fast-forward through the
design process and introduced the design patterns. The session started
with an (1.1) overview of example dashboards from our collection,
asking participants to describe what they see and how these dashboards
appear to them upon ﬁrst sight. Then, we (1.2) introduced dashboard de-
sign challenges and discussed high-level guidelines such as mentioned
in Section 2. Then, (1.3) the workshop introduced the framework in Fig-
ure 6. Eventually, (1.4) the session introduced a possible design process,
one stage for each type of design patterns: (i) Data Information (what
information about data do I need to show) (ii) Dashboard structure
(which pages to I need, how are they related?), (iii) page design (page
ﬁt and layout, visual representation), and eventually (iv) interactivity
and (v) color. The full process is outlined on our website.1 Following
the kickoff session, we had (2) six asynchronous check-in sessions
over two weeks. Each session lasted 1h and was facilitated by one to
two of the co-authors. During these sessions, we provided individual
help to participants, discussing their dashboard examples, giving advice
about pattern usage and discussing related data visualization questions.
Each session was attended by six participants on average, discussing
2-4 dashboards during that hour. Eventually, we had a (3) debrieﬁng
meeting in which we asked participants to show their mockups and
reﬂect on their design process, choices, and challenges. A post-hoc
questionnaire collected feedback about the workshop outline and de-
sign patterns. The entire workshop was held on Zoom, encouraging
participants to work on their design mockups asynchronously and share
their designs through Figma.
Participants: We had 23 participants in total from diverse back-
grounds, including data science, medicine, psychology, economics,
bioinformatics, design, etc., including a mix of industry and academic
partners. Each participant worked on their own dashboard within a
context they deﬁned themselves and which was relevant to their work.
Example dashboards created during the course included an analytic
dashboard allowing to browse learning analytics for hundreds of uni-
versity courses; an infographic dashboard to inform midwives about
the risks of Covid-19 and vaccination during pregnancy; an analytic
dashboard to track dynamic user interaction log data; a repository dash-
board tracking live data about conﬂicts across the world; an analytical
dashboard to help modelers assess and track the performance of their
models over various sessions of training and parameter adjustments;
a repository dashboard about open government data to allow journal-
ists and politicians retrieve relevant data; and eventually a personal
analytical dashboard to monitor energy consumption at homes. About
half of the participants had prior experience of one to several years in
dashboard design with Power BI and Tableau. For almost all partici-
pants, this workshops was the ﬁrst time they deliberately engaged in
dashboard design in a structured and guided form.
6.2
Findings
6.2.1
Workshop Discussions
In the drop-in sessions, discussions were sparked by participants sharing
their designs. Participants also shared questions, possible answers, and
reﬂections, voiced in a participatory manner. In the following, we
summarize key discussion points and the role of design tradeoffs and
design patterns in this discussion.
Information overload was a frequent topic related to what infor-
mation to include in a dashboard and how much information to in-
clude. When discussing dashboard examples at the beginning of the
course, many participants complained about “too much info”, data,
and information, and general confusion about where to look at. Some
commented on small sizes of charts and maps, and unclear relations be-
tween components: “not sure how the linechart relates to the number”.
1https://dashboarddesignpatterns.github.io/
processguidelines.html

Color was sometimes considered overused and its particular function
was not always clear. Our color patterns helped sensitizing participants
here and discuss reasons for using color.
Optimizing screenspace and reducing the number of pages was
another common topic. While discussing techniques to make visu-
alizations simple, concise, and make best use of the screen space,
one participant asked “can a dashboard ever contain too much infor-
mation?” This comment sparked a long discussion around how to
best apply and combine screenspace patterns (screenﬁt, overﬂow,
detail-on-demand, parameterization, multiple pages), layouts (open,
table, stratiﬁed, grouped, schematic), and compressed visual encodings
(namely miniature charts and single values). The discussion resulted in
some agreement that there are lots of techniques to visually compress
dashboards and that, again, the design patterns provided an excellent
repertoire of potential solutions (also see 6.2.3). One participant raised
the question how to design for mobile and desktop screens and how
many versions of a single dashboard are required. We discussed how
our patterns can help reducing a large onscreen dashboard into a mobile
one, by applying a single pattern (e.g., multiple pages) or gradually
applying several patterns to the large onscreen dashboard.
These issues eventually led to discussion about novice vs. expert
audiences as well as casual vs. frequent users. Novice or casual users
will likely need more guidance in the form of clear layout (e.g, strati-
ﬁed) and titles, little to no interaction, and generally less information
(e.g., single value, aggregated data). Expert or frequent users will be
more data literate and require more data for their decisions. At the same
time, dashboards for experts and frequent users will also likely include
more bespoke features, compared to dashboards for novices and casual
users, who might be driven by general concerns and more general tasks.
Novice and casual users will likely appreciate more message-heavy
dashboards (e.g., infographic dashboards
or magazine dashboards
), while experts might appreciate more “self-serving” dashboards,
e.g., analytical
or repositories
.
Many dashboard examples we discussed were found to suffer from
a lack of context. For example, individual values
and numbers
require more data to be compared to. Such data can be provided through
a temporal context, e.g., data from the past, or other comparisons (e.g.,
miniature charts, detailed data, trend arrows, indicators). Experts and
frequent users might have an implicit understanding of this context, but
novices and casual users might not.
Color and accessibility was a frequent topic in our discussions.
Color was heavily used in the dashboard designs, either originating
from the participants’ personal decision or provided by the dashboard
tool without consultation by the designer. Color consistency was a big
issue in most designs and most advice hinted towards removing color
where not necessary, e.g., on most screenﬁt dashboards. Accessibility
was raised as an often neglected topic with implications for titles,
colors, and chart sizes. While many guidelines exist for accessibility in
visualization, we are not aware of any accessibility guidelines that take
into account the density, tasks, and scenarios of dashboards.
Those participants who had some experience with dashboard de-
sign tools commented that design iterations are very easy and building
dashboard prototypes was easy. On the downside, these tools offered
complementary support for dashboard creation with no tool clearly
outpacing the other tools or supporting all design demands and design
patterns. Many tools lacked support for speciﬁc design decisions and
design patterns (e.g., optimal use of screen space, layout, interactions,
shared color scheme
).
6.2.2
Reﬂections on the Design Process
We obtained many quotes from our questionnaire which nicely capture
participants’ reﬂections and which do not need much commenting:
• “Start with simple designs that spotlight just the most important data,
then add to this as you go; this will help avoid just putting everything
you can on the dashboard, keeping it focused. (This might not apply
to repository style dashboards).”[P4]
• “I learned not to try to ask too many questions for one graph. One
graph can give several different answers, but the question should just
be one question.”[P3]
• “Simpler is often better when it comes to charts: bar charts, line
charts, and tables are often clearer and easier to read than their
more fancy looking counterparts.”[P4]
• “If you try to simplify [your design] too much, you risk imposing
your own story.”[P3]
• “Use ﬁlters, menus, buttons, and parameters to reduce the number of
static visuals shown at any one time [to] keep things readable.”[P4]
• “In medicine we often hand out 15 leaﬂets and tell patients [...] to
come back with a decision [...] but I have not given them information
about how to use [the information] and how to decide.”[P2]
6.2.3
Pattern and Workshop Utility
Participants valued the individual feedback onto their designs as well as
discussing other participants’ design. They also valued the framework,
guidance, and community the workshop provided.
• “[Design patterns and their terminology] limit down [the design
complexity] from endless design options to 2-3 good candidates [...]
I think it will be really useful for co-creation or kick-off meetings
[...] so everyone is very clear on what the key elements are and what
we’re trying to achieve right from the start etc”[P1]
• “[I used the patterns] ﬁrst as guidance for designing [then] I did any
changes with the design principles in mind. In the end, I used [the
patterns] as a ‘check-list’ to review my design decisions.”[P5]
• “If you walk through each of those patterns/categories, you basically
end up with a written plan for your dashboard which is clear to
everyone e.g. ‘I’m planning to build an analytic dashboard. Because
of XYZ factors, we’re going to use a paginated design and allow user
interaction etc.”’[P1]
• “I think it’s very useful to now be able to ask things like ‘is this a
static dashboard? is this an analytic dashboard?’. Or on structure,
things like ’is a hierarchical structure the best? [...] it makes it a bit
easier to envision and make choices.”[P1]
• “in my experience as a data analyst, building dashboards is some-
thing I’ve had to pick up and learn myself with not much outside
training or workshops [...], that’s a somewhat common experience
for analysts.”[P1]
7
TOWARDS A DESIGN FRAMEWORK FOR DASHBOARDS
At this point, we want to reﬂect on how the insights from this research
can be put into actionable dashboard design practice. To that end, we
consider a design framework consisting of four parts: (1) knowledge
in the form of guidelines, annotated examples, and design patterns;
(2) tradeoffs that require discussion and decision making; (3) design
processes; and (4) tool support. Some of these aspects can be drawn
from the literature (e.g., knowledge as discussed in Sect. 2); some
are presented in this paper (e.g., design patterns, annotated exaples,
tradeoffs, design processes); others are compelling topics for future
work and can be informed by our ﬁndings here (e.g., tool support for
effective dashboard creation).
7.1
Design Knowledge
Design knowledge includes anything that can be learned and read from
the literature, or taught in classes in the form of theory. We can think
of this as the ‘raw material’ in any design process: the ideas, theories,
models and examples that compose the syntactic and structural rules
and components of any design. Design knowledge can come from
empirical observation from studies, and is generally highly formalized
and includes guidelines, examples, and design patterns.
Design patterns for dashboards are, for the ﬁrst time, described in this
paper. We also provide a set of dashboard genres that illustrate common
combinations of design patterns and abstract many of the real-world
examples examined in our work. These genres can be put into action as
part of the dashboard design process. However, we believe more design
patterns could be found and our collection paves the way to a more
comprehensive collection. These patterns help establish a terminology
for design knowledge about dashboards. They might even point to
speciﬁc characteristics of dashboards, helping to see dashboards as
only an instance within the forms and genres in the wider visualization

landscape, such as multiple coordinated views or infographics. At the
same time, these patterns help relate dashboards to these other forms
and genres, while keeping the delineation of dashboards deliberately
blurred to allow for transfer and cross-fertilization of design ideas.
An additional contribution is our dashboard corpus. We extended
the dashboard collection started by Sarikaya et al. [44] to a set of
144 examples. Due to the sheer number of dashboards online, any
systematic survey is impossible, but a common corpus can inform future
research, design, and discussion, similar to examples for physical data
visualization [15], storytelling [6], or data comics [7] that involve plenty
of examples from outside academia. Dashboard design guidelines were
discussed in Sect. 2.2 and applied and scrutinized through our workshop.
Guidelines can often be generic and widely applicable, but most are
limited to speciﬁc use cases and some guidelines may contradict each
other. Based on our design patterns and discussion of tradeoffs, we are
able to formulate additional guidelines, listed on our website.
7.2
Design Tradeoffs
Every design process and design problem is unique in that several
parameters must be considered: users, tasks, contexts, devices, etc. De-
sign tradeoffs are inevitable when no solution is optimal, i.e., when the
speciﬁc parameters of a design problem have contradictory knowledge
(e.g., guidelines, heuristics, solutions). Dashboard designers can use
this knowledge to inform their approach, but other activities (deliberate
or otherwise) will be necessary: e.g., reasoning and logic, experimenta-
tion and prototyping, user-centered design and evaluation. Decisions
may likely inﬂuence or conﬂict with other decisions, causing further
design tradeoffs to be necessary, requiring constant iteration towards
an effective and usable dashboard design.
We discussed a framework for design tradeoffs (Sect. 5), strongly
informed by our design patterns and by our experience in designing
dashboards [31, 32]. We think of this discussion as a ﬁrst formal
discussion—partially based on information theory—of design deci-
sions for dashboards. This discourse will evolve with the set of design
patterns and future empirical studies. Future empirical studies should
challenge our reﬂections and address the speciﬁc design tensions de-
scribed in this paper. There are also many questions left open regarding
the costs and beneﬁts of speciﬁc solutions and decisions. For example,
To what extent do users engage with interactive dashboards? (some
similar work exists in the context of interactivity and storytelling on
the web [9]); Does interaction help users solve tasks effectively and
efﬁciently, or does it just add complexity?; How much data information
is too much? How to support speciﬁc tasks and audiences?
7.3
Dashboard Design Processes
There is a key need for dashboard design processes that structure both
knowledge and decisions in tradeoffs, to guide designers towards ef-
fective dashboard designs. As part of our workshop, we describe one
possible design process (see website) that aims to describe mid-level
decisions and complement the discussion in Sect. 5. The process as-
sumes requirement analysis has deﬁned users, tasks, and datasets. This
process is intended to kickstart the dashboard design process and in-
troduce our design patterns one group at a time. The process implies
many iterations to negotiate design tradeoffs.
7.4
Tool and Technical Support
While there are existing tools for dashboard creation (e.g., Tableau,
Power BI, Exploration Views [16], QualDash [17]), there is a need
for greater support to guide design choices. For example, authors of
dashboards and dashboard-authoring tool designers could offer sup-
port for a range of design patterns and genre templates. This could
streamline dashboard design and allow designers to create different
dashboard versions based on the same widgets. There might be further
potential for automating dashboard creation [29] through recommender
systems, e.g., as used with visualizations [34] and infographics [52].
Recommender systems should take into account levels of abstraction
and composition. However, these are non-trivial challenges that require
formal design rules, which in turn require further study.
Dashboard users could be provided with options for personalization,
sharing, bookmarking, or annotation. Personalization could allow a
user to specify data they consider important and adapt the layout and
size of components accordingly. Only a small number of dashboards
support personalization through adding or moving/resizing widgets. A
related problem is a lack of responsiveness to different screen sizes.
There has been only a handful of studies and suggestions how to make
visualizations responsive [25] but responsiveness in dashboards should
include the levels of abstraction for data and visual encodings, eventu-
ally turning a static dashboard
into an analytic dashboard
.
7.5
Limitations
Our research is limited by the set of dashboards we have curated. To
ensure consistency with existing research, we started our collection
from existing dashboard used by Sarikaya et al. [44] and added con-
temporary dashboards, mostly around Covid. We open our dashboard
collection and coding scheme for future research on our website. Our
design patterns reﬂect close agreement among six coders and have been
scrutinized through application in the workshop. We highlight that any
design pattern collection (Sect. 2.3) is highly qualitative in that it aims
ideation and describing applicable solutions for reuse, inspiration, and
analysis. This implies patterns to bear meaning and capture ideas that
can be applied. We see our patterns allowing hybrids, e.g., parallel
structures in hierarchical structures, or hybrids of grouped and stratiﬁed
and open layouts. Our patterns and their frequencies (reported as % in
Sect. 3) are representative for the dashboards we analyzed. Future work
can complement our collection. Eventually, the scope of this paper is
not to suggest ‘good designs’, but to inform future studies.
8
CONCLUSION
Dashboards have their distinct place in the visualization landscape, yet
are still an overlooked subject in the VIS community. They share many
characteristics with, e.g., multiple coordinated views, small multiples,
infographics, and potentially data comics but lack generic and practical
design guidance beyond high-level guidelines. Our dashboard patterns
are the ﬁrst to map common solutions in dashboard design in an applica-
ble way. They help describing why dashboards are special: abstraction
of data, organizing of a screenspace, grouping of elements, showing
relations (hierarchy, grouping, color), and the use of interaction for
exploration, drilldown, navigation, or personalization. However, we
argue against a strict deﬁnition of the term ‘dashboard’, and rather
see it as way to communicate speciﬁc affordances onto a visualization
user interface in a speciﬁc context: the need for overview, control, and
conciseness for decision making.
In proposing a simple model for discussing design tradeoffs, we show
how the design patterns can be used in a deliberate and informed design
practice. Our dashboard genres describe higher level patterns and solu-
tions to design tradeoffs and target solutions for higher level questions
such as audience, extent of data, usage scenarios, and medium (e.g.,
static vs. interactive, mobile phone vs. large wall). Patterns, tradeoffs,
and genres are meant as a ﬁrst stepping stone that provides structured
guidance (terminology, examples, ideas) to both novice and expert
users access to dashboard design. We are aware of the limitations of
our classiﬁcation and tradeoff framework and the necessary unﬁnished
nature of any such current or future attempt. It was beyond the scope of
this work to determine what makes for a ‘good’ dashboard, and this will
depend on many subjective and domain-speciﬁc factors. The diversity
in dashboard design found here suggests more research into strengths
and weaknesses of different dashboard genres, echoing Sarikaya et al.’s
call-to-action for more dashboard visualization research [44].
ACKNOWLEDGMENTS
This work was supported by EPSRC (EP/V054236/1). We would like
to thank all volunteers from the SCRC and all VIS volunteers [31] and
the dashboard workshop. In particular, we would like to thank Dr. P.
H. Nguyen (Red Sift Ltd.) and Dr. H. C. Purchase (U. Glasgow) for
their contribution to the RAMPVIS work on dashboards, and SCRC
colleagues Profs. R. Reeve (U. Glasgow) and L. Matthews (U. Glasgow)
for their advice on pandemic responses.

REFERENCES
[1] Creativity Cards. online: http://ja-ye.atom2.cz/form/download.
ashx?FileId=52, 2016. [last visited: Nov. 29, 2016].
[2] Design with Intend.
online:
http://designwithintent.co.uk/
docs/designwithintent_cards_1.0_draft_rev_sm.pdf,
2016.
[last visited: Nov. 29, 2016].
[3] Ideo Cards. online: https://www.ideo.com/work/method-cards,
2016. [last visited: Nov. 29, 2016].
[4] M. Alhamadi. Challenges, strategies and adaptations on interactive dash-
boards. In Proceedings of the 28th ACM Conference on User Modeling,
Adaptation and Personalization, pp. 368–371, 2020.
[5] J. Allison, S. Badanjak, B. Bach, C. Bell, D. Bhattacharya, F. Knaussel,
and L. Wise. An interactive tracker for ceaseﬁres in the time of covid-19.
The Lancet Infectious Diseases, 21(6):764–765, 2021.
[6] B. Bach, M. Stefaner, J. Boy, S. Drucker, L. Bartram, J. Wood, P. Ciuc-
carelli, Y. Engelhardt, U. Koeppen, and B. Tversky. Narrative design
patterns for data-driven storytelling. In Data-driven storytelling, pp. 107–
133. AK Peters/CRC Press, 2018.
[7] B. Bach, Z. Wang, M. Farinella, D. Murray-Rust, and N. Henry Riche. De-
sign patterns for data comics. In Proceedings of the 2018 CHI Conference
on Human Factors in Computing Systems, pp. 1–12, 2018.
[8] J. Bernard, D. Sessler, J. Kohlhammer, and R. A. Ruddle. Using dash-
board networks to visualize multiple patient histories: a design study on
post-operative prostate cancer. IEEE Transactions on Visualization and
Computer Graphics, 25(3):1615–1628, 2018.
[9] J. Boy, F. Detienne, and J.-D. Fekete. Storytelling in information visual-
izations: Does it engage users to explore data? In Proceedings of the 33rd
Annual ACM Conference on Human Factors in Computing Systems, pp.
1449–1458, 2015.
[10] A. Buja, J. A. McDonald, J. Michalak, and W. Stuetzle.
Interactive
data visualization using focusing and linking. In Proceedings of the 2nd
Conference on Visualization ’91, pp. 156–163, 1991.
[11] S. Card and J. Mackinlay. The structure of the information visualization
design space. In Proceedings of VIZ ’97: Visualization Conference, Infor-
mation Visualization Symposium and Parallel Rendering Symposium, pp.
92–99, 1997. doi: 10.1109/INFVIS.1997.636792
[12] S. Charleer, J. Klerkx, E. Duval, T. De Laet, and K. Verbert. Creating
effective learning analytics dashboards: Lessons learnt. In European
Conference on Technology Enhanced Learning, pp. 42–56. Springer, 2016.
[13] H. Chen. Toward design patterns for dynamic analytical data visualiza-
tion. In Visualization and Data Analysis 2004, vol. 5295, pp. 75–86.
International Society for Optics and Photonics, 2004.
[14] E. Dong, H. Du, and L. Gardner. An interactive web-based dashboard to
track covid-19 in real time. The Lancet infectious diseases, 20(5):533–534,
2020.
[15] P. Dragicevic and Y. Jansen.
List of physical visualizations.
www.dataphys.org/list, 2012. Last accessed 2021-09-06.
[16] M. Elias and A. Bezerianos. Exploration views: understanding dashboard
creation and customization for visualization novices. In IFIP Conference
on Human-Computer Interaction, pp. 274–291. Springer, 2011.
[17] M. Elshehaly, R. Randell, M. Brehmer, L. McVey, N. Alvarado, C. P.
Gale, and R. A. Ruddle. Qualdash: Adaptable generation of visualisation
dashboards for healthcare quality improvement. IEEE Transactions on
Visualization and Computer Graphics, 27(2):689–699, 2020.
[18] B. Eno and P. Schmidt.
Oblique Strategies.
online: https://en.
wikipedia.org/wiki/Oblique_Strategies, 2016. [last visited: Nov.
29, 2016].
[19] A. Faiola, P. Srinivas, and J. Duke. Supporting clinical cognition: a human-
centered approach to a novel icu information visualization dashboard.
In AMIA Annual Symposium Proceedings, vol. 2015, p. 560. American
Medical Informatics Association, 2015.
[20] S. Few. Information dashboard design: The effective visual communication
of data, vol. 2. O’reilly Sebastopol, CA, 2006.
[21] S. Few and P. Edge. Dashboard confusion revisited. Perceptual Edge, pp.
1–6, 2007.
[22] B. G. Glaser and A. L. Strauss.
The discovery of grounded theory:
Strategies for qualitative research.
Routledge, 2017. doi: 10.4324/
9780203793206
[23] S. Goodwin, Y. Dkhissi, Q. Wu, B. Moyle, K. Freidin, and A. Liebman.
Informed dashboard designs for microgrid electricity market operators.
In Proceedings of the Twelfth ACM International Conference on Future
Energy Systems, e-Energy ’21, p. 406–411. Association for Computing
Machinery, New York, NY, USA, 2021. doi: 10.1145/3447555.3466604
[24] S. He and E. Adar. Vizitcards: A card-based toolkit for infovis design
education. IEEE Transactions on Visualization and Computer Graphics,
(1):561–570, 2017.
[25] J. Hoffswell, W. Li, and Z. Liu. Techniques for ﬂexible responsive visu-
alization design. In Proceedings of the 2020 CHI Conference on Human
Factors in Computing Systems, pp. 1–13, 2020.
[26] J. Hullman and B. Bach. Picturing science: Design patterns in graphical
abstracts. In International Conference on Theory and Application of
Diagrams, pp. 183–200. Springer, 2018.
[27] A. Janes, A. Sillitti, and G. Succi. Effective dashboard design. Cutter IT
Journal, 26(1):17–24, 2013.
[28] H. Kennedy and R. L. Hill. The feeling of numbers: Emotions in everyday
engagements with data and their visualisation. Sociology, 52(4):830–848,
2018.
[29] A. Key, B. Howe, D. Perry, and C. Aragon. Vizdeck: self-organizing
dashboards for visual analytics. In Proceedings of the 2012 ACM SIGMOD
International Conference on Management of Data, pp. 681–684, 2012.
[30] S. S. Khairat, A. Dukkipati, H. A. Lauria, T. Bice, D. Travers, and S. S.
Carson. The impact of visualization dashboards on quality of care and
clinician satisfaction: integrative literature review. JMIR Human Factors,
5(2):e9328, 2018.
[31] S. Khan, P. H. Nguyen, A. Abdul-Rahman, B. Bach, M. Chen, E. Free-
man, and C. Turkay. Propagating visual designs to numerous plots and
dashboards. IEEE Transactions on Visualization and Computer Graphics,
28(1):86–95, 2022.
[32] S. Khan, P. H. Nguyen, A. Abdul-Rahman, E. Freeman, C. Turkay, and
M. Chen. Rapid development of a data visualization service in an emer-
gency response. IEEE Transactions on Services Computing, p. to appear,
2022.
[33] R. Kitchin, T. P. Lauriault, and G. McArdle. Knowing and governing
cities through urban indicators, city benchmarking and real-time dash-
boards. Regional Studies, Regional Science, 2(1):6–28, 2015. doi: 10.
1080/21681376.2014.983149
[34] P. Law, A. Endert, and J. T. Stasko. Characterizing automated data insights.
In 31st IEEE Visualization Conference, IEEE VIS 2020 - Short Papers,
Virtual Event, USA, October 25-30, 2020, pp. 171–175. IEEE, 2020. doi:
10.1109/VIS47514.2020.00041
[35] B. Lechner and A. Fruhling. Towards public health dashboard design
guidelines. In F. F.-H. Nah, ed., HCI in Business, pp. 49–59. Springer
International Publishing, Cham, 2014.
[36] D. Lee, J. R. A. Felix, S. He, D. Offenhuber, and C. Ratti. Cityeye: Real-
time visual dashboard for managing urban services and citizen feedback
loops. In Proceedings of the 14th International Conference on Computing
in Urban Planning and Urban Management (CUPUM), Cambridge, MA,
USA, pp. 7–10, 2015.
[37] E. Mlaver, J. L. Schnipper, R. B. Boxer, D. J. Breuer, E. F. Gershanik,
P. C. Dykes, A. F. Massaro, J. Benneyan, D. W. Bates, and L. S. Lehmann.
User-centered collaborative design and development of an inpatient safety
dashboard. The Joint Commission Journal on Quality and Patient Safety,
43(12):676–685, 2017. doi: 10.1016/j.jcjq.2017.05.010
[38] W. Noonpakdee, T. Khunkornsiri, A. Phothichai, and K. Danaisawat. A
framework for analyzing and developing dashboard templates for small
and medium enterprises. In 2018 5th International Conference on Indus-
trial Engineering and Applications (ICIEA), pp. 479–483. IEEE, 2018.
[39] K. Pauwels, T. Ambler, B. H. Clark, P. LaPointe, D. Reibstein, B. Skiera,
B. Wierenga, and T. Wiesel. Dashboards as a service: why, what, how, and
what research is needed? Journal of Service Research, 12(2):175–189,
2009.
[40] A. A. Rahman, Y. B. Adamu, and P. Harun. Review on dashboard applica-
tion from managerial perspective. In 2017 International Conference on
Research and Innovation in Information Systems (ICRIIS), pp. 1–5. IEEE,
2017.
[41] N. H. Rasmussen, M. Bansal, and C. Y. Chen. Business dashboards: a
visual catalog for design and deployment. John Wiley & Sons, 2009.
[42] J. C. Roberts. State of the art: Coordinated & multiple views in exploratory
visualization.
In Fifth International Conference on Coordinated and
Multiple Views in Exploratory Visualization (CMV 2007), pp. 61–71. IEEE,
2007.
[43] M. Roser, H. Ritchie, E. Ortiz-Ospina, and J. Hasell. Coronavirus pan-
demic (covid-19). https://ourworldindata.org/coronavirus last
accessed, Jul 1, 2022, 2020.
[44] A. Sarikaya, M. Correll, L. Bartram, M. Tory, and D. Fisher. What do

we talk about when we talk about dashboards? IEEE Transactions on
Visualization and Computer Graphics, 25(1):682–692, 2019. doi: 10.
1109/TVCG.2018.2864903
[45] H.-J. Schulz, T. Nocke, M. Heitzler, and H. Schumann. A design space
of visualization tasks. IEEE Transactions on Visualization and Computer
Graphics, 19(12):2366–2375, 2013. doi: 10.1109/TVCG.2013.120
[46] K. Sedig and P. Parsons. Design of visualizations for human-information
interaction: A pattern-based framework. Synthesis Lectures on Visualiza-
tion, 4(1):1–185, 2016.
[47] E. Segel and J. Heer. Narrative visualization: Telling stories with data.
IEEE Transactions on Visualization and Computer Graphics, 16(6):1139–
1148, 2010.
[48] J. C. M. Serrano, O. Papakyriakopoulos, M. Shahrezaye, and S. Hegelich.
The political dashboard: A tool for online political transparency. In
Proceedings of the International AAAI Conference on Web and Social
Media, vol. 14, pp. 983–985, 2020.
[49] E. R. Tufte. Beautiful evidence, vol. 1. Graphics Press Cheshire, CT, 2006.
[50] A. V´azquez-Ingelmo, F. J. Garc´ıa-Pe˜nalvo, and R. Ther´on. Tailored infor-
mation dashboards: A systematic mapping of the literature. In Proceedings
of the XX International Conference on Human Computer Interaction, pp.
1–8, 2019.
[51] A. V´azquez-Ingelmo, F. J. Garc´ıa-Pe˜nalvo, R. Ther´on, D. A. Filv`a, and
D. F. Escudero. Connecting domain-speciﬁc features to source code:
Towards the automatization of dashboard generation. Cluster Computing,
23(3):1803–1816, 2020.
[52] Y. Wang, Z. Sun, H. Zhang, W. Cui, K. Xu, X. Ma, and D. Zhang. Datashot:
Automatic generation of fact sheets from tabular data. IEEE Transactions
on Visualization and Computer Graphics, 26(1):895–905, 2019.
[53] B. A. Wilbanks and P. A. Langford. A review of dashboards for data
analytics in nursing. CIN: Computers, Informatics, Nursing, 32(11):545–
549, 2014.
[54] O. M. Yigitbasioglu and O. Velcu. A review of dashboards in performance
management: Implications for design and research. International Journal
of Accounting Information Systems, 13(1):41–59, 2012.
[55] Y. Zhang, Y. Sun, L. Padilla, S. Barua, E. Bertini, and A. G. Parker.
Mapping the landscape of covid-19 crisis visualizations. In Proceedings
of the 2021 CHI Conference on Human Factors in Computing Systems, pp.
1–23, 2021.
[56] R. Zheng, M. Fern´andez Camporro, H. Romat, N. Henry Riche, B. Bach,
F. Chevalier, K. Hinckley, and N. Marquardt. Sketchnote components,
design space dimensions, and strategies for effective visual note taking. In
Proceedings of the 2021 CHI Conference on Human Factors in Computing
Systems, pp. 1–15, 2021.
