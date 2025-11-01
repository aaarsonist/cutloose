package com.barbershop.impl;

import com.barbershop.model.Master;
import com.barbershop.repository.MasterRepository;
import com.barbershop.service.MasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MasterServiceImpl implements MasterService {

    private final MasterRepository masterRepository;

    @Autowired
    public MasterServiceImpl(MasterRepository masterRepository) {
        this.masterRepository = masterRepository;
    }

    @Override
    public List<Master> getAllMasters() {
        return masterRepository.findAllByActiveTrue();
    }

    @Override
    @Transactional
    public void deactivateMaster(Long id) {
        Optional<Master> masterOptional = masterRepository.findById(id);

        if (masterOptional.isPresent()) {
            Master master = masterOptional.get();
            master.setActive(false);
            masterRepository.save(master);
        } else {
            throw new RuntimeException("Master not found with id: " + id);
        }
    }
    @Override
    @Transactional
    public Master addMaster(Master master) {
        master.setActive(true);
        return masterRepository.save(master);
    }
}