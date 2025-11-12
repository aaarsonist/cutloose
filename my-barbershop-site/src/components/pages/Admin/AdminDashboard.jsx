import React, { useState } from 'react';
import styles from './AdminDashboard.module.css'; 
import AdminAnalytics from './AdminAnalytics'; 
import AdminManagement from './AdminManagement'; 
import AdminSchedule from './AdminSchedule'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('schedule');

  const renderSection = () => {
    switch (activeSection) {
      case 'management':
        return <AdminManagement />;
      case 'schedule':
        return <AdminSchedule />;
      case 'analytics':
        return <AdminAnalytics />;
      default:
        return <AdminSchedule />;
    }
  };

  return (
    <div className={styles.adminContainer}>
      <ToastContainer 
          position="bottom-right" 
          autoClose={3000} 
          newestOnTop
          pauseOnHover
      />
      <div className={styles.sidebar}>
        <h3>Панель администратора</h3>
        <button
          onClick={() => setActiveSection('management')}
          className={activeSection === 'management' ? styles.active : ''}
        >
          Управление
        </button>
        <button
          onClick={() => setActiveSection('schedule')}
          className={activeSection === 'schedule' ? styles.active : ''}
        >
          Расписание
        </button>
        <button
          onClick={() => setActiveSection('analytics')}
          className={activeSection === 'analytics' ? styles.active : ''}
        >
          Аналитика и прогнозы
        </button>
      </div>

      <div className={styles.content}>
        {renderSection()}
      </div>
    </div>
  );
}

export default AdminDashboard;