/**
 * ComplaintsContext.jsx
 * Central state management for all campus complaints,
 * multi-step timelines, upvotes, notifications, and escalation rules.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COMPLAINTS } from '../data/seedComplaints';
import { generateComplaintId } from '../utils/idGenerator';
import { isEscalated } from '../utils/helpers';

const ComplaintsContext = createContext();

const STORAGE_KEY = 'fmc_complaints_data';
const NOTIFICATIONS_KEY = 'fmc_notifications_data';

export function ComplaintsProvider({ children }) {
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading complaints from storage:', e);
    }
    return INITIAL_COMPLAINTS;
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading notifications:', e);
    }
    return [
      {
        id: 'notif_1',
        title: 'Status Updated: Fan Repair',
        message: 'Your complaint FMC-2026-0002 has been marked as Resolved by Ramesh Sundaram.',
        complaintId: 'FMC-2026-0002',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        read: false,
        type: 'success',
      },
      {
        id: 'notif_2',
        title: 'Work In Progress: Water Cooler',
        message: 'Santosh Kumar (Plumber) has started repair on FMC-2026-0001.',
        complaintId: 'FMC-2026-0001',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: false,
        type: 'info',
      },
    ];
  });

  // Persist complaints on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch (e) {
      console.warn('Failed saving complaints to localStorage:', e);
    }
  }, [complaints]);

  // Persist notifications on change
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed saving notifications:', e);
    }
  }, [notifications]);

  // Add an in-app notification
  const addNotification = (title, message, complaintId, type = 'info') => {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      complaintId,
      timestamp: new Date().toISOString(),
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Submit a brand new complaint
  const createComplaint = (formData, user) => {
    const newId = generateComplaintId();
    const nowIso = new Date().toISOString();

    // Smart default department routing based on category
    let defaultDept = 'Maintenance Head';
    if (formData.category === 'Electrical') defaultDept = 'Electrician';
    else if (formData.category === 'Plumbing') defaultDept = 'Plumber';
    else if (formData.category === 'Cleanliness / Sanitation') defaultDept = 'Housekeeping';
    else if (formData.category === 'Wi-Fi / Internet') defaultDept = 'IT Support';
    else if (formData.location.includes('Hostel')) defaultDept = 'Warden';
    else if (formData.location.includes('Library')) defaultDept = 'Library In-charge';

    const newComplaint = {
      id: newId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      location: formData.location,
      roomBlock: formData.roomBlock ? formData.roomBlock.trim() : '',
      urgency: formData.urgency || 'Medium',
      status: 'Submitted',
      studentName: user?.displayName || 'Anonymous Student',
      studentEmail: user?.email || 'student@campus.edu',
      studentUid: user?.uid || 'guest',
      createdAt: nowIso,
      upvotes: 1,
      upvotedBy: [user?.uid || 'guest'],
      assignedDepartment: formData.suggestedDepartment || defaultDept,
      photos: formData.photos || [],
      timeline: [
        {
          step: 'Submitted',
          title: 'Complaint Submitted',
          by: `${user?.displayName || 'Student'} (Student)`,
          timestamp: nowIso,
          remark: 'Issue registered through FixMyCampus web portal with initial photo evidence.',
        },
      ],
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Send confirmation notification
    addNotification(
      'Issue Reported Successfully',
      `Your complaint ${newId} has been submitted. It has been routed to ${newComplaint.assignedDepartment}.`,
      newId,
      'success'
    );

    return newComplaint;
  };

  // Get complaint by unique ID
  const getComplaintById = (id) => {
    if (!id) return null;
    const cleanId = id.trim().toUpperCase();
    return complaints.find((c) => c.id.toUpperCase() === cleanId) || null;
  };

  // Upvote / "Me Too" toggle
  const upvoteComplaint = (id, userUid) => {
    const uid = userUid || 'guest_user';
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const alreadyUpvoted = c.upvotedBy && c.upvotedBy.includes(uid);
        let newUpvotedBy;
        let newCount;

        if (alreadyUpvoted) {
          newUpvotedBy = c.upvotedBy.filter((u) => u !== uid);
          newCount = Math.max(0, (c.upvotes || 1) - 1);
        } else {
          newUpvotedBy = [...(c.upvotedBy || []), uid];
          newCount = (c.upvotes || 0) + 1;
        }

        return {
          ...c,
          upvotes: newCount,
          upvotedBy: newUpvotedBy,
        };
      })
    );
  };

  // Staff / Admin updates status and appends timeline step
  const updateComplaintStatus = (id, newStatus, staffUser, remark, afterPhotoUrl = null) => {
    const nowIso = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        const timelineEntry = {
          step: newStatus,
          title: `Status: ${newStatus}`,
          by: staffUser ? `${staffUser.displayName} (${staffUser.department || staffUser.role || 'Staff'})` : 'Campus Administration',
          timestamp: nowIso,
          remark: remark || `Complaint moved to ${newStatus}.`,
        };

        const updated = {
          ...c,
          status: newStatus,
          timeline: [...c.timeline, timelineEntry],
        };

        if (staffUser && staffUser.role === 'staff' && staffUser.department) {
          updated.assignedStaff = {
            name: staffUser.displayName,
            role: staffUser.designation || staffUser.department,
            avatar: staffUser.avatar,
          };
        }

        if (newStatus === 'Resolved') {
          updated.resolvedAt = nowIso;
          updated.resolutionNote = remark || 'Issue has been inspected and resolved.';
          if (afterPhotoUrl) {
            updated.afterPhotos = [...(c.afterPhotos || []), afterPhotoUrl];
          }
        }

        return updated;
      })
    );

    // Notify the student
    const target = complaints.find((c) => c.id === id);
    if (target) {
      addNotification(
        `Status Updated: ${newStatus}`,
        `Complaint ${id} is now ${newStatus}. Note: "${remark || 'No note added.'}"`,
        id,
        newStatus === 'Resolved' ? 'success' : 'info'
      );
    }
  };

  // Student confirms resolution with 1 to 5 star rating
  const confirmResolution = (id, rating, comment, studentUser) => {
    const nowIso = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        const feedbackEntry = {
          confirmed: true,
          rating,
          comment: comment || '',
          submittedAt: nowIso,
        };

        const timelineEntry = {
          step: 'Closed',
          title: 'Student Confirmed Resolution',
          by: `${studentUser?.displayName || c.studentName || 'Student'} (Student)`,
          timestamp: nowIso,
          remark: `Student confirmed resolution with a ${rating}-star rating: "${comment || 'Verified fixed.'}"`,
        };

        return {
          ...c,
          status: 'Resolved',
          studentFeedback: feedbackEntry,
          timeline: [...c.timeline, timelineEntry],
        };
      })
    );

    addNotification(
      'Resolution Feedback Submitted',
      `Thank you for rating complaint ${id} (${rating} stars).`,
      id,
      'success'
    );
  };

  // Student reopens complaint with reason
  const reopenComplaint = (id, reason, studentUser) => {
    const nowIso = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;

        const timelineEntry = {
          step: 'Reopened',
          title: 'Complaint Reopened by Student',
          by: `${studentUser?.displayName || c.studentName || 'Student'} (Student)`,
          timestamp: nowIso,
          remark: `REOPENED: ${reason || 'Problem has recurred or was not resolved satisfactorily.'}`,
        };

        return {
          ...c,
          status: 'Reopened',
          reopenedReason: reason,
          reopenedAt: nowIso,
          timeline: [...c.timeline, timelineEntry],
        };
      })
    );

    addNotification(
      'Complaint Reopened',
      `Complaint ${id} has been reopened and prioritized for the maintenance team.`,
      id,
      'warning'
    );
  };

  // Reset to seed data
  const resetToSeedData = () => {
    setComplaints(INITIAL_COMPLAINTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
  };

  return (
    <ComplaintsContext.Provider
      value={{
        complaints,
        notifications,
        createComplaint,
        getComplaintById,
        upvoteComplaint,
        updateComplaintStatus,
        confirmResolution,
        reopenComplaint,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToSeedData,
      }}
    >
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintsContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintsProvider');
  }
  return context;
}
