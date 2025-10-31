import React, { useEffect, useState } from 'react'; 
import api from '../api/api';
import styles from './AdminDashboard.module.css'; // Используем общие стили

function AdminManagement() {
    // --- Состояния ---
    const [services, setServices] = useState([]);
    const [masters, setMasters] = useState([]);
    const [reviews, setReviews] = useState([]); 
    const [editingService, setEditingService] = useState(null);
    const [newService, setNewService] = useState({
        name: '', price: '', type: 'MEN', duration: ''
    });
    const [newMasterName, setNewMasterName] = useState('');

    useEffect(() => {
        fetchServices();
        fetchReviews(); 
        fetchMasters(); 
    }, []);

    // --- ЛОГИКА УСЛУГ ---
    const fetchServices = async () => { /* ... (без изменений) ... */ 
        try {
            const response = await api.get('/services'); 
            setServices(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке услуг:', error);
        }
    };
    const handleServiceFormChange = (e) => { /* ... (без изменений) ... */ 
        const { name, value } = e.target;
        setNewService(prevState => ({ ...prevState, [name]: value }));
    };
    const handleAddService = async () => { /* ... (без изменений) ... */ 
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
            await api.post('/services', serviceToAdd);
            alert('Услуга успешно добавлена!');
            setNewService({ name: '', price: '', type: 'MEN', duration: '' });
            fetchServices();
        } catch (error) {
            console.error('Ошибка при добавлении услуги:', error);
            alert('Не удалось добавить услугу.');
        }
    };
    const handleEditService = (service) => { /* ... (без изменений) ... */ 
        setEditingService(service);
    };
    const handleSaveEdit = async () => { /* ... (без изменений) ... */ 
        try {
            const serviceToSave = {
                ...editingService,
                price: parseFloat(editingService.price),
                duration: parseInt(editingService.duration)
            };
            await api.put(`/services/${editingService.id}`, serviceToSave);
            fetchServices();
            setEditingService(null);
        } catch (error) {
            console.error('Ошибка при обновлении услуги:', error);
        }
    };
    const handleDeleteService = async (id) => { /* ... (без изменений) ... */ 
        if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
            try {
                await api.delete(`/services/${id}`);
                fetchServices();
            } catch (error) {
                console.error('Ошибка при удалении услуги:', error);
                alert('Не удалось удалить услугу. Возможно, на нее есть записи.');
            }
        }
    };

    // --- ЛОГИКА МАСТЕРОВ ---
    const fetchMasters = async () => { /* ... (без изменений) ... */ 
        try {
            const response = await api.get('/api/masters'); 
            setMasters(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке мастеров:', error);
        }
    };
    const handleDeleteMaster = async (id) => { /* ... (без изменений) ... */ 
        if (window.confirm('Вы уверены, что хотите удалить этого мастера? Это действие необратимо.')) {
            try {
                await api.delete(`/api/masters/${id}`);
                fetchMasters(); 
            } catch (error) {
                console.error('Ошибка при удалении мастера:', error);
                alert('Не удалось удалить мастера. Возможно, у него есть будущие записи.');
            }
        }
    };
    const handleAddMaster = async () => { /* ... (без изменений) ... */ 
        if (!newMasterName.trim()) {
            alert('Пожалуйста, введите имя мастера.');
            return;
        }
        try {
            const masterToAdd = { name: newMasterName };
            await api.post('/api/masters', masterToAdd);
            alert('Мастер успешно добавлен!');
            setNewMasterName(''); 
            fetchMasters(); 
        } catch (error) {
            console.error('Ошибка при добавлении мастера:', error);
            alert('Не удалось добавить мастера.');
        }
    };

    // --- ЛОГИКА ОТЗЫВОВ (с добавлением удаления) ---
    const fetchReviews = async () => { /* ... (без изменений) ... */ 
        try {
            const response = await api.get('/api/reviews');
            setReviews(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке отзывов:', error);
        }
    };
    const renderStars = (rating) => { /* ... (без изменений) ... */ 
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return 'Нет оценки';
        }
        const fullStar = '★';
        const emptyStar = '☆';
        return fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
    };
    
    // НОВАЯ ЛОГИКА: Удаление отзыва
    const handleDeleteReview = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            try {
                await api.delete(`/api/reviews/${id}`);
                fetchReviews(); // Обновляем список отзывов
            } catch (error) {
                console.error('Ошибка при удалении отзыва:', error);
                alert('Не удалось удалить отзыв.');
            }
        }
    };


    // --- JSX (С ПЕРЕСТАНОВКОЙ) ---
    return (
        <div className={styles.dashboard}> 
            <div className={styles.managementWidget} style={{marginBottom: '30px'}}> {/* Добавляем отступ снизу */}
                <h3>Отзывы клиентов</h3>
                <ul className={styles.managementList}>
                    {reviews.map((review) => (
                         <li key={review.id} className={styles.managementItem}>
                             <span className={styles.itemInfo}>
                                {review.appointment ? (
                                    <>
                                        <strong>{review.appointment.service?.name || 'Услуга'}</strong> ({renderStars(review.rating)})
                                        <br/>
                                        <small style={{color: '#555', fontStyle: 'italic'}}>"{review.reviewText}"</small>
                                        <br/>
                                        <small>Мастер: {review.appointment.master?.name || 'Неизвестно'}</small>
                                    </>
                                ) : (
                                    <>
                                        <strong>Отзыв без привязки</strong> ({renderStars(review.rating)})
                                        <br/>
                                        <small style={{color: '#555', fontStyle: 'italic'}}>"{review.reviewText}"</small>
                                    </>
                                )}
                             </span>
                             <div className={styles.itemButtons}>
                                <button onClick={() => handleDeleteReview(review.id)} className={styles.deleteButton}>
                                    Удалить
                                </button>
                             </div>
                         </li>
                    ))}
                     {reviews.length === 0 && <li className={styles.managementItem}>Список отзывов пуст.</li>} 
                </ul>
            </div>

            {/* СЕТКА 1x2 ДЛЯ СПИСКОВ И ФОРМ (без изменений) */}
            <div className={styles.managementGrid}>
                
                {/* --- КОЛОНКА 1: УСЛУГИ --- */}
                <div className={styles.managementWidget}>
                    <h3>Список услуг</h3>
                    <ul className={styles.managementList}>
                        {services.map((service) => (
                            <li key={service.id} className={styles.managementItem}>
                                {editingService?.id === service.id ? (
                                    // Форма РЕДАКТИРОВАНИЯ
                                    <div className={styles.editForm}>
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
                                    // Обычная строка
                                    <>
                                        <span className={styles.itemInfo}>
                                            {service.name} - {service.price} р. ({service.duration || 'N/A'} мин.)
                                        </span>
                                        <div className={styles.itemButtons}>
                                            <button onClick={() => handleEditService(service)} className={styles.editButton}>Редактировать</button>
                                            <button onClick={() => handleDeleteService(service.id)} className={styles.deleteButton}>Удалить</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                    
                    {/* --- Форма ДОБАВЛЕНИЯ УСЛУГИ (внутри виджета) --- */}
                    <h3 className={styles.formToggle}>Добавить услугу</h3>
                    <div className={styles.editForm}>
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

                {/* --- КОЛОНКА 2: МАСТЕРА --- */}
                <div className={styles.managementWidget}>
                    <h3>Список мастеров</h3>
                    <ul className={styles.managementList}>
                        {masters.map((master) => (
                            <li key={master.id} className={styles.managementItem}>
                                <span className={styles.itemInfo}>{master.name}</span>
                                <div className={styles.itemButtons}>
                                    <button onClick={() => handleDeleteMaster(master.id)} className={styles.deleteButton}>
                                        Удалить
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    
                    {/* --- Форма ДОБАВЛЕНИЯ МАСТЕРА (внутри виджета) --- */}
                    <h3 className={styles.formToggle}>Добавить мастера</h3>
                    <div className={styles.editForm}>
                        <input 
                            type="text" 
                            placeholder="Имя мастера" 
                            value={newMasterName} 
                            onChange={(e) => setNewMasterName(e.target.value)} 
                        />
                        <button onClick={handleAddMaster}>Добавить мастера</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminManagement;