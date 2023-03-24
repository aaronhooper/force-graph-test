import "./App.css";
import { genRandomTree } from "./util";
import { ForceGraph2D } from "react-force-graph";

function App() {
  return (
    <div className="App">
      <ForceGraph2D graphData={genRandomTree()} />
    </div>
  );
}

export default App;
