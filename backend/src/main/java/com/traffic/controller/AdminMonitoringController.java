// Place in: src/main/java/.../controller/AdminMonitoringController.java
//
// Provides the data the new "Monitoring" tab in AdminDashboard.jsx expects:
// GET /api/admin/monitoring
// {
//   "districtCollections": [ { "district": "Colombo", "total": 450000 }, ... ],
//   "categoryBreakdown":  [ { "category": "Speeding", "total": 230000 }, ... ]
// }
//
// Adjust entity/repository names (Fine, Payment, etc.) to match your actual schema.

package com.traffic.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.traffic.repository.FineRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminMonitoringController {

    private final FineRepository fineRepository;

    public AdminMonitoringController(FineRepository fineRepository) {
        this.fineRepository = fineRepository;
    }

    @GetMapping("/monitoring")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getMonitoringData() {

        // Group all PAID fines by district, summing the total amount
        List<DistrictTotal> districtCollections = fineRepository.sumPaidAmountByDistrict();

        // Group all PAID fines by offense/category, summing the total amount
        List<CategoryTotal> categoryBreakdown = fineRepository.sumPaidAmountByCategory();

        return Map.of(
            "districtCollections", districtCollections,
            "categoryBreakdown", categoryBreakdown
        );
    }

    // --- Projection interfaces used by the repository queries below ---

    public interface DistrictTotal {
        String getDistrict();
        Double getTotal();
    }

    public interface CategoryTotal {
        String getCategory();
        Double getTotal();
    }
}

/*
Add these to FineRepository (extends JpaRepository<Fine, Long>):

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
*/
