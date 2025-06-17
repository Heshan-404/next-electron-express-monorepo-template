import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import styles from '../../styles/userManagement.module.css';

interface AddUserFormData {
    email: string;
    username: string;
    password: string;
    role: string;
}

interface AddUserFormProps {
    onSubmit: (userData: AddUserFormData) => void;
    error: string | null;
    loading: boolean;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSubmit, error, loading }) => {
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [role, setRole] = useState<string>('User');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !username.trim() || !password.trim()) {
            alert('Email, Username, and Password are required.');
            return;
        }

        onSubmit({
            email: email.trim(),
            username: username.trim(),
            password: password,
            role: role
        });

        setEmail('');
        setUsername('');
        setPassword('');
        setRole('User');
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h3 className={styles.sectionHeader}>Add New User</h3>
            {error && <p className={styles.errorMessage}>{error}</p>}
            <Input
                type="email"
                placeholder="Email (Required)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
                required
            />
            <Input
                type="text"
                placeholder="Username (Required)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.formInput}
                required
            />
            <Input
                type="password"
                placeholder="Password (Required)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formInput}
                required
            />
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={styles.formInput}
            >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="QualityChecker">Quality Checker</option>
                <option value="InternalDeliver">Internal Deliver</option>
            </select>
            <Button type="submit" variant="success" className={styles.formButton} disabled={loading}>
                {loading ? 'Adding User...' : 'Add User'}
            </Button>
        </form>
    );
};

export default AddUserForm;