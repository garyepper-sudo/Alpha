import { ExecutiveBrief, Organism } from "../../types/stewardship";

export function compileExecutiveBrief(organism: Organism): ExecutiveBrief {
  const topNode = organism.nodes[0];
  const secondNode = organism.nodes[1];

  if (!topNode) {
    return {
      title: "Executive Brief — Evidence Needed",
      mostImportantDiscovery: "No approved evidence has entered the organism yet.",
      whyItMatters: "Discovery should not create strategic conclusions until evidence has been reviewed and approved.",
      supportingEvidence: [],
      decisionsThatChange: ["Do not change strategy yet.", "Prioritize collecting the first high-quality evidence packet."],
      enterpriseValueImpact: ["Reduces false confidence.", "Protects executive judgment from unsupported AI output."],
      confidence: "Low",
      nextEvidence: ["Upload or paste CRM, customer, support, financial, or operating evidence."]
    };
  }

  return {
    title: "Executive Brief — What Changed",
    mostImportantDiscovery: topNode.label,
    whyItMatters: secondNode
      ? `The strongest pattern now connects to ${secondNode.label.toLowerCase()}, which suggests the issue may be systemic rather than isolated.`
      : "The organism has formed its first evidence-backed pattern, but needs more coverage before stronger recommendations are appropriate.",
    supportingEvidence: topNode.supportingEvidence,
    decisionsThatChange: [
      "Treat the strongest pattern as an executive review item.",
      "Do not resolve the visible symptom until the underlying relationship has been tested.",
      "Assign an owner to collect the next evidence packet."
    ],
    enterpriseValueImpact: [
      "Improves capital allocation by distinguishing root causes from symptoms.",
      "Reduces strategic risk by making confidence and contradiction visible.",
      "Creates a repeatable evidence trail for leadership decisions."
    ],
    confidence: topNode.confidence,
    nextEvidence: [
      "Add one quantitative source that tests the strongest pattern.",
      "Add one qualitative source that challenges the current interpretation.",
      "Review contradictions before moving this into an executive recommendation."
    ]
  };
}
