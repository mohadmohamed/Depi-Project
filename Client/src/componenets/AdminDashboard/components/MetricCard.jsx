// MetricCard.jsx
import React from "react";
import styles from "./MetricCard.module.css";

 function MetricCard({ title, value, extra }) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <div className={styles.value}>{value}</div>
      <div className={styles.extra}>{extra}</div>
    </div>
  );
}
export default MetricCard
