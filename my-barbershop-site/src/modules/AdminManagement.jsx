import React, { useEffect, useState } from 'react'; 
import api from '../api/api';
import styles from './AdminDashboard.module.css'; // Используем общие стили

function AdminManagement() {
    // ВАША ЛОГИКА УПРАВЛЕНИЯ УСЛУГАМИ
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({
        name: '',
        price: '',
        type: 'MEN',
        duration: ''
    });
    const [editingService, setEditingService] = useState(null);

    // ВАША ЛОГИКА УПРАВЛЕНИЯ ОТЗЫВАМИ
    const [reviews, setReviews] = useState([]); 

    useEffect(() => {
        fetchServices();
        fetchReviews(); 
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services'); 
            setServices(response.data);
            console.log('Список услуг загружен:', response.data);
        } catch (error) {
            console.error('Ошибка при загрузке услуг:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await api.get('/api/reviews');
            setReviews(response.data);
            console.log('Список отзывов загружен:', response.data);
        } catch (error) {
            console.error('Ошибка при загрузке отзывов:', error);
        }
    };

    const handleServiceFormChange = (e) => {
        const { name, value } = e.target;
        setNewService(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddService = async () => {
        if (!newService.name || !newService.price || !newService.duration) {
            alert('Пожалуйста, заполните все поля (Название, Цена, Длительность).');
            return;
        }
        try {
            const serviceToAdd = {
                name: newService.name,
                price: parseFloat(newService.price),
                type: newService.type,
                duration: parseInt(newService.duration)
            };
            await api.post('/services', serviceToAdd, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert('Услуга успешно добавлена!');
            setNewService({
                name: '',
                price: '',
                type: 'MEN',
                duration: ''
            });
            fetchServices();
        } catch (error) {
            console.error('Ошибка при добавлении услуги:', error);
            alert('Не удалось добавить услугу.');
        }
    };

    const handleEditService = (service) => {
        setEditingService(service);
    };

    const handleSaveEdit = async () => {
        try {
            const serviceToSave = {
                ...editingService,
                price: parseFloat(editingService.price),
                duration: parseInt(editingService.duration)
            };
            await api.put(`/services/${editingService.id}`, serviceToSave);
            console.log('Услуга обновлена:', serviceToSave);
            fetchServices();
            setEditingService(null);
        } catch (error) {
            console.error('Ошибка при обновлении услуги:', error);
        }
    };

    const handleDeleteService = async (id) => {
        try {
            await api.delete(`/services/${id}`);
            console.log(`Услуга с ID ${id} удалена`);
            fetchServices();
        } catch (error) {
            console.error('Ошибка при удалении услуги:', error);
        }
    };

    // ВАША ФУНКЦИЯ РЕНДЕРИНГА ЗВЕЗД
    const renderStars = (rating) => {
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return 'Нет оценки';
        }
        const fullStar = '★';
        const emptyStar = '☆';
        const stars = fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
        return <span>{stars}</span>;
    };

    return (
        <div className={styles.dashboard}> {/* Используем .dashboard для сохранения стилей */}
            {/* ВАША СЕКЦИЯ ДОБАВЛЕНИЯ УСЛУГИ */}
            <div className={styles.addServiceSection}>
                <h3>Добавить новую услугу</h3>
                <div className={styles.serviceForm}>
                    <input type="text" placeholder="Название услуги" name="name" value={newService.name} onChange={handleServiceFormChange} />
                    <input type="number" placeholder="Цена (руб.)" name="price" value={newService.price} onChange={handleServiceFormChange} />
                    <input type="number" placeholder="Длительность (мин.)" name="duration" value={newService.duration} onChange={handleServiceFormChange} />
                    <select name="type" value={newService.type} onChange={handleServiceFormChange} >
                        <option value="MEN">Мужская</option>
                        <option value="WOMEN">Женская</option>
                    </select>
                    <button onClick={handleAddService}>Добавить услугу</button>
                </div>
            </div>

            {/* ВАША СЕКЦИЯ СПИСКА УСЛУГ */}
            <div className={styles.serviceListSection}>
                <h3>Список услуг</h3>
                <ul className={styles.serviceList}>
                    {services.map((service) => (
                        <li key={service.id} className={styles.serviceItem}>
                            {editingService?.id === service.id ? (
                                <div>
                                    <input type="text" value={editingService.name} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} />
                                    <input type="number" value={editingService.price} onChange={(e) => setEditingService({ ...editingService, price: e.target.value })} />
                                    <input type="number" placeholder="Длит. (мин)" value={editingService.duration || ''} onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })} />
                                    <select value={editingService.type} onChange={(e) => setEditingService({ ...editingService, type: e.target.value })} >
                                        <option value="MEN">Мужская</option>
                                        <option value="WOMEN">Женская</option>
                                    </select>
                                    <button onClick={handleSaveEdit}>Сохранить</button>
                                </div>
                            ) : (
                                <div>
                                    <span>{service.name} - {service.price} р. ({service.type === 'MEN' ? 'Мужская' : 'Женская'}) - {service.duration || 'N/A'} мин.</span>
                                    <button onClick={() => handleEditService(service)}>Редактировать</button>
                                    <button onClick={() => handleDeleteService(service.id)}>Удалить</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* ВАША СЕКЦИЯ ОТЗЫВОВ */}
            <div className={styles.reviewListSection}>
                <h3>Отзывы клиентов</h3>
                <ul className={styles.reviewList}>
                    {reviews.map((review) => (
                         <li key={review.id} className={styles.reviewItem}>
                             {review.appointment ? (
                                 <>
                                     <strong>Услуга:</strong> {review.appointment.service?.name || 'Неизвестно'} <br/>
                                     <strong>Мастер:</strong> {review.appointment.master?.name || 'Неизвестно'}<br/>
                                     <strong>Оценка:</strong> {renderStars(review.rating)} <br/>
                                     <strong>Отзыв:</strong> {review.reviewText}                                                                     
                                 </>
                             ) : (
                                 <>
                                     <strong>Оценка:</strong> {renderStars(review.rating)} <br/>
                                     <strong>Отзыв:</strong> {review.reviewText} <br/>
                                     <span>(Связь с записью расписания отсутствует)</span>
                                 </>
                             )}
                             {/* Сюда можно добавить кнопку "Удалить отзыв" */}
                         </li>
                    ))}
                     {reviews.length === 0 && <li>Список отзывов пуст.</li>} 
                </ul>
            </div>
        </div>
    );
}

export default AdminManagement;