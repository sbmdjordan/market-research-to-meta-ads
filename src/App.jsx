// Entry point. The whole tool is the pipeline: research → segments → offer →
// headlines → creatives. The creative studio (the original engine) is the
// final step, rendered by Pipeline once headlines exist.
import Pipeline from './Pipeline'

function App() {
  return <Pipeline />
}

export default App
