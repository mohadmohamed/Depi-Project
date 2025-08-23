
import { useEffect, useState } from "react";


function App() {
  const [ping, setPing] = useState("");

  const testPing = async () => {
    setPing("Loading...");
    try {
      const res = await fetch("/api/home/ping");
      const data = await res.json();
      setPing(data.message);
    } catch (err) {
      setPing("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Hello  World</h1>
      <button onClick={testPing}>Ping MVC Backend</button>
      <div style={{ marginTop: 10, color: 'green' }}>{ping}</div>
    </div>
  );
}

export default App;
