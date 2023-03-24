import "./App.css";
import { ForceGraph2D } from "react-force-graph";
import { useEffect, useState } from "react";

function App() {
  const [graphData, setGraphData] = useState({
    nodes: [{ id: 0 }],
    links: [],
  });

  console.log(graphData);

  useEffect(() => {
    const interval = setInterval(() => {
      setGraphData(({ nodes, links }) => {
        const id = nodes.length;
        return {
          nodes: [...nodes, { id }],
          links: [
            ...links,
            { source: id, target: Math.round(Math.random() * (id - 1)) },
          ],
        };
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="App">
      <ForceGraph2D graphData={graphData} />
    </div>
  );
}

export default App;
