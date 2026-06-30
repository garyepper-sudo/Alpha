import { EvidenceObject, RawDocument, SourceQuality } from "../../types/stewardship";
import { clamp, splitStatements, stableId, unique } from "./utils";

const TAG_RULES: Record<string, string[]> = {
  renewal: ["renewal", "renew", "churn", "retention"],
  onboarding: ["implement", "implementation", "onboard", "setup", "time-to-value", "handoff"],
  pricing: ["price", "pricing", "discount", "budget", "cost"],
  support: ["support", "ticket", "issue", "bug", "integration"],
  revenue: ["revenue", "arr", "sales", "growth", "pipeline"],
  customer: ["customer", "account", "buyer", "user"],
  risk: ["risk", "decline", "delay", "constraint", "blocked", "fell"],
  opportunity: ["expand", "opportunity", "increase", "growth", "improve"]
};

function inferTags(statement: string) {
  const lower = statement.toLowerCase();
  const tags = Object.entries(TAG_RULES)
    .filter(([, words]) => words.some((word) => lower.includes(word)))
    .map(([tag]) => tag);
  return unique(tags.length ? tags : ["general"]);
}

function inferSourceQuality(document: RawDocument): SourceQuality {
  const lower = `${document.name} ${document.type}`.toLowerCase();
  if (lower.includes("export") || lower.includes("csv") || lower.includes("financial") || lower.includes("crm")) return "high";
  if (lower.includes("interview") || lower.includes("memo") || lower.includes("transcript")) return "medium";
  return "medium";
}

function scoreEvidence(statement: string, quality: SourceQuality) {
  const hasNumber = /\d/.test(statement);
  const hasComparison = /(fell|rose|increased|decreased|higher|lower|from|to|versus|vs\.)/i.test(statement);
  const base = quality === "high" ? 0.72 : quality === "medium" ? 0.58 : 0.42;
  return clamp(base + (hasNumber ? 0.12 : 0) + (hasComparison ? 0.1 : 0));
}

export function extractEvidence(documents: RawDocument[]): EvidenceObject[] {
  return documents.flatMap((document) => {
    const quality = inferSourceQuality(document);
    return splitStatements(document.content).map((statement, index) => ({
      id: stableId("ev", `${document.id}:${index}:${statement}`),
      statement,
      sourceId: document.id,
      sourceName: document.name,
      sourceQuote: statement.slice(0, 240),
      tags: inferTags(statement),
      owner: "Human reviewer",
      createdAt: document.createdAt,
      status: "proposed",
      sourceQuality: quality,
      freshnessScore: 1,
      confidence: scoreEvidence(statement, quality)
    }));
  });
}
