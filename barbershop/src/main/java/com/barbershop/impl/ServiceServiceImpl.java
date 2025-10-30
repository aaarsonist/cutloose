package com.barbershop.impl;

import com.barbershop.model.ServiceEntity;
import com.barbershop.model.ServiceType;
import com.barbershop.repository.ServiceRepository;
import com.barbershop.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceServiceImpl implements ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Override
    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    @Override
    public List<ServiceEntity> getServicesByType(ServiceType type) {
        return serviceRepository.findByType(type);
    }

    @Override
    public ServiceEntity saveService(ServiceEntity service) {
        return serviceRepository.save(service);
    }

    @Override
    public ServiceEntity updateService(Long id, ServiceEntity service) {
        ServiceEntity existingService = serviceRepository.findById(id).orElseThrow(() -> new RuntimeException("Услуга не найдена"));
        existingService.setName(service.getName());
        existingService.setPrice(service.getPrice());
        existingService.setDuration(service.getDuration());
        existingService.setType(service.getType());
        return serviceRepository.save(existingService);
    }

    @Override
    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
}
