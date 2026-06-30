import { RawDocument, StewardshipResult } from "../../types/stewardship";
import { approveEvidence, approvedOnly } from "./approvalEngine";
import { compileExecutiveBrief } from "./briefCompiler";
import { extractEvidence } from "./evidenceEngine";
import { discoverRelationships } from "./graphEngine";
import { buildOrganism } from "./organismStore";
import { stableId } from "./utils";

export function runStewardshipPipeline(input: {
  organizationName?: string;
  documents: RawDocument[];
  approvedEvidenceIds?: string[];
}): StewardshipResult {
  const createdAt = new Date().toISOString();
  const proposedEvidence = extractEvidence(input.documents);
  const reviewedEvidence = approveEvidence(proposedEvidence, input.approvedEvidenceIds);
  const approvedEvidence = approvedOnly(reviewedEvidence);
  const relationships = discoverRelationships(approvedEvidence);
  const organism = buildOrganism(input.organizationName || "Discovery Demo Organization", approvedEvidence, relationships);
  const brief = compileExecutiveBrief(organism);

  return {
    runId: stableId("run", JSON.stringify({ docs: input.documents, approved: input.approvedEvidenceIds || "all" })),
    createdAt,
    proposedEvidence,
    approvedEvidence,
    organism,
    brief,
    replayReceipt: {
      documentCount: input.documents.length,
      proposedEvidenceCount: proposedEvidence.length,
      approvedEvidenceCount: approvedEvidence.length,
      relationshipCount: relationships.length,
      nodeCount: organism.nodes.length,
      deterministicVersion: "stewardship-engine-v0.3.0"
    }
  };
}
