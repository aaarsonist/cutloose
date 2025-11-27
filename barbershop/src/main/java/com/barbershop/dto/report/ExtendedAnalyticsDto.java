package com.barbershop.dto.report;

import lombok.Data;
import java.util.Map;
import java.util.List;

@Data
public class ExtendedAnalyticsDto {
    // Карточка 1: Топ мастер
    private String topMasterName;
    private Double topMasterRevenue;
    private Double topMasterRating;

    // Карточка 2: Средний чек
    private Double averageCheck;
    private Double averageCheckTrend; // Процент роста/падения по сравнению с прошлым периодом

    // Карточка 3: Удержание
    private Double retentionRate; // Процент

    // Круговая диаграмма (Мужчины vs Женщины)
    private Map<String, Long> genderDistribution; // "MEN": 50, "WOMEN": 30

    // Воронка (Топ услуг)
    private List<ServiceUsageDto> topServices;

    @Data
    public static class ServiceUsageDto {
        private String serviceName;
        private Long usageCount;

        public ServiceUsageDto(String serviceName, Long usageCount) {
            this.serviceName = serviceName;
            this.usageCount = usageCount;
        }
    }
}