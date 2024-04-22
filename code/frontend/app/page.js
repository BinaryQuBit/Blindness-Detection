"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import styles from "./page.module.css";

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    fetch("http://localhost:5000")
      .then((res) => res.json())
      .then((data) => {
        console.log("Server message:", data.message);
      });
  }, []);

  useEffect(() => {
    const text = "Blindness Detection ";
    const typingElement = document.getElementById("typing");
    let i = 0;
    const speed = 150;

    function typeEffect() {
      if (i < text.length) {
        typingElement.textContent = text.substring(0, i + 1);
        i++;
        setTimeout(typeEffect, speed);
      } else {
        typingElement.classList.add(styles.blinkingCursor);
      }
    }

    typeEffect();
  }, []);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/uploads",
        formData
      );
      setPrediction(response.data.message);
    } catch (error) {
      console.error("Error during file prediction:", error);
      alert("Failed to predict the image.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const objectUrl = URL.createObjectURL(file);
      setUploadedImage(objectUrl);
    } else {
      setFile(null);
      setUploadedImage(null);
      setPrediction(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFile(file);
      const objectUrl = URL.createObjectURL(file);
      setUploadedImage(objectUrl);
    } else {
      setFile(null);
      setUploadedImage(null);
      setPrediction(null);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current.click();
  };

  const clearSelection = () => {
    setFile(null);
    setUploadedImage(null);
    setPrediction(null);
  };

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <span id="typing" className={styles.typing}></span>
      </div>
      <input
        type="file"
        id="xray-upload"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
        accept="image/jpeg, image/png"
      />
      <div
        className={styles.dropzone}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleDropZoneClick}
      >
        Drag and drop your X-ray here, or click here to select a file
      </div>
      {uploadedImage && (
        <div className={styles.imagePreview}>
          <Image
            src={uploadedImage}
            alt="Uploaded X-ray"
            width={200}
            height={200}
          />
          <button className={styles.removeButton} onClick={clearSelection}>
            ✖
          </button>
        </div>
      )}
      {file && (
        <button className={styles.uploadButton} onClick={handleSubmit}>
          Predict
        </button>
      )}
      <div className={styles.prediction}>
        {file ? (
          prediction ? (
            <p>{prediction}</p>
          ) : (
            <p>Waiting for prediction...</p>
          )
        ) : (
          <p>Upload image to predict</p>
        )}
      </div>
    </main>
  );
}
