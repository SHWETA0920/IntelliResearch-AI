// import { useMemo, useState } from "react";
// import dagre from "@dagrejs/dagre";
// import {
//   ReactFlow,
//   Background,
//   Controls,
//   // MiniMap,
//   MarkerType,
//   Position,
//   Handle
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";

// const COLORS = {
//   relevant: "#27845B",
//   partially_relevant: "#B7791F",
//   low_relevance: "#B84049",
//   unknown: "#687386",
// };

// function getPaperId(value) {
//   if (value && typeof value === "object") {
//     return value.id ?? value.pk;
//   }
//   return value;
// }

// function getRelevance(paper) {
//   // Use a relevance result only if the backend has supplied one.
//   const value =
//     paper.relevance ??
//     paper.raw_ai_data?.relevance?.status;

//   const normalized = String(value || "").toLowerCase();

//   if (["relevant", "high"].includes(normalized)) {
//     return "relevant";
//   }

//   if (
//     ["partially_relevant", "partially relevant", "medium"].includes(
//       normalized
//     )
//   ) {
//     return "partially_relevant";
//   }

//   if (["low_relevance", "low"].includes(normalized)) {
//     return "low_relevance";
//   }

// //   console.log("PAPER RELEVANCE DEBUG:", papers.map((paper) => ({
// //   id: paper.id,
// //   title: paper.title,
// //   relevance: paper.relevance,
// //   raw_ai_data: paper.raw_ai_data,
// //   relevance_reason: paper.relevance_reason,
// // })));

//   return "unknown";
// }

// function PaperNode({ data }) {
//   const color = COLORS[data.relevance] || COLORS.unknown;

//   return (
//     <div
//       style={{
//         position: "relative",
//         width: 190,
//         padding: 12,
//         borderRadius: 10,
//         border: `2px solid ${color}`,
//         background: "#101B2B",
//         color: "#F4F7FB",
//         boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
//       }}
//     >
//       <Handle
//         type="target"
//         position={Position.Top}
//         style={{
//           width: 9,
//           height: 9,
//           background: "#E8963D",
//           border: "2px solid #101B2B",
//         }}
//       />

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

//       <Handle
//         type="source"
//         position={Position.Bottom}
//         style={{
//           width: 9,
//           height: 9,
//           background: "#E8963D",
//           border: "2px solid #101B2B",
//         }}
//       />
//     </div>
//   );
// }

// const nodeTypes = { paper: PaperNode };

// export default function CitationGraph({
//   papers = [],
//   citations = [],
// }) {
//   const [selectedPaper, setSelectedPaper] = useState(null);

//     const { nodes, edges } = useMemo(() => {
//     const graph = new dagre.graphlib.Graph();

//     graph.setDefaultEdgeLabel(() => ({}));

//     graph.setGraph({
//       rankdir: "TB",
//       nodesep: 60,
//       ranksep: 100,
//       marginx: 40,
//       marginy: 40,
//     });

//     const paperIds = new Set(papers.map((paper) => String(paper.id)));

//     // Register every paper with Dagre.
//     papers.forEach((paper) => {
//       graph.setNode(String(paper.id), {
//         width: 218,
//         height: 110,
//       });
//     });

//     // Build citation edges, preserving citing -> cited direction.
//     const edges = citations
//       .map((citation, index) => {
//         const sourceId = getPaperId(
//           citation.citing_paper ?? citation.source
//         );

//         const targetId = getPaperId(
//           citation.cited_paper ?? citation.target
//         );

//         if (sourceId == null || targetId == null) {
//           return null;
//         }

//         const source = String(sourceId);
//         const target = String(targetId);

//         if (
//           source === target ||
//           !paperIds.has(source) ||
//           !paperIds.has(target)
//         ) {
//           return null;
//         }

//         graph.setEdge(source, target);

//         return {
//           id: `citation-${citation.id ?? index}`,
//           source,
//           target,
//           type: "smoothstep",
//           markerEnd: {
//             type: MarkerType.ArrowClosed,
//             color: "#E8963D",
//           },
//           style: {
//             stroke: "#E8963D",
//             strokeWidth: 2,
//           },
//         };
//       })
//       .filter(Boolean);

//     // Calculate top-to-bottom positions.
//     dagre.layout(graph);

//     const nodes = papers.map((paper, index) => {
//       const id = String(paper.id);
//       const layout = graph.node(id);

//       return {
//         id,
//         type: "paper",
//         position: {
//           x: layout.x - 109,
//           y: layout.y - 55,
//         },
//         sourcePosition: Position.Bottom,
//         targetPosition: Position.Top,
//         data: {
//           label:
//             paper.title?.trim() ||
//             paper.name?.trim() ||
//             `Paper ${paper.id}`,
//           number: index + 1,
//           relevance: getRelevance(paper),
//           paper,
//         },
//       };
//     });

//     return { nodes, edges };
//   }, [papers, citations]);

//   if (!papers.length) {
//     return <p>No papers are available for the citation graph.</p>;
//   }

//   return (
//     <div style={{ width: "100%", color: "inherit" }}>
//       <div
//         style={{
//           display: "flex",
//           flexWrap: "wrap",
//           gap: 12,
//           marginBottom: 12,
//           fontSize: 12,
//         }}
//       >
//         {Object.entries(COLORS).map(([status, color]) => (
//           <span
//             key={status}
//             style={{
//               display: "flex",
//               gap: 6,
//               alignItems: "center",
//             }}
//           >
//             <span
//               style={{
//                 width: 10,
//                 height: 10,
//                 borderRadius: "50%",
//                 background: color,
//               }}
//             />
//             {status.replaceAll("_", " ")}
//           </span>
//         ))}
//       </div>

//       <div
//         style={{
//           height: 520,
//           borderRadius: 12,
//           overflow: "hidden",
//           border: "1px solid rgba(145,164,189,0.25)",
//         }}
//       >
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           nodeTypes={nodeTypes}
//           fitView
//           onNodeClick={(_, node) => setSelectedPaper(node.data)}
//           proOptions={{ hideAttribution: true }}
//         >
//           <Background color="#64748B" gap={24} />
//           <Controls
//   style={{
//     backgroundColor: "#101B2B",
//     border: "1px solid #334155",
//     borderRadius: 8,
//     overflow: "hidden",
//   }}
//   showInteractive={false}
// />
//         </ReactFlow>
//       </div>

//       {!edges.length && (
//         <p style={{ fontSize: 13, marginTop: 10 }}>
//           No citation links between the displayed papers were found.
//         </p>
//       )}

//       {selectedPaper && (
//         <div
//           style={{
//             marginTop: 14,
//             padding: 16,
//             borderRadius: 10,
//             background: "rgba(100,116,139,0.12)",
//           }}
//         >
//           <h3 style={{ marginTop: 0 }}>
//             {selectedPaper.label}
//           </h3>

//           <p>
//             <strong>Relevance status:</strong>{" "}
//             {selectedPaper.relevance === "unknown"
//               ? "Not assessed yet"
//               : selectedPaper.relevance.replaceAll("_", " ")}
//           </p>

//           {selectedPaper.paper.abstract && (
//             <p>
//               <strong>Abstract:</strong>{" "}
//               {selectedPaper.paper.abstract}
//             </p>
//           )}

//           {selectedPaper.paper.relevance_reason && (
//             <p>
//               <strong>Assessment:</strong>{" "}
//               {selectedPaper.paper.relevance_reason}
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useMemo, useState } from "react";
import dagre from "@dagrejs/dagre";

import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Position,
  Handle,
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
  const value =
    paper.relevance ??
    paper.raw_ai_data?.relevance?.status;

  const normalized = String(value || "").toLowerCase();

  if (["relevant", "high"].includes(normalized)) {
    return "relevant";
  }

  if (
    [
      "partially_relevant",
      "partially relevant",
      "medium",
    ].includes(normalized)
  ) {
    return "partially_relevant";
  }

  if (
    ["low_relevance", "low"].includes(normalized)
  ) {
    return "low_relevance";
  }

  return "unknown";
}


function PaperNode({ data }) {
  const color =
    COLORS[data.relevance] || COLORS.unknown;

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

      <div
        style={{
          fontSize: 11,
          opacity: 0.75,
        }}
      >
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


const nodeTypes = {
  paper: PaperNode,
};


export default function CitationGraph({
  papers = [],
  citations = [],
  paperRelevances = [],
}) {
  const [selectedPaper, setSelectedPaper] = useState(null);

  const { nodes, edges } = useMemo(() => {
    const graph = new dagre.graphlib.Graph();

    graph.setDefaultEdgeLabel(() => ({}));

    graph.setGraph({
      rankdir: "TB",
      nodesep: 70,
      ranksep: 110,
      marginx: 40,
      marginy: 40,
    });

    const paperIds = new Set(
      papers.map((paper) => String(paper.id))
    );

    papers.forEach((paper) => {
      graph.setNode(String(paper.id), {
        width: 218,
        height: 110,
      });
    });

    const graphEdges = [];

    const addLayoutEdge = (source, target) => {
      if (
        source !== target &&
        paperIds.has(source) &&
        paperIds.has(target)
      ) {
        graph.setEdge(source, target);
      }
    };


    // -----------------------------------------
    // 1. CITATION EDGES
    // Direction: citing paper -> cited paper
    // -----------------------------------------

    citations.forEach((citation, index) => {
      const sourceId = getPaperId(
        citation.citing_paper ?? citation.source
      );

      const targetId = getPaperId(
        citation.cited_paper ?? citation.target
      );

      if (
        sourceId == null ||
        targetId == null
      ) {
        return;
      }

      const source = String(sourceId);
      const target = String(targetId);

      if (
        source === target ||
        !paperIds.has(source) ||
        !paperIds.has(target)
      ) {
        return;
      }

      addLayoutEdge(source, target);

      graphEdges.push({
        id: `citation-${citation.id ?? index}`,
        source,
        target,
        type: "smoothstep",
        label: "Cites",
        labelStyle: {
          fill: "#E8963D",
          fontSize: 10,
          fontWeight: 700,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#E8963D",
        },
        style: {
          stroke: "#E8963D",
          strokeWidth: 2.2,
        },
      });
    });


    // -----------------------------------------
    // 2. PAIRWISE RELEVANCE EDGES
    // Undirected: A <-> B
    // -----------------------------------------

    paperRelevances.forEach(
      (relationship, index) => {
        const aId = getPaperId(
          relationship.paper_a ??
          relationship.paperA
        );

        const bId = getPaperId(
          relationship.paper_b ??
          relationship.paperB
        );

        if (
          aId == null ||
          bId == null
        ) {
          return;
        }

        const source = String(aId);
        const target = String(bId);

        if (
          source === target ||
          !paperIds.has(source) ||
          !paperIds.has(target)
        ) {
          return;
        }

        const score = Number(
          relationship.score ??
          relationship.relevance_score ??
          0
        );

        addLayoutEdge(source, target);

        graphEdges.push({
          id: `relevance-${relationship.id ?? index}`,
          source,
          target,
          type: "smoothstep",
          label: `Relevant ${Math.round(score * 100)}%`,
          labelStyle: {
            fill: "#54C58A",
            fontSize: 10,
            fontWeight: 700,
          },
          markerStart: {
            type: MarkerType.ArrowClosed,
            color: "#54C58A",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#54C58A",
          },
          style: {
            stroke: "#54C58A",
            strokeWidth: 2.5,
            strokeDasharray: "7 4",
          },
          data: {
            reason: relationship.reason,
            evidence: relationship.evidence,
            score,
          },
        });
      }
    );


    // -----------------------------------------
    // 3. TOP-TO-BOTTOM LAYOUT
    // -----------------------------------------

    dagre.layout(graph);

    const graphNodes = papers.map(
      (paper, index) => {
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
      }
    );

    return {
      nodes: graphNodes,
      edges: graphEdges,
    };

  }, [papers, citations, paperRelevances]);


  if (!papers.length) {
    return (
      <p>
        No papers are available for the citation
        and relevance graph.
      </p>
    );
  }


  const selectedTitle =
    selectedPaper?.label ||
    selectedPaper?.paper?.title ||
    "Selected paper";


  return (
    <div
      style={{
        width: "100%",
        color: "inherit",
      }}
    >

      {/* Graph legend */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 12,
          fontSize: 12,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 22,
              borderTop: "2px solid #E8963D",
            }}
          />
          Citation (directional)
        </span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 22,
              borderTop: "2px dashed #54C58A",
            }}
          />
          Relevance (two-way)
        </span>

        {Object.entries(COLORS).map(
          ([status, color]) => (
            <span
              key={status}
              style={{
                display: "inline-flex",
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
          )
        )}
      </div>


      {/* Graph */}
      <div
        style={{
          height: 520,
          borderRadius: 12,
          overflow: "hidden",
          border:
            "1px solid rgba(145,164,189,0.25)",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          onNodeClick={(_, node) => {
            setSelectedPaper(node.data);
          }}
          proOptions={{
            hideAttribution: false,
          }}
        >
          <Background
            color="#64748B"
            gap={24}
          />

          <Controls
            style={{
              backgroundColor: "#101B2B",
              border: "1px solid #334155",
              borderRadius: 8,
              overflow: "hidden",
            }}
            showInteractive={false}
          />
        </ReactFlow>
      </div>


      {/* Empty relationships message */}
      {!edges.length && (
        <p
          style={{
            fontSize: 13,
            marginTop: 10,
          }}
        >
          No citation or pairwise relevance links
          were found between the displayed papers.
        </p>
      )}


      {/* Selected paper details */}
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
            {selectedTitle}
          </h3>

          <p>
            <strong>Topic relevance:</strong>{" "}
            {selectedPaper.relevance === "unknown"
              ? "Not assessed yet"
              : selectedPaper.relevance.replaceAll(
                  "_",
                  " "
                )}
          </p>

          {selectedPaper.paper?.abstract && (
            <p>
              <strong>Abstract:</strong>{" "}
              {selectedPaper.paper.abstract}
            </p>
          )}

          {selectedPaper.paper?.raw_ai_data
            ?.relevance?.reason && (
            <p>
              <strong>Topic assessment:</strong>{" "}
              {
                selectedPaper.paper.raw_ai_data
                  .relevance.reason
              }
            </p>
          )}

          {selectedPaper.paper?.authors && (
            <p>
              <strong>Authors:</strong>{" "}
              {selectedPaper.paper.authors}
            </p>
          )}

          {selectedPaper.paper?.year && (
            <p>
              <strong>Year:</strong>{" "}
              {selectedPaper.paper.year}
            </p>
          )}
        </div>
      )}

    </div>
  );
}