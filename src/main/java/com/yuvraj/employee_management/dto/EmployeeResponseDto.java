package com.yuvraj.employee_management.dto;

import java.math.BigDecimal;

public class EmployeeResponseDto {

    private final Long id;
    private final String name;
    private final String department;
    private final BigDecimal salary;

    public EmployeeResponseDto(Long id, String name, String department, BigDecimal salary) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.salary = salary;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDepartment() {
        return department;
    }

    public BigDecimal getSalary() {
        return salary;
    }
}