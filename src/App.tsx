import "./App.css";
import { ForceGraph2D } from "react-force-graph";
import { useState } from "react";

async function getArtists(
  query: string,
  limit: number
): Promise<Record<string, any>> {
  const apiKey = "269da84a1701721e5910142a21121af4";
  const url = `http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${query}&api_key=${apiKey}&limit=${limit}&format=json`;
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
  const graphDataInitialState = {
    nodes: [{ id: 0 }],
    links: [],
  };

  const [limit, setLimit] = useState(5);
  const [query, setQuery] = useState("");
  const [graphData, setGraphData] = useState(graphDataInitialState);

  function handleTextboxChange(e: React.FormEvent<HTMLInputElement>) {
    setQuery(e.currentTarget.value);
  }

  async function handleNodeClick(node) {
    const { similar } = await getArtists(node.name, limit);

    setGraphData((prevGraphData: any): any => {
      const [newNodes, duplicateNodes] = similar.reduce(
        (acc, artist, index) => {
          const existingArtist = prevGraphData.nodes.find(
            (prevArtist) => prevArtist.name === artist.name
          );

          if (existingArtist) {
            acc[1].push(existingArtist);
            return acc;
          }

          acc[0].push({
            ...artist,
            id: prevGraphData.nodes.at(-1).id + 1 + index,
          });
          return acc;
        },
        [[], []]
      );

      const newLinks: Record<string, number>[] = [];

      newNodes.forEach((newNode) => {
        newLinks.push({
          source: node.id,
          target: newNode.id,
        });
      });

      duplicateNodes.forEach((duplicate) => {
        newLinks.push({
          source: node.id,
          target: duplicate.id,
        });
      });

      return {
        nodes: [...prevGraphData.nodes, ...newNodes],
        links: [...prevGraphData.links, ...newLinks],
      };
    });
  }

  async function handleButtonClick() {
    const { match, similar } = await getArtists(query, limit);

    setGraphData({ ...graphDataInitialState, nodes: [{ id: 0, name: match }] });

    setGraphData((prevGraphData: any): any => {
      const newNodes = similar.map((artist, index) => ({
        ...artist,
        id: prevGraphData.nodes.length + index,
      }));

      const newLinks = newNodes.map((artist) => ({
        source: 0,
        target: artist.id,
      }));

      return {
        nodes: [...prevGraphData.nodes, ...newNodes],
        links: [...prevGraphData.links, ...newLinks],
      };
    });
  }

  function handleLimitChange(e) {
    setLimit(e.currentTarget.value);
  }

  return (
    <div className="App">
      <h1>Similar Artists Visualizer</h1>
      <input
        type="textbox"
        onChange={handleTextboxChange}
        placeholder="artist/band/musician ..."
      />
      <input type="number" value={limit} onChange={handleLimitChange} />
      <button onClick={handleButtonClick}>Search</button>
      <ForceGraph2D graphData={graphData} onNodeClick={handleNodeClick} />
    </div>
  );
}

export default App;
