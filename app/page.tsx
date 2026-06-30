"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { OrganismGraph } from "./components/OrganismGraph";
import { RawDocument, StewardshipResult } from "./types/stewardship";

const SAMPLE = `Enterprise renewal rate fell from 91% to 78%.
Customers taking longer than 60 days to implement renewed at 62%.
Customers implemented within 30 days renewed at 93%.
Sales notes mention pricing objections, but customer interviews mention onboarding delays.
Support tickets increased 38% for enterprise integrations.`;

type UploadDoc = RawDocument & { size?: number };

export default function Page() {
  const [content, setContent] = useState(SAMPLE);
  const [documents, setDocuments] = useState<UploadDoc[]>([]);
  const [result, setResult] = useState<StewardshipResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState(false);

  const runDocuments = useMemo<RawDocument[]>(() => {
    const pasted = content.trim()
      ? [{ id: "pasted-evidence", name: "Pasted evidence", type: "text" as const, content, createdAt: new Date(0).toISOString() }]
      : [];
    return [...documents, ...pasted];
  }, [content, documents]);

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setReading(true);
    const files = Array.from(event.target.files || []);
    const readable = files.filter((file) =>
      /text|json|csv|markdown/.test(file.type) || /\.(txt|md|csv|json)$/i.test(file.name)
    );
    const skipped = files.length - readable.length;
    const loaded = await Promise.all(
      readable.map(async (file, index): Promise<UploadDoc> => ({
        id: `upload-${file.name}-${file.size}-${index}`,
        name: file.name,
        type: file.name.endsWith(".csv") ? "csv" : "file",
        content: await file.text(),
        createdAt: new Date(0).toISOString(),
        size: file.size
      }))
    );
    setDocuments((existing) => [...existing, ...loaded]);
    setReading(false);
    event.target.value = "";
    if (skipped) setError(`${skipped} file(s) skipped. This test harness currently reads .txt, .md, .csv, and .json files.`);
  }

  async function run() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/stewardship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName: "Red Team Test Company", documents: runDocuments })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Pipeline failed.");
        return;
      }
      setResult(data);
    } catch {
      setLoading(false);
      setError("Could not reach /api/stewardship. Check that this deployment includes the Sprint 3 API route.");
    }
  }

  function clearUploads() {
    setDocuments([]);
    setResult(null);
    setError("");
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="brand">DISCOVERY <span>Sprint 3</span></div>
          <p>Stewardship Engine · Upload-enabled test harness</p>
        </div>
        <div className="statusPill">{result?.organism.maturity || "Seed"}</div>
      </header>

      <section className="heroGrid">
        <div className="heroCopy">
          <div className="eyebrow">Engine Inspector</div>
          <h1>Try to break the organism.</h1>
          <p>
            Upload red-team notes, paste messy evidence, and run the full Sprint 3 pipeline: extraction, approval, relationships, confidence, and executive brief generation.
          </p>
          <div className="pipeline">
            <span>Upload</span><b /> <span>Extract</span><b /> <span>Connect</span><b /> <span>Score</span><b /> <span>Brief</span>
          </div>
        </div>
        <div className="organismCard">
          <OrganismGraph organism={result?.organism} />
          <h3>{result ? result.brief.mostImportantDiscovery : "Waiting for evidence"}</h3>
          <p>{result ? result.brief.whyItMatters : "The engine should surface contradictions, weak evidence, duplicate facts, and stale assumptions instead of manufacturing certainty."}</p>
        </div>
      </section>

      <section className="workspace">
        <div className="panel inputPanel">
          <div className="eyebrow">Evidence input</div>
          <h2>Upload or paste documents</h2>
          <label className="uploadBox">
            <input type="file" multiple accept=".txt,.md,.csv,.json,text/*" onChange={onUpload} />
            <strong>{reading ? "Reading files..." : "Choose red-team docs"}</strong>
            <span>.txt, .md, .csv, and .json supported in this browser test harness</span>
          </label>
          {documents.length > 0 && (
            <div className="uploadList">
              {documents.map((doc) => <div key={doc.id}><strong>{doc.name}</strong><span>{doc.content.length.toLocaleString()} chars</span></div>)}
              <button className="secondary" onClick={clearUploads}>Clear uploaded docs</button>
            </div>
          )}
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={run} disabled={loading || reading || runDocuments.length === 0}>{loading ? "Building organism..." : `Run ${runDocuments.length} document(s)`}</button>
          {error && <div className="error">{error}</div>}
        </div>

        <div className="panel">
          <div className="eyebrow">Replay receipt</div>
          <h2>{result ? result.replayReceipt.deterministicVersion : "No run yet"}</h2>
          <div className="metrics">
            <Metric label="Documents" value={result?.replayReceipt.documentCount || runDocuments.length} />
            <Metric label="Evidence proposed" value={result?.replayReceipt.proposedEvidenceCount || 0} />
            <Metric label="Relationships" value={result?.replayReceipt.relationshipCount || 0} />
            <Metric label="Organism nodes" value={result?.replayReceipt.nodeCount || 0} />
          </div>
        </div>
      </section>

      {result && (
        <section className="resultsGrid">
          <div className="panel wide">
            <div className="eyebrow">Executive Brief</div>
            <h2>{result.brief.title}</h2>
            <div className="briefBlock"><strong>Most important discovery</strong><p>{result.brief.mostImportantDiscovery}</p></div>
            <div className="briefBlock"><strong>Why it matters</strong><p>{result.brief.whyItMatters}</p></div>
            <div className="briefColumns">
              <List title="Supporting evidence" items={result.brief.supportingEvidence} />
              <List title="Decisions that change" items={result.brief.decisionsThatChange} />
              <List title="Next evidence" items={result.brief.nextEvidence} />
            </div>
          </div>

          <div className="panel">
            <div className="eyebrow">Organism nodes</div>
            <div className="nodeStack">
              {result.organism.nodes.map((node) => (
                <div className="nodeCard" key={node.id}>
                  <strong>{node.label}</strong>
                  <span>{node.confidence} · {Math.round(node.confidenceScore * 100)}%</span>
                  <p>{node.supportingEvidence[0]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel wide">
            <div className="eyebrow">Approved Evidence Objects</div>
            <div className="evidenceStack">
              {result.approvedEvidence.map((evidence) => (
                <div className="evidenceCard" key={evidence.id}>
                  <strong>{evidence.statement}</strong>
                  <p>{evidence.sourceName} · {evidence.tags.join(", ")} · {Math.round(evidence.confidence * 100)}%</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span></div>;
}

function List({ title, items }: { title: string; items: string[] }) {
  return <div className="list"><h3>{title}</h3>{items.map((item) => <p key={item}>• {item}</p>)}</div>;
}
