package com.barbershop.repository;

import com.barbershop.model.Master;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MasterRepository extends JpaRepository<Master, Long> {
    List<Master> findAllByActiveTrue();

    // 2. Изменяем ваш существующий метод, добавляя m.active = true
    @Query("SELECT m FROM Master m WHERE m.active = true")
    List<Master> findActiveByServiceId(@Param("serviceId") Long serviceId);
}