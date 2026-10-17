package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.DailyCapacity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DailyCapacityRepository extends JpaRepository<DailyCapacity, UUID> {
}
