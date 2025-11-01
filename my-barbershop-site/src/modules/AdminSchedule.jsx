import React, { useEffect, useState } from 'react'; 
import api from '../api/api';
import styles from './AdminDashboard.module.css'; 
import ScheduleEditModal from './ScheduleEditModal'; 

// Дни недели для колонок таблицы
const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_NAMES_RU = {
    MONDAY: "Пн", TUESDAY: "Вт", WEDNESDAY: "Ср", THURSDAY: "Чт", FRIDAY: "Пт", SATURDAY: "Сб", SUNDAY: "Вс"
};
const formatTime = (timeString) => {
    if (typeof timeString === 'string' && timeString.length >= 5) {
        return timeString.substring(0, 5);
    }
    return timeString; // Возвращаем как есть, если формат неизвестен
};

function AdminSchedule() {
    // Состояния
    const [masters, setMasters] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Состояния для модального окна
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null); // { master, dayOfWeek, ... }

    // 1. Загрузка всех данных при монтировании
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Загружаем мастеров и их графики параллельно
                const [mastersRes, schedulesRes] = await Promise.all([
                    api.get('/api/masters'),
                    api.get('/api/work-schedule/all')
                ]);
                
                setMasters(mastersRes.data);
                setSchedules(schedulesRes.data);
                
            } catch (error) {
                console.error("Ошибка при загрузке данных графика:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. Хелпер для поиска ячейки в данных
    // Находит конкретную запись (Master + Day) в большом массиве schedules
    const findScheduleEntry = (masterId, dayOfWeek) => {
        return schedules.find(s => s.master.id === masterId && s.dayOfWeek === dayOfWeek);
    };

    // 3. Обработчик клика по ячейке
    const handleCellClick = (master, dayOfWeek) => {
        const entry = findScheduleEntry(master.id, dayOfWeek);
        
        if (entry) {
            // Если запись есть, редактируем ее
            setEditingSchedule(entry);
        } else {
            // Если записи нет (Выходной), создаем "шаблон" для редактирования
            setEditingSchedule({
                master: master,
                dayOfWeek: dayOfWeek,
                startTime: null,
                endTime: null
            });
        }
        setIsModalOpen(true);
    };

    // 4. Обработчик сохранения из модального окна
    const handleSaveSchedule = async (updatedEntry) => {
        try {
            // Отправляем данные на бэкенд (бэкенд разберется, обновить или создать)
            const response = await api.post('/api/work-schedule', updatedEntry);
            const savedData = response.data; // Сохраненная/обновленная запись

            // Обновляем наше локальное состояние, чтобы UI мгновенно обновился
            setSchedules(prevSchedules => {
                // Ищем, была ли уже такая запись
                const existingIndex = prevSchedules.findIndex(
                    s => s.master.id === updatedEntry.master.id && s.dayOfWeek === updatedEntry.dayOfWeek
                );
                
                if (savedData) { // Если бэкенд вернул запись (т.е. это НЕ удаление)
                    if (existingIndex > -1) {
                        // Обновляем существующую
                        const newSchedules = [...prevSchedules];
                        newSchedules[existingIndex] = savedData;
                        return newSchedules;
                    } else {
                        // Добавляем новую
                        return [...prevSchedules, savedData];
                    }
                } else { // Если бэкенд вернул null (т.е. это было УДАЛЕНИЕ)
                    if (existingIndex > -1) {
                        // Убираем запись из массива
                        return prevSchedules.filter((_, index) => index !== existingIndex);
                    }
                    return prevSchedules; // Ничего не делаем, ее и не было
                }
            });

        } catch (error) {
            console.error("Ошибка при сохранении графика:", error);
            alert("Не удалось сохранить график.");
        } finally {
            setIsModalOpen(false); // Закрываем модальное окно
        }
    };

    if (isLoading) {
        return <div className={styles.loader}>Загрузка графика...</div>;
    }

    return (
        <div className={styles.scheduleContainer}>
            <h3>График работы мастеров</h3>
            
            <table className={styles.scheduleGrid}>
                <thead>
                    <tr>
                        <th>Мастер</th>
                        {DAYS_OF_WEEK.map(day => (
                            <th key={day} className={(day === "SATURDAY" || day === "SUNDAY") ? styles.isWeekend : ""}>
                                {DAY_NAMES_RU[day]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {masters.map(master => (
                        <tr key={master.id}>
                            <td className={styles.masterNameCell}>{master.name}</td>
                            
                            {DAYS_OF_WEEK.map(day => {
                                const entry = findScheduleEntry(master.id, day);
                                const isOff = !entry || !entry.startTime;
                                
                                return (
                                    <td 
                                        key={day} 
                                        className={`${styles.scheduleCell} ${isOff ? styles.isOff : ''} ${(day === "SATURDAY" || day === "SUNDAY") ? styles.isWeekend : ""}`}
                                        onClick={() => handleCellClick(master, day)}
                                    >
                                        {isOff ? "Выходной" : `${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}`}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Разделы "Календарь записей" и "Запись клиента" 
              (Мы их пока не трогаем, но они будут здесь) 
            */}
            
            {/* Модальное окно (рендерится, только когда isModalOpen = true) */}
            <ScheduleEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSchedule}
                scheduleData={editingSchedule}
                masterName={editingSchedule?.master?.name}
            />
        </div>
    );
}

export default AdminSchedule;