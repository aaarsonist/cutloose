import React, { useEffect, useState, useCallback } from 'react'; 
import api from '../api/api';
import styles from './AdminDashboard.module.css'; 

import Range from 'rc-slider'; 
import 'rc-slider/assets/index.css'; 

// --- ВАЖНО: Добавляем LineElement и PointElement для Line-графика ---
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2'; 
import Select from 'react-select';

// Регистрация Chart.js (без изменений)
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// ... (Ваши вспомогательные функции: formatLocalDate, renderStars, formatCurrency, toInputFormat, toLabelFormat) ...
const formatLocalDate = (localDate) => {
    if (!localDate) return '';
    if (Array.isArray(localDate)) { 
        const date = new Date(localDate[0], localDate[1] - 1, localDate[2]);
        return date.toLocaleString('ru-RU', { month: 'long', day: 'numeric' });
    }
    if (typeof localDate === 'string') { 
        const parts = localDate.split('-');
        if (parts.length === 3) {
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return date.toLocaleString('ru-RU', { month: 'long', day: 'numeric' });
        }
    }
    return String(localDate); 
};
const renderStars = (rating) => {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) return 'N/A';
    const fullStar = '★';
    const emptyStar = '☆';
    return fullStar.repeat(Math.round(rating)) + emptyStar.repeat(5 - Math.round(rating));
};
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 BYN';
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'BYN' }).format(amount);
};
const toInputFormat = (date) => {
    if (!date || isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0]; 
    }
    return date.toISOString().split('T')[0];
};
const toLabelFormat = (timestamp) => {
    if (timestamp === null || timestamp === undefined) return "";
    return new Date(timestamp).toLocaleDateString('ru-RU');
};


// --- КОНСТАНТЫ ДЛЯ СЛАЙДЕРА (без изменений) ---
const TODAY_TS = Date.now();
const ONE_YEAR_AGO_TS = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).getTime();
const ONE_MONTH_AGO_TS = new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime();


function AdminAnalytics() {
    // --- Состояния ---
    const [salesData, setSalesData] = useState(null); 
    const [serviceData, setServiceData] = useState(null);
    const [masterData, setMasterData] = useState(null); 
    
    // --- НОВОЕ СОСТОЯНИЕ ДЛЯ ПРОГНОЗА ---
    const [forecastData, setForecastData] = useState([]);
    
    const [sliderValues, setSliderValues] = useState([ONE_MONTH_AGO_TS, TODAY_TS]);
    const [startDate, setStartDate] = useState(toInputFormat(new Date(ONE_MONTH_AGO_TS))); 
    const [endDate, setEndDate] = useState(toInputFormat(new Date(TODAY_TS))); 
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedMasters, setSelectedMasters] = useState([]);
    const [serviceOptions, setServiceOptions] = useState([]);
    const [masterOptions, setMasterOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- Загрузка списков для фильтров (без изменений) ---
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [servicesRes, mastersRes] = await Promise.all([
                    api.get('/services'), 
                    api.get('/api/masters') 
                ]);
                setServiceOptions(servicesRes.data.map(s => ({ value: s.id, label: s.name })));
                setMasterOptions(mastersRes.data.map(m => ({ value: m.id, label: m.name })));
            } catch (error) {
                console.error("Ошибка загрузки опций для фильтров:", error);
            }
        };
        fetchFilterOptions();
    }, []);

    // --- Загрузка данных дашборда (без изменений) ---
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);

        const isoStartDate = startDate ? new Date(startDate).toISOString() : null;
        const isoEndDate = endDate ? new Date(new Date(endDate).setHours(23, 59, 59)).toISOString() : null; 
        const serviceIds = selectedServices.map(s => s.value);
        const masterIds = selectedMasters.map(m => m.value);
        const params = { startDate: isoStartDate, endDate: isoEndDate, serviceIds: serviceIds, masterIds: masterIds };
        
        const config = {
            params: params,
            paramsSerializer: {
                serialize: (params) => {
                    const searchParams = new URLSearchParams();
                    for (const key in params) {
                        const value = params[key];
                        if (Array.isArray(value)) {
                            value.forEach(item => searchParams.append(key, item));
                        } else if (value !== null && value !== undefined) {
                            searchParams.append(key, value);
                        }
                    }
                    return searchParams.toString();
                }
            }
        };

        try {
            // --- ИЗМЕНЕНИЕ: Добавляем 4-й запрос ---
            const [ salesRes, serviceRes, masterRes, forecastRes ] = await Promise.all([
                api.get('/api/reports/sales', config), 
                api.get('/api/reports/services', config), 
                api.get('/api/reports/masters', config),
                api.get('/api/forecast/weekly') // Запрос прогноза
            ]);

            setSalesData(salesRes.data);
            setServiceData(serviceRes.data);
            setMasterData(masterRes.data);
            setForecastData(forecastRes.data); // Сохраняем данные прогноза

        } catch (error) {
            console.error("Ошибка при загрузке данных дашборда:", error);
            alert("Не удалось загрузить аналитику. " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, selectedServices, selectedMasters]); // Зависимости не изменились

    // --- useEffect для загрузки (без изменений) ---
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]); 

    // --- Обработчик слайдера (без изменений) ---
    const handleSliderStop = (values) => {
        if (!values || typeof values[0] !== 'number' || typeof values[1] !== 'number') {
            console.error("handleSliderStop: получены неверные значения", values);
            return;
        }
        const newStartDate = toInputFormat(new Date(values[0]));
        const newEndDate = toInputFormat(new Date(values[1]));
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    // --- Опции и данные для графиков (без изменений) ---
    const chartOptions = (title) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: title, font: { size: 14 } },
        },
        scales: { y: { beginAtZero: true } }
    });
    
    const salesChart = {
        labels: salesData?.dailyRevenueDataPoints.map(dp => formatLocalDate(dp.date)) || [],
        datasets: [{
            label: 'Выручка (BYN)',
            data: salesData?.dailyRevenueDataPoints.map(dp => dp.totalRevenue) || [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            fill: true,
        }],
    };

    const serviceChart = {
        labels: serviceData?.visitData.map(dp => formatLocalDate(dp.date)) || [],
        datasets: [{
            label: 'Кол-во записей',
            data: serviceData?.visitData.map(dp => dp.totalVisits) || [],
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
        }],
    };
    
    // --- НОВЫЙ ГРАФИК: ДАННЫЕ ДЛЯ ПРОГНОЗА ---
    const forecastChartData = {
        labels: forecastData.map(d => d.dayOfWeekRussian), 
        datasets: [
            {
                label: 'Предложение (часы)',
                data: forecastData.map(d => d.supplyHours.toFixed(1)),
                backgroundColor: 'rgba(54, 162, 235, 0.6)', // Синий
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Спрос (сред. часы)',
                data: forecastData.map(d => d.demandHours.toFixed(1)),
                backgroundColor: 'rgba(255, 159, 64, 0.6)', // Оранжевый
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            }
        ]
    };
    
    const forecastChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' }, // Включаем легенду
            title: { display: false },
        },
        scales: { 
            y: { 
                beginAtZero: true,
                title: { display: true, text: 'Часы' }
            } 
        }
    };
    
    // --- JSX Рендеринг ---
    return (
        <div className={styles.analyticsPage}>
            
            {/* --- ФИЛЬТРЫ (без изменений) --- */}
            <div className={styles.dateSliderBar}>
                <span className={styles.sliderLabel}>{toLabelFormat(sliderValues[0])}</span>
                <div className={styles.sliderWrapper}>
                    <Range
                        range 
                        min={ONE_YEAR_AGO_TS}
                        max={TODAY_TS}
                        value={sliderValues}
                        onChange={setSliderValues} 
                        onChangeComplete={handleSliderStop} 
                        allowCross={false}
                    />
                </div>
                <span className={styles.sliderLabel}>{toLabelFormat(sliderValues[1])}</span>
                {isLoading && <div className={styles.loader}>Обновление...</div>}
            </div>
            <div className={styles.filterBar}>
                <div className={styles.filterGroupWide}>
                    <Select
                        isMulti options={serviceOptions}
                        value={selectedServices} onChange={setSelectedServices}
                        className={styles.selectMulti} placeholder="Все услуги"
                    />
                </div>
                <div className={styles.filterGroupWide}>
                    <Select
                        isMulti options={masterOptions}
                        value={selectedMasters} onChange={setSelectedMasters}
                        className={styles.selectMulti} placeholder="Все мастера"
                    />
                </div>
            </div>

            {/* --- РЯДЫ ГРАФИКОВ И ТАБЛИЦ (без изменений) --- */}
            <div className={styles.dashboardGrid}>
                <div className={styles.widget}>
                    {salesData ? <Line options={chartOptions('Динамика выручки')} data={salesChart} /> : "Загрузка..."}
                </div>
                <div className={styles.widget}>
                    {serviceData ? <Bar options={chartOptions('Динамика посещений')} data={serviceChart} /> : "Загрузка..."}
                </div>
            </div>
            <div className={styles.dashboardGrid}>
                <div className={styles.widget}>
                    <h3>Эффективность мастеров</h3>
                    {/* ... (таблица masterData без изменений) ... */}
                    <div className={styles.tableContainer}>
                        <table>
                            <thead>
                                <tr><th>Мастер</th><th>Записей</th><th>Выручка</th><th>Сред. оценка</th></tr>
                            </thead>
                            <tbody>
                                {masterData?.masterPerformanceData.length > 0 ? masterData.masterPerformanceData.map(m => (
                                    <tr key={m.masterId}>
                                        <td>{m.masterFullName}</td>
                                        <td>{m.appointmentCount}</td>
                                        <td>{formatCurrency(m.totalRevenue)}</td>
                                        <td>{m.averageRating ? m.averageRating.toFixed(1) : 'N/A'} {renderStars(m.averageRating)}</td>
                                    </tr>
                                )) : <tr><td colSpan="4">Нет данных</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styles.widget}>
                    <h3>Средние оценки услуг</h3>
                    {/* ... (таблица serviceData.averageRatings без изменений) ... */}
                    <div className={styles.tableContainer}>
                        <table>
                            <thead>
                                <tr><th>Услуга</th><th>Сред. оценка</th></tr>
                            </thead>
                            <tbody>
                                {serviceData?.averageRatings.length > 0 ? serviceData.averageRatings.map(r => (
                                    <tr key={r.serviceId}>
                                        <td>{r.serviceName}</td>
                                        <td>{r.averageRating ? r.averageRating.toFixed(1) : 'N/A'} {renderStars(r.averageRating)}</td>
                                    </tr>
                                )) : <tr><td colSpan="2">Нет данных</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            
            {/* --- НОВЫЙ БЛОК ПРОГНОЗИРОВАНИЯ --- */}
            <div className={styles.forecastSection}>
                <h3>Прогноз спроса и рекомендации по оптимизации</h3>
                
                <div className={styles.dashboardGrid}>
                    {/* Виджет для графика */}
                    <div className={styles.widget}>
                        <h3>Прогноз спроса vs предложение (в часах)</h3>
                        {forecastData.length > 0 ? (
                            <div style={{height: '300px'}}>
                                <Bar options={forecastChartOptions} data={forecastChartData} />
                            </div>
                        ) : "Загрузка..."}
                    </div>
                    
                    {/* Виджет для рекомендаций */}
                    <div className={styles.widget}>
                        <h3>Рекомендации по оптимизации</h3>
                        <ul className={styles.recommendationList}>
                            {forecastData.map(day => (
                                <li key={day.dayOfWeek} className={styles[day.recommendationLevel.toLowerCase()]}>
                                    <strong>{day.dayOfWeekRussian}:</strong> {day.recommendationText}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default AdminAnalytics;