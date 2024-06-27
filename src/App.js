// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  // Function to send detections to backend
  const sendDetectionsToBackend = async (objects) => {
    try {
      const response = await fetch("http://localhost:5000/api/detections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ objects }),
      });
      if (!response.ok) {
        throw new Error("Failed to send detection data to backend");
      }
      console.log("Detection data sent successfully");
    } catch (error) {
      console.error("Error sending detection data:", error);
    }
  };  

  // Main function
  const runCoco = async () => {
    const net = await cocossd.load();
    console.log("coco-ssd model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const objs = await net.detect(video);
      setDetectedObjects(objs); // Update detected objects state
      sendDetectionsToBackend(objs); // Send detections to backend

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawRect(objs, ctx); 
    }
  };

  useEffect(()=>{runCoco()},[]);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10, // Position at the bottom of the page
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 10,
            width: "100%",
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: 10,
          }}
        >
          <h2>Detected Objects</h2>
          <p>Number of objects detected: {detectedObjects.length}</p>
          <ul>
            {detectedObjects.map((obj, index) => (
              <li key={index}>{obj.class}</li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
