import "./App.css";
import { ForceGraph2D } from "react-force-graph";
import { useCallback, useEffect, useState } from "react";

async function getArtists(
  query: string,
  limit: number
): Promise<Record<string, string>[]> {
  const apiKey = "269da84a1701721e5910142a21121af4";
  const url = `//ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${query}&api_key=${apiKey}&limit=${limit}&format=json`;

  const response = await fetch(url);
  const json = await response.json();

  if (json.hasOwnProperty("error")) {
    throw new Error(json.message);
  }

  return json.similarartists.artist.map(
    ({ name, url }: Record<string, string>) => ({ name, url })
  );
}

function App() {
  const limit = 5;
  const [query, setQuery] = useState("");
  const [graphData, setGraphData] = useState({
    nodes: [{ id: 0, name: query }],
    links: [],
  });

  console.log(graphData);

  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    setQuery(e.currentTarget.value);
  }

  async function handleClick() {
    const artists = await getArtists(query, limit);

    setGraphData((prevGraphData: any): any => {
      const artistsWithIndex = artists.map((artist, index) => ({
        ...artist,
        id: index + prevGraphData.nodes.length,
      }));

      const newNodes = [...prevGraphData.nodes, ...artistsWithIndex];

      return { ...prevGraphData, nodes: newNodes };
    });

    setGraphData((prevGraphData: any): any => {
      const newLinks: Record<string, number>[] = [];

      prevGraphData.nodes.forEach((node: Record<any, any>, index: number) => {
        if (node.id === 0) return;
        newLinks.push({ source: 0, target: index });
      });

      return { ...prevGraphData, links: [...newLinks] };
    });
  }

  const handleBackgroundClick = useCallback(() => {
    setGraphData((graphData: any): any => {
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
      <input type="textbox" onChange={handleChange} />
      <button onClick={handleClick}>Search</button>
      <ForceGraph2D graphData={graphData} />
    </div>
  );
}

export default App;
