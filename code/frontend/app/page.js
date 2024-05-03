"use client";

// Imports
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithubAlt } from "@fortawesome/free-brands-svg-icons";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

// Start of the Build
export default function Home() {

  // Hooks
  const [uploadedImage, setUploadedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [showDropzone, setShowDropzone] = useState(true);

// Blindness Detection Effect
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

  // Wait effect
  useEffect(() => {
    let timeoutId;
    if (loading) {
      const dotsElement = document.getElementById("dots");
      let dotCount = 0;
      function updateDots() {
        dotCount = (dotCount % 5) + 1;
        dotsElement.textContent = ".".repeat(dotCount);
        timeoutId = setTimeout(updateDots, 500);
      }
      updateDots();
    }
    return () => clearTimeout(timeoutId);
  }, [loading]);


  // Handle of Submit
  const handleSubmit = async () => {
    setLoading(true);
    setShowDropzone(false);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://blindnessdetection.csproject.org/api/uploads",
        formData
      );
      setPrediction(response.data.message);
    } catch (error) {
      console.error("Error during file prediction:", error);
      alert("Failed to predict the image.");
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  // Handle of the file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const objectUrl = URL.createObjectURL(file);
      setUploadedImage(objectUrl);
      setPrediction(null); // Reset prediction info
    } else {
      resetState();
    }
  };


  // State of the reset
  const resetState = () => {
    setFile(null);
    setUploadedImage(null);
    setPrediction(null);
    setShowDropzone(true);
  };

  // Reset Handler
  const handleReset = () => {
    resetState();
    setLoading(false);
  };

  // Drag Handler
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Drop Handler
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFile(file);
      const objectUrl = URL.createObjectURL(file);
      setUploadedImage(objectUrl);
      setPrediction(null);
    } else {
      resetState();
    }
  };

  // Drop Zone Handler
  const handleDropZoneClick = () => {
    fileInputRef.current.click();
  };

  // Start of the UI/UX Build
  return (
    <>
    <div className={styles.wholeContainer}>
      <div className={styles.links}>
        <a
          href="https://github.com/BinaryQuBit/Blindness-Detection"
          title="Github Repository"
        >
          <FontAwesomeIcon className={styles.faIcon} icon={faGithubAlt} />
        </a>
        <a
          href="/alienDataset.zip"
          download="/alienDataset.zip"
          title="Download Dataset"
        >
          <FontAwesomeIcon className={styles.faIcon} icon={faDownload} />
        </a>
      </div>
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
        <div className={styles.middleContainer}>
          <div className={styles.leftContainer}>
            Architecture: Inception-V3
          </div>
          <div className={styles.makeAppear}>
            Accuracy: 77.68%
          </div>
          {showDropzone && (
    <div
      className={styles.dropzone}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleDropZoneClick}
    >
      Drag and drop your X-ray here, or click here to select a file
    </div>
)}

          <div className={styles.rightContainer}>
            Accuracy: 77.68%
          </div>
        </div>
        {uploadedImage && (
          <div className={styles.imagePreview}>
            <Image
              src={uploadedImage}
              alt="Uploaded X-ray"
              width={200}
              height={200}
            />
            {!loading && (
              <button className={styles.removeButton} onClick={resetState}>
                ✖
              </button>
            )}
          </div>
        )}
        {file && !loading && (
          <button className={styles.uploadButton} onClick={handleSubmit}>
            Predict
          </button>
        )}
        <div className={styles.prediction}>
          {prediction ? (
            <>
              <p>{prediction}</p>
              <button className={styles.resetButton} onClick={handleReset}>
                Reset
              </button>
            </>
          ) : (
            <>
              {loading ? (
                <p>
                  Predicting<span id="dots"></span>
                </p>
              ) : (
                <p>Upload image to predict</p>
              )}
            </>
          )}
        </div>
      </main>
      <div className={styles.secondary}>
        <div className={styles.description}>
          <div className={styles.titleDes}>What is Blindness Detection?</div>
          <div>
            The Blindness Detection aims to develop a computer-aided diagnosis
            system using Convolutional Neural Networks (CNNs) to detect Diabetic
            Retinopathy (DR), a major cause of blindness in diabetic patients.
            Utilizing a large, preprocessed dataset from Kaggle, the project
            employs TensorFlow and Keras to build and train various CNN models.
            These models are evaluated based on accuracy, sensitivity, and
            specificity to create an effective tool for early DR detection,
            helping reduce blindness risk in diabetics.
          </div>
        </div>
        <div>
          <p className={styles.titleDes}>Stages of Diabetic Retinopathy</p>
          <div className={styles.imageContainer}>
            <div className={styles.centerAllign}>
              <img src="/noDR.png" alt="No DR" height={80} />
              <p>No DR</p>
            </div>
            <div className={styles.centerAllign}>
              <img src="/mild.png" alt="Mild" height={80} />
              <p>Mild</p>
            </div>
            <div className={styles.centerAllign}>
              <img src="/moderate.png" alt="Moderate" height={80} />
              <p>Moderate</p>
            </div>
            <div className={styles.centerAllign}>
              <img src="/severe.png" alt="Severe" height={80} />
              <p>Severe</p>
            </div>
            <div className={styles.centerAllign}>
              <img
                src="/proliferativeDR.png"
                alt="Proliferative DR"
                height={80}
              />
              <p>Proliferative DR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
      <div className={styles.centerAllignFooter}>Copyright &copy; 2024 Blindness Detection</div>
      </>
  );
}
