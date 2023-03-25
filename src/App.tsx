import "./App.css";
import { ForceGraph2D } from "react-force-graph";
import { useCallback, useEffect, useState } from "react";

function App() {
  const [graphData, setGraphData] = useState({
    nodes: [{ id: 0 }],
    links: [],
  });

  console.log(graphData);

  const handleBackgroundClick = useCallback(() => {
    setGraphData((graphData) => {
      const { nodes, links } = graphData;
      const id = nodes.length;
      return {
        nodes: [...nodes, { id }],
        links: [
          ...links,
          { source: id, target: Math.round(Math.random() * (id - 1)) },
        ],
      };
    });
  }, [graphData, setGraphData]);

  return (
    <div className="App">
      <h1>Similar Artists Visualizer</h1>
      <input type="textbox" />
      <button>Search</button>
      <ForceGraph2D
        graphData={graphData}
        onBackgroundClick={handleBackgroundClick}
      />
    </div>
  );
}

export default App;
