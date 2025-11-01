package com.barbershop.impl;

import com.barbershop.model.Master;
import com.barbershop.model.WorkSchedule;
import com.barbershop.repository.MasterRepository;
import com.barbershop.repository.WorkScheduleRepository;
import com.barbershop.service.WorkScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Service
public class WorkScheduleServiceImpl implements WorkScheduleService {

    @Autowired
    private WorkScheduleRepository workScheduleRepository;

    @Autowired
    private MasterRepository masterRepository; // Нужен для привязки

    @Override
    @Transactional(readOnly = true)
    public List<WorkSchedule> getAllSchedules() {
        return workScheduleRepository.findAllByOrderByMasterIdAsc();
    }

    @Override
    @Transactional
    public WorkSchedule updateSchedule(WorkSchedule scheduleData) {

        Long masterId = scheduleData.getMaster().getId();
        DayOfWeek day = scheduleData.getDayOfWeek();

        // 1. Пытаемся найти существующую запись
        Optional<WorkSchedule> existingScheduleOpt = workScheduleRepository
                .findByMasterIdAndDayOfWeek(masterId, day);

        WorkSchedule scheduleToSave;

        if (existingScheduleOpt.isPresent()) {
            // 2. Если запись есть - обновляем ее
            scheduleToSave = existingScheduleOpt.get();
            scheduleToSave.setStartTime(scheduleData.getStartTime());
            scheduleToSave.setEndTime(scheduleData.getEndTime());

            // Если время null (т.е. стал "Выходной"), удаляем запись
            if (scheduleData.getStartTime() == null) {
                workScheduleRepository.delete(scheduleToSave);
                return null; // Возвращаем null, чтобы фронтенд понял, что это удаление
            }

        } else {
            // 3. Если записи нет и это не "Выходной" - создаем новую
            if (scheduleData.getStartTime() == null) {
                return null; // Не нужно создавать запись для "Выходного", если ее и не было
            }

            scheduleToSave = new WorkSchedule();
            // Находим мастера, чтобы привязать
            Master master = masterRepository.findById(masterId)
                    .orElseThrow(() -> new RuntimeException("Master not found"));

            scheduleToSave.setMaster(master);
            scheduleToSave.setDayOfWeek(day);
            scheduleToSave.setStartTime(scheduleData.getStartTime());
            scheduleToSave.setEndTime(scheduleData.getEndTime());
        }

        return workScheduleRepository.save(scheduleToSave);
    }
}