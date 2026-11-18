import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Eye, X, Image as ImageIcon, CheckCircle, Sparkles } from 'lucide-react';
import { compressImage, formatBytes } from '../utils/imageCompressor';
import CameraCapture from './CameraCapture';

export default function PhotoUploader({ photos = [], onPhotosChange, maxPhotos = 3 }) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const [compressionStats, setCompressionStats] = useState(null);

  const galleryInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);

  const handleProcessImage = async (fileOrDataUrl) => {
    if (photos.length >= maxPhotos) {
      alert(`You can upload a maximum of ${maxPhotos} photos.`);
      return;
    }

    setIsCompressing(true);
    try {
      const result = await compressImage(fileOrDataUrl, 1280, 1280, 0.78);
      
      const newPhotoObj = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        dataUrl: result.dataUrl,
        file: result.file,
        compressedSize: result.compressedSize,
        originalSize: result.originalSize,
        uploadedAt: new Date().toISOString(),
      };

      const updated = [...photos, newPhotoObj];
      onPhotosChange(updated);

      setCompressionStats({
        orig: formatBytes(result.originalSize),
        comp: formatBytes(result.compressedSize),
        savings: Math.round(((result.originalSize - result.compressedSize) / (result.originalSize || 1)) * 100),
      });

      // Clear compression stats message after 4s
      setTimeout(() => setCompressionStats(null), 4000);
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Could not process this image. Please try another.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleGallerySelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (photos.length >= maxPhotos) break;
      await handleProcessImage(file);
    }

    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleMobileCameraCapture = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      await handleProcessImage(file);
    }
    if (mobileCameraInputRef.current) mobileCameraInputRef.current.value = '';
  };

  const handleWebcamSnapshot = async (dataUrl) => {
    setShowWebcamModal(false);
    await handleProcessImage(dataUrl);
  };

  const handleRemovePhoto = (photoId) => {
    const updated = photos.filter((p) => (typeof p === 'string' ? p !== photoId : p.id !== photoId));
    onPhotosChange(updated);
  };

  const openCameraHandler = () => {
    // If on a mobile device, triggering file input with capture="environment" works best
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && mobileCameraInputRef.current) {
      mobileCameraInputRef.current.click();
    } else {
      setShowWebcamModal(true);
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleGallerySelect}
      />
      <input
        ref={mobileCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleMobileCameraCapture}
      />

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={openCameraHandler}
          disabled={photos.length >= maxPhotos || isCompressing}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-4 h-4" />
          Take Photo
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={photos.length >= maxPhotos || isCompressing}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 text-slate-500" />
          Upload from Gallery
        </button>

        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto font-medium">
          {photos.length}/{maxPhotos} photos
        </span>
      </div>

      {/* Compression notification pill */}
      {isCompressing && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Compressing image on device for lightning-fast upload...</span>
        </div>
      )}

      {compressionStats && !isCompressing && (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>
            Optimized: <strong>{compressionStats.orig}</strong> → <strong>{compressionStats.comp}</strong> ({compressionStats.savings}% smaller)
          </span>
        </div>
      )}

      {/* Thumbnail Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-2">
          {photos.map((photo, idx) => {
            const url = typeof photo === 'string' ? photo : photo.dataUrl;
            const photoId = typeof photo === 'string' ? photo : photo.id;

            return (
              <div
                key={photoId || idx}
                className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-slate-100 dark:bg-slate-800 shadow-sm"
              >
                <img
                  src={url}
                  alt={`Proof #${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                {/* Badge Number */}
                <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  #{idx + 1}
                </span>

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl(url)}
                    className="p-1.5 rounded-full bg-white/90 text-slate-900 hover:bg-white transition-colors"
                    title="Zoom View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photoId)}
                    className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live WebCam Modal */}
      {showWebcamModal && (
        <CameraCapture
          onCapture={handleWebcamSnapshot}
          onClose={() => setShowWebcamModal(false)}
        />
      )}

      {/* Lightbox Zoom Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl">
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalUrl}
              alt="Full Preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
