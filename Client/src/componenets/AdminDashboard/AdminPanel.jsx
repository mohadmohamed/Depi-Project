//Admin panel = our container.
import React, { useState } from "react";
import styles from "./AdminPanel.module.css";
import UserFile from "./user.json"

//import components.
import Sidebar from "./components/Sidebar";
import MetricCard from "./components/MetricCard";
import UserTable from "./components/UserTable";
import Settings from "./components/SettingsPanel";
import SupportPanel from "./components/SupportPanel";

 function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className={styles.container}>
      {/* Sidebar*/}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main*/}
      <main className={styles.main}>
        {activeTab === "overview" && (
          <>
            <h1>Overview / Analytics</h1>
            <div className={styles.metrics}>
              <MetricCard title="Users Count" value={UserFile.sampleUsers.length} extra="+24 this week" />
              <MetricCard title="Resumes Analyzed" value="5382" extra="processed" />
              <MetricCard title="Interviews Done" value="740" extra="mock sessions" />
            </div>
          </>
        )}

        {activeTab === "users" && (
          <>
            <h1>User Management</h1>
            <UserTable />
          </>
        )}

        {activeTab === "settings" && (
          <>
            <Settings/>

          </>
        )}

        {activeTab === "support" && (
          <>
            <SupportPanel />
          </>
        )}
      </main>
    </div>
  );
}
export default AdminPanel
