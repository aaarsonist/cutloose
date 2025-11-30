import React, { useState, useEffect } from 'react';
import AdminManagement from './AdminManagement';
import AdminSchedule from './AdminSchedule';
import AdminAnalytics from './AdminAnalytics';
import AdminForecast from './AdminForecast';
import styles from './AdminDashboard.module.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
    // 1. Инициализируем состояние вкладки из localStorage (или 'management' по умолчанию)
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('adminActiveTab') || 'management';
    });
    
    // По умолчанию панель скрыта (false), чтобы она "появлялась" при наведении
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 2. Сохраняем выбранную вкладку в localStorage при каждом изменении
    useEffect(() => {
        localStorage.setItem('adminActiveTab', activeTab);
    }, [activeTab]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={styles.adminContainer}>
            <ToastContainer 
                position="bottom-right" 
                autoClose={3000} 
                newestOnTop
                pauseOnHover
            />

            {/* Кнопка "Бургер" */}
            <button 
                className={styles.hamburgerBtn} 
                onClick={toggleSidebar}
                // Открываем панель при наведении на кнопку
                onMouseEnter={() => setIsSidebarOpen(true)}
            >
                ☰
            </button>

            {/* Сайдбар */}
            <div 
                className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}
                // Закрываем панель, когда курсор уходит с неё
                onMouseLeave={() => setIsSidebarOpen(false)}
            >
                <h3>Панель управления</h3>
                <button 
                    className={activeTab === 'management' ? styles.active : ''} 
                    onClick={() => setActiveTab('management')}
                >
                    Управление
                </button>
                <button 
                    className={activeTab === 'schedule' ? styles.active : ''} 
                    onClick={() => setActiveTab('schedule')}
                >
                    Расписание
                </button>
                <button 
                    className={activeTab === 'analytics' ? styles.active : ''} 
                    onClick={() => setActiveTab('analytics')}
                >
                    Аналитика
                </button>
                <button 
                    className={activeTab === 'forecast' ? styles.active : ''} 
                    onClick={() => setActiveTab('forecast')}
                >
                    Прогноз и рекомендации
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'management' && <AdminManagement />}
                {activeTab === 'schedule' && <AdminSchedule />}
                {activeTab === 'analytics' && <AdminAnalytics />}
                {activeTab === 'forecast' && <AdminForecast />}
            </div>
        </div>
    );
}

export default AdminDashboard;