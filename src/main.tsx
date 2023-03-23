import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ForceGraph2D } from 'react-force-graph'

function genRandomTree(N = 300, reverse = false) {
  return {
    nodes: [...Array(N).keys()].map(i => ({ id: i })),
      links: [...Array(N).keys()]
    .filter(id => id)
    .map(id => ({
      [reverse ? 'target' : 'source']: id,
      [reverse ? 'source' : 'target']: Math.round(Math.random() * (id-1))
    }))
  };
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ForceGraph2D graphData={genRandomTree()} />
  </React.StrictMode>,
)
