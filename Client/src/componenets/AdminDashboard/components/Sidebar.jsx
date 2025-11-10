// Sidebar.jsx
import React from "react";
import styles from "./Sidebar.module.css";

 function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>Admin-Dashboard</h2>
      <ul>
        <li
          className={activeTab === "overview" ? styles.active : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </li>
        <li
          className={activeTab === "users" ? styles.active : ""}
          onClick={() => setActiveTab("users")}
        >
          Users
        </li>
        <li
          className={activeTab === "settings" ? styles.active : ""}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </li>
        <li
          className={activeTab === "support" ? styles.active : ""}
          onClick={() => setActiveTab("support")}
        >
          Support
        </li>
      </ul>
    </aside>
  );
}
export default Sidebar
