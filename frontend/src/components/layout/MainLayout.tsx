
import React from 'react';
import Sidebar from './Sidebar';
import styles from '../../styles/layout.module.css';

interface MainLayoutProps {
children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
return (
<div className={styles.appContainer}>
<Sidebar />
<main className={styles.mainContent}>
{children}
</main>
</div>
);
};

export default MainLayout;
