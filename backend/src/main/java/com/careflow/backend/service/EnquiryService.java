package com.careflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.careflow.backend.entity.Enquiry;
import com.careflow.backend.repository.EnquiryRepository;

@Service
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;

    public EnquiryService(EnquiryRepository enquiryRepository) {
        this.enquiryRepository = enquiryRepository;
    }

    public Enquiry createEnquiry(Enquiry enquiry) {
        return enquiryRepository.save(enquiry);
    }

    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAll();
    }

    public Enquiry getEnquiryById(Long id) {
        return enquiryRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Enquiry not found with ID: " + id));
    }
}
