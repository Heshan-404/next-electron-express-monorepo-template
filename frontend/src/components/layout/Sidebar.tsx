
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/sidebar.module.css';

const Sidebar: React.FC = () => {
const router = useRouter();
const isActive = (pathname: string) => router.pathname === pathname;

// Note: FontAwesome icons like <i className="fas fa-tachometer-alt"></i>
// will not render unless FontAwesome is included in the project.
// For this demo, they are placeholders. You can add FontAwesome via CDN
// in a <Head> tag in _app.tsx or install it as a package.

return (
    <aside className={styles.sidebar}>
        <h3 className={styles.sidebarHeader}>Fabric Manage Stock</h3>
        <nav className={styles.sidebarNav}>
            <ul>
                <li>
                    <Link href="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
                        <i className="fas fa-tachometer-alt"></i> Dashboard
                    </Link>
                </li>
                <li>
                    <Link href="/analytics/" className={`${styles.navLink} ${isActive('/analytics/') ? styles.active : ''}`}>
                        <i className="fas fa-chart-line"></i> Analytics
                    </Link>
                </li>
                <li>
                    <Link href="/job-m/" className={`${styles.navLink} ${isActive('/job-m/') ? styles.active : ''}`}>
                        <i className="fas fa-briefcase"></i> Job M
                    </Link>
                </li>
                <li>
                    <Link href="/fabric/" className={`${styles.navLink} ${isActive('/fabric/') ? styles.active : ''}`}>
                        <i className="fas fa-ruler-horizontal"></i> Fabrics M
                    </Link>
                </li>
                <li>
                    <Link href="/items-m/" className={`${styles.navLink} ${isActive('/items-m/') ? styles.active : ''}`}>
                        <i className="fas fa-tshirt"></i> Items M
                    </Link>
                </li>
                <li>
                    <Link href="/shops-m/" className={`${styles.navLink} ${isActive('/shops-m/') ? styles.active : ''}`}>
                        <i className="fas fa-store"></i> Shops M
                    </Link>
                </li>
                <li>
                    <Link href="/bills-m/" className={`${styles.navLink} ${isActive('/bills-m/') ? styles.active : ''}`}>
                        <i className="fas fa-file-invoice"></i> Bills M
                    </Link>
                </li>
                <li>
                    <Link href="/users/" className={`${styles.navLink} ${isActive('/users/') ? styles.active : ''}`}>
                        <i className="fas fa-users"></i> User M
                    </Link>
                </li>
                <li>
                    <Link href="/settings/" className={`${styles.navLink} ${isActive('/settings/') ? styles.active : ''}`}>
                        <i className="fas fa-cog"></i> Settings
                    </Link>
                </li>
            </ul>
        </nav>
    </aside>
);
};

export default Sidebar;
