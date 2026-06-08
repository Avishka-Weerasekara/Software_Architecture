package com.traffic.repository;

import com.traffic.entity.CitizenUser;
import com.traffic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    @Query("SELECT c FROM CitizenUser c WHERE c.nic = :nic")
    Optional<CitizenUser> findCitizenByNic(@Param("nic") String nic);
}
