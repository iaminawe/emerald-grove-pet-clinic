# Development Guide

This guide covers development setup, testing, and contribution guidelines for the Spring PetClinic application.

## Prerequisites

- **Java 17** or later
- **Maven 3.6+** or **Gradle 7+**
- **Git** for version control
- **Docker** (optional, for containerized databases)

## Development Workflow

### TDD-First Development Process

⚠️ **Critical**: This project enforces **Strict Test-Driven Development (TDD)**. All development must follow the Red-Green-Refactor cycle:

#### 1. RED Phase - Write Failing Test

- Write a test that defines the desired behavior
- Ensure the test fails for the correct reason
- Test should be specific and focused on one behavior

#### 2. GREEN Phase - Make Test Pass

- Write the **minimum** code required to make the test pass
- No extra functionality beyond what the test requires
- Focus on making the test pass quickly

#### 3. REFACTOR Phase - Improve Code

- Improve code structure while keeping tests green
- Eliminate duplication and improve readability
- Ensure all tests still pass

### Feature Development Process

1. **Requirements Analysis**: Understand the feature requirements
2. **Test Design**: Write comprehensive failing tests
3. **TDD Implementation**: Follow Red-Green-Refactor cycle
4. **Integration**: Verify with existing code
5. **Review**: Code review and feedback
6. **Documentation**: Update relevant documentation

### TDD Quality Gates

#### Before Writing Code

- [ ] Test is written and failing
- [ ] Test clearly defines expected behavior
- [ ] Test covers edge cases and error conditions

#### Before Commit

- [ ] All tests pass (including new ones)
- [ ] Code coverage meets standards (>90%)
- [ ] Code follows clean code principles
- [ ] No code duplication

#### Before Merge

- [ ] Peer review completed
- [ ] Integration tests pass
- [ ] Documentation updated
- [ ] Performance impact assessed

## Development Setup

### Clone and Build

```bash
git clone <repository-url>
cd spring-petclinic

# Maven
./mvnw spring-boot:run

# Gradle
./gradlew bootRun
```

### IDE Configuration

#### IntelliJ IDEA

1. Open the project via `File -> Open` and select the `pom.xml`
2. Run configuration `PetClinicApplication` should be created automatically
3. Alternatively, right-click `PetClinicApplication` main class and select `Run`

#### Eclipse/STS

1. Import via `File -> Import -> Maven -> Existing Maven project`
2. Select the root directory of the cloned repo
3. Right-click project and `Run As -> Maven install` to generate resources
4. Run the application's main method by right-clicking and choosing `Run As -> Java Application`

#### VS Code

1. Install the Extension Pack for Java
2. Open the project folder
3. Use the integrated terminal to run `./mvnw spring-boot:run`

## Database Configuration

### Default (H2)

The application uses an in-memory H2 database by default with sample data.

- **Console:** `http://localhost:8080/h2-console`
- **JDBC URL:** `jdbc:h2:mem:<uuid>` (UUID shown in console)

### Persistent Databases

#### MySQL

```bash
# Start MySQL
docker run -e MYSQL_USER=petclinic -e MYSQL_PASSWORD=petclinic -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=petclinic -p 3306:3306 mysql:8.4

# Run with MySQL profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

#### PostgreSQL

```bash
# Start PostgreSQL
docker run -e POSTGRES_USER=petclinic -e POSTGRES_PASSWORD=petclinic -e POSTGRES_DB=petclinic -p 5432:5432 postgres:17

# Run with PostgreSQL profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=postgres
```

### Docker Compose

```bash
# MySQL
docker compose up mysql

# PostgreSQL
docker compose up postgres
```

## Testing

### Run Tests

```bash
# Maven
./mvnw test

```

For comprehensive testing information including test patterns, database-specific tests, and best practices, see the **[Testing Guide](TESTING.md)**.

### Quick Test Commands

Integration tests are available for different database configurations:

- H2 (default)
- MySQL (using Testcontainers)
- PostgreSQL (using Docker Compose)

```bash
# Run specific test types
./mvnw test -Dtest="*ControllerTests"     # Web layer tests
./mvnw test -Dtest="*IntegrationTests"   # Integration tests
./mvnw test -Dtest=MySqlIntegrationTests  # MySQL-specific tests
```

## Project Structure

```text
src/main/java/org/springframework/samples/petclinic/
├── PetClinicApplication.java     # Main application class
├── model/                        # Domain entities
│   ├── BaseEntity.java          # Base entity with ID
│   ├── NamedEntity.java         # Named entity base class
│   └── Person.java              # Person base class
├── owner/                        # Owner-related components
│   ├── Owner.java               # Owner entity
│   ├── OwnerController.java     # Web controller
│   ├── OwnerRepository.java     # Data repository
│   ├── Pet.java                 # Pet entity
│   ├── PetController.java       # Pet web controller
│   └── PetType.java             # Pet type entity
├── vet/                          # Veterinarian components
│   ├── Vet.java                 # Vet entity
│   ├── VetController.java       # Vet web controller
│   ├── VetRepository.java       # Vet repository
│   └── Specialty.java           # Medical specialty entity
└── system/                       # System utilities
    ├── CacheConfiguration.java  # Caching setup
    └── PetClinicRuntimeHints.java # Runtime hints
```

## Customization

### Profiles

Switch between configurations using Spring profiles:

- `h2` (default) - In-memory database
- `mysql` - MySQL database
- `postgres` - PostgreSQL database

### CSS/SCSS

Update styling using the provided build profile:

```bash
./mvnw package -P css
```

The `petclinic.css` is generated from `petclinic.scss` combined with Bootstrap 5.

### Configuration Files

- `application.properties` - Main configuration
- `application-{profile}.properties` - Profile-specific settings

### Environment Variables

Override configuration:

```bash
export SPRING_PROFILES_ACTIVE=mysql
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/petclinic
```

## Containerization

Build a Docker image using Spring Boot build plugin:

```bash
./mvnw spring-boot:build-image
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- Follow Spring Boot conventions
- Use meaningful variable and method names
- Add JavaDoc for public APIs
- Keep methods small and focused

### Testing Guidelines

- Write unit tests for business logic
- Add integration tests for data access
- Test web controllers with MockMvc
- Maintain test coverage above 90%

## Troubleshooting

### Common Issues

#### Build fails with Java version error

- Ensure Java 17+ is installed and active
- Check `JAVA_HOME` environment variable

#### Database connection errors

- Verify database is running
- Check profile-specific configuration
- Ensure correct database credentials

#### CSS not updating

- Run `./mvnw package -P css` to recompile styles
- Clear browser cache

#### Hot reload not working

- Ensure Spring Boot Devtools is included
- Check IDE auto-compilation settings

### Debug Mode

Enable debug logging:

```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dlogging.level.org.springframework=DEBUG"
```

## Performance

### Caching

The application uses Spring Cache abstraction. Configure caching in `CacheConfiguration.java`.

### Database Optimization

- Use appropriate indexes for frequent queries
- Consider connection pooling for production
- Monitor query performance with database tools

### Memory Management

- Monitor heap usage with JVM tools
- Consider garbage collection tuning for production
- Use profiling tools to identify bottlenecks
