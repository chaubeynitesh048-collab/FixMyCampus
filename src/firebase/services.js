/**
 * firebase/services.js
 * High-level service methods for Firebase Storage, Auth, and Firestore
 * with zero-config graceful fallbacks.
 */

import { storage, isFirebaseConfigured } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a compressed image file to Firebase Storage.
 * If Firebase is not configured or fails, falls back to dataUrl.
 */
export async function uploadComplaintPhoto(file, dataUrl, complaintId, index = 0) {
  if (!isFirebaseConfigured || !storage) {
    // Return base64 dataUrl directly for local demo persistence
    return dataUrl;
  }

  try {
    const timestamp = Date.now();
    const storagePath = `complaints/${complaintId || 'temp'}/${timestamp}_photo_${index}.jpg`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file, {
      contentType: 'image/jpeg',
      customMetadata: {
        complaintId: complaintId || 'unassigned',
        uploadedAt: new Date().toISOString(),
      },
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload failed, falling back to local image data:', error);
    return dataUrl;
  }
}
