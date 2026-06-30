export type EvidenceStatus = "proposed" | "approved" | "rejected";
export type ConfidenceBand = "Low" | "Emerging" | "Stabilizing" | "Strong" | "Very High";
export type SourceQuality = "low" | "medium" | "high";

export type RawDocument = {
  id: string;
  name: string;
  type: "text" | "file" | "csv" | "transcript" | "memo";
  content: string;
  createdAt: string;
};

export type EvidenceObject = {
  id: string;
  statement: string;
  sourceId: string;
  sourceName: string;
  sourceQuote: string;
  tags: string[];
  owner: string;
  createdAt: string;
  status: EvidenceStatus;
  sourceQuality: SourceQuality;
  freshnessScore: number;
  confidence: number;
};

export type Relationship = {
  id: string;
  fromEvidenceId: string;
  toEvidenceId: string;
  type: "supports" | "contradicts" | "depends_on" | "causes" | "correlates_with";
  explanation: string;
  strength: number;
};

export type OrganismNode = {
  id: string;
  label: string;
  kind: "evidence" | "pattern" | "risk" | "opportunity" | "decision";
  evidenceIds: string[];
  supportingEvidence: string[];
  contradictingEvidence: string[];
  confidence: ConfidenceBand;
  confidenceScore: number;
  lastUpdated: string;
};

export type Organism = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  evidence: EvidenceObject[];
  relationships: Relationship[];
  nodes: OrganismNode[];
  maturity: "Seed" | "First pattern" | "Emerging network" | "Mature";
};

export type ExecutiveBrief = {
  title: string;
  mostImportantDiscovery: string;
  whyItMatters: string;
  supportingEvidence: string[];
  decisionsThatChange: string[];
  enterpriseValueImpact: string[];
  confidence: ConfidenceBand;
  nextEvidence: string[];
};

export type StewardshipResult = {
  runId: string;
  createdAt: string;
  proposedEvidence: EvidenceObject[];
  approvedEvidence: EvidenceObject[];
  organism: Organism;
  brief: ExecutiveBrief;
  replayReceipt: {
    documentCount: number;
    proposedEvidenceCount: number;
    approvedEvidenceCount: number;
    relationshipCount: number;
    nodeCount: number;
    deterministicVersion: string;
  };
};
