import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [error, setError] = useState(null);
  const [flashActive, setFlashActive] = useState(false);

  useEffect(() => {
    let activeStream = null;

    async function startCamera() {
      try {
        setError(null);
        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((e) => console.log('Autoplay handled', e));
        }
      } catch (err) {
        console.warn('getUserMedia error:', err);
        setError(
          'Could not access camera. Please allow camera permissions or use the file upload option.'
        );
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current) return;

    // Trigger visual shutter flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Stop streams
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    onCapture(dataUrl);
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Take Campus Problem Photo</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Frame */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-slate-300 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-sm">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 rounded-xl text-white text-xs font-semibold"
              >
                Use Device File Picker Instead
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Shutter flash overlay */}
              {flashActive && <div className="absolute inset-0 bg-white opacity-80" />}

              {/* Viewfinder crosshairs */}
              <div className="absolute inset-6 border-2 border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-12 h-12 border border-emerald-400/60 rounded-full" />
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        {!error && (
          <div className="p-4 bg-slate-950/80 flex items-center justify-between">
            <button
              onClick={toggleCamera}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Switch Camera (Front/Back)"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/30 transition-transform active:scale-90"
              title="Take Photo"
            >
              <Camera className="w-7 h-7" />
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
