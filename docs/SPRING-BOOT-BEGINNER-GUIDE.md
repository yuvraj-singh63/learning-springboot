# Employee Management: Beginner's Spring Boot Guide

This document teaches the whole `employee-management` project from the ground up.
It is written for a beginner, but the project structure follows patterns used in
professional backend applications.

The application has two parts:

```text
React + TypeScript frontend
            |
            | HTTP/JSON through Vite proxy
            v
Spring Boot REST backend
            |
            | JPA/Hibernate
            v
H2 database
```

The backend stores employees. The frontend displays employees, calculates
dashboard statistics, and lets the user create, edit, and delete employees.

---

## 1. What You Need to Know First

### Java

Java is a strongly typed, object-oriented programming language. Strongly typed
means every variable has a known type.

```java
String name = "Yuvraj";
BigDecimal salary = new BigDecimal("50000.00");
```

`String` stores text. `BigDecimal` stores precise decimal numbers, which is
safer than `double` for money.

### Class and object

A class is a blueprint. An object is a real instance created from that blueprint.

```java
public class Employee {
    private String name;
}

Employee employee = new Employee();
```

The `Employee` class describes what an employee has. The `employee` object is
one actual employee in memory.

### Method

A method is a named action inside a class.

```java
public String getName() {
    return name;
}
```

This method returns the employee name.

### Constructor

A constructor runs when an object is created.

```java
public Employee(String name, String department, BigDecimal salary) {
    this.name = name;
    this.department = department;
    this.salary = salary;
}
```

`this.name` means the field belonging to the current object. `name` means the
constructor parameter.

### Interface

An interface describes a contract. It says what operations are available, while
another class supplies the implementation.

```java
public interface EmployeeRepository {
    Employee save(Employee employee);
}
```

In this project, Spring Data creates the implementation of
`EmployeeRepository` automatically.

### Package

A package groups related Java classes and prevents naming conflicts.

```java
package com.yuvraj.employee_management.service;
```

The package name usually starts with a reversed domain name and then the
application name.

---

## 2. Project Structure

```text
employee-management/
├── pom.xml
├── mvnw
├── mvnw.cmd
├── data/
├── frontend/
│   ├── package.json
│   ├── src/App.tsx
│   ├── src/api.ts
│   ├── src/styles.css
│   └── vite.config.ts
├── src/main/java/com/yuvraj/employee_management/
│   ├── EmployeeManagementApplication.java
│   ├── controller/EmployeeController.java
│   ├── service/EmployeeService.java
│   ├── repository/EmployeeRepository.java
│   ├── entity/Employee.java
│   ├── dto/
│   ├── exception/
│   └── mapper/EmployeeMapper.java
├── src/main/resources/
│   └── application.properties
├── src/test/java/
└── target/
```

### `pom.xml`

`pom.xml` is Maven's project configuration file. Maven is a Java build tool. It
downloads libraries, compiles source code, runs tests, and creates build output.

Important sections:

- `groupId`: identifies the organization or package owner.
- `artifactId`: identifies the project.
- `version`: current project version.
- `parent`: supplies Spring Boot defaults and dependency versions.
- `properties`: sets Java 21.
- `dependencies`: lists libraries required by the project.
- `build`: configures Maven plugins.

The main dependencies are:

| Dependency | Purpose |
|---|---|
| `spring-boot-starter-webmvc` | REST controllers and HTTP server |
| `spring-boot-starter-data-jpa` | JPA repositories and Hibernate |
| `spring-boot-starter-validation` | Request validation |
| `h2` | Local development database |
| `mysql-connector-j` | Future MySQL connection |
| test starters | Testing Spring MVC, JPA, and validation |

The word `starter` means a convenient bundle of related Spring libraries.

### `src/main/java`

This is the main Java source directory. Maven compiles Java files here into
`target/classes`.

### `src/main/resources`

This contains non-Java application resources. `application.properties` is read
by Spring Boot at startup.

### `src/test/java`

This contains automated tests. Tests verify that code behaves correctly and
protect the application from future regressions.

### `mvnw` and `mvnw.cmd`

These are Maven Wrapper scripts. They allow the project to use Maven without
requiring a separate global Maven installation.

On Windows:

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

### `target`

Maven generates `target` during compilation. It contains compiled classes,
test reports, and build metadata. You normally do not edit it or commit it.

### `frontend`

This is a separate Node.js application. React renders the user interface.
TypeScript adds type safety. Vite provides the development server and build tool.

---

## 3. What Spring Framework and Spring Boot Are

### Spring Framework

Spring is a Java framework that helps build applications from cooperating
objects. Its most important feature is dependency injection.

Without Spring, you create dependencies manually:

```java
EmployeeRepository repository = new EmployeeRepositoryImpl();
EmployeeMapper mapper = new EmployeeMapper();
EmployeeService service = new EmployeeService(repository, mapper);
```

With Spring, you declare classes as components and Spring creates and connects
them for you.

### Spring Boot

Spring Boot is built on Spring. It adds sensible defaults, automatic
configuration, embedded Tomcat, and easy application startup.

The application starts here:

```java
SpringApplication.run(EmployeeManagementApplication.class, args);
```

### Auto-configuration

Auto-configuration examines the classpath and configuration files. Because this
project has JPA and H2, Spring Boot automatically configures a datasource,
Hikari connection pool, EntityManagerFactory, Hibernate, and transaction support.

This is why you do not manually write a `DataSource` class for this project.

### Inversion of Control and the IoC container

Inversion of Control, or IoC, means the framework controls object creation and
lifecycle instead of your application creating every object itself.

The IoC container is Spring's object registry. It stores objects called beans.
When `EmployeeController` needs `EmployeeService`, the container finds the
service bean and passes it to the controller constructor.

### Bean

A bean is an object managed by Spring. These classes become beans through
annotations:

```java
@Service
public class EmployeeService { }

@Component
public class EmployeeMapper { }
```

Repositories are also registered automatically by Spring Data.

### Component scanning

`@SpringBootApplication` scans the package containing the main class and its
subpackages. Therefore the main class should remain at the root package:

```text
com.yuvraj.employee_management
```

It can discover `controller`, `service`, `repository`, `mapper`, and other
subpackages below it.

---

## 4. Layered Architecture

This project uses the following flow:

```text
Client
  ↓ HTTP request
Controller
  ↓ Java method call
Service
  ↓ repository method call
Repository
  ↓ SQL generated by Hibernate
Database
```

### Client

The client is the React frontend, Postman, a browser, or another application.
It sends HTTP requests such as `POST /employees`.

### Controller

The controller handles HTTP details:

- URL paths
- HTTP methods
- JSON request bodies
- HTTP status codes
- JSON responses

It should not contain complicated business rules.

### Service

The service contains application and business logic. It decides how a use case
works, coordinates repositories and mappers, and defines transaction boundaries.

### Repository

The repository talks to the database. It should not decide how an HTTP request
works.

### Entity

An entity represents data persisted in the database. It is not automatically the
best object to expose in a public API.

### DTO

DTO means Data Transfer Object. DTOs define the data crossing the API boundary.
This protects the database model and allows request validation.

This separation makes each class easier to test and change. For example, the
database can change from H2 to MySQL without rewriting the controller.

---

## 5. Application Startup Internals

The main class is:

```java
package com.yuvraj.employee_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EmployeeManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmployeeManagementApplication.class, args);
    }
}
```

Line by line:

1. `package` places the class in the root application package.
2. The imports make Spring Boot classes available.
3. `@SpringBootApplication` combines configuration, auto-configuration, and component scanning.
4. `public class` defines the application class.
5. `main` is Java's entry point.
6. `SpringApplication.run` creates the Spring container, starts the web server, and loads the application.

Startup sequence:

1. Java starts `main`.
2. Spring creates the application context.
3. Component scanning finds application classes.
4. Auto-configuration creates web, JPA, and database infrastructure.
5. Hikari opens database connections.
6. Hibernate reads `Employee` and creates or updates the `employees` table.
7. Tomcat starts on port `8080`.
8. The application accepts requests.

---

## 6. Database Configuration

The current configuration is in `application.properties`:

```properties
spring.application.name=employee-management
spring.datasource.url=jdbc:h2:file:./data/employee-db
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

Explanation:

- `spring.application.name` gives the application a name.
- `spring.datasource.url` tells Java how to connect to H2.
- `jdbc:h2:file:./data/employee-db` stores data in the project `data` directory.
- `username=sa` uses H2's default local username.
- Empty password means no password for this local database.
- `driver-class-name` identifies the H2 JDBC driver.
- `ddl-auto=update` lets Hibernate create or update tables from entities.
- `show-sql=true` prints generated SQL in development logs.
- `format_sql=true` makes generated SQL easier to read.
- `open-in-view=false` keeps database work inside service transactions.
- `h2.console.enabled=true` enables the browser database console.
- `h2.console.path` makes the console available at `/h2-console`.

H2 Console settings:

```text
URL: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:file:./data/employee-db
User Name: sa
Password: leave empty
```

For production, avoid relying on `ddl-auto=update`. Use controlled database
migrations such as Flyway or Liquibase.

---

## 7. Entity: Mapping Java to a Table

The entity is `Employee`:

```java
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salary;
}
```

Annotations:

- `@Entity`: tells JPA that this class is persistent.
- `@Table`: maps the class to the `employees` table.
- `@Id`: marks the primary key.
- `@GeneratedValue`: lets the database generate the ID.
- `GenerationType.IDENTITY`: uses an identity/auto-increment style column.
- `@Column(nullable = false)`: creates a required database column.
- `precision = 12`: allows up to 12 total digits.
- `scale = 2`: stores two digits after the decimal point.

The Java-to-database mapping is approximately:

| Java | Database |
|---|---|
| `Long id` | numeric primary key |
| `String name` | text column |
| `String department` | text column |
| `BigDecimal salary` | decimal column |

The protected empty constructor exists because JPA needs to create entities by
reflection. Application code should use the meaningful constructor instead.

The `updateDetails` method protects the way an employee is changed:

```java
public void updateDetails(String name, String department, BigDecimal salary) {
    this.name = name;
    this.department = department;
    this.salary = salary;
}
```

---

## 8. DTOs: Safe API Objects

### Request DTO

`EmployeeRequestDto` represents data accepted from the client:

```java
public class EmployeeRequestDto {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Salary is required")
    @DecimalMin(value = "0.0", message = "Salary cannot be negative")
    private BigDecimal salary;
}
```

This DTO has setters because Jackson, Spring's JSON library, fills it from the
incoming JSON request.

### Response DTO

`EmployeeResponseDto` represents data returned to the client:

```java
public class EmployeeResponseDto {
    private final Long id;
    private final String name;
    private final String department;
    private final BigDecimal salary;
}
```

Its fields are final and it has no setters, so callers cannot change a response
object after it is constructed.

Why not expose `Employee` directly?

1. Entities represent database design, not necessarily API design.
2. Entity relationships could accidentally expose too much data.
3. Request validation belongs on request objects.
4. DTOs allow API fields to change independently of database fields.
5. DTOs prevent clients from trying to set server-controlled fields such as `id`.

---

## 9. Mapper

The mapper translates between API objects and database objects:

```java
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
```

`@Component` registers the mapper as a Spring bean. The service receives that
bean through constructor injection.

For larger applications, teams may use MapStruct to generate mapper code, but a
small explicit mapper is easy to understand and debug.

---

## 10. Repository and Spring Data JPA

The repository is very small:

```java
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}
```

`JpaRepository<Employee, Long>` means:

- The repository manages `Employee` entities.
- The ID type is `Long`.
- Spring Data supplies the implementation at runtime.

Common inherited methods:

```java
employeeRepository.save(employee);
employeeRepository.findAll();
employeeRepository.findById(id);
employeeRepository.deleteById(id);
employeeRepository.count();
```

What they mean:

- `save`: inserts a new entity or updates an existing entity.
- `findAll`: returns all employees.
- `findById`: returns `Optional<Employee>` because the employee may not exist.
- `deleteById`: deletes the record with that ID.
- `count`: returns the number of records.

Spring Data can create query methods from method names:

```java
List<Employee> findByDepartment(String department);
List<Employee> findByNameContainingIgnoreCase(String name);
```

The method names are parsed and converted into queries. For complicated queries,
use `@Query` with a carefully reviewed JPQL or SQL query.

JPA is a Java standard for persistence. Hibernate is the implementation used by
this application. Hibernate translates Java repository operations into SQL.

---

## 11. Service Layer

The service is the application's use-case layer:

```java
@Service
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    public EmployeeService(EmployeeRepository employeeRepository,
                           EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
    }
}
```

Important concepts:

- `@Service` registers the class as a Spring bean.
- `@Transactional(readOnly = true)` makes service methods read-only by default.
- `private final` dependencies cannot be replaced after construction.
- The constructor expresses everything the service needs.
- This is constructor injection, which is preferred over field injection.

### Create

```java
@Transactional
public EmployeeResponseDto createEmployee(EmployeeRequestDto request) {
    Employee employee = employeeMapper.toEntity(request);
    Employee savedEmployee = employeeRepository.save(employee);
    return employeeMapper.toResponse(savedEmployee);
}
```

The method converts the request, saves the entity, receives the generated ID,
and converts the saved entity into a response DTO.

### Read all

```java
public List<EmployeeResponseDto> getAllEmployees() {
    return employeeRepository.findAll().stream()
            .map(employeeMapper::toResponse)
            .toList();
}
```

`stream()` processes the list. `map` transforms each entity. `toList` creates
the response list.

### Read one

```java
public EmployeeResponseDto getEmployeeById(Long id) {
    Employee employee = findEmployeeById(id);
    return employeeMapper.toResponse(employee);
}
```

### Update

```java
@Transactional
public EmployeeResponseDto updateEmployee(Long id, EmployeeRequestDto request) {
    Employee employee = findEmployeeById(id);
    employee.updateDetails(request.getName(), request.getDepartment(), request.getSalary());
    return employeeMapper.toResponse(employee);
}
```

Hibernate tracks the loaded entity. When the transaction commits, it detects the
changed fields and sends an SQL `UPDATE`. This is called dirty checking.

### Delete

```java
@Transactional
public void deleteEmployee(Long id) {
    Employee employee = findEmployeeById(id);
    employeeRepository.delete(employee);
}
```

The shared helper keeps missing-employee behavior consistent:

```java
private Employee findEmployeeById(Long id) {
    return employeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Employee not found with id: " + id));
}
```

### Transaction

A transaction is a unit of database work. It should either complete or roll
back. Creating, updating, and deleting are marked `@Transactional` because they
change data. Reads use the class-level read-only transaction.

---

## 12. REST Controller

The controller is the HTTP boundary:

```java
@RestController
@RequestMapping("/employees")
public class EmployeeController {
    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }
}
```

Annotations:

- `@RestController`: marks the class as a web controller whose return values become JSON.
- `@RequestMapping("/employees")`: adds the base URL to every method.
- `@GetMapping`: handles HTTP GET.
- `@PostMapping`: handles HTTP POST.
- `@PutMapping`: handles HTTP PUT.
- `@DeleteMapping`: handles HTTP DELETE.
- `@RequestBody`: converts JSON into a Java object.
- `@PathVariable`: reads a value from a URL such as `/employees/1`.
- `@Valid`: triggers validation annotations on the DTO.
- `ResponseEntity`: allows explicit status codes and headers.

### API endpoints

| HTTP | URL | Purpose | Success |
|---|---|---|---|
| POST | `/employees` | Create employee | `201 Created` |
| GET | `/employees` | Get all employees | `200 OK` |
| GET | `/employees/{id}` | Get one employee | `200 OK` |
| PUT | `/employees/{id}` | Update employee | `200 OK` |
| DELETE | `/employees/{id}` | Delete employee | `204 No Content` |

Create endpoint:

```java
@PostMapping
public ResponseEntity<EmployeeResponseDto> createEmployee(
        @Valid @RequestBody EmployeeRequestDto request) {
    EmployeeResponseDto response = employeeService.createEmployee(request);
    URI location = URI.create("/employees/" + response.getId());
    return ResponseEntity.created(location).body(response);
}
```

`201 Created` communicates that a new resource was created. The `Location`
header points to the new resource.

---

## 13. Validation and Error Handling

Validation prevents invalid data from reaching the service and database.

Example:

```java
@NotBlank(message = "Name is required")
private String name;

@NotNull(message = "Salary is required")
@DecimalMin(value = "0.0", message = "Salary cannot be negative")
private BigDecimal salary;
```

The lifecycle is:

1. Client sends JSON.
2. Jackson creates `EmployeeRequestDto`.
3. `@Valid` asks Bean Validation to inspect it.
4. Invalid input raises `MethodArgumentNotValidException`.
5. The controller method is not called.
6. `GlobalExceptionHandler` returns a JSON error response.

Custom exception:

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

`RuntimeException` allows the exception to travel through the application until
the global handler processes it.

Global handler:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(...) {
        return buildResponse(HttpStatus.NOT_FOUND, ...);
    }
}
```

- `@RestControllerAdvice` applies to all REST controllers.
- `@ExceptionHandler` connects an exception type to a handler method.
- Missing employees become HTTP `404` instead of an unhelpful server error.
- Validation failures become HTTP `400`.

Example missing-resource response:

```json
{
  "timestamp": "2026-09-10T10:00:00Z",
  "status": 404,
  "message": "Employee not found with id: 99",
  "path": "/employees/99"
}
```

---

## 14. Complete Request Lifecycle

Suppose the client sends:

```http
POST http://localhost:8080/employees
Content-Type: application/json
```

```json
{
  "name": "Yuvraj",
  "department": "IT",
  "salary": 50000
}
```

The complete flow is:

1. React or Postman sends HTTP POST.
2. Tomcat receives the request.
3. Spring MVC matches `/employees` and `@PostMapping`.
4. Jackson converts JSON into `EmployeeRequestDto`.
5. `@Valid` checks name, department, and salary.
6. The controller calls `employeeService.createEmployee`.
7. The mapper converts the request DTO into `Employee`.
8. The repository calls Hibernate.
9. Hibernate generates an SQL `INSERT`.
10. H2 stores the row and generates the ID.
11. The service maps the saved entity to `EmployeeResponseDto`.
12. Spring converts the response DTO to JSON.
13. The controller returns HTTP `201`.
14. React refreshes its employee list and dashboard calculations.

This separation is the reason each layer has a focused responsibility.

---

## 15. Testing the Backend

### Browser

Browsers can directly test GET requests:

```text
http://localhost:8080/employees
http://localhost:8080/employees/1
```

### PowerShell

```powershell
$body = @{
    name = "Aisha Mehta"
    department = "Engineering"
    salary = 75000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/employees" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

Get all:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/employees"
```

Update:

```powershell
$body = @{
    name = "Aisha Mehta"
    department = "Design"
    salary = 80000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/employees/1" `
    -Method Put `
    -ContentType "application/json" `
    -Body $body
```

Delete:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/employees/1" -Method Delete
```

### Maven tests

```powershell
.\mvnw.cmd test
```

The current context test starts the Spring application and proves that the
application can load its configuration and beans.

For a mature application, add:

- service unit tests with Mockito
- repository tests with `@DataJpaTest`
- controller tests with `@WebMvcTest`
- full integration tests with `@SpringBootTest`

---

## 16. React Frontend Integration

The frontend lives under `frontend` and uses React, TypeScript, Vite, and
`lucide-react` icons.

### `frontend/src/api.ts`

The API module centralizes HTTP communication:

```typescript
export const employeeApi = {
  list: () => request<Employee[]>('/employees'),
  create: (payload: EmployeePayload) => request<Employee>('/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
}
```

The TypeScript type describes the backend response:

```typescript
export type Employee = {
  id: number
  name: string
  department: string
  salary: number
}
```

### Vite proxy

`vite.config.ts` contains:

```typescript
proxy: {
  '/employees': 'http://localhost:8080',
}
```

When the browser requests `/employees`, Vite forwards it to Spring Boot. This
allows local development without a separate CORS configuration.

### React state

`useState` stores values that affect the screen:

```typescript
const [employees, setEmployees] = useState<Employee[]>([])
```

`useEffect` performs work after rendering, such as loading employees:

```typescript
useEffect(() => { void loadEmployees() }, [])
```

`useMemo` calculates filtered data without recalculating unnecessarily during
unrelated renders.

The Insights route calculates department mix, salary bands, top earners, and
payroll allocation from the same employee API response.

Start both applications:

```powershell
# Terminal 1, project root
.\mvnw.cmd spring-boot:run

# Terminal 2, frontend directory
cd frontend
npm.cmd install
npm.cmd run dev
```

Then open:

```text
http://localhost:5173
```

If port 5173 is busy, Vite may use 5174.

---

## 17. Common Terminology

| Term | Simple meaning | Used here |
|---|---|---|
| API | A contract for software communication | `/employees` endpoints |
| REST | HTTP-based style for resources | Employee CRUD API |
| JSON | Text format for structured data | Request and response bodies |
| HTTP method | The requested operation | GET, POST, PUT, DELETE |
| CRUD | Create, Read, Update, Delete | Employee operations |
| Bean | Object managed by Spring | `EmployeeService` |
| IoC | Spring controls object creation | Constructor injection |
| Dependency injection | Spring supplies required objects | Controller receives service |
| JPA | Java persistence standard | `JpaRepository`, entity mapping |
| Hibernate | JPA implementation | Generates SQL |
| JDBC | Java database connection API | H2 driver connection |
| ORM | Maps objects to relational tables | `Employee` to `employees` |
| Entity | Persistent domain object | `Employee` |
| DTO | API data object | Request and response DTOs |
| Repository | Database access abstraction | `EmployeeRepository` |
| Service | Use-case and business layer | `EmployeeService` |
| Controller | HTTP boundary | `EmployeeController` |
| Transaction | Atomic database operation | Create/update/delete methods |
| Validation | Input correctness checking | `@NotBlank`, `@NotNull` |
| Exception handler | Converts errors to HTTP responses | `GlobalExceptionHandler` |
| Serialization | Object to JSON conversion | Response DTO to JSON |
| Deserialization | JSON to object conversion | Request JSON to DTO |
| Dependency | External library or required object | Spring starter, repository |
| Maven | Java build and dependency tool | `mvnw.cmd` |
| H2 | Lightweight Java database | Local development database |
| MySQL | Production-style relational database | Future runtime option |
| Vite | Frontend dev server/build tool | React development server |

---

## 18. Important Design Choices

### Why constructor injection?

Constructor injection makes dependencies explicit, supports immutable fields,
and makes unit testing easy:

```java
EmployeeService service = new EmployeeService(fakeRepository, mapper);
```

Field injection hides dependencies and makes plain Java testing harder.

### Why DTOs?

DTOs protect the persistence model and provide a stable API contract.

### Why `BigDecimal` for salary?

Money needs exact decimal arithmetic. Floating-point types can produce rounding
surprises.

### Why `ResponseEntity`?

It makes HTTP status codes and headers explicit. A REST API should communicate
whether a resource was created, found, rejected, or deleted.

### Why transactions in the service?

The service owns a complete business operation. This keeps transaction rules out
of HTTP code and database implementation details.

### Why `open-in-view=false`?

It prevents lazy database work from unexpectedly continuing after the service
has returned. Database work remains inside a deliberate service transaction.

---

## 19. H2 to MySQL Later

The application already includes the MySQL connector. A MySQL configuration can
be placed in a separate profile, for example `application-mysql.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/employee_management
spring.datasource.username=employee_user
spring.datasource.password=change-this-password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
```

Start with the profile:

```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
```

Never commit real production passwords. Use environment variables or a secret
manager.

---

## 20. Suggested Learning Order

Study and change the application in this order:

1. Learn Java variables, classes, methods, constructors, interfaces, and exceptions.
2. Read the main application class and understand startup.
3. Change one `application.properties` value and observe startup logs.
4. Read `Employee` and compare fields with the H2 table.
5. Read the repository and learn `JpaRepository`.
6. Read one service method from controller to repository.
7. Test each endpoint with PowerShell or Postman.
8. Add a validation rule and send invalid JSON.
9. Read the global exception handler and inspect the error JSON.
10. Add a repository query such as `findByDepartment`.
11. Add unit tests for the service.
12. Read `frontend/src/api.ts` and trace a request from React to Spring.
13. Add a new frontend filter based on a backend field.
14. Replace H2 with MySQL using a Spring profile.
15. Add Flyway migrations before treating the application as production-ready.

The best learning method is to predict what will happen, make one small change,
run the application, and compare the result with your prediction.

---

## 21. Interview Questions to Practice

### What is Spring Boot?

Spring Boot is a framework built on Spring that provides auto-configuration,
starter dependencies, embedded servers, and production-friendly defaults.

### What is dependency injection?

Dependency injection is supplying an object with the dependencies it needs
instead of making the object construct those dependencies itself.

### What is a bean?

A bean is an object created and managed by the Spring IoC container.

### What is the difference between `@Controller` and `@RestController`?

`@Controller` usually returns a view. `@RestController` returns data directly,
usually JSON, because it combines `@Controller` and `@ResponseBody` behavior.

### What is JPA versus Hibernate?

JPA is a standard API. Hibernate is an implementation of that standard.

### What is the difference between an entity and a DTO?

An entity represents persisted database data. A DTO represents data crossing an
application boundary, such as an HTTP API.

### What is the repository versus service distinction?

A repository performs persistence operations. A service coordinates use cases and
business rules.

### Why is constructor injection preferred?

It makes dependencies explicit, supports final fields, prevents partially
initialized objects, and makes testing easier.

### What does `@Transactional` do?

It runs database work inside a transaction that commits on success and rolls back
when an appropriate failure occurs.

### What is `Optional`?

`Optional<T>` represents a value that may or may not exist. `findById` uses it so
the caller must handle the missing-record case.

### What is Hibernate dirty checking?

Hibernate remembers loaded entity state. At transaction commit, it compares the
current state with the original state and generates updates for changed fields.

---

## 22. Final Mental Model

When a user clicks **Add employee**:

```text
React form
  -> fetch POST /employees
  -> Vite proxy
  -> Spring MVC controller
  -> JSON deserialization
  -> validation
  -> service transaction
  -> mapper creates Employee
  -> repository calls Hibernate
  -> Hibernate executes INSERT
  -> H2 stores the row
  -> mapper creates response DTO
  -> Spring serializes JSON
  -> React reloads employees
  -> dashboard and Insights recalculate
```

That is the entire application in one flow. Every package exists to keep one
part of this flow understandable, replaceable, and testable.
