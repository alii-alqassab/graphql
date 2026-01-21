import { GraphQLService } from "./graphqlService";
import { sanitizeTokenString } from "../token-utils";

const TECHNICAL_SKILLS = [
  { key: "prog", label: "Elementary programming" },
  { key: "front-end", label: "Front-end" },
  { key: "algo", label: "Elementary algorithms" },
  { key: "back-end", label: "Back-end" },
  { key: "tcp", label: "TCP/IP" },
  { key: "stats", label: "Statistics" },
  { key: "ai", label: "AI" },
  { key: "game", label: "Game programming" },
  { key: "sys-admin", label: "System administration" },
  { key: "blockchain", label: "Blockchain" },
  { key: "mobile-dev", label: "Mobile development" },
  { key: "cybersecurity", label: "Cybersecurity" },
  { key: "cloud", label: "Cloud" },
];

const TECHNOLOGY_SKILLS = [
  { key: "go", label: "Go" },
  { key: "js", label: "JS" },
  { key: "html", label: "HTML" },
  { key: "c", label: "C" },
  { key: "sql", label: "SQL" },
  { key: "css", label: "CSS" },
  { key: "unix", label: "Unix" },
  { key: "docker", label: "Docker" },
  { key: "rust", label: "Rust" },
  { key: "java", label: "Java" },
  { key: "shell", label: "Shell" },
  { key: "php", label: "PHP" },
  { key: "python", label: "Python" },
  { key: "ruby", label: "Ruby" },
  { key: "c++", label: "C++" },
  { key: "graphql", label: "GraphQL" },
  { key: "ruby-on-rails", label: "Ruby on Rails" },
  { key: "laravel", label: "Laravel" },
  { key: "django", label: "Django" },
  { key: "electron", label: "Electron" },
  { key: "git", label: "Git" },
];

export async function fetchProfileData(token, userId) {
  const sanitizedToken = sanitizeTokenString(token);

  if (!sanitizedToken) {
    throw new Error("Missing authentication token.");
  }

  if (!Number.isFinite(userId)) {
    throw new Error("Cannot determine the authenticated user.");
  }

  const service = new GraphQLService({ token: sanitizedToken });

  const results = await Promise.all([
    service.getUserInfo(),
    service.getAuditRatio(),
    service.getXpAmount(),
    service.getUserLevel(),
    service.getUserProjectXp(),
    service.getUserSkills(),
  ]);

  const [
    userResult,
    auditRatioResult,
    xpAmountResult,
    userLevelResult,
    projectXpResult,
    skillsResult,
  ] = results;

  const rawUser = requireData(userResult, "user info");
  const xpAggregate = optionalData(xpAmountResult);
  const levelEntry = optionalData(userLevelResult);
  const projectTransactions = requireData(projectXpResult, "project XP");
  const skillTransactions = optionalData(skillsResult) ?? [];
  const auditRatioData = optionalData(auditRatioResult) ?? {};

  const profile = normalizeUser(rawUser);
  const xpTimeline = buildXpTimeline(projectTransactions);
  const xpByProject = buildXpByProject(projectTransactions);
  const skillRadar = buildSkillRadarData(skillTransactions);

  const totalXp =
    Number(xpAggregate?.aggregate?.sum?.amount) || sumXp(projectTransactions);
  const level = Number(levelEntry?.amount) || 0;
  const auditsGiven = Number(auditRatioData?.totalUp) || 0;
  const auditsReceived = Number(auditRatioData?.totalDown) || 0;

  const ratio =
    typeof auditRatioData?.auditRatio === "number"
      ? auditRatioData.auditRatio
      : auditsReceived === 0
      ? 0
      : auditsGiven / Math.max(1, auditsReceived);

  return {
    profile,
    summary: {
      totalXp,
      auditRatio: ratio,
      auditsGiven,
      auditsReceived,
      level,
    },
    xpTimeline,
    xpByProject,
    skillRadar,
  };
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  const attrs = parseAttrs(user.attrs);
  const nameParts = [attrs?.firstName, attrs?.lastName].filter(Boolean);

  return {
    id: user.id,
    login: user.login,
    name: nameParts.join(" ") || user.login,
    campus: user.campus,
    email: user.email,
    attrs,
  };
}

function parseAttrs(attrs) {
  if (!attrs) {
    return null;
  }

  if (typeof attrs === "object") {
    return attrs;
  }

  if (typeof attrs === "string") {
    try {
      return JSON.parse(attrs);
    } catch {
      return null;
    }
  }

  return null;
}

function buildXpTimeline(transactions) {
  let running = 0;
  return transactions.map((tx) => {
    running += Number(tx?.amount) || 0;
    const fallbackId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `tx-${Math.random().toString(36).slice(2, 9)}`;
    return {
      id: tx?.id ?? fallbackId,
      label: new Date(tx?.createdAt || Date.now()).toLocaleDateString(),
      value: running,
    };
  });
}

function buildXpByProject(transactions) {
  const map = new Map();

  transactions.forEach((tx) => {
    const name =
      tx?.object?.name ||
      tx?.path?.split("/").filter(Boolean).pop() ||
      `#${tx?.object?.id || tx?.objectId || tx?.id}`;
    const current = map.get(name) || 0;
    map.set(name, current + (Number(tx?.amount) || 0));
  });

  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function buildSkillRadarData(transactions) {
  const skillMap = new Map();

  transactions.forEach((tx) => {
    const key = normalizeSkillType(tx?.type);
    if (!key) {
      return;
    }
    const value = Math.max(Number(tx?.amount) || 0, 0);
    const current = skillMap.get(key) || 0;
    if (value > current) {
      skillMap.set(key, value);
    }
  });

  const toRadarData = (entries) =>
    entries.reduce((acc, entry) => {
      const value = roundSkillValue(skillMap.get(entry.key));
      if (value > 0) {
        acc.push({ label: entry.label, value });
      }
      return acc;
    }, []);

  return {
    technical: toRadarData(TECHNICAL_SKILLS),
    technologies: toRadarData(TECHNOLOGY_SKILLS),
  };
}

function normalizeSkillType(type) {
  if (typeof type !== "string") {
    return "";
  }
  const lowered = type.toLowerCase();
  if (!lowered.startsWith("skill_")) {
    return "";
  }
  const normalized = lowered.replace(/^skill_/, "").replace(/[_\s]+/g, "-");
  return normalized;
}

function roundSkillValue(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return Math.round(safeValue * 10) / 10;
}

function sumXp(transactions) {
  return transactions.reduce(
    (total, tx) => total + (Number(tx?.amount) || 0),
    0
  );
}

function requireData(result, label) {
  const [data, error] = result ?? [];
  if (error) {
    throw error;
  }
  if (data === null || data === undefined) {
    throw new Error(`${label} is not available.`);
  }
  return data;
}

function optionalData(result) {
  const [data, error] = result ?? [];
  if (error) {
    throw error;
  }
  return data ?? null;
}

