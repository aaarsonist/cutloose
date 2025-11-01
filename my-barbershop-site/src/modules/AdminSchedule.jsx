import React, { useEffect, useState, useCallback } from 'react'; 
import api from '../api/api';
import styles from './AdminDashboard.module.css'; 

// --- НОВЫЕ ИМПОРТЫ ДЛЯ КАЛЕНДАРЯ ---
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/ru'; // Импортируем русскую локаль для moment

// --- НОВЫЕ ИМПОРТЫ МОДАЛЬНЫХ ОКОН ---
import ScheduleEditModal from './ScheduleEditModal'; // Ваше существующее окно
import AppointmentInfoModal from './AppointmentInfoModal'; // Наше новое окно

// Настраиваем локализацию для календаря
moment.locale('ru');
const localizer = momentLocalizer(moment);

// Дни недели для сетки (без изменений)
const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_NAMES_RU = {
    MONDAY: "Пн", TUESDAY: "Вт", WEDNESDAY: "Ср", THURSDAY: "Чт", FRIDAY: "Пт", SATURDAY: "Сб", SUNDAY: "Вс"
};
const formatTime = (timeString) => { 
    if (typeof timeString === 'string' && timeString.length >= 5) {
        return timeString.substring(0, 5);
    }
    return timeString;
};


function AdminSchedule() {
    // --- Состояния для Сетки Графика (без изменений) ---
    const [masters, setMasters] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null); 

    // --- НОВЫЕ СОСТОЯНИЯ ДЛЯ КАЛЕНДАРЯ ЗАПИСЕЙ ---
    const [appointments, setAppointments] = useState([]); // Для данных из /api/timetable
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // 1. Загрузка ВСЕХ данных
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [mastersRes, schedulesRes, appointmentsRes] = await Promise.all([
                api.get('/api/masters'),
                api.get('/api/work-schedule/all'),
                api.get('/api/timetable') // <-- Этот GET теперь возвращает DTO
            ]);
            
            setMasters(mastersRes.data);
            setSchedules(schedulesRes.data);
            
            const calendarEvents = appointmentsRes.data.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));
            setAppointments(calendarEvents);
            
        } catch (error) {
            console.error("Ошибка при загрузке данных графика:", error);
        } finally {
            setIsLoading(false);
        }
    }, []); 

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Обработчики Сетки Графика (без изменений) ---
    const findScheduleEntry = (masterId, dayOfWeek) => { 
        return schedules.find(s => s.master.id === masterId && s.dayOfWeek === dayOfWeek);
    };
    const handleCellClick = (master, dayOfWeek) => { 
        const entry = findScheduleEntry(master.id, dayOfWeek);
        if (entry) {
            setEditingSchedule(entry);
        } else {
            setEditingSchedule({
                master: master, dayOfWeek: dayOfWeek, startTime: null, endTime: null
            });
        }
        setIsScheduleModalOpen(true);
    };
    const handleSaveSchedule = async (updatedEntry) => { 
        try {
            const response = await api.post('/api/work-schedule', updatedEntry);
            const savedData = response.data; 

            setSchedules(prevSchedules => {
                const existingIndex = prevSchedules.findIndex(
                    s => s.master.id === updatedEntry.master.id && s.dayOfWeek === updatedEntry.dayOfWeek
                );
                
                if (savedData) { 
                    if (existingIndex > -1) {
                        const newSchedules = [...prevSchedules];
                        newSchedules[existingIndex] = savedData;
                        return newSchedules;
                    } else {
                        return [...prevSchedules, savedData];
                    }
                } else { 
                    if (existingIndex > -1) {
                        return prevSchedules.filter((_, index) => index !== existingIndex);
                    }
                    return prevSchedules; 
                }
            });
        } catch (error) {
            console.error("Ошибка при сохранении графика:", error);
            alert("Не удалось сохранить график.");
        } finally {
            setIsScheduleModalOpen(false); 
        }
    };

    // --- НОВЫЕ ОБРАБОТЧИКИ ДЛЯ КАЛЕНДАРЯ ЗАПИСЕЙ ---
    
    // 5. Клик по событию в календаре
    const handleSelectEvent = (event) => {
        setSelectedAppointment(event); 
        setIsAppointmentModalOpen(true);
    };

    // 6. "Отмена" (удаление) записи АДМИНИСТРАТОРОМ
    const handleDeleteAppointment = async (id) => {
        if (window.confirm('Вы уверены, что хотите отменить эту запись?')) {
            try {
                // --- ИЗМЕНЕНИЕ: Используем новый АДМИНСКИЙ эндпоинт ---
                await api.delete(`/api/timetable/admin/${id}`);
                // --- КОНЕЦ ИЗМЕНЕНИЯ ---
                
                setAppointments(prev => prev.filter(app => app.id !== id));
                setIsAppointmentModalOpen(false);
                setSelectedAppointment(null);
            } catch (error) {
                console.error("Ошибка при отмене записи:", error);
                if (error.response && error.response.status === 400) {
                    alert("Не удалось отменить: эта запись уже в прошлом.");
                } else {
                    alert("Не удалось отменить запись.");
                }
            }
        }
    };
    
    // 7. Сообщения для календаря (на русском)
    const messages = {
        allDay: 'Весь день',
        previous: 'Назад',
        next: 'Вперед',
        today: 'Сегодня',
        month: 'Месяц',
        week: 'Неделя',
        day: 'День',
        agenda: 'Список',
        date: 'Дата',
        time: 'Время',
        event: 'Событие',
        noEventsInRange: 'На этот период нет записей.',
    };

    if (isLoading) {
        return <div className={styles.loader}>Загрузка графика...</div>;
    }

    return (
        <>
            {/* --- СЕТКА ГРАФИКА (Сверху) --- */}
            <div className={styles.scheduleContainer}>
                <h2>Сводный график работы</h2>
                <table className={styles.scheduleGrid}>
                    {/* ... (код <thead> и <tbody> без изменений) ... */}
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
            </div>
            
            {/* --- НОВЫЙ КАЛЕНДАРЬ ЗАПИСЕЙ (Снизу) --- */}
            <div className={styles.calendarContainer}>
                <h2>Календарь записей</h2>
                <Calendar
                    localizer={localizer}
                    events={appointments}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }} // Задаем высоту
                    messages={messages} // Русификация
                    onSelectEvent={handleSelectEvent} // Клик по записи
                    defaultView="week" // Вид по умолчанию - неделя
                    views={['month', 'week', 'day']} // Доступные виды
                    step={30} // Шаг в 30 минут
                    timeslots={2} // 2 слота в час
                    min={new Date(0, 0, 0, 8, 0, 0)} // Начало рабочего дня (8:00)
                    max={new Date(0, 0, 0, 21, 0, 0)} // Конец рабочего дня (21:00)
                />
            </div>
            
            {/* --- МОДАЛЬНЫЕ ОКНА --- */}
            <ScheduleEditModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSave={handleSaveSchedule}
                scheduleData={editingSchedule}
                masterName={editingSchedule?.master?.name}
            />
            
            <AppointmentInfoModal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                onDelete={handleDeleteAppointment}
                event={selectedAppointment}
            />
        </>
    );
}

export default AdminSchedule;