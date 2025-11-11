import React, { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css'; // Используем общие стили
import api from '../api/api'; // Импортируем наш API

function AdminBookingModal({ isOpen, onClose, onSave }) {
    // 1. Состояния для данных формы
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedMaster, setSelectedMaster] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    
    // 2. Состояния для загрузки (списки и слоты)
    const [services, setServices] = useState([]);
    const [masters, setMasters] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    
    // 3. Состояние для выбранного слота
    const [selectedSlot, setSelectedSlot] = useState(null); // (e.g., "10:30")

    // Загрузка списков Услуг и Мастеров при первом открытии
    useEffect(() => {
        if (isOpen) {
            // Загружаем услуги
            api.get('/services')
                .then(res => setServices(res.data))
                .catch(err => console.error("Ошибка загрузки услуг:", err));
            
            // Загружаем мастеров
            api.get('/api/masters')
                .then(res => setMasters(res.data))
                .catch(err => console.error("Ошибка загрузки мастеров:", err));
        }
    }, [isOpen]); // Повторно загружать, если окно закрыли и открыли

    // Эффект для загрузки ДОСТУПНЫХ СЛОТОВ
    // (Срабатывает, когда меняются 3 ключевых поля)
    useEffect(() => {
        // Сбрасываем слоты, если одно из полей пустое
        if (!selectedService || !selectedMaster || !selectedDate) {
            setAvailableSlots([]);
            setSelectedSlot(null); // Сбрасываем выбор слота
            return;
        }

        setIsLoadingSlots(true);
        setSelectedSlot(null); // Сбрасываем выбор слота

        // Ищем ID услуги для запроса
        const service = services.find(s => s.id === Number(selectedService));
        if (!service) return;

        // Запрос к вашему AvailabilityService
        api.get('/api/availability', {
            params: {
                masterId: selectedMaster,
                serviceId: service.id,
                date: selectedDate
            }
        })
        .then(res => {
            setAvailableSlots(res.data);
        })
        .catch(err => {
            console.error("Ошибка загрузки слотов:", err);
            setAvailableSlots([]);
        })
        .finally(() => {
            setIsLoadingSlots(false);
        });

    }, [selectedService, selectedMaster, selectedDate, services]);

    if (!isOpen) {
        return null; // Не рендерим, если закрыто
    }

    const handleSubmit = () => {
        // Проверка на заполненность
        if (!clientName || !clientEmail || !selectedSlot) {
            alert("Пожалуйста, заполните все поля и выберите время.");
            return;
        }

        // Собираем DTO для бэкенда
        const bookingRequest = {
            clientName: clientName,
            clientEmail: clientEmail,
            masterId: selectedMaster,
            serviceId: selectedService,
            // Бэкенд ждет LocalDateTime, мы склеиваем дату и время
            appointmentTime: `${selectedDate}T${selectedSlot}` 
        };
        
        // Вызываем onSave (который в AdminSchedule.jsx)
        onSave(bookingRequest);
    };
    
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h4>Записать клиента</h4>
                
                {/* Используем тот же стиль, что и в Управлении */}
                <div className={styles.editForm}>
                    <label>Имя клиента:</label>
                    <input 
                        type="text" 
                        placeholder="Иван" 
                        value={clientName} 
                        onChange={e => setClientName(e.target.value)}
                    />
                    
                    <label>Email клиента (Логин):</label>
                    <input 
                        type="email" 
                        placeholder="client@example.com" 
                        value={clientEmail} 
                        onChange={e => setClientEmail(e.target.value)}
                    />
                    
                    <label>Услуга:</label>
                    <select value={selectedService} onChange={e => setSelectedService(e.target.value)}>
                        <option value="" disabled>-- Выберите услугу --</option>
                        {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.price} BYN)</option>
                        ))}
                    </select>

                    <label>Мастер:</label>
                    <select value={selectedMaster} onChange={e => setSelectedMaster(e.target.value)}>
                        <option value="" disabled>-- Выберите мастера --</option>
                        {masters.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    
                    <label>Дата:</label>
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={e => setSelectedDate(e.target.value)}
                    />
                    
                    {/* Блок доступных слотов */}
                    <label>Доступное время:</label>
                    <div className={styles.timeSlotsContainer}> 
                    {isLoadingSlots ? (
                        <p>Загрузка слотов...</p>
                    ) : availableSlots.length > 0 ? (
                        availableSlots.map(slot => (
                            <button 
                                key={slot}
                                // Используем вашу функцию setSelectedSlot
                                onClick={() => setSelectedSlot(slot)} 
                                
                                /* Используем классы .timeSlotButton (базовый) 
                                   и .selected (активный), как в CSS
                                */
                                className={`${styles.timeSlotButton} ${selectedSlot === slot ? styles.selected : ''}`}
                            >
                                {slot}
                            </button>
                        ))
                    ) : (
                        <p>(Нет доступных слотов на эту дату)</p>
                    )}
                </div>
                </div>

                <div className={styles.modalButtons}>
                    <button onClick={onClose} className={styles.cancelButton}>Отмена</button>
                    <button 
                        onClick={handleSubmit} 
                        className={styles.saveButton}
                        // Кнопка неактивна, пока не выбрано время
                        disabled={!selectedSlot || isLoadingSlots} 
                    >
                        Записать
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminBookingModal;