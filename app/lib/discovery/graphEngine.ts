import { EvidenceObject, Relationship } from "../../types/stewardship";
import { stableId } from "./utils";

function sharedTags(a: EvidenceObject, b: EvidenceObject) {
  return a.tags.filter((tag) => b.tags.includes(tag));
}

function relationshipType(a: EvidenceObject, b: EvidenceObject): Relationship["type"] {
  const joined = `${a.statement} ${b.statement}`.toLowerCase();
  if (joined.includes("pricing") && (joined.includes("onboard") || joined.includes("implement"))) return "depends_on";
  if ((joined.includes("fell") || joined.includes("declin")) && (joined.includes("support") || joined.includes("delay"))) return "causes";
  return "correlates_with";
}

export function discoverRelationships(evidence: EvidenceObject[]): Relationship[] {
  const relationships: Relationship[] = [];

  for (let i = 0; i < evidence.length; i += 1) {
    for (let j = i + 1; j < evidence.length; j += 1) {
      const a = evidence[i];
      const b = evidence[j];
      const overlap = sharedTags(a, b);
      if (overlap.length === 0) continue;
      const type = relationshipType(a, b);
      const strength = Math.min(1, 0.32 + overlap.length * 0.16 + (a.confidence + b.confidence) / 8);
      relationships.push({
        id: stableId("rel", `${a.id}:${b.id}:${type}`),
        fromEvidenceId: a.id,
        toEvidenceId: b.id,
        type,
        explanation: `Evidence shares ${overlap.join(", ")} context, suggesting a ${type.replace("_", " ")} relationship.`,
        strength
      });
    }
  }

  return relationships.sort((a, b) => b.strength - a.strength).slice(0, 24);
}
