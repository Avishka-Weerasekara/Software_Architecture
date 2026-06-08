package com.traffic.repository;

import com.traffic.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FineRepository extends JpaRepository<Fine, UUID> {
    List<Fine> findByCitizenIdOrderByCreatedAtDesc(UUID citizenId);
    List<Fine> findByPoliceOfficerIdOrderByCreatedAtDesc(UUID policeId);
}
