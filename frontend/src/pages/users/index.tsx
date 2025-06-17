import React from "react";
import {useUsers} from "../../hooks/useUsers";
import UserTable from "../../components/users/UserTable";
import AddUserForm from "../../components/users/AddUserForm";
import styles from "../../styles/userManagement.module.css";

export default function UserManagementPage() {
    const {users, loading, error, fetchUsers, createUser} = useUsers();


    return (
        <div>
            <h1 className={styles.pageTitle}>User Management</h1>

            <AddUserForm
                onSubmit={() => {
                    console.log("")
                }}
                error={error}
                loading={loading}
            />

            <h2 className={styles.sectionHeader}>Existing Users</h2>
            <button
                onClick={fetchUsers}
                disabled={loading}
                style={{
                    marginBottom: "10px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                }}
            >
                {loading ? "Refreshing..." : "Refresh Users"}
            </button>
            <UserTable users={users} loading={loading} error={error}/>
        </div>
    );
}
