package com.yuvraj.employee_management.mapper;

import com.yuvraj.employee_management.dto.EmployeeRequestDto;
import com.yuvraj.employee_management.dto.EmployeeResponseDto;
import com.yuvraj.employee_management.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public Employee toEntity(EmployeeRequestDto request) {
        return new Employee(request.getName(), request.getDepartment(), request.getSalary());
    }

    public EmployeeResponseDto toResponse(Employee employee) {
        return new EmployeeResponseDto(
                employee.getId(),
                employee.getName(),
                employee.getDepartment(),
                employee.getSalary()
        );
    }
}