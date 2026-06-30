import { EvidenceObject, OrganismNode, Relationship } from "../../types/stewardship";
import { clamp, confidenceBand, stableId, unique } from "./utils";

function nodeLabelForTag(tag: string) {
  const labels: Record<string, string> = {
    renewal: "Renewal pressure is changing",
    onboarding: "Implementation speed may drive customer outcomes",
    pricing: "Pricing objections may be symptoms, not causes",
    support: "Support burden is becoming strategically relevant",
    revenue: "Revenue quality needs closer inspection",
    risk: "Operational risk may be compounding",
    opportunity: "There may be an expansion lever"
  };
  return labels[tag] || `${tag[0]?.toUpperCase() || "G"}${tag.slice(1)} pattern`;
}

export function buildOrganismNodes(evidence: EvidenceObject[], relationships: Relationship[]): OrganismNode[] {
  const tags = unique(evidence.flatMap((item) => item.tags));

  return tags.map((tag) => {
    const relatedEvidence = evidence.filter((item) => item.tags.includes(tag));
    const relatedIds = relatedEvidence.map((item) => item.id);
    const relevantRelationships = relationships.filter(
      (rel) => relatedIds.includes(rel.fromEvidenceId) || relatedIds.includes(rel.toEvidenceId)
    );
    const contradictionSignals = relatedEvidence.filter((item) => /but|however|despite|contradict|although/i.test(item.statement));
    const avgEvidenceConfidence = relatedEvidence.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, relatedEvidence.length);
    const relationshipBoost = Math.min(0.22, relevantRelationships.length * 0.035);
    const contradictionPenalty = Math.min(0.22, contradictionSignals.length * 0.08);
    const coverageBoost = Math.min(0.18, relatedEvidence.length * 0.04);
    const score = clamp(avgEvidenceConfidence + relationshipBoost + coverageBoost - contradictionPenalty);

    return {
      id: stableId("node", tag),
      label: nodeLabelForTag(tag),
      kind: (tag === "risk" ? "risk" : tag === "opportunity" ? "opportunity" : "pattern") as OrganismNode["kind"],
      evidenceIds: relatedIds,
      supportingEvidence: relatedEvidence.map((item) => item.statement).slice(0, 5),
      contradictingEvidence: contradictionSignals.map((item) => item.statement).slice(0, 3),
      confidence: confidenceBand(score) as OrganismNode["confidence"],
      confidenceScore: score,
      lastUpdated: new Date().toISOString()
    };
  }).sort((a, b) => b.confidenceScore - a.confidenceScore);
}
