import { NextResponse } from "next/server";
import { RawDocument } from "../../types/stewardship";
import { runStewardshipPipeline } from "../../lib/discovery/stewardshipEngine";
import { stableId } from "../../lib/discovery/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const documents: RawDocument[] = Array.isArray(body.documents)
      ? body.documents
      : [
          {
            id: stableId("doc", body.content || "empty"),
            name: body.name || "Pasted evidence",
            type: "text",
            content: body.content || "",
            createdAt: new Date().toISOString()
          }
        ];

    if (!documents.some((doc) => doc.content && doc.content.trim().length > 0)) {
      return NextResponse.json({ error: "No evidence content supplied." }, { status: 400 });
    }

    const result = runStewardshipPipeline({
      organizationName: body.organizationName,
      documents,
      approvedEvidenceIds: body.approvedEvidenceIds
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Stewardship pipeline failed." }, { status: 500 });
  }
}
