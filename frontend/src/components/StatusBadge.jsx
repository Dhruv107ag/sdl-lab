import React from 'react';

export function StatusBadge({ status }) {
  const getBadgeClass = (s) => {
    switch (s) {
      case 'Submitted': return 'badge badge-submitted';
      case 'Under Review': return 'badge badge-under-review';
      case 'Assigned': return 'badge badge-assigned';
      case 'In Progress': return 'badge badge-in-progress';
      case 'Resolved': return 'badge badge-resolved';
      case 'Closed': return 'badge badge-closed';
      case 'Rejected / Invalid': return 'badge badge-rejected';
      default: return 'badge badge-submitted';
    }
  };

  return <span className={getBadgeClass(status)}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  const getBadgeClass = (p) => {
    switch (p) {
      case 'Low': return 'badge badge-low';
      case 'High': return 'badge badge-high';
      case 'Urgent': return 'badge badge-urgent';
      default: return 'badge badge-medium';
    }
  };

  return <span className={getBadgeClass(priority)}>{priority || 'Medium'}</span>;
}
