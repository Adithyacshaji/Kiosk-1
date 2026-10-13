/**
 * Department Utilities
 * Provides standardized collegiate short names (e.g., CS, ME, CE, EEE, ECE, BSH, MBA, ADMIN)
 * and corresponding icons for academic and administrative departments.
 */

export const getDeptShortName = (deptOrName) => {
  if (!deptOrName) return "";

  // If object with explicit code or shortName
  if (typeof deptOrName === "object") {
    if (deptOrName.shortName) return deptOrName.shortName;
    if (deptOrName.code) {
      const codeUpper = deptOrName.code.toUpperCase().trim();
      if (codeUpper === "CSE") return "CS"; // User preferred shortname CS for Computer Science
      if (codeUpper === "MECH") return "ME";
      if (codeUpper === "CIVIL") return "CE";
      if (codeUpper.length <= 5 && codeUpper !== "COMP") {
        return codeUpper;
      }
    }
  }

  const rawName = typeof deptOrName === "string" ? deptOrName : (deptOrName.name || deptOrName.title || "");
  const name = rawName.trim().toLowerCase();

  // Match Department Name patterns with word boundaries
  if (name.includes("computer") || /\bcs\b/i.test(name) || /\bcse\b/i.test(name)) return "CS";
  if (name.includes("mechanical") || /\bmech?\b/i.test(name)) return "ME";
  if (name.includes("civil") || /\bce\b/i.test(name)) return "CE";
  if (
    (name.includes("electronic") && name.includes("comm")) ||
    (name.includes("electrical") && name.includes("comm")) ||
    /\bece\b/i.test(name) || /\bec\b/i.test(name)
  ) return "ECE";
  if (
    name.includes("electrical") ||
    /\beee\b/i.test(name) || /\bee\b/i.test(name)
  ) return "EEE";
  if (name.includes("basic science") || name.includes("humanities") || /\bbsh\b/i.test(name)) return "BSH";
  if (name.includes("business administration") || /\bmba\b/i.test(name)) return "MBA";
  if (name.includes("administration") || /\badmin\b/i.test(name)) return "ADMIN";
  if (name.includes("artificial intelligence") || name.includes("data science") || /\baids?\b/i.test(name)) return "AI/DS";
  if (name.includes("information tech") || /\bit\b/i.test(name)) return "IT";

  // If name is already a short acronym (<= 5 chars)
  if (rawName.trim().length <= 5 && !name.includes(" ")) {
    return rawName.trim().toUpperCase();
  }

  // Fallback: extract initials
  const initials = rawName
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .join("");

  return initials.substring(0, 4) || rawName.substring(0, 3).toUpperCase();
};

export const getDeptIconName = (deptOrName) => {
  const short = getDeptShortName(deptOrName);
  switch (short) {
    case 'CS': return 'Monitor';
    case 'ME': return 'Wrench';
    case 'CE': return 'Landmark';
    case 'EEE': return 'Zap';
    case 'ECE': return 'Radio';
    case 'BSH': return 'GraduationCap';
    case 'MBA': return 'Briefcase';
    case 'ADMIN': return 'Building2';
    case 'AI/DS': return 'Cpu';
    default: return 'GraduationCap';
  }
};
