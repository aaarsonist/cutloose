import React, { useState } from 'react';
import styles from './AdminDashboard.module.css'; // Мы будем использовать тот же CSS-модуль
import AdminAnalytics from './AdminAnalytics'; // Импортируем новый компонент для аналитики
import AdminManagement from './AdminManagement'; // Импортируем новый компонент для управления
import AdminSchedule from './AdminSchedule'; // Импортируем новый компонент для расписания

function AdminDashboard() {
  // 'analytics' - раздел по умолчанию, как вы и просили
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
      {/* Боковая панель навигации */}
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

      {/* Основной контент раздела */}
      <div className={styles.content}>
        {renderSection()}
      </div>
    </div>
  );
}

export default AdminDashboard;