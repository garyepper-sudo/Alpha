import { EvidenceObject } from "../../types/stewardship";

export function approveEvidence(evidence: EvidenceObject[], approvedIds?: string[]) {
  const allowed = approvedIds && approvedIds.length > 0 ? new Set(approvedIds) : null;
  return evidence.map((item) => ({
    ...item,
    status: allowed === null || allowed.has(item.id) ? "approved" as const : "rejected" as const
  }));
}

export function approvedOnly(evidence: EvidenceObject[]) {
  return evidence.filter((item) => item.status === "approved");
}
