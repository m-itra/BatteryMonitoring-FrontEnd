function StatusBadge({ children, variant = "neutral" }) {
  return <span className={`status-badge status-${variant}`}>{children}</span>;
}

export default StatusBadge;
