import React, { useState } from "react";
import styles from "./SettingsPanel.module.css";

export default function Settings() {
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireNumbers: true,
    requireSymbols: false,
  });

  const [apiKey, setApiKey] = useState("");
  const [features, setFeatures] = useState({
    resumeParser: true,
    mockInterview: false,
    emailNotifications: true,
  });

  const [lastBackup, setLastBackup] = useState("2025-09-20");

  const handleBackup = () => {
    alert("Backup created successfully!");
    setLastBackup(new Date().toISOString().split("T")[0]);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚙️ Settings Panel</h1>

      {/* Authentication */}
      <section className={styles.card}>
        <h2>🔐 Authentication</h2>

        <div className={styles.settingItem}>
          <label>Minimum Password Length:</label>
          <input
            type="number"
            min="6"
            value={passwordPolicy.minLength}
            onChange={(e) =>
              setPasswordPolicy({ ...passwordPolicy, minLength: e.target.value })
            }
          />
        </div>

        <div className={styles.settingItem}>
          <label>
            <input
              type="checkbox"
              checked={passwordPolicy.requireNumbers}
              onChange={(e) =>
                setPasswordPolicy({
                  ...passwordPolicy,
                  requireNumbers: e.target.checked,
                })
              }
            />
            Require Numbers
          </label>
        </div>

        <div className={styles.settingItem}>
          <label>
            <input
              type="checkbox"
              checked={passwordPolicy.requireSymbols}
              onChange={(e) =>
                setPasswordPolicy({
                  ...passwordPolicy,
                  requireSymbols: e.target.checked,
                })
              }
            />
            Require Symbols
          </label>
        </div>
      </section>

      {/* API Keys */}
      <section className={styles.card}>
        <h2>🔑 API Keys</h2>
        <input
          type="text"
          placeholder="Enter OpenAI API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className={styles.apiInput}
        />
        <button className={styles.btn}>Save Key</button>
      </section>

      {/*System Config */}
      <section className={styles.card}>
        <h2>⚙️ System Config</h2>

        {Object.entries(features).map(([key, value]) => (
          <div key={key} className={styles.settingItem}>
            <label>{key.replace(/([A-Z])/g, " $1")}</label>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={value}
                onChange={() =>
                  setFeatures({ ...features, [key]: !features[key] })
                }
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        ))}
      </section>

      {/*Backup / Restore */}
      <section className={styles.card}>
        <h2>💾 Backup & Restore</h2>
        <p>Last Backup: <strong>{lastBackup}</strong></p>
        <button className={styles.btn} onClick={handleBackup}>
          Create Backup
        </button>
      </section>
    </div>
  );
}

