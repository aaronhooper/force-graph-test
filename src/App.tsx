import "./App.css";
import { ForceGraph2D } from "react-force-graph";
import { useCallback, useEffect, useState } from "react";

async function getArtists(
  query: string,
  limit: number
): Promise<Record<string, any>> {
  const apiKey = "269da84a1701721e5910142a21121af4";
  const url = `//ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${query}&api_key=${apiKey}&limit=${limit}&format=json`;
  const response = await fetch(url);
  const json = await response.json();

  if (json.hasOwnProperty("error")) {
    throw new Error(json.message);
  }

  const artistMatch: string = json.similarartists["@attr"].artist;
  const artists = json.similarartists.artist.map(
    ({ name, url }: Record<string, string>) => ({ name, url })
  );

  return { match: artistMatch, similar: artists };
}

function App() {
  const limit = 5;
  const graphDataInitialState = {
    nodes: [{ id: 0 }],
    links: [],
  };
  const [query, setQuery] = useState("");
  const [graphData, setGraphData] = useState(graphDataInitialState);

  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    setQuery(e.currentTarget.value);
  }

  async function handleNodeClick(node) {
    const { match, similar } = await getArtists(node.name, limit);

    // add nodes
    setGraphData((prevGraphData: any): any => {
      const artistsWithIndex = similar.map((artist, index) => ({
        ...artist,
        id: index + prevGraphData.nodes.length,
      }));

      const newNodes = [...prevGraphData.nodes, ...artistsWithIndex];

      return { ...prevGraphData, nodes: newNodes };
    });

    // add links
    setGraphData((prevGraphData: any): any => {
      const newLinks: Record<string, number>[] = [];
      const newNodes = prevGraphData.nodes.slice(
        prevGraphData.nodes.length - limit
      );

      newNodes.forEach((newNode: Record<any, any>, index: number) => {
        newLinks.push({
          source: node.id,
          target: prevGraphData.nodes.length + index - limit,
        });
      });

      return { ...prevGraphData, links: [...prevGraphData.links, ...newLinks] };
    });
  }

  async function handleClick() {
    const { match, similar } = await getArtists(query, limit);

    // reset graph
    setGraphData({ ...graphDataInitialState, nodes: [{ id: 0, name: match }] });

    // add nodes
    setGraphData((prevGraphData: any): any => {
      const artistsWithIndex = similar.map((artist, index) => ({
        ...artist,
        id: index + prevGraphData.nodes.length,
      }));

      const newNodes = [...prevGraphData.nodes, ...artistsWithIndex];

      return { ...prevGraphData, nodes: newNodes };
    });

    // add links
    setGraphData((prevGraphData: any): any => {
      const newLinks: Record<string, number>[] = [];

      prevGraphData.nodes.forEach((node: Record<any, any>, index: number) => {
        if (node.id === 0) return;
        newLinks.push({ source: 0, target: index });
      });

      return { ...prevGraphData, links: [...newLinks] };
    });
  }

  return (
    <div className="App">
      <h1>Similar Artists Visualizer</h1>
      <input type="textbox" onChange={handleChange} />
      <button onClick={handleClick}>Search</button>
      <ForceGraph2D graphData={graphData} onNodeClick={handleNodeClick} />
    </div>
  );
}

export default App;
