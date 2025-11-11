import React from 'react';
import styles from './AdminDashboard.module.css'; // Используем общие стили

function AppointmentInfoModal({ isOpen, onClose, onDelete, event }) {
    if (!isOpen || !event) {
        return null; // Не рендерим, если закрыто
    }

    // Форматируем даты для отображения
    const formatEventDate = (date) => {
        return new Date(date).toLocaleString('ru-RU', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // --- ВАША ЛОГИКА ---
    // event.start - это объект Date
    const isPast = event.start < new Date();
    // --- КОНЕЦ ЛОГИКИ ---
    
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h4>Детали записи</h4>
                
                <ul className={styles.appointmentDetails}>
                    <li>
                        <span>Клиент:</span>
                        <strong>{event.clientName}</strong> ({event.clientEmail})
                    </li>
                    <li>
                        <span>Услуга:</span>
                        <strong>{event.serviceName}</strong>
                    </li>
                    <li>
                        <span>Мастер:</span>
                        <strong>{event.masterName}</strong>
                    </li>
                    <li>
                        <span>Время:</span>
                        <strong>{formatEventDate(event.start)}</strong>
                    </li>
                </ul>

                <div className={styles.modalButtons}>
                    <button onClick={onClose} className={styles.cancelButton}>Закрыть</button>
                    
                    <button 
                        onClick={() => onDelete(event.id)} 
                        className={styles.deleteButton} // Красный стиль
                        disabled={isPast} // Отключаем, если запись в прошлом
                    >
                        {isPast ? "Запись прошла" : "Отменить запись"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AppointmentInfoModal;