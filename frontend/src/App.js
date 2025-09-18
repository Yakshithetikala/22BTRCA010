import React, { useState } from "react";
import { log } from "./log";

function App() {
  const [url, setUrl] = useState("");

  const handleShorten = async () => {
    // Example logging when user clicks "Shorten"
    await log(
      "frontend",
      "info",
      "component",
      `User attempted to shorten URL: ${url}`
    );

    // Your URL shortening logic goes here...
    alert("This is where shortening logic will run.");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>URL Shortener</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <button onClick={handleShorten}>Shorten</button>
    </div>
  );
}

export default App;
