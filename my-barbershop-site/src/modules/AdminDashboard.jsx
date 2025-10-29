import React, { useEffect, useState, useMemo, useCallback } from 'react'; 
import axios from 'axios';
import api from '../api/api';
import styles from './AdminDashboard.module.css';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2'; 

import Select from 'react-select';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        title: { display: false, text: 'График' }, 
         tooltip: { 
             callbacks: {
                 label: function(context) {
                     let label = context.dataset.label || '';
                     if (label) {
                         label += ': ';
                     }
                     if (context.parsed.y !== null) {
                          const value = context.parsed.y;
                         const reportType = context.chart.options.reportType; 
                         if (reportType === 'sales') {
                              label += new Intl.NumberFormat('by-BY', { style: 'currency', currency: 'BYN', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
                         } else {
                              label += value;
                         }
                     }
                     return label;
                 }
             }
         }
    },
    scales: {
        x: { title: { display: true, text: 'Период' } },
        y: {
             title: { display: true, text: 'Количество' }, 
             beginAtZero: true
        },
    },
};

function AdminDashboard() {
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({ name: '', price: '', type: '' });
    const [editingService, setEditingService] = useState(null);
    const [reviews, setReviews] = useState([]); 
    const [timetable, setTimetable] = useState([]);
    // eslint-disable-next-line
    const [masters, setMasters] = useState([]);

    const [selectedReportType, setSelectedReportType] = useState(''); 
    const [reportStartDate, setReportStartDate] = useState('');    
    const [reportEndDate, setReportEndDate] = useState('');     
    const [reportAllTime, setReportAllTime] = useState(false);    
    const [performanceReport, setPerformanceReport] = useState(null); 

    const [availableServices, setAvailableServices] = useState([]); 
    const [selectedServiceOptions, setSelectedServiceOptions] = useState([]); 

    const [availableMasters, setAvailableMasters] = useState([]); 
    const [selectedMasterOptions, setSelectedMasterOptions] = useState([]);

    useEffect(() => {
        fetchServices();
        fetchReviews(); 
        fetchTimetable();
        fetchMasters();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('http://localhost:8080/services');
            setServices(response.data);
            const serviceOptions = response.data.map(service => ({
                value: service.id,   
                label: service.name, 
            }));
            setAvailableServices(serviceOptions);
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
    
      const fetchTimetable = async () => {
        try {
            const response = await api.get('/api/timetable');
            setTimetable(response.data);
            console.log('Расписание загружено:', response.data);
        } catch (error) {
            console.error('Ошибка при загрузке расписания:', error);
        }
    };
    const fetchMasters = async () => {
        try {
            const response = await api.get('/api/masters'); 
            setMasters(response.data);
            const masterOptions = response.data.map(master => ({ value: master.id, label: master.name })); 
            setAvailableMasters(masterOptions);
            console.log('Список мастеров загружен:', response.data);
        } catch (error) {
            console.error('Ошибка при загрузке мастеров:', error);
        }
    };

    const handleAddService = async () => {
        if (newService.name && newService.price && newService.type) {
            try {
                await axios.post('http://localhost:8080/services', newService);
                console.log('Услуга добавлена:', newService);
                setNewService({ name: '', price: '', type: '' });
                fetchServices();
            } catch (error) {
                console.error('Ошибка при добавлении услуги:', error);
            }
        } else {
            alert('Введите название, цену и тип услуги.');
        }
    };

    const handleEditService = (service) => {
        setEditingService(service);
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`http://localhost:8080/services/${editingService.id}`, editingService);
            console.log('Услуга обновлена:', editingService);
            fetchServices();
            setEditingService(null);
        } catch (error) {
            console.error('Ошибка при обновлении услуги:', error);
        }
    };

    const handleDeleteService = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/services/${id}`);
            console.log(`Услуга с ID ${id} удалена`);
            fetchServices();
        } catch (error) {
            console.error('Ошибка при удалении услуги:', error);
        }
    };

    const formatAppointmentTime = (isoString) => {
        if (!isoString) return 'Неизвестное время';
        try {
             const date = new Date(isoString);
             if (isNaN(date.getTime())) { throw new Error("Некорректный формат даты"); }
             const dateWithOffset = new Date(date.getTime() - (3 * 60 * 60 * 1000)); 
             return dateWithOffset.toLocaleString('ru-RU', {
                 year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
             });
         } catch (e) {
             console.error("Ошибка форматирования даты:", isoString, e);
             return 'Некорректное время';
         }
   };
    
    const renderStars = (rating) => {
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return 'Нет оценки';
        }
        const fullStar = '★';
        const emptyStar = '☆';
        const stars = fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
        return <span>{stars}</span>;
    };

    const formatLocalDate = useCallback((localDate) => {
        if (!localDate) return '';
        if (typeof localDate === 'string' && localDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
             const [year, month, day] = localDate.split('-').map(Number);
             const date = new Date(year, month - 1, day);
             return date.toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        if (Array.isArray(localDate) && localDate.length === 3) {
            const [year, month, day] = localDate;
            const date = new Date(year, month - 1, day);
            return date.toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
        }
         try {
            const date = new Date(localDate);
            if (!isNaN(date.getTime())) {
                 return date.toLocaleString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
            }
         } catch (e) { }
        return String(localDate);
    }, []);

    const getColorForService = useCallback((serviceName) => {
        const colors = [
            { background: 'rgba(255, 99, 132, 0.5)', border: 'rgba(255, 99, 132, 1)' }, 
            { background: 'rgba(54, 162, 235, 0.5)', border: 'rgba(54, 162, 235, 1)' }, 
            { background: 'rgba(255, 206, 86, 0.5)', border: 'rgba(255, 206, 86, 1)' },
            { background: 'rgba(75, 192, 192, 0.5)', border: 'rgba(75, 192, 192, 1)' },
            { background: 'rgba(153, 102, 255, 0.5)', border: 'rgba(153, 102, 255, 1)' }, 
            { background: 'rgba(255, 159, 64, 0.5)', border: 'rgba(255, 159, 64, 1)' },
            { background: 'rgba(199, 199, 199, 0.5)', border: 'rgba(199, 199, 199, 1)' }, 
            { background: 'rgba(83, 102, 255, 0.5)', border: 'rgba(83, 102, 255, 1)' }, 
            { background: 'rgba(255, 99, 255, 0.5)', border: 'rgba(255, 99, 255, 1)' },
        ];
        let hash = 0;
        for (let i = 0; i < serviceName.length; i++) {
            hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }, []); 
    const formatCurrency = useCallback((amount) => {
        if (amount === null || amount === undefined) return 'Нет данных';
        const formatter = new Intl.NumberFormat('by-BY', { 
            style: 'currency',
            currency: 'BYN', 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2, 
        });
        const numberAmount = typeof amount === 'object' && amount !== null && amount.value !== undefined
                             ? amount.value 
                             : Number(amount);

        if (isNaN(numberAmount)) return 'Некорректная сумма';

        return formatter.format(numberAmount);

    }, []); 

    const fetchPerformanceReport = async () => {
        if (!reportAllTime && (!reportStartDate || !reportEndDate)) {
            alert("Выберите начальную и конечную дату или опцию 'За все время'.");
            return;
        }
         if (!selectedReportType) {
             alert("Выберите тип анализа.");
             return;
         }

        let startDate = null;
        let endDate = null;

        if (!reportAllTime) {
            try {
                const startObj = new Date(reportStartDate);
                const endObj = new Date(reportEndDate);
                endObj.setHours(23, 59, 59, 999); 

                startDate = reportStartDate ? startObj.toISOString() : null; // отправляется null, если дата не выбрана
                endDate = reportEndDate ? endObj.toISOString() : null;   

            } catch (e) {
                alert("Некорректный формат даты.");
                console.error("Date formatting error:", e);
                return;
            }
        }

        let serviceIdsForBackend = selectedReportType === 'masters' ? null : selectedServiceOptions.map(option => option.value); 
        let masterIdsForBackend = selectedReportType === 'services' ? null : selectedMasterOptions.map(option => option.value); 

        if (selectedReportType === 'sales') {
            serviceIdsForBackend = selectedServiceOptions.map(option => option.value); 
            masterIdsForBackend = selectedMasterOptions.map(option => option.value);   
        }

        const params = {
            reportType: selectedReportType,
            startDate: startDate, 
            endDate: endDate,
            ...(serviceIdsForBackend !== null ? { serviceIds: serviceIdsForBackend } : {}),
            ...(masterIdsForBackend !== null ? { masterIds: masterIdsForBackend } : {}),
        };

        try {
            const response = await api.get('/api/reports/performance', {
                params: params, 
                paramsSerializer: {
                    serialize: (params) => {
                        const searchParams = new URLSearchParams();
                        for (const key in params) {
                            const value = params[key];
                            if (Array.isArray(value)) {
                                if (value.length === 0) {
                                    searchParams.append(key, ''); 
                                } else {
                                    value.forEach(item => {
                                        searchParams.append(key, item === null || item === undefined ? '' : String(item));
                                    });
                                }
                            } else {
                                if (value === null || value === undefined) {
                                    searchParams.append(key, '');
                                } else {
                                    searchParams.append(key, String(value)); 
                                }
                            }
                        }
                        return searchParams.toString();
                    }
                }
            });
            setPerformanceReport(response.data);
            console.log('Отчет по эффективности загружен:', response.data);

        } catch (error) {
            console.error('Ошибка при загрузке отчета:', error);
            let errorMessage = "Не удалось загрузить отчет.";
             if (axios.isAxiosError(error) && error.response) {
                 errorMessage = `Ошибка: ${error.response.status} ${error.response.statusText}`;
                  if (error.response.status === 403) {
                      errorMessage = "У вас нет прав для просмотра отчетов (требуется роль ADMIN).";
                  }
                 if (error.response.data && typeof error.response.data === 'string') {
                      errorMessage += `: ${error.response.data}`;
                  }
             }
             alert(errorMessage);
            setPerformanceReport(null);
        }
    };

    const chartData = useMemo(() => {
        if (selectedReportType === 'services' && performanceReport?.serviceReportData?.visitData && performanceReport.serviceReportData.visitData.length > 0) {
            const visitDataPoints = performanceReport.serviceReportData.visitData;
            const labels = visitDataPoints.map(point => formatLocalDate(point.date));
            const datasets = [];
            const showIndividualServices = selectedServiceOptions && selectedServiceOptions.length > 0;

            if (showIndividualServices) {
                selectedServiceOptions.forEach(selectedService => {
                     const serviceName = selectedService.label;
                     const color = getColorForService(serviceName);
                     datasets.push({
                         label: serviceName,
                         data: visitDataPoints.map(point => point.serviceVisitCounts?.[serviceName] || 0),
                         backgroundColor: color.background,
                         borderColor: color.border,
                         borderWidth: 1,
                     });
                });
            } else {
                datasets.push({
                    label: 'Общее количество посещений',
                    data: visitDataPoints.map(point => point.totalVisits || 0),
                     backgroundColor: 'rgba(75, 192, 192, 0.5)',
                     borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                });
            }
            return { labels, datasets, reportType: 'services' }; 

        }

        if (selectedReportType === 'sales' && performanceReport?.salesReportData?.dailyRevenueDataPoints && performanceReport.salesReportData.dailyRevenueDataPoints.length > 0) {
             const dailyRevenueDataPoints = performanceReport.salesReportData.dailyRevenueDataPoints;

             const sortedData = [...dailyRevenueDataPoints].sort((a, b) => new Date(a.date) - new Date(b.date));


             const labels = sortedData.map(point => formatLocalDate(point.date)); 

             const datasets = [{
                 label: 'Выручка', 
                 data: sortedData.map(point => point.totalRevenue), 
                 backgroundColor: 'rgba(54, 162, 235, 0.5)', 
                 borderColor: 'rgba(54, 162, 235, 1)',
                 borderWidth: 1,
             }];

            return { labels, datasets, reportType: 'sales' }; 
        }
        return null; 
        // eslint-disable-next-line
    }, [performanceReport, selectedServiceOptions, selectedMasterOptions, formatLocalDate, getColorForService, selectedReportType]); 

    //  адаптация опций графика в зависимости от типа отчета 
    const currentChartOptions = useMemo(() => {
        const options = { ...chartOptions }; 

        if (chartData) {
            if (chartData.reportType === 'services') {
                 options.plugins.title.text = `График посещаемости услуг за период ${reportAllTime ? "за все время" : `с ${reportStartDate} по ${reportEndDate}`}`;
                 options.scales.y.title.text = 'Количество посещений'; 
            } else if (chartData.reportType === 'sales') {
                 options.plugins.title.text = `График ежедневной выручки за период ${reportAllTime ? "за все время" : `с ${reportStartDate} по ${reportEndDate}`} (Br)`;
                 options.scales.y.title.text = 'Выручка (Br)'; 
            }
             options.plugins.title.display = true; 
             options.reportType = chartData.reportType;

        } else {
            options.plugins.title.display = false; 
        }

        return options;
    }, [chartData, reportAllTime, reportStartDate, reportEndDate]); 


    return (
        <div className={styles.dashboard}>
            <h2>Личный кабинет администратора</h2>
            <div className={styles.timetableSection}>
                <h3>Расписание</h3>
                <ul className={styles.timetableList}>
                    {timetable
                        .slice() 
                        .sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime)) 
                        .map((entry) =>(
                      <li key={entry.id} className={styles.timetableItem}>
                        <div>
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
                                 // Если связь с записью отсутствует
                                 <>
                                     <strong>Оценка:</strong> {renderStars(review.rating)} <br/>
                                     <strong>Отзыв:</strong> {review.reviewText} <br/>
                                     <span>(Связь с записью расписания отсутствует)</span>
                                 </>
                             )}
                         </li>
                    ))}
                     {reviews.length === 0 && <li>Список отзывов пуст.</li>} 
                </ul>
            </div>
            <div className={styles.addServiceSection}>
                <h3>Добавить новую услугу</h3>
                <input
                    type="text"
                    placeholder="Название услуги"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Цена услуги"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                />
                <select
                    required
                    value={newService.type}
                    onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                >
                    <option value="">Выберите тип услуги</option>
                    <option value="MEN">Мужская</option>
                    <option value="WOMEN">Женская</option>
                </select>
                <button className={styles.addButton} onClick={handleAddService}>
                    Добавить услугу
                </button>
            </div>

            <div className={styles.serviceListSection}>
                <h3>Список услуг</h3>
                <ul className={styles.serviceList}>
                    {services.map((service) => (
                        <li key={service.id} className={styles.serviceItem}>
                            {editingService?.id === service.id ? (
                                <div>
                                    <input
                                        type="text"
                                        value={editingService.name}
                                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        value={editingService.price}
                                        onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                                    />
                                    <select
                                        value={editingService.type}
                                        onChange={(e) => setEditingService({ ...editingService, type: e.target.value })}
                                    >
                                        <option value="MEN">Мужская</option>
                                        <option value="WOMEN">Женская</option>
                                    </select>
                                    <button onClick={handleSaveEdit}>Сохранить</button>
                                </div>
                            ) : (
                                <div>
                                    <span>{service.name} - {service.price} р. ({service.type === 'MEN' ? 'Мужская' : 'Женская'})</span>
                                    <button onClick={() => handleEditService(service)}>Редактировать</button>
                                    <button onClick={() => handleDeleteService(service.id)}>Удалить</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {/*СЕКЦИЯ АНАЛИЗА ЭФФЕКТИВНОСТИ*/}
            <div className={styles.analyticsSection}>
                <h3>Анализ эффективности парикмахерской</h3>

                <div className={styles.reportParameters}>
                    <select value={selectedReportType} onChange={(e) => {setSelectedReportType(e.target.value); setPerformanceReport(null); setSelectedServiceOptions([]); setSelectedMasterOptions([]);}}>
                         <option value="">Выберите тип анализа</option>
                         <option value="services">По услугам (посещениям)</option>
                         <option value="masters">По мастерам</option> 
                         <option value="sales">По прибыли (выручке)</option> 
                    </select>

                    <div className={styles.parameterInputs}>
                    <>
                        <label htmlFor="startDate">C:</label>
                        <input type="date" id="startDate" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)}/>
                        <label htmlFor="endDate" style={{ marginLeft: '10px' }}>По:</label>
                        <input type="date" id="endDate" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)}/>
                    </>
                    <label style={{ marginLeft: '10px' }}>
                    <input type="checkbox" checked={reportAllTime} onChange={(e) => { setReportAllTime(e.target.checked); if (e.target.checked) { setReportStartDate(''); setReportEndDate(''); }}}/>
                        За все время
                    </label>

                    {/* Фильтры в зависимости от выбранного типа анализа */}
                     {(selectedReportType === 'services'|| selectedReportType === 'sales') && (
                         <div className={styles.serviceFilter}>
                             <label style={{ marginLeft: '10px' }}>Фильтр услуг:</label>
                             <Select
                                 isMulti 
                                 name="services"
                                 options={availableServices} 
                                 className="basic-multi-select" 
                                 classNamePrefix="select" 
                                 placeholder="Выберите услуги..."
                                 noOptionsMessage={() => "Услуги не найдены"}
                                 value={selectedServiceOptions} 
                                 onChange={(selected) => setSelectedServiceOptions(selected || [])} 
                                 styles={{
                                     container: (provided) => ({
                                         ...provided,
                                         width: '100%',
                                         maxWidth: '300px',
                                         marginLeft: '0px',
                                         marginBottom: '0px',
                                         minWidth: '150px',
                                     }),
                                     control: (provided) => ({
                                          ...provided,
                                          minHeight: '40px',
                                     }),
                                     valueContainer: (provided) => ({
                                          ...provided,
                                          padding: '0 8px',
                                     }),
                                     input: (provided) => ({
                                        ...provided,
                                        margin: '0px',
                                        padding: '0px',
                                     }),
                                 }}
                             />
                         </div>
                     )}
                     {(selectedReportType === 'masters' || selectedReportType === 'sales') && (
                             <div className={styles.masterFilter}> 
                                 <label style={{ marginLeft: '10px' }}>Фильтр мастеров:</label>
                                 <Select
                                     isMulti
                                     name="masters"
                                     options={availableMasters} 
                                     className="basic-multi-select" 
                                     classNamePrefix="select"
                                     placeholder="Выберите мастеров..."
                                     noOptionsMessage={() => "Мастера не найдены"}
                                     value={selectedMasterOptions} 
                                     onChange={(selected) => setSelectedMasterOptions(selected || [])}
                                     styles={{
                                         container: (provided) => ({ ...provided, width: '100%', maxWidth: '300px', marginLeft: '0px', marginBottom: '0px', minWidth: '150px', }),
                                         control: (provided) => ({ ...provided, minHeight: '40px', }),
                                         valueContainer: (provided) => ({ ...provided, padding: '0 8px', }),
                                         input: (provided) => ({ ...provided, margin: '0px', padding: '0px', }),
                                     }}
                                 />
                             </div>
                         )}
                     </div>
                     <div className={styles.reportButtonContainer}>
                        <button onClick={fetchPerformanceReport}>Показать анализ</button>
                    </div>
                </div>


                {/*Report Results Area*/}
                 {performanceReport ? (
                     <div className={styles.reportResults}>
                         {selectedReportType === 'services' && performanceReport.serviceReportData && (
                              <div className={styles.serviceAnalytics}>
                                 <div className={styles.visitGraph}>
                                        {chartData ? (
                                            <div style={{ position: 'relative', height: '40vh', width: '80%', margin: '0 auto' }}>
                                                <Bar options={currentChartOptions} data={chartData} /> 
                                            </div>
                                        ) : (
                                            <p>Нет данных для построения графика посещений за выбранный период.</p>
                                        )}
                                   </div>
                                 
                                   <div className={styles.averageRatings}>
                                        <h5>Средняя оценка по услугам</h5>
                                         {performanceReport.serviceReportData.averageRatings && performanceReport.serviceReportData.averageRatings.length > 0 ? (
                                            <ul>
                                                {performanceReport.serviceReportData.averageRatings.map(ar => (
                                                    <li key={ar.serviceId}>
                                                         {ar.serviceName}: {ar.averageRating ? ar.averageRating.toFixed(1) : 'Нет данных'} {renderStars(Math.round(ar.averageRating || 0))}
                                                    </li>
                                                ))}
                                            </ul>
                                         ) : (
                                             <p>Нет данных об оценках за выбранный период или для выбранных услуг.</p>
                                         )}
                                   </div>
                              </div>
                         )}
                        {selectedReportType === 'masters' && performanceReport.masterReportData && (
                             <div className={styles.masterAnalytics}> 
                                 <h4>Анализ по мастерам</h4>

                                 {/* таблица с данными по мастерам */}
                                  {performanceReport.masterReportData.masterPerformanceData && performanceReport.masterReportData.masterPerformanceData.length > 0 ? (
                                     <table className={styles.reportTable}>
                                        <thead>
                                             <tr>
                                                 <th>Мастер</th>
                                                 <th>Количество записей (за период)</th>
                                                 <th>Суммарная стоимость записей (за период)</th>
                                                 <th>Средняя оценка</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                            {performanceReport.masterReportData.masterPerformanceData.map(masterData => (
                                                 <tr key={masterData.masterId}>
                                                     <td>{masterData.masterFullName || 'Неизвестно'}</td>
                                                     <td>{masterData.appointmentCount !== null ? masterData.appointmentCount : 'Нет данных'}</td>
                                                     <td>{formatCurrency(masterData.totalRevenue)}</td>
                                                     <td>
                                                           {masterData.averageRating !== null ? (
                                                            <>
                                                                <span>{masterData.averageRating.toFixed(1)}</span>
                                                                {' '} 
                                                                {renderStars(Math.round(masterData.averageRating || 0))} 
                                                            </>
                                                           ) : (
                                                             'Нет данных'
                                                           )}
                                                      </td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                  ) : (
                                      <p>Нет данных по мастерам за выбранный период или для выбранных мастеров.</p>
                                  )}
                             </div>
                         )}
                          {selectedReportType === 'sales' && performanceReport.salesReportData && (
                              <div className={styles.salesAnalytics}> 
                                   {/* График прибыли */}
                                    <div className={styles.revenueGraph}>
                                         {chartData ? (
                                             <div style={{ position: 'relative', height: '40vh', width: '80%', margin: '0 auto' }}>
                                                 <Bar options={currentChartOptions} data={chartData} /> 
                                             </div>
                                         ) : (
                                             <p>Нет данных для построения графика прибыли за выбранный период.</p>
                                         )}
                                    </div>

                                  {/* TODO: Можно добавить сводные цифры по прибыли здесь, если нужно */}
                              </div>
                         )}
                     </div>
                 ) : (
                     <p>Выберите тип анализа, период и нажмите "Показать анализ".</p>
                 )}
            </div>
        </div>
    );
}

export default AdminDashboard;
