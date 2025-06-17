import React from "react";
import Table from "../common/Table";
import type { User } from "@backend-types";
import styles from "../../styles/table.module.css";

interface UserTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, error }) => {
  const columns = [
    { header: "ID", key: "id" },
    { header: "Username", key: "username" },
    { header: "Email", key: "email" },
    { header: "Role", key: "role" },
    {
      header: "Active",
      key: "active",
      render: (user: User) => (user.active ? "Yes" : "No"),
    },
  ];

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p className={styles.errorMessage}>Error: {error}</p>;
  }

  if (!loading && !error && users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
      <Table<User>
          data={users}
          columns={columns}
          keyField="id"
          caption="User List"
      />
  );
};

export default UserTable;