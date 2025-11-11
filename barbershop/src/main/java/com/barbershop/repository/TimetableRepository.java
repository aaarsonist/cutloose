package com.barbershop.repository;

import com.barbershop.model.BookingStatus;
import com.barbershop.model.Timetable;
import com.barbershop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph; // Для жадной загрузки связанных сущностей
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.time.LocalDate;
import java.util.Optional;
@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    @Query("SELECT DATE(t.appointmentTime), s.name, COUNT(t) FROM Timetable t JOIN t.service s " +
            "WHERE t.status = com.barbershop.model.BookingStatus.COMPLETED " +
            "AND (:startDate IS NULL OR t.appointmentTime >= :startDate) AND (:endDate IS NULL OR t.appointmentTime <= :endDate) AND (:serviceIds IS NULL OR s.id IN :serviceIds) " +
            "AND (:masterIds IS NULL OR m.id IN :masterIds)" +
            "GROUP BY DATE(t.appointmentTime), s.name ORDER BY DATE(t.appointmentTime) ASC, s.name ASC")
    List<Object[]> countVisitsByDayAndService(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("serviceIds") List<Long> serviceIds,
            @Param("masterIds") List<Long> masterIds
    );

    @Query("SELECT t.master.id, m.name, COUNT(t) FROM Timetable t JOIN t.master m " +
            "WHERE t.status = com.barbershop.model.BookingStatus.COMPLETED " +
            "AND (:startDate IS NULL OR t.appointmentTime >= :startDate) AND (:endDate IS NULL OR t.appointmentTime <= :endDate) AND (:masterIds IS NULL OR m.id IN :masterIds) " +
            "AND (:serviceIds IS NULL OR t.service.id IN :serviceIds)" +
            "GROUP BY t.master.id, m.name")
    List<Object[]> countAppointmentsByMaster(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("masterIds") List<Long> masterIds,
            @Param("serviceIds") List<Long> serviceIds
    );

    @Query("SELECT t.master.id, m.name, SUM(t.service.price) FROM Timetable t JOIN t.master m JOIN t.service s " +
            "WHERE t.status = com.barbershop.model.BookingStatus.COMPLETED " +
            "AND (:startDate IS NULL OR t.appointmentTime >= :startDate) AND (:endDate IS NULL OR t.appointmentTime <= :endDate) AND (:masterIds IS NULL OR m.id IN :masterIds) " +
            "AND (:serviceIds IS NULL OR s.id IN :serviceIds)" +
            "GROUP BY t.master.id, m.name")
    List<Object[]> sumServicePricesByMaster(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("masterIds") List<Long> masterIds,
            @Param("serviceIds") List<Long> serviceIds
    );

    @Query("SELECT CAST(t.appointmentTime as date), SUM(t.service.price) FROM Timetable t JOIN t.service s JOIN t.master m " +
            "WHERE t.status = com.barbershop.model.BookingStatus.COMPLETED " +
            "AND (:startDate IS NULL OR t.appointmentTime >= :startDate) AND (:endDate IS NULL OR t.appointmentTime <= :endDate) AND (:serviceIds IS NULL OR s.id IN :serviceIds) AND (:masterIds IS NULL OR m.id IN :masterIds) " +
            "GROUP BY CAST(t.appointmentTime as date) ORDER BY CAST(t.appointmentTime as date) ASC")
    List<Object[]> sumServicePricesByDay(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("serviceIds") List<Long> serviceIds,
            @Param("masterIds") List<Long> masterIds
    );
    List<Timetable> findByBookedByAndAppointmentTimeBefore(User user, LocalDateTime currentTime);

    List<Timetable> findByBookedByAndStatus(User user, BookingStatus status);

    @Query("SELECT t FROM Timetable t LEFT JOIN t.reviews r " +
            "WHERE t.bookedBy = :user " +
            "AND t.status = com.barbershop.model.BookingStatus.COMPLETED")
    List<Timetable> findCompletedAppointmentsForUserWithoutReview(@Param("user") User user);

    @EntityGraph(attributePaths = {"service"})
    List<Timetable> findByStatusAndAppointmentTimeBefore(BookingStatus status, LocalDateTime time);

    @EntityGraph(attributePaths = {"service", "master", "bookedBy"})
    List<Timetable> findByStatusAndAppointmentTimeAfter(BookingStatus status, LocalDateTime time);

    @Query("SELECT t FROM Timetable t " +
            "WHERE t.master.id = :masterId " +
            "AND FUNCTION('DATE', t.appointmentTime) = :date")
    List<Timetable> findAllByMasterIdAndDate(@Param("masterId") Long masterId, @Param("date") LocalDate date);

    @Query("SELECT MIN(t.appointmentTime) FROM Timetable t WHERE t.status = 'COMPLETED'")
    Optional<LocalDateTime> findMinAppointmentTime();

    @Query("SELECT MAX(t.appointmentTime) FROM Timetable t WHERE t.status = 'COMPLETED'")
    Optional<LocalDateTime> findMaxAppointmentTime();
    List<Timetable> findByBookedByIdAndStatus(Long userId, BookingStatus status);

    List<Timetable> findByBookedByIdAndStatusAndAppointmentTimeAfter(Long userId, BookingStatus status, LocalDateTime time);
}