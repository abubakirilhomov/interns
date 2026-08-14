// Penalty severity weights — how much each violation category affects rating.
// The higher the severity, the bigger the hit to the intern's rating score.
export const PENALTY_WEIGHTS = {
  green: 0.2,
  yellow: 0.5,
  red: 1.0,
  black: 2.0,
};

// Severity order — used to determine the "worst" penalty level for badges.
export const SEVERITY_ORDER = ["green", "yellow", "red", "black"];

// Compute a penalty summary for an intern given their violations and a
// ruleId → category map. Returns counts per category, total deduction and
// the worst (highest severity) level currently on the intern.
export function computePenalties(violations = [], ruleMap = {}) {
  const counts = { green: 0, yellow: 0, red: 0, black: 0 };
  let totalDeduction = 0;
  let worstLevel = null;

  for (const v of violations) {
    const rule = ruleMap[String(v.ruleId)];
    // Default to yellow if the rule is missing (e.g. deleted) so a penalty
    // never silently disappears from the rating.
    const category = rule?.category || v.rule?.category || "yellow";
    if (counts[category] !== undefined) counts[category] += 1;
    totalDeduction += PENALTY_WEIGHTS[category] || 0;
    if (
      worstLevel === null ||
      SEVERITY_ORDER.indexOf(category) > SEVERITY_ORDER.indexOf(worstLevel)
    ) {
      worstLevel = category;
    }
  }

  return {
    counts,
    total: violations.length,
    totalDeduction: +totalDeduction.toFixed(2),
    worstLevel, // null | green | yellow | red | black
  };
}

// Build a ruleId → category map from a list of Rule documents.
export function buildRuleMap(rules = []) {
  const map = {};
  for (const r of rules) {
    map[String(r._id)] = r.category;
  }
  return map;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

// Maps a penalty severity level to a Tailwind badge class.
// green → success, yellow → warning, red → error, black → neutral
export const PENALTY_BADGE_CLASS = {
  green: "badge-success",
  yellow: "badge-warning",
  red: "badge-error",
  black: "badge-neutral",
};

// Maps a penalty severity level to a Tailwind text color class.
export const PENALTY_TEXT_COLOR = {
  green: "text-success",
  yellow: "text-warning",
  red: "text-error",
  black: "text-neutral",
};

// Maps a penalty severity level to a Tailwind background color class.
export const PENALTY_BG_COLOR = {
  green: "bg-success/10",
  yellow: "bg-warning/10",
  red: "bg-error/10",
  black: "bg-neutral/10",
};

// Maps a penalty severity level to a display label.
export const PENALTY_LABELS = {
  green: "Yashil",
  yellow: "Sariq",
  red: "Qizil",
  black: "Qora",
};

// Returns the badge class for a given penalty level, or null if no penalties.
export function getPenaltyBadgeClass(level) {
  if (!level || !PENALTY_BADGE_CLASS[level]) return null;
  return PENALTY_BADGE_CLASS[level];
}

// Returns the text color class for a given penalty level.
export function getPenaltyTextColor(level) {
  if (!level || !PENALTY_TEXT_COLOR[level]) return "text-base-content/40";
  return PENALTY_TEXT_COLOR[level];
}

// Returns the background color class for a given penalty level.
export function getPenaltyBgColor(level) {
  if (!level || !PENALTY_BG_COLOR[level]) return "bg-base-200";
  return PENALTY_BG_COLOR[level];
}

// Returns a human-readable label for a penalty level.
export function getPenaltyLabel(level) {
  if (!level) return "Shtraf yo'q";
  return PENALTY_LABELS[level] || level;
}

// Returns the worst penalty level from a penaltyInfo object, or null.
export function getWorstLevel(penaltyInfo) {
  if (!penaltyInfo) return null;
  return penaltyInfo.worstLevel || null;
}

// Returns the total number of violations from a penaltyInfo object.
export function getTotalViolations(penaltyInfo) {
  if (!penaltyInfo) return 0;
  return penaltyInfo.total || 0;
}

// ─── Rating color helpers ────────────────────────────────────────────────────

// Maps a rating score to a color class.
// Scores are usually 0-5, but can exceed 5 for very high attendance
// (attendanceFactor is uncapped — see int-server's getRatings()).
export const getRatingColorClass = (score) => {
  if (score >= 4.5) return "text-green-500 bg-green-100";
  if (score >= 3.5) return "text-blue-500 bg-blue-100";
  if (score >= 2.5) return "text-yellow-500 bg-yellow-100";
  if (score >= 1.5) return "text-orange-500 bg-orange-100";
  return "text-red-500 bg-red-100";
};

// Maps a rating severity level to a display label.
export const RATING_LABELS = {
  black: "Qora",
  red: "Qizil",
  yellow: "Sariq",
  green: "Yashil",
};

// Maps a rating severity level to a badge class.
export const RATING_BADGE_CLASSES = {
  black: "badge-neutral",
  red: "badge-error",
  yellow: "badge-warning",
  green: "badge-success",
};

// Maps a rating severity level to a progress bar color.
export const RATING_PROGRESS_COLORS = {
  black: "progress-neutral",
  red: "progress-error",
  yellow: "progress-warning",
  green: "progress-success",
};

// Returns the badge class for a given rating level.
export function getRatingBadgeClass(level) {
  return RATING_BADGE_CLASSES[level] || "badge-ghost";
}

// Returns the progress bar color class for a given rating level.
export function getRatingProgressColor(level) {
  return RATING_PROGRESS_COLORS[level] || "progress-error";
}

// Returns the label for a given rating level.
export function getRatingLabel(level) {
  return RATING_LABELS[level] || level;
}

// ─── Hobby/Collection helpers ───────────────────────────────────────────────

// Hobby categories and their colors for profile display
export const HOBBY_CATEGORIES = {
  coding: { name: "Dasturlash", color: "bg-blue-100 text-blue-700", icon: "FaCode" },
  design: { name: "Tasarim", color: "bg-purple-100 text-purple-700", icon: "FaPalette" },
  writing: { name: "Yazma", color: "bg-green-100 text-green-700", icon: "FaEdit" },
  teaching: { name: "O'qitish", color: "bg-orange-100 text-orange-700", icon: "FaUsers" },
  sports: { name: "Sport", color: "bg-red-100 text-red-700", icon: "FaDumbbell" },
  music: { name: "Musiqa", color: "bg-yellow-100 text-yellow-700", icon: "FaMusic" },
  photography: { name: "Fotografiya", color: "bg-pink-100 text-pink-700", icon: "FaCamera" },
  gaming: { name: "O'yin", color: "bg-indigo-100 text-indigo-700", icon: "FaGamepad" },
};

// Default hobby if none specified
export const DEFAULT_HOBBY = {
  name: "Dasturiy ta'minlash",
  color: "bg-gray-100 text-gray-600",
  icon: "FaServer",
};

// Notification types for hobby changes
export const NOTIFICATION_TYPES = {
  newHobby: "yangi_yutuq",
  hobbyUpdated: "yutuq_ozgartildi",
};

// Get hobby by category key
export function getHobbyByCategory(category) {
  return HOBBY_CATEGORIES[category] || DEFAULT_HOBBY;
}

// Get all hobbies as an array
export function getAllHobbies() {
  return Object.values(HOBBY_CATEGORIES);
}

// Get hobby color class
export function getHobbyColorClass(category) {
  const hobby = HOBBY_CATEGORIES[category];
  return hobby ? hobby.color : DEFAULT_HOBBY.color;
}

// Get hobby icon component name
export function getHobbyIcon(category) {
  const hobby = HOBBY_CATEGORIES[category];
  return hobby ? hobby.icon : DEFAULT_HOBBY.icon;
}