import React, { useEffect, useState } from 'react'; 
import api from '../api/api';
import styles from './AdminDashboard.module.css'; // Используем общие стили

function AdminManagement() {
    // --- Состояния ---
    const [services, setServices] = useState([]);
    const [masters, setMasters] = useState([]);
    const [reviews, setReviews] = useState([]); 
    const [editingService, setEditingService] = useState(null);
    
    // Состояние для формы "Добавить услугу"
    const [newService, setNewService] = useState({
        name: '', price: '', type: 'MEN', duration: ''
    });
    
    // НОВОЕ: Состояние для формы "Добавить мастера"
    const [newMasterName, setNewMasterName] = useState('');

    useEffect(() => {
        fetchServices();
        fetchReviews(); 
        fetchMasters(); 
    }, []);

    // --- ЛОГИКА УСЛУГ (включая добавление) ---
    const fetchServices = async () => { /* ... (без изменений) ... */ 
        try {
            const response = await api.get('/services'); 
            setServices(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке услуг:', error);
        }
    };
    const handleServiceFormChange = (e) => {
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

    // --- ЛОГИКА МАСТЕРОВ (включая добавление) ---
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
    // НОВАЯ ЛОГИКА: Добавление мастера
    const handleAddMaster = async () => {
        if (!newMasterName.trim()) {
            alert('Пожалуйста, введите имя мастера.');
            return;
        }
        try {
            const masterToAdd = { name: newMasterName };
            await api.post('/api/masters', masterToAdd);
            alert('Мастер успешно добавлен!');
            setNewMasterName(''); // Очищаем поле
            fetchMasters(); // Обновляем список
        } catch (error) {
            console.error('Ошибка при добавлении мастера:', error);
            alert('Не удалось добавить мастера.');
        }
    };

    // --- ЛОГИКА ОТЗЫВОВ (без изменений) ---
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


    // --- JSX (С НОВЫМИ ФОРМАМИ ВНУТРИ СЕТКИ) ---
    return (
        <div className={styles.dashboard}> 
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
                    <div className={styles.editForm}> {/* Используем тот же стиль .editForm */}
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
                    
                    {/* --- НОВАЯ Форма ДОБАВЛЕНИЯ МАСТЕРА (внутри виджета) --- */}
                    <h3 className={styles.formToggle}>Добавить мастера</h3>
                    <div className={styles.editForm}> {/* Используем тот же стиль .editForm */}
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

            {/* --- СЕКЦИЯ ОТЗЫВОВ (внизу) --- */}
            <div className={styles.managementWidget}> {/* Используем тот же стиль виджета */}
                <h3>Отзывы клиентов</h3>
                <ul className={styles.managementList}> {/* Используем тот же стиль списка */}
                    {reviews.map((review) => (
                         <li key={review.id} className={styles.managementItem}> {/* Используем тот же стиль строки */}
                             <span className={styles.itemInfo}>
                                 {review.appointment?.service?.name || 'Услуга не найдена'} ({renderStars(review.rating)})
                                 <br/>
                                 <small style={{color: '#555'}}>{review.reviewText}</small>
                             </span>
                             {/* Можно добавить кнопку удаления отзыва сюда */}
                         </li>
                    ))}
                     {reviews.length === 0 && <li className={styles.managementItem}>Список отзывов пуст.</li>} 
                </ul>
            </div>
        </div>
    );
}

export default AdminManagement;