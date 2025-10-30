package com.barbershop.repository;

import com.barbershop.model.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.Optional;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {

    // Находит график для мастера на конкретный день недели
    Optional<WorkSchedule> findByMasterIdAndDayOfWeek(Long masterId, DayOfWeek dayOfWeek);
}
