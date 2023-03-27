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
  const graphDataInitialState = {
    nodes: [{ id: 0 }],
    links: [],
  };

  const [limit, setLimit] = useState(5);
  const [query, setQuery] = useState("");
  const [graphData, setGraphData] = useState(graphDataInitialState);

  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    setQuery(e.currentTarget.value);
  }

  async function handleNodeClick(node) {
    const { similar } = await getArtists(node.name, limit);
    const duplicates: string[] = [];

    // add nodes
    setGraphData((prevGraphData: any): any => {
      const newSimilarArtists = similar.map((artist) => {
        return { ...artist };
      });

      for (let i = 0; i < newSimilarArtists.length; i++) {
        for (let j = 0; j < prevGraphData.nodes.length; j++) {
          if (newSimilarArtists[i].name === prevGraphData.nodes[j].name) {
            const [removed] = newSimilarArtists.splice(i, 1);
            duplicates.push(removed.name);
            break;
          }
        }
      }

      const newSimilarArtistsWithId = newSimilarArtists.map(
        (artist, index) => ({
          ...artist,
          id: prevGraphData.nodes.length + index,
        })
      );
      const newNodes = [...prevGraphData.nodes, ...newSimilarArtistsWithId];

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

      duplicates.forEach((artistName) => {
        const duplicateArtist = prevGraphData.nodes.find(
          (artist) => artist.name === artistName
        );

        newLinks.push({
          source: node.id,
          target: duplicateArtist.id,
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

  function handleLimitChange(e) {
    setLimit(e.currentTarget.value);
  }

  return (
    <div className="App">
      <h1>Similar Artists Visualizer</h1>
      <input
        type="textbox"
        onChange={handleChange}
        placeholder="artist/band/musician ..."
      />
      <input type="number" value={limit} onChange={handleLimitChange} />
      <button onClick={handleClick}>Search</button>
      <ForceGraph2D graphData={graphData} onNodeClick={handleNodeClick} />
    </div>
  );
}

export default App;
