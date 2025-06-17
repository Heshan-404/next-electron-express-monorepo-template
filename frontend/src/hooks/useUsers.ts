import { useState, useCallback } from 'react';
import type { User } from '@backend-types';

const initialUsers: User[] = [
    {
        id: 1,
        username: 'johndoe',
        email: 'john.doe@example.com',
        role: 'Admin',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        username: 'janedoe',
        email: 'jane.doe@example.com',
        role: 'User',
        active: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
];

type CreateUserPayload = Omit<User, 'id' | 'active' | 'createdAt' | 'updatedAt'> & {
    password: string;
};

export function useUsers() {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        console.log("Fetching users from backend...");
        try {
            const response = await fetch('http://localhost:5002/api/users');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch users');
            }
            const data: User[] = await response.json();
            const parsedData = data.map(user => ({
                ...user,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt),
            }));
            setUsers(parsedData);
            console.log("Users fetched successfully:", parsedData);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.message || 'An unknown error occurred while fetching users.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (userData: CreateUserPayload) => {
        setLoading(true);
        setError(null);
        console.log('Attempting to create user with data:', userData);
        try {
            const response = await fetch('http://localhost:5002/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create user');
            }

            const newUser: User = await response.json();
            const parsedNewUser = {
                ...newUser,
                createdAt: new Date(newUser.createdAt),
                updatedAt: new Date(newUser.updatedAt),
            };

            setUsers(prevUsers => [...prevUsers, parsedNewUser]);
            console.log('User created successfully:', parsedNewUser);
            return parsedNewUser;
        } catch (err: any) {
            console.error('Error creating user:', err);
            setError(err.message || 'An unknown error occurred during user creation.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { users, loading, error, fetchUsers, createUser };
}