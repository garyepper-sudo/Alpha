import { Organism } from "../types/stewardship";

export function OrganismGraph({ organism }: { organism?: Organism }) {
  const nodes = organism?.nodes || [];
  return (
    <div className="organismGraph">
      <div className="graphCore" />
      {nodes.slice(0, 9).map((node, i) => (
        <div key={node.id} className={`graphNode graphNode${i}`} title={node.label}>
          <span />
        </div>
      ))}
      {nodes.slice(0, 8).map((node, i) => <div key={`line-${node.id}`} className={`graphLine graphLine${i}`} />)}
    </div>
  );
}
