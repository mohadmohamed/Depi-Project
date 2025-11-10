// UserTable.jsx
import React, { useState } from "react";
import styles from "./UserTable.module.css";
import UserFile from "../user.json"


// create "UserTable" component.
 function UserTable() {
  const [users, setUsers] = useState(UserFile.sampleUsers);
  const [query, setQuery] = useState("");
  const [editId, setEditId] = useState(null);
  const [editedUser, setEditedUser] = useState({});

  // filter according to the searched value.
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  // Edit
  const handleEdit = (user) => {
    setEditId(user.id);
    setEditedUser({ ...user });
  };

  // Save edits.
  const saveEdit = () => {
    setUsers(users.map((u) => (u.id === editId ? editedUser : u)));
    setEditId(null);
  };

  // activate useres.
  const toggleStatus = (id) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, active: !u.active } : u
      )
    );
  };

  // Reset Passward.
  const resetPassword = (email) => {
    alert(`Password reset link sent to ${email}`);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.search}
      />
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Signup Date</th>
            <th>Status</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u.id} className={!u.active ? styles.inactiveRow : ""}>
              <td>
                {editId === u.id ? (
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, name: e.target.value })
                    }
                  />
                ) : (
                  u.name
                )}
              </td>
              <td>
                {editId === u.id ? (
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, email: e.target.value })
                    }
                  />
                ) : (
                  u.email
                )}
              </td>
              <td>{u.signup}</td>
              <td>{u.active ? "Active ✅" : "Inactive ❌"}</td>
              <td>
              <select
              className={styles.roleSelect}
              value={editId === u.id ? editedUser.role : u.role}
              onChange={(e) =>
              editId === u.id
              ? setEditedUser({ ...editedUser, role: e.target.value })
              : setUsers(
              users.map((user) =>
              user.id === u.id ? { ...user, role: e.target.value } : user
          ) ) }>
             <option value="user">User</option>
             <option value="admin">Admin</option>
             </select>

              </td>
              <td>
                {editId === u.id ? (
                  <button onClick={saveEdit}>Save</button>
                ) : (
                  <button onClick={() => handleEdit(u)}>Edit</button>
                )}
                <button onClick={() => resetPassword(u.email)}>🔑Reset passward</button>
                <button onClick={() => toggleStatus(u.id)}>
                  {u.active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default UserTable

