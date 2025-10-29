package com.barbershop.repository;

import com.barbershop.model.ServiceEntity;
import com.barbershop.model.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByType(ServiceType type);
}
