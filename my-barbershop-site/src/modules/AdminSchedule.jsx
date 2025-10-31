import React, { useEffect, useState } from 'react'; 
import api from '../api/api';
import styles from './AdminDashboard.module.css'; // Используем общие стили

function AdminSchedule() {
    // ВАША ЛОГИКА РАСПИСАНИЯ
    const [timetable, setTimetable] = useState([]);
    const [services, setServices] = useState([]); // Нужно для отображения имен услуг

    useEffect(() => {
        fetchTimetable();
        fetchServices();
    }, []);

    const fetchTimetable = async () => {
        try {
            const response = await api.get('/api/timetable');
            setTimetable(response.data);
            console.log('Расписание загружено:', response.data);
        } catch (error) {
            console.error('Ошибка при загрузке расписания:', error);
        }
    };

    // Загружаем сервисы, чтобы найти имя по ID
    const fetchServices = async () => {
        try {
            const response = await api.get('/services'); 
            setServices(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке услуг:', error);
        }
    };

    // ВАША ФУНКЦИЯ ФОРМАТИРОВАНИЯ ВРЕМЕНИ
    const formatAppointmentTime = (isoString) => {
        if (!isoString) return 'Неизвестное время';
        try {
             const date = new Date(isoString);
             if (isNaN(date.getTime())) { throw new Error("Некорректный формат даты"); }
             // ВАЖНО: Я сохраняю ваш офсет -3 часа.
             const dateWithOffset = new Date(date.getTime() - (3 * 60 * 60 * 1000)); 
             return dateWithOffset.toLocaleString('ru-RU', {
                 year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
             });
         } catch (e) {
             console.error("Ошибка форматирования даты:", isoString, e);
             return 'Некорректное время';
         }
   };
    
    return (
        <div className={styles.dashboard}> {/* Используем .dashboard для сохранения стилей */}
            {/* ВАША СЕКЦИЯ РАСПИСАНИЯ */}
            <div className={styles.timetableSection}>
                <h3>Расписание</h3>
                <ul className={styles.timetableList}>
                    {timetable
                        .slice() 
                        .sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime)) 
                        .map((entry) =>(
                      <li key={entry.id} className={styles.timetableItem}>
                        <div>
                            {/* Ваша логика поиска имени услуги */}
                            <span>{services.find(service => service.id === entry.service.id)?.name || 'Неизвестно'}</span>
                        </div>
                        <div>
                        <span>{formatAppointmentTime(entry.appointmentTime)}</span>
                        </div>
                        <div>
                        <span>{entry.master ? `Мастер: ${entry.master.name}` : 'Мастер: Неизвестно'}</span>
                        </div>
                      </li>    
                    ))}
                </ul>
            </div>

            {/* Заглушки для будущих функций, как мы обсуждали */}
            <div style={{ margin: '20px 0' }}>
              <h3>График работы мастеров</h3>
              <p>[Здесь будет управление рабочими днями и часами мастеров]</p>
            </div>

            <div style={{ margin: '20px 0' }}>
              <h3>Записать клиента</h3>
              <p>[Здесь будет форма для ручной записи клиента администратором]</p>
            </div>
        </div>
    );
}

export default AdminSchedule;