package com.barbershop.impl;

import com.barbershop.model.BookingStatus;
import com.barbershop.model.ServiceEntity;
import com.barbershop.model.Timetable;
import com.barbershop.model.WorkSchedule;
import com.barbershop.repository.ServiceRepository;
import com.barbershop.repository.TimetableRepository;
import com.barbershop.repository.WorkScheduleRepository;
import com.barbershop.service.AvailabilityService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AvailabilityServiceImpl implements AvailabilityService {

    private final WorkScheduleRepository workScheduleRepository;
    private final TimetableRepository timetableRepository;
    private final ServiceRepository serviceRepository;

    // Интервал слотов (например, 30 минут)
    private static final int SLOT_INTERVAL_MINUTES = 30;

    public AvailabilityServiceImpl(WorkScheduleRepository workScheduleRepository,
                                   TimetableRepository timetableRepository,
                                   ServiceRepository serviceRepository) {
        this.workScheduleRepository = workScheduleRepository;
        this.timetableRepository = timetableRepository;
        this.serviceRepository = serviceRepository;
    }

    @Override
    public List<LocalTime> getAvailableSlots(Long masterId, Long serviceId, LocalDate date) {

        // 1. Получить график мастера
        Optional<WorkSchedule> scheduleOpt = workScheduleRepository.findByMasterIdAndDayOfWeek(masterId, date.getDayOfWeek());
        if (scheduleOpt.isEmpty() || scheduleOpt.get().getStartTime() == null) {
            return new ArrayList<>(); // Мастер не работает или графика нет
        }
        WorkSchedule schedule = scheduleOpt.get();
        LocalTime workStart = schedule.getStartTime();
        LocalTime workEnd = schedule.getEndTime();

        // 2. Получить длительность услуги
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        int duration = service.getDuration();

        // 3. Получить все СУЩЕСТВУЮЩИЕ записи
        List<Timetable> existingBookings = timetableRepository.findAllByMasterIdAndDate(masterId, date);

        List<LocalTime> availableSlots = new ArrayList<>();
        LocalTime currentSlot = workStart;

        // 4. Идем по графику с шагом в 15 минут
        while (currentSlot.plusMinutes(duration).isBefore(workEnd) || currentSlot.plusMinutes(duration).equals(workEnd)) {

            boolean isOverlap = false;
            LocalTime slotStart = currentSlot;
            LocalTime slotEnd = currentSlot.plusMinutes(duration);

            // 5. Проверяем, не пересекается ли СЛОТ с СУЩЕСТВУЮЩИМИ записями
            for (Timetable booking : existingBookings) {
                // Игнорируем отмененные/удаленные (если бы они были)
                if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.BOOKED) {

                    LocalTime bookingStart = booking.getAppointmentTime().toLocalTime();
                    // Длительность существующей записи
                    int existingDuration = booking.getService().getDuration();
                    LocalTime bookingEnd = bookingStart.plusMinutes(existingDuration);

                    // Логика проверки пересечения
                    // (SlotStart < BookingEnd) и (SlotEnd > BookingStart)
                    if (slotStart.isBefore(bookingEnd) && slotEnd.isAfter(bookingStart)) {
                        isOverlap = true;
                        break;
                    }
                }
            }

            // 6. Если пересечений нет - слот доступен
            if (!isOverlap) {
                availableSlots.add(slotStart);
            }

            // Переходим к следующему слоту (с шагом 15 мин)
            currentSlot = currentSlot.plusMinutes(SLOT_INTERVAL_MINUTES);
        }

        return availableSlots;
    }
}
