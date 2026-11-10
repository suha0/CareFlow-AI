
package com.careflow.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.careflow.backend.entity.Enquiry;

public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {

}
