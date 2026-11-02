import { useMemo, useState } from "react";
import dagre from "@dagrejs/dagre";
import {
  ReactFlow,
  Background,
  Controls,
  // MiniMap,
  MarkerType,
  Position,
  Handle
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const COLORS = {
  relevant: "#27845B",
  partially_relevant: "#B7791F",
  low_relevance: "#B84049",
  unknown: "#687386",
};

function getPaperId(value) {
  if (value && typeof value === "object") {
    return value.id ?? value.pk;
  }
  return value;
}

function getRelevance(paper) {
  // Use a relevance result only if the backend has supplied one.
  const value =
    paper.relevance ??
    paper.raw_ai_data?.relevance?.status;

  const normalized = String(value || "").toLowerCase();

  if (["relevant", "high"].includes(normalized)) {
    return "relevant";
  }

  if (
    ["partially_relevant", "partially relevant", "medium"].includes(
      normalized
    )
  ) {
    return "partially_relevant";
  }

  if (["low_relevance", "low"].includes(normalized)) {
    return "low_relevance";
  }

  return "unknown";
}

// function PaperNode({ data }) {
//   const color = COLORS[data.relevance] || COLORS.unknown;

//   return (
//     <div
//       style={{
//         width: 190,
//         padding: 12,
//         borderRadius: 10,
//         border: `2px solid ${color}`,
//         background: "#101B2B",
//         color: "#F4F7FB",
//         boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
//       }}
//     >
//       <div style={{ fontSize: 11, opacity: 0.75 }}>
//         PAPER {data.number}
//       </div>

//       <div
//         style={{
//           fontSize: 13,
//           fontWeight: 600,
//           margin: "7px 0",
//           overflowWrap: "anywhere",
//         }}
//       >
//         {data.label}
//       </div>

//       <div
//         style={{
//           color,
//           fontSize: 11,
//           fontWeight: 700,
//           textTransform: "uppercase",
//         }}
//       >
//         {data.relevance.replaceAll("_", " ")}
//       </div>
//     </div>
//   );
// }

function PaperNode({ data }) {
  const color = COLORS[data.relevance] || COLORS.unknown;

  return (
    <div
      style={{
        position: "relative",
        width: 190,
        padding: 12,
        borderRadius: 10,
        border: `2px solid ${color}`,
        background: "#101B2B",
        color: "#F4F7FB",
        boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 9,
          height: 9,
          background: "#E8963D",
          border: "2px solid #101B2B",
        }}
      />

      <div style={{ fontSize: 11, opacity: 0.75 }}>
        PAPER {data.number}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          margin: "7px 0",
          overflowWrap: "anywhere",
        }}
      >
        {data.label}
      </div>

      <div
        style={{
          color,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {data.relevance.replaceAll("_", " ")}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 9,
          height: 9,
          background: "#E8963D",
          border: "2px solid #101B2B",
        }}
      />
    </div>
  );
}

const nodeTypes = { paper: PaperNode };

export default function CitationGraph({
  papers = [],
  citations = [],
}) {
  const [selectedPaper, setSelectedPaper] = useState(null);

    const { nodes, edges } = useMemo(() => {
    const graph = new dagre.graphlib.Graph();

    graph.setDefaultEdgeLabel(() => ({}));

    graph.setGraph({
      rankdir: "TB",
      nodesep: 60,
      ranksep: 100,
      marginx: 40,
      marginy: 40,
    });

    const paperIds = new Set(papers.map((paper) => String(paper.id)));

    // Register every paper with Dagre.
    papers.forEach((paper) => {
      graph.setNode(String(paper.id), {
        width: 218,
        height: 110,
      });
    });

    // Build citation edges, preserving citing -> cited direction.
    const edges = citations
      .map((citation, index) => {
        const sourceId = getPaperId(
          citation.citing_paper ?? citation.source
        );

        const targetId = getPaperId(
          citation.cited_paper ?? citation.target
        );

        if (sourceId == null || targetId == null) {
          return null;
        }

        const source = String(sourceId);
        const target = String(targetId);

        if (
          source === target ||
          !paperIds.has(source) ||
          !paperIds.has(target)
        ) {
          return null;
        }

        graph.setEdge(source, target);

        return {
          id: `citation-${citation.id ?? index}`,
          source,
          target,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#E8963D",
          },
          style: {
            stroke: "#E8963D",
            strokeWidth: 2,
          },
        };
      })
      .filter(Boolean);

    // Calculate top-to-bottom positions.
    dagre.layout(graph);

    const nodes = papers.map((paper, index) => {
      const id = String(paper.id);
      const layout = graph.node(id);

      return {
        id,
        type: "paper",
        position: {
          x: layout.x - 109,
          y: layout.y - 55,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        data: {
          label:
            paper.title?.trim() ||
            paper.name?.trim() ||
            `Paper ${paper.id}`,
          number: index + 1,
          relevance: getRelevance(paper),
          paper,
        },
      };
    });

    return { nodes, edges };
  }, [papers, citations]);

  if (!papers.length) {
    return <p>No papers are available for the citation graph.</p>;
  }

  return (
    <div style={{ width: "100%", color: "inherit" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 12,
          fontSize: 12,
        }}
      >
        {Object.entries(COLORS).map(([status, color]) => (
          <span
            key={status}
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: color,
              }}
            />
            {status.replaceAll("_", " ")}
          </span>
        ))}
      </div>

      <div
        style={{
          height: 520,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(145,164,189,0.25)",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          onNodeClick={(_, node) => setSelectedPaper(node.data)}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#64748B" gap={24} />
          <Controls
  style={{
    backgroundColor: "#101B2B",
    border: "1px solid #334155",
    borderRadius: 8,
    overflow: "hidden",
  }}
  showInteractive={false}
/>
    
          {/* <MiniMap
  nodeColor={(node) =>
    COLORS[node.data?.relevance] || COLORS.unknown
  }
  style={{
    backgroundColor: "#101B2B",
    border: "1px solid #334155",
  }}
  maskColor="rgba(0, 0, 0, 0.5)"
  nodeStrokeColor="#E8963D"
  nodeBorderRadius={4}
/> */}
        </ReactFlow>
      </div>

      {!edges.length && (
        <p style={{ fontSize: 13, marginTop: 10 }}>
          No citation links between the displayed papers were found.
        </p>
      )}

      {selectedPaper && (
        <div
          style={{
            marginTop: 14,
            padding: 16,
            borderRadius: 10,
            background: "rgba(100,116,139,0.12)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            {selectedPaper.label}
          </h3>

          <p>
            <strong>Relevance status:</strong>{" "}
            {selectedPaper.relevance === "unknown"
              ? "Not assessed yet"
              : selectedPaper.relevance.replaceAll("_", " ")}
          </p>

          {selectedPaper.paper.abstract && (
            <p>
              <strong>Abstract:</strong>{" "}
              {selectedPaper.paper.abstract}
            </p>
          )}

          {selectedPaper.paper.relevance_reason && (
            <p>
              <strong>Assessment:</strong>{" "}
              {selectedPaper.paper.relevance_reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}