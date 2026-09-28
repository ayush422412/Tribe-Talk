import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUTPUT_PATH = "C:/Users/piyus/OneDrive/Documents/TribeTalk/TribeTalk_Minor_Project_Proposal.pptx";
const WIDTH = 1280;
const HEIGHT = 720;

const COLORS = {
  white: "#FFFFFF",
  ink: "#111827",
  muted: "#667085",
  panel: "#F2F4F7",
  rule: "#D0D5DD",
  blue: "#3D8DFF",
  blueLight: "#EAF4FF",
  green: "#2F9E6F"
};

function addText(slide, name, content, position, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 }
  });

  shape.text = content;
  shape.text.style = {
    fontSize: options.fontSize ?? 24,
    typeface: "Arial",
    color: options.color ?? COLORS.ink,
    bold: options.bold ?? false,
    alignment: options.align ?? "left",
    verticalAlignment: options.verticalAlign ?? "top",
    autoFit: options.autoFit ?? "shrinkText",
    ...(options.italic ? { italic: true } : {})
  };
  return shape;
}

function addRect(slide, name, position, options = {}) {
  return slide.shapes.add({
    geometry: options.geometry ?? "rect",
    name,
    position,
    fill: options.fill ?? COLORS.panel,
    line: options.line ?? { style: "solid", fill: options.lineColor ?? COLORS.rule, width: options.lineWidth ?? 1 },
    ...(options.radius ? { borderRadius: options.radius } : {})
  });
}

function addLine(slide, name, position, color = COLORS.rule, width = 2) {
  return slide.shapes.add({
    geometry: "line",
    name,
    position,
    fill: "none",
    line: { style: "solid", fill: color, width }
  });
}

function addSlideChrome(slide, pageNumber) {
  addText(slide, "deck-label", "TRIBETALK  /  MINOR PROJECT PROPOSAL", { left: 42, top: 28, width: 520, height: 24 }, {
    fontSize: 16,
    bold: true,
    color: COLORS.muted
  });
  addText(slide, "slide-number", String(pageNumber).padStart(2, "0"), { left: 1170, top: 28, width: 68, height: 24 }, {
    fontSize: 16,
    bold: true,
    color: COLORS.muted,
    align: "right"
  });
  addLine(slide, "top-rule", { left: 42, top: 66, width: 1196, height: 0 }, COLORS.rule, 1);
}

function addSpeakerNotes(slide, sources) {
  slide.speakerNotes.textFrame.setText(`[Sources]\n${sources.map((source) => `- ${source}`).join("\n")}`);
  slide.speakerNotes.setVisible(true);
}

function addBulletGroup(slide, prefix, items, left, top, width, fontSize = 20) {
  const rowHeight = 44;
  items.forEach((item, index) => {
    addText(slide, `${prefix}-number-${index}`, String(index + 1).padStart(2, "0"), {
      left,
      top: top + index * rowHeight,
      width: 38,
      height: 28
    }, { fontSize: 17, bold: true, color: COLORS.blue });
    addText(slide, `${prefix}-item-${index}`, item, {
      left: left + 54,
      top: top + index * rowHeight - 2,
      width: width - 54,
      height: 34
    }, { fontSize, color: COLORS.ink });
  });
}

function addFeatureColumn(slide, index, title, body, left, accentColor) {
  addText(slide, `feature-number-${index}`, String(index + 1).padStart(2, "0"), {
    left,
    top: 232,
    width: 60,
    height: 38
  }, { fontSize: 22, bold: true, color: accentColor });
  addLine(slide, `feature-rule-${index}`, { left, top: 288, width: 310, height: 0 }, accentColor, 3);
  addText(slide, `feature-title-${index}`, title, {
    left,
    top: 320,
    width: 330,
    height: 42
  }, { fontSize: 28, bold: true });
  addText(slide, `feature-body-${index}`, body, {
    left,
    top: 382,
    width: 330,
    height: 180
  }, { fontSize: 20, color: COLORS.muted });
}

function createCover(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = COLORS.white;
  addText(slide, "cover-eyebrow", "MINOR PROJECT PROPOSAL", { left: 54, top: 54, width: 430, height: 30 }, {
    fontSize: 18,
    bold: true,
    color: COLORS.muted
  });
  addText(slide, "cover-title", "TribeTalk", { left: 54, top: 182, width: 620, height: 90 }, {
    fontSize: 76,
    bold: true
  });
  addText(slide, "cover-subtitle", "A real-time platform for student collaboration and community communication", {
    left: 58,
    top: 298,
    width: 580,
    height: 102
  }, { fontSize: 30, color: COLORS.muted });
  addText(slide, "cover-team", "Team: Tribe Innovators\nPrepared for Minor Project Review", {
    left: 58,
    top: 540,
    width: 500,
    height: 78
  }, { fontSize: 20, color: COLORS.ink });

  addRect(slide, "cover-blue-block", { left: 764, top: 122, width: 424, height: 438 }, {
    fill: COLORS.blueLight,
    line: { style: "solid", fill: COLORS.blueLight, width: 0 }
  });
  addText(slide, "cover-visual-title", "One place for", { left: 812, top: 178, width: 290, height: 40 }, {
    fontSize: 25,
    bold: true,
    color: COLORS.blue
  });
  addText(slide, "cover-visual-line-1", "Learning communities", { left: 812, top: 252, width: 324, height: 42 }, {
    fontSize: 29,
    bold: true
  });
  addText(slide, "cover-visual-line-2", "Topic channels", { left: 812, top: 330, width: 324, height: 42 }, {
    fontSize: 29,
    bold: true
  });
  addText(slide, "cover-visual-line-3", "Live conversations", { left: 812, top: 408, width: 324, height: 42 }, {
    fontSize: 29,
    bold: true
  });
  addLine(slide, "cover-accent", { left: 812, top: 486, width: 250, height: 0 }, COLORS.blue, 4);
  addText(slide, "cover-visual-caption", "Structured • secure • collaborative", { left: 812, top: 510, width: 300, height: 30 }, {
    fontSize: 17,
    color: COLORS.muted
  });
  addSpeakerNotes(slide, ["TribeTalk project repository and README (project scope, accessed 2026-07-24)."]);
}

function createProblemSlide(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = COLORS.white;
  addSlideChrome(slide, 2);
  addText(slide, "problem-title", "Academic communication is fragmented", {
    left: 42,
    top: 112,
    width: 1090,
    height: 58
  }, { fontSize: 42, bold: true });
  addText(slide, "problem-summary", "Study groups need one clear place to organise discussions, participants and shared resources.", {
    left: 42,
    top: 188,
    width: 940,
    height: 36
  }, { fontSize: 23, color: COLORS.muted });

  addFeatureColumn(slide, 1, "Fragmented groups", "Important conversations are distributed across informal chat groups, email threads and unrelated applications.", 42, COLORS.blue);
  addFeatureColumn(slide, 2, "Lost context", "Topic-specific messages, files and decisions become difficult to discover after they are buried in continuous chat.", 462, COLORS.green);
  addFeatureColumn(slide, 3, "Limited control", "Student communities need clear membership, moderation and role permissions for safer collaboration.", 882, "#8B5CF6");
  addSpeakerNotes(slide, ["TribeTalk project proposal rationale, based on the project repository and README (accessed 2026-07-24)."]);
}

function createSolutionSlide(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = COLORS.white;
  addSlideChrome(slide, 3);
  addText(slide, "solution-title", "A structured home for student communities", {
    left: 42,
    top: 112,
    width: 1020,
    height: 58
  }, { fontSize: 42, bold: true });
  addText(slide, "solution-body", "The platform moves collaboration from unstructured chat to organised communities that are easy to join, manage and use in real time.", {
    left: 42,
    top: 214,
    width: 455,
    height: 134
  }, { fontSize: 25, color: COLORS.muted });
  addText(slide, "solution-note", "Each layer gives students a simpler path from belonging to focused discussion.", {
    left: 42,
    top: 510,
    width: 450,
    height: 54
  }, { fontSize: 20, color: COLORS.ink, italic: true });

  addLine(slide, "solution-line-1", { left: 610, top: 326, width: 102, height: 0 }, COLORS.rule, 3);
  addLine(slide, "solution-line-2", { left: 896, top: 326, width: 102, height: 0 }, COLORS.rule, 3);
  const community = addRect(slide, "solution-community", { left: 510, top: 250, width: 190, height: 154 }, { fill: COLORS.blueLight, lineColor: COLORS.blue });
  const channel = addRect(slide, "solution-channel", { left: 798, top: 250, width: 190, height: 154 }, { fill: COLORS.panel, lineColor: COLORS.rule });
  const conversation = addRect(slide, "solution-conversation", { left: 1086, top: 250, width: 150, height: 154 }, { fill: COLORS.panel, lineColor: COLORS.rule });
  addText(slide, "solution-community-title", "Community", { left: 532, top: 286, width: 150, height: 34 }, { fontSize: 25, bold: true, align: "center" });
  addText(slide, "solution-community-body", "Study group\nor club", { left: 532, top: 332, width: 150, height: 50 }, { fontSize: 19, color: COLORS.muted, align: "center" });
  addText(slide, "solution-channel-title", "Channel", { left: 820, top: 286, width: 150, height: 34 }, { fontSize: 25, bold: true, align: "center" });
  addText(slide, "solution-channel-body", "Topic-led\nspace", { left: 820, top: 332, width: 150, height: 50 }, { fontSize: 19, color: COLORS.muted, align: "center" });
  addText(slide, "solution-conversation-title", "Live", { left: 1100, top: 286, width: 122, height: 34 }, { fontSize: 25, bold: true, align: "center" });
  addText(slide, "solution-conversation-body", "Chat", { left: 1100, top: 332, width: 122, height: 34 }, { fontSize: 19, color: COLORS.muted, align: "center" });
  addSpeakerNotes(slide, ["TribeTalk project repository and README (servers, channels, and real-time messaging, accessed 2026-07-24)."]);
}

function createObjectivesSlide(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = COLORS.white;
  addSlideChrome(slide, 4);
  addText(slide, "objectives-title", "The project has six practical objectives", { left: 42, top: 112, width: 1000, height: 58 }, {
    fontSize: 42,
    bold: true
  });
  addText(slide, "objectives-intro", "Each objective supports a usable, secure and demonstrable minor-project system.", {
    left: 42,
    top: 188,
    width: 910,
    height: 34
  }, { fontSize: 23, color: COLORS.muted });
  addBulletGroup(slide, "objective-left", [
    "Create organised student communities and channels.",
    "Deliver real-time group communication.",
    "Support direct messages and resource sharing."
  ], 62, 280, 520, 21);
  addBulletGroup(slide, "objective-right", [
    "Apply authentication and protected access.",
    "Manage roles, permissions and moderation.",
    "Validate key workflows through functional testing."
  ], 664, 280, 520, 21);
  addLine(slide, "objectives-divider", { left: 620, top: 270, width: 0, height: 170 }, COLORS.rule, 1);
  addSpeakerNotes(slide, ["TribeTalk project proposal objectives, informed by the project repository and README (accessed 2026-07-24)."]);
}

function createFeaturesSlide(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = COLORS.white;
  addSlideChrome(slide, 5);
  addText(slide, "features-title", "Features designed for everyday collaboration", { left: 42, top: 112, width: 1050, height: 58 }, {
    fontSize: 42,
    bold: true
  });
  addText(slide, "features-intro", "The scope balances student-friendly interaction with the controls required for managed communities.", {
    left: 42,
    top: 188,
    width: 1080,
    height: 36
  }, { fontSize: 23, color: COLORS.muted });
  addFeatureColumn(slide, 1, "Community space", "Create or join servers, organise topic channels, update profiles and view member lists.", 42, COLORS.blue);
  addFeatureColumn(slide, 2, "Live communication", "Send real-time messages, share supported files, react, edit and delete messages, and use direct messages.", 462, COLORS.green);
  addFeatureColumn(slide, 3, "Safety and control", "Use login protection, role-based permissions, member management, rate limiting and moderation actions.", 882, "#8B5CF6");
  addSpeakerNotes(slide, ["TribeTalk project repository and README (implemented feature scope, accessed 2026-07-24)."]);
}

function createArchitectureSlide(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = COLORS.white;
  addSlideChrome(slide, 6);
  addText(slide, "architecture-title", "Architecture combines live delivery with dependable storage", { left: 42, top: 112, width: 1100, height: 58 }, {
    fontSize: 42,
    bold: true
  });
  addText(slide, "architecture-intro", "REST handles initial data operations; Socket.IO handles real-time collaboration; MongoDB and Redis support persistent and short-lived data.", {
    left: 42,
    top: 188,
    width: 1148,
    height: 40
  }, { fontSize: 21, color: COLORS.muted });

  addLine(slide, "architecture-client-server", { left: 367, top: 329, width: 142, height: 0 }, COLORS.rule, 3);
  addLine(slide, "architecture-server-mongo", { left: 724, top: 385, width: 0, height: 96 }, COLORS.rule, 3);
  addLine(slide, "architecture-server-redis", { left: 830, top: 385, width: 0, height: 96 }, COLORS.rule, 3);
  addRect(slide, "architecture-client", { left: 90, top: 268, width: 276, height: 120 }, { fill: COLORS.blueLight, lineColor: COLORS.blue });
  addRect(slide, "architecture-server", { left: 510, top: 268, width: 430, height: 120 }, { fill: COLORS.panel, lineColor: COLORS.rule });
  addRect(slide, "architecture-mongo", { left: 608, top: 482, width: 210, height: 96 }, { fill: COLORS.panel, lineColor: COLORS.rule });
  addRect(slide, "architecture-redis", { left: 872, top: 482, width: 210, height: 96 }, { fill: COLORS.panel, lineColor: COLORS.rule });
  addText(slide, "architecture-client-title", "React client", { left: 112, top: 300, width: 230, height: 32 }, { fontSize: 27, bold: true, align: "center" });
  addText(slide, "architecture-client-body", "Vite • Redux Toolkit\nRTK Query • Socket.IO client", { left: 112, top: 342, width: 230, height: 38 }, { fontSize: 17, color: COLORS.muted, align: "center" });
  addText(slide, "architecture-server-title", "Node.js application layer", { left: 548, top: 300, width: 354, height: 32 }, { fontSize: 27, bold: true, align: "center" });
  addText(slide, "architecture-server-body", "Express REST API  •  Socket.IO  •  JWT  •  role checks", { left: 548, top: 344, width: 354, height: 28 }, { fontSize: 17, color: COLORS.muted, align: "center" });
  addText(slide, "architecture-mongo-title", "MongoDB", { left: 630, top: 507, width: 166, height: 28 }, { fontSize: 23, bold: true, align: "center" });
  addText(slide, "architecture-mongo-body", "Persistent records", { left: 630, top: 540, width: 166, height: 24 }, { fontSize: 17, color: COLORS.muted, align: "center" });
  addText(slide, "architecture-redis-title", "Redis", { left: 894, top: 507, width: 166, height: 28 }, { fontSize: 23, bold: true, align: "center" });
  addText(slide, "architecture-redis-body", "Presence • cache • rate limits", { left: 894, top: 540, width: 166, height: 24 }, { fontSize: 17, color: COLORS.muted, align: "center" });
  addSpeakerNotes(slide, ["TribeTalk README architecture and project source code (React, Express, Socket.IO, MongoDB, Redis; accessed 2026-07-24)."]);
}

function createStackSlide(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = COLORS.white;
  addSlideChrome(slide, 7);
  addText(slide, "stack-title", "Proposed technology stack", { left: 42, top: 112, width: 820, height: 58 }, { fontSize: 42, bold: true });
  addText(slide, "stack-intro", "A focused MERN-stack implementation is appropriate for a real-time web application and a manageable minor-project scope.", {
    left: 42,
    top: 188,
    width: 1120,
    height: 38
  }, { fontSize: 22, color: COLORS.muted });

  const columns = [
    { left: 42, title: "Frontend", body: "React\nVite\nReact Router\nRedux Toolkit\nTailwind CSS" },
    { left: 342, title: "Backend", body: "Node.js\nExpress.js\nSocket.IO\nJWT\nbcrypt" },
    { left: 642, title: "Data & services", body: "MongoDB\nMongoose\nRedis\nMulter\nREST API" },
    { left: 942, title: "Development", body: "npm\nGit\nNodemon\nPostman\nFunctional testing" }
  ];
  columns.forEach((column, index) => {
    addText(slide, `stack-number-${index}`, String(index + 1).padStart(2, "0"), { left: column.left, top: 280, width: 60, height: 32 }, {
      fontSize: 20,
      bold: true,
      color: COLORS.blue
    });
    addLine(slide, `stack-rule-${index}`, { left: column.left, top: 330, width: 235, height: 0 }, COLORS.rule, 2);
    addText(slide, `stack-title-${index}`, column.title, { left: column.left, top: 358, width: 260, height: 34 }, { fontSize: 25, bold: true });
    addText(slide, `stack-body-${index}`, column.body, { left: column.left, top: 416, width: 240, height: 160 }, { fontSize: 19, color: COLORS.muted });
  });
  addSpeakerNotes(slide, ["TribeTalk package manifests and README (technology stack, accessed 2026-07-24)."]);
}

function createTimelineSlide(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = COLORS.white;
  addSlideChrome(slide, 8);
  addText(slide, "timeline-title", "A focused 16-week implementation plan", { left: 42, top: 112, width: 950, height: 58 }, { fontSize: 42, bold: true });
  addText(slide, "timeline-intro", "The work is split into four reviewable phases so that the team can demonstrate progress regularly.", {
    left: 42,
    top: 188,
    width: 1100,
    height: 38
  }, { fontSize: 22, color: COLORS.muted });
  addLine(slide, "timeline-line", { left: 82, top: 360, width: 1116, height: 0 }, COLORS.rule, 3);
  const phases = [
    { left: 82, label: "Wks 1–4", title: "Planning & design", body: "Requirements, wireframes, data model and UI structure." },
    { left: 360, label: "Wks 5–8", title: "Core platform", body: "Authentication, servers, channels, APIs and database models." },
    { left: 638, label: "Wks 9–12", title: "Real-time features", body: "Socket messaging, presence, direct messages and attachments." },
    { left: 916, label: "Wks 13–16", title: "Testing & review", body: "Permissions, functional tests, documentation and final demonstration." }
  ];
  phases.forEach((phase, index) => {
    addRect(slide, `timeline-dot-${index}`, { left: phase.left, top: 348, width: 24, height: 24 }, {
      geometry: "ellipse",
      fill: index === 0 ? COLORS.blue : COLORS.ink,
      line: { style: "solid", fill: index === 0 ? COLORS.blue : COLORS.ink, width: 0 }
    });
    addText(slide, `timeline-label-${index}`, phase.label, { left: phase.left, top: 292, width: 200, height: 28 }, { fontSize: 18, bold: true, color: COLORS.blue });
    addText(slide, `timeline-title-${index}`, phase.title, { left: phase.left, top: 406, width: 232, height: 52 }, { fontSize: 24, bold: true });
    addText(slide, `timeline-body-${index}`, phase.body, { left: phase.left, top: 474, width: 232, height: 98 }, { fontSize: 18, color: COLORS.muted });
  });
  addSpeakerNotes(slide, ["Proposed project implementation plan created for this minor-project proposal (accessed 2026-07-24)."]);
}

function createImpactSlide(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = COLORS.white;
  addSlideChrome(slide, 9);
  addText(slide, "impact-title", "TribeTalk supports SDG 4", { left: 42, top: 112, width: 1130, height: 58 }, {
    fontSize: 42,
    bold: true
  });
  addText(slide, "impact-intro", "Through peer collaboration, student communication and organised access to learning communities, TribeTalk can support—not replace—formal teaching.", {
    left: 42,
    top: 188,
    width: 1120,
    height: 40
  }, { fontSize: 22, color: COLORS.muted });
  addRect(slide, "impact-goal-field", { left: 42, top: 288, width: 360, height: 260 }, { fill: COLORS.blue, line: { style: "solid", fill: COLORS.blue, width: 0 } });
  addText(slide, "impact-goal-number", "SDG 4", { left: 80, top: 334, width: 290, height: 58 }, { fontSize: 48, bold: true, color: COLORS.white });
  addText(slide, "impact-goal-title", "Quality\nEducation", { left: 80, top: 410, width: 258, height: 88 }, { fontSize: 30, bold: true, color: COLORS.white });
  addText(slide, "impact-contribution-label", "HOW THE PROJECT CONTRIBUTES", { left: 500, top: 304, width: 430, height: 26 }, { fontSize: 17, bold: true, color: COLORS.blue });
  addBulletGroup(slide, "impact", [
    "Makes study-group communication easier to organise.",
    "Supports peer assistance in topic-based channels.",
    "Creates managed spaces for sharing resources and project updates."
  ], 500, 366, 660, 22);
  addSpeakerNotes(slide, [
    "United Nations Department of Economic and Social Affairs, Goal 4: Quality Education, https://sdgs.un.org/goals/goal4 (accessed 2026-07-24).",
    "TribeTalk project repository and README (project feature scope, accessed 2026-07-24)."
  ]);
}

function createClosingSlide(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = COLORS.white;
  addText(slide, "closing-eyebrow", "MINOR PROJECT PROPOSAL", { left: 54, top: 54, width: 380, height: 28 }, {
    fontSize: 18,
    bold: true,
    color: COLORS.muted
  });
  addText(slide, "closing-title", "TribeTalk is ready for project approval.", {
    left: 54,
    top: 172,
    width: 1060,
    height: 144
  }, { fontSize: 58, bold: true });
  addText(slide, "closing-body", "It combines a real student need with demonstrable full-stack engineering: secure access, structured communities, live messaging, data management and role-based controls.", {
    left: 58,
    top: 360,
    width: 910,
    height: 78
  }, { fontSize: 26, color: COLORS.muted });
  addLine(slide, "closing-accent", { left: 58, top: 502, width: 398, height: 0 }, COLORS.blue, 5);
  addText(slide, "closing-request", "Request: Approval to undertake TribeTalk as a Minor Project", {
    left: 58,
    top: 530,
    width: 800,
    height: 36
  }, { fontSize: 24, bold: true, color: COLORS.ink });
  addText(slide, "closing-team", "Team: Tribe Innovators", { left: 58, top: 610, width: 400, height: 28 }, { fontSize: 18, color: COLORS.muted });
  addSpeakerNotes(slide, ["TribeTalk project repository and README (project scope, accessed 2026-07-24)."]);
}

async function main() {
  const presentation = Presentation.create({ slideSize: { width: WIDTH, height: HEIGHT } });

  createCover(presentation);
  createProblemSlide(presentation);
  createSolutionSlide(presentation);
  createObjectivesSlide(presentation);
  createFeaturesSlide(presentation);
  createArchitectureSlide(presentation);
  createStackSlide(presentation);
  createTimelineSlide(presentation);
  createImpactSlide(presentation);
  createClosingSlide(presentation);

  await fs.mkdir("C:/Users/piyus/OneDrive/Documents/TribeTalk", { recursive: true });
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(OUTPUT_PATH);
  console.log(`Created ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
