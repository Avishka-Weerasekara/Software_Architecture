package com.traffic.repository;

import com.traffic.entity.Fine;
import com.traffic.controller.AdminMonitoringController;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FineRepository extends JpaRepository<Fine, UUID> {

    List<Fine> findByCitizenIdOrderByCreatedAtDesc(UUID citizenId);

    List<Fine> findByPoliceOfficerIdOrderByCreatedAtDesc(UUID policeId);

    long countByStatus(String status);

    @Query("SELECT SUM(f.totalAmount) FROM Fine f WHERE f.status = 'PAID'")
    Double getTotalRevenue();

    @Query("""
        SELECT u.district AS district, SUM(f.totalAmount) AS total
        FROM Fine f
        JOIN f.citizen u
        WHERE f.status = 'PAID'
        GROUP BY u.district
        ORDER BY total DESC
    """)
    List<AdminMonitoringController.DistrictTotal> sumPaidAmountByDistrict();

    @Query("""
        SELECT r.reason AS category, SUM(r.amount) AS total
        FROM Fine f
        JOIN f.reasons r
        WHERE f.status = 'PAID'
        GROUP BY r.reason
        ORDER BY total DESC
    """)
    List<AdminMonitoringController.CategoryTotal> sumPaidAmountByCategory();
}