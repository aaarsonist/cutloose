import React, { useState, useEffect } from "react";
import axios from "axios";
import api from '../api/api';
import styles from './UserDashboard.module.css';

function UserDashboard() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState(0);
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState('');

  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [selectedAppointmentIdForReview, setSelectedAppointmentIdForReview] = useState('');

  const [userName, setUserName] = useState('');
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    fetchServices();
    fetchMasters();
    fetchCompletedAppointments();
    fetchUpcomingAppointments();

    const userString = localStorage.getItem('currentUser');
    if (userString) {
        const user = JSON.parse(userString);
        setUserName(user.name || user.username);
    }
  }, []);

  const fetchServices = async () => {
    try {
        const response = await axios.get('http://localhost:8080/services');
        setServices(response.data);
        console.log('Список услуг загружен:', response.data);
    } catch (error) {
        console.error('Ошибка при загрузке услуг:', error);
    }
  };

  const fetchMasters = async () => {
    try {
      const response = await api.get('/api/masters'); 
      setMasters(response.data);
      console.log('Список мастеров загружен:', response.data);
    } catch (error) {
      console.error('Ошибка при загрузке мастеров:', error);
    }
  };

  const fetchCompletedAppointments = async () => {
    try {
        // Теперь этот эндпоинт отдает только COMPLETED без отзывов
        const response = await api.get('/api/timetable/user/completed');
        setCompletedAppointments(response.data);
        console.log('Прошедшие записи для отзыва загружены:', response.data);
    } catch (error) {
        console.error('Ошибка при загрузке прошедших записей:', error);
    }
};

  const fetchUpcomingAppointments = async () => {
    try {
        const response = await api.get('/api/timetable/user/upcoming');
        // Сортируем от ближайшей к дальнейшей
        const sorted = response.data.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
        setUpcomingAppointments(sorted);
        console.log('Предстоящие записи загружены:', sorted);
    } catch (error) {
        console.error('Ошибка при загрузке предстоящих записей:', error);
    }
  };

  const handleBooking = () => {
    if (!selectedService || !appointmentTime|| !selectedMaster) {
      alert("Выберите услугу, время и мастера!");
      return;
    }

  const date = new Date(appointmentTime);
  date.setHours(date.getHours() + 6); 

  const appointmentData = {
    service: { id: selectedService },
    master: { id: selectedMaster },
    appointmentTime: date.toISOString(), 
  };

    api.post('/api/timetable', appointmentData)
      .then(() => {
        alert("Вы успешно забронировали услугу!");
        setSelectedService('');
        setSelectedMaster(''); 
        setAppointmentTime('');
        fetchCompletedAppointments();
        fetchUpcomingAppointments();
      })
      .catch(error => {
        console.error("Ошибка при бронировании:", error);
        alert("Ошибка при бронировании. Пожалуйста, попробуйте еще раз.");
      });
  };
  const handleReviewSubmit = async () => {
    if (!selectedAppointmentIdForReview  || rating < 1) { 
      alert("Выберите запись, на которую хотите оставить отзыв, введите текст отзыва и выберите оценку (нажмите на звезду)! ");
      return;
    }

    const reviewData = {
      reviewText: reviewText,
      rating: rating, 
      appointment: { id: selectedAppointmentIdForReview } 
    };

    try {
      await api.post('/api/reviews', reviewData);
      console.log("Отзыв успешно отправлен:", reviewData);
      alert("Ваш отзыв успешно отправлен!");
      setSelectedAppointmentIdForReview('');
      setReviewText('');
      setRating(0); 
      setHoverRating(0); 
      fetchCompletedAppointments();

    } catch (error) {
      console.error("Ошибка при отправке отзыва:", error);
      let errorMessage = "Ошибка при отправке отзыва.";
      if (axios.isAxiosError(error) && error.response) {
           errorMessage = `Ошибка: ${error.response.status} ${error.response.statusText}`;
           if (error.response.data) {
               errorMessage += `: ${error.response.data}`;
           }
      } else if (axios.isAxiosError(error) && error.message) {
           errorMessage = `Ошибка: ${error.message}`;
      }
      alert(errorMessage);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    // Твое требование: "система должна спрашивать точно ли мы хотим отменить"
    if (!window.confirm("Вы уверены, что хотите отменить эту запись?")) {
        return;
    }

    try {
        // Используем DELETE и правильный URL
        await api.delete(`/api/timetable/${appointmentId}`);
        alert("Запись успешно отменена!");
        // Обновляем список
        fetchUpcomingAppointments();
    } catch (error) {
        console.error("Ошибка при отмене записи:", error);
        alert("Не удалось отменить запись. Возможно, она уже прошла.");
    }
  };

    const formatAppointmentTime = (isoString) => {
        if (!isoString) return 'Неизвестное время';
        try {
            const date = new Date(isoString);
             if (isNaN(date.getTime())) {
                 throw new Error("Invalid date format");
             }
             const dateWithOffset = new Date(date.getTime() - (3 * 60 * 60 * 1000));
             return dateWithOffset.toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error("Error formatting date:", isoString, e);
            return 'Некорректное время';
        }
    };

  return (
    <div className={styles.dashboard}>
      <h2>{userName ? `${userName}. ` : ''}Личный кабинет</h2>
      <h3>Запись на услугу</h3>
      <div className={styles.bookingSection}>

        <select 
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          required
        >
          <option value="" disabled>Выберите услугу</option>
          {services.length > 0 ? (
            services.map((service) => (
              <option key={service.id} value={service.id}>
                 {service.name} - {service.price} руб. ({service.type === 'MEN' ? 'Мужская' : 'Женская'})
              </option>
            ))
          ) : (
            <option disabled>Список услуг пуст</option>
          )}
        </select>
        
        <select
          value={selectedMaster}
          onChange={(e) => setSelectedMaster(e.target.value)}
          required
        >
          <option value="" disabled>Выберите мастера</option>
          {masters.length > 0 ? (
            masters.map((master) => (
              <option key={master.id} value={master.id}>
                {master.name}
              </option>
            ))
          ) : (
            <option disabled>Список мастеров пуст</option>
          )}
        </select>

        <input 
          type="datetime-local" 
          value={appointmentTime} 
          // Атрибут min, чтобы разрешить выбор прошлых дат/времени
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => setAppointmentTime(e.target.value)} 
        />

        <button className={styles.button1} onClick={handleBooking}>Забронировать</button>
      </div>
      
      <div className={styles.upcomingAppointmentsSection}>
        <h3>Ваши предстоящие записи</h3>
        {upcomingAppointments.length > 0 ? (
            <ul className={styles.appointmentList}>
                {upcomingAppointments.map((appointment) => (
                    <li key={appointment.id} className={styles.appointmentItem}>
                        <div className={styles.appointmentDetails}>
                            <span>
                                {appointment.service?.name || 'Услуга'}
                                {' у '}
                                {appointment.master?.name || 'Мастер'}
                            </span>
                            <span>
                                {formatAppointmentTime(appointment.appointmentTime)}
                            </span>
                        </div>
                        <button 
                            className={styles.cancelButton} 
                            onClick={() => handleCancelAppointment(appointment.id)}>
                            Отменить
                        </button>
                    </li>
                ))}
            </ul>
        ) : (
            <p>У вас нет предстоящих записей.</p>
        )}
      </div>

      <div className={styles.reviewSection}>
        <h3>Оставить отзыв</h3>
                {completedAppointments.length > 0 ? (
             <select
                 value={selectedAppointmentIdForReview}
                 onChange={(e) => setSelectedAppointmentIdForReview(e.target.value)}
                 required
             >
                 <option value="" disabled>Выберите прошедшую запись</option>
                 {completedAppointments.map((appointment) => (
                     <option key={appointment.id} value={appointment.id}>
                         {formatAppointmentTime(appointment.appointmentTime)}
                         {' - '}
                         {appointment.service?.name || 'Неизвестная услуга'}
                         {' у '}
                         {appointment.master?.name || 'Неизвестного мастера'}
                     </option>
                 ))}
             </select>
         ) : (
             <p>Нет прошедших записей для отзыва.</p>
         )}

<div className={styles.ratingInput}>
    <label>Ваша оценка:</label>
    <div className={styles.starRating}> 
        {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
                <span
                    key={starValue}
                    className={styles.star} 
                    onClick={() => completedAppointments.length > 0 && setRating(starValue)} 
                    onMouseEnter={() => completedAppointments.length > 0 && setHoverRating(starValue)} 
                    onMouseLeave={() => completedAppointments.length > 0 && setHoverRating(0)} 
                    style={{
                        color: starValue <= (hoverRating || rating) ? 'gold' : 'gray',
                        cursor: completedAppointments.length > 0 ? 'pointer' : 'not-allowed', 
                    }}
                >
                    ★ 
                </span>
            );
        })}
    </div>

</div>

        <textarea
          placeholder="Напишите ваш отзыв..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
          disabled={completedAppointments.length === 0} 
        />
        <button
            className={styles.button1}
            onClick={handleReviewSubmit}
            disabled={!selectedAppointmentIdForReview || completedAppointments.length === 0} 
        >
            Отправить отзыв
        </button>
      </div>
    </div>
  );
}

export default UserDashboard;
