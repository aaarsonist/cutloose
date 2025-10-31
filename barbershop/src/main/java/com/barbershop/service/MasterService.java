package com.barbershop.service;

import com.barbershop.model.Master;
import java.util.List;

public interface MasterService {
    List<Master> getAllMasters();
    List<Master> getMastersByService(Long serviceId);
    void deactivateMaster(Long id);
    Master addMaster(Master master);
}