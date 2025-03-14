import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as faceapi from "face-api.js";

export default function BiometricAuth() {
  const [status, setStatus] = useState("Waiting for authentication...");
  const videoRef = useRef(null);

  useEffect(() => {
    if (!window.PublicKeyCredential) {
      setStatus("WebAuthn not supported on this device");
    }
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    };
    loadModels();
  }, []);

  const startFaceRecognition = async () => {
    setStatus("Starting face recognition...");
    if (videoRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;
    }
  };

  const handleFingerprintAuth = async () => {
    if (!window.PublicKeyCredential) {
      setStatus("WebAuthn is not supported on this device.");
      return;
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: { name: "Biometric Auth App" },
          user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "User",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: false,
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "none",
        },
      });

      if (credential) {
        setStatus("Fingerprint authentication successful!");
      } else {
        setStatus("Authentication failed.");
      }
    } catch (error) {
      setStatus("Authentication error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold mb-4">
        Biometric Authentication
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
        {status}
      </motion.p>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-blue-500 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-blue-600 mb-4"
        onClick={handleFingerprintAuth}
      >
        Scan Fingerprint
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-green-500 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-green-600"
        onClick={startFaceRecognition}
      >
        Start Face Recognition
      </motion.button>
      <video ref={videoRef} autoPlay className="mt-4 w-64 h-48 rounded-lg border" />
    </div>
  );
}
