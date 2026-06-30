import { EvidenceObject, Organism, Relationship } from "../../types/stewardship";
import { buildOrganismNodes } from "./confidenceEngine";

export function buildOrganism(name: string, evidence: EvidenceObject[], relationships: Relationship[]): Organism {
  const now = new Date().toISOString();
  const nodes = buildOrganismNodes(evidence, relationships);
  const maturity =
    nodes.length >= 10 ? "Mature" :
    nodes.length >= 5 ? "Emerging network" :
    nodes.length >= 1 ? "First pattern" :
    "Seed";

  return {
    id: "org_default",
    name,
    createdAt: now,
    updatedAt: now,
    evidence,
    relationships,
    nodes,
    maturity
  };
}
