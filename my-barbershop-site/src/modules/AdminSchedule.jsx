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
import AdminBookingModal from './AdminBookingModal';

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
    const [isAdminBookingModalOpen, setIsAdminBookingModalOpen] = useState(false);

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
            
            const calendarEvents = appointmentsRes.data.map(event => {
                
                const localStartStr = event.start.replace('T', ' ');
                const localEndStr = event.end.replace('T', ' ');

                const startDate = new Date(localStartStr);
                const endDate = new Date(localEndStr);

                const offset = 3 * 60 * 60 * 1000;
                startDate.setTime(startDate.getTime() - offset);
                endDate.setTime(endDate.getTime() - offset);
                
                return {
                    ...event,
                    start: startDate,
                    end: endDate,
                };
            });
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

    const handleAdminBookingSave = async (bookingRequest) => {
        try {
            // Вызываем новый эндпоинт
            await api.post('/api/timetable/admin/book', bookingRequest);
            
            alert('Клиент успешно записан!');
            setIsAdminBookingModalOpen(false); // Закрываем модалку
            
            // ПЕРЕЗАГРУЖАЕМ ВСЕ ДАННЫЕ (включая календарь)
            fetchData(); 
            
        } catch (error) {
            console.error("Ошибка при создании записи:", error);
            alert("Не удалось создать запись. Возможно, слот уже занят.");
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
            <div className={styles.calendarContainer}>
                {/* --- НОВЫЙ ЗАГОЛОВОК С КНОПКОЙ --- */}
                <div className={styles.calendarHeader}>
                    <h3>Календарь записей</h3>
                    <button 
                        className={styles.bookClientButton}
                        onClick={() => setIsAdminBookingModalOpen(true)}
                    >
                        + Записать клиента
                    </button>
                </div>
                {/* --- КОНЕЦ НОВОГО ЗАГОЛОВКА --- */}
                
                <Calendar
                    localizer={localizer}
                    events={appointments}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }} 
                    messages={messages} 
                    onSelectEvent={handleSelectEvent} 
                    defaultView="week" 
                    views={['month', 'week', 'day']} 
                    step={30} 
                    timeslots={2} 
                    min={new Date(0, 0, 0, 9, 0, 0)} 
                    max={new Date(0, 0, 0, 21, 0, 0)} 
                />
            </div>

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

            <AdminBookingModal
                isOpen={isAdminBookingModalOpen}
                onClose={() => setIsAdminBookingModalOpen(false)}
                onSave={handleAdminBookingSave}
            />
        </>
    );
}

export default AdminSchedule;