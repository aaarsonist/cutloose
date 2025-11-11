import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css'; // Используем общие стили

function ScheduleEditModal({ isOpen, onClose, onSave, scheduleData, masterName }) {
    // Внутреннее состояние для полей
    const [isWorking, setIsWorking] = useState(true);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');

    // Дни недели на русском для заголовка
    const dayNames = {
        MONDAY: "Понедельник", TUESDAY: "Вторник", WEDNESDAY: "Среда",
        THURSDAY: "Четверг", FRIDAY: "Пятница", SATURDAY: "Суббота", SUNDAY: "Воскресенье"
    };

    // Обновляем внутреннее состояние, когда `scheduleData` (данные ячейки) меняется
    useEffect(() => {
        if (scheduleData && scheduleData.startTime) {
            setIsWorking(true);
            setStartTime(scheduleData.startTime);
            setEndTime(scheduleData.endTime);
        } else {
            // Если данных нет (startTime == null), это "Выходной"
            setIsWorking(false);
            setStartTime('09:00'); // Время по умолчанию
            setEndTime('15:00');
        }
    }, [scheduleData]);

    if (!isOpen) {
        return null; // Не рендерим, если закрыто
    }

    const handleSave = () => {
        const finalEntry = {
            ...scheduleData,
            startTime: isWorking ? startTime : null, // Отправляем null, если "Выходной"
            endTime: isWorking ? endTime : null,
        };
        onSave(finalEntry);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                {/* Заголовок модального окна */}
                <h4>{masterName}</h4>
                <h5>{dayNames[scheduleData.dayOfWeek]}</h5>

                {/* Форма редактирования */}
                <div className={styles.editForm}>
                    <div className={styles.checkboxGroup}>
                        <input
                            type="checkbox"
                            id="isWorkingCheckbox"
                            checked={isWorking}
                            onChange={(e) => setIsWorking(e.target.checked)}
                        />
                        <label htmlFor="isWorkingCheckbox">Рабочий день</label>
                    </div>

                    <label>Время начала:</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={!isWorking} // Недоступно, если "Выходной"
                        step="1800" // Шаг 30 минут (60 * 30)
                    />
                    
                    <label>Время окончания:</label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={!isWorking}
                        step="1800"
                    />

                    <div className={styles.modalButtons}>
                        <button onClick={onClose} className={styles.cancelButton}>Отмена</button>
                        <button onClick={handleSave} className={styles.saveButton}>Сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScheduleEditModal;