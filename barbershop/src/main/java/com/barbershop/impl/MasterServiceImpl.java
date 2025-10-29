package com.barbershop.impl;

import com.barbershop.model.Master;
import com.barbershop.repository.MasterRepository;
import com.barbershop.service.MasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MasterServiceImpl implements MasterService {

    private final MasterRepository masterRepository;

    @Autowired
    public MasterServiceImpl(MasterRepository masterRepository) {
        this.masterRepository = masterRepository;
    }

    @Override
    public List<Master> getAllMasters() {
        return masterRepository.findAll();
    }
}