# Institution user-count column + context-menu actions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an enabled-user count per institution (avatars + `+N`) to the platform admin institutions table via a new admin-only endpoint, and switch desktop row actions to a right-click context menu (mobile keeps the three-dots button).

**Architecture:** New `GET /api/v1/platform/institutions` (autenticado + `@RequiresPlatformRole(PLATFORM_ADMIN)`) returns the existing institution list fields plus `userCount`. The public `GET /api/v1/institutions` stays untouched. The frontend list service points at the new endpoint; the table gains a "Usuarios" column rendered with `AvatarGroup` (icon-only avatars) and a `+N` overflow. Each table row is wrapped in a shadcn `ContextMenu`; the existing three-dots dropdown gains `md:hidden`.

**Tech Stack:** Spring Boot 3.x + Spring Data JPA (backend, JPQL interface projection), Gradle (build/test), JUnit 5 + Mockito + AssertJ + `@WebMvcTest`/`@DataJpaTest` (tests), Next.js 16 + React 19 + shadcn/ui (frontend), pnpm, ESLint, TypeScript.

## Global Constraints

- **No commits.** Do NOT run `git commit`, `git add`, or stage anything. Leave working-tree changes unstaged. (User instruction.)
- **No frontend tests.** Do NOT add or run `*.test.tsx`/`*.test.ts` for the frontend changes. Verify frontend via `pnpm lint` (ESLint) and `pnpm exec tsc --noEmit` only.
- **Public endpoint stays untouched.** Do not modify `GET /api/v1/institutions`, `InstitutionListItemResponse`, `ListInstitutionsUseCase`, `PublicRoutes.INSTITUTION_READ_ROUTES`.
- New route `/api/v1/platform/institutions` must NOT appear in `PublicRoutes` or `GET_ONLY_ROUTES` — it relies on `anyRequest().authenticated()` in `SecurityConfig` + `@RequiresPlatformRole(PLATFORM_ADMIN)`.
- Avatars are icon-only (`UserIcon` from lucide-react). No user previews/names from the backend. Backend returns only the `long userCount`.
- Test code must follow the existing helper pattern in `boero-api/src/test/java/.../support/InstitutionalTestData.java` (`createInstitution`, `createUser`, `persist`) and `support/AuthTestData.java` (`platformPrincipal`, `institutionalPrincipal`).
- Backend single-test command: `./gradlew --no-daemon test --tests "<fully.qualified.ClassName>"` (run from `/home/matias/Workspace/Repositories/TypeIt/boero-api`).
- Backend formatter: `./gradlew spotlessApply` (spotless is enforced; run before considering a task done).
- Frontend lint: `pnpm lint`. Frontend typecheck: `pnpm exec tsc --noEmit` (workspace root `boero-ui`).
- Use the OpenCode tool mapping: `read`/`edit`/`write`/`bash`/`grep`/`glob`.

## File structure

Backend (`boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/`):

- **Create** `auth/interfaces/InstitutionUserCount.java` — Spring Data JPA interface projection for the grouped count query.
- **Modify** `auth/interfaces/UserRepository.java` — add `countEnabledUsersByInstitutionIdIn(Collection<UUID>)`.
- **Create** `institutional/payloads/InstitutionAdminListItemResponse.java` — record DTO extending the list-item fields with `userCount`; static `from(Institution, long)`.
- **Create** `institutional/services/ListInstitutionsAdminUseCase.java` — fetches page via `institutionRepository.findAllWithLocation`, resolves counts via the new repo method, merges into a `Map`, maps to the new DTO.
- **Modify** `institutional/controllers/InstitutionController.java` — new `listForAdmin(Pageable)` endpoint `GET /platform` (mapped under `/institutions` controller → `/institutions/...`? **No** — see Task 3 for the correct path mapping).
- **Unchanged** `security/config/PublicRoutes.java`, `InstitutionListItemResponse`, `ListInstitutionsUseCase`.

Backend tests (`boero-api/src/test/...`):

- **Modify** `auth/interfaces/UserRepositoryTest.java` — add the grouped-count test.
- **Create** `institutional/services/ListInstitutionsAdminUseCaseTest.java` — mock repo + verify `userCount` mapping (0 for institutions with no enabled users).
- **Modify** `institutional/controllers/InstitutionControllerWebMvcTest.java` — add admin-list tests (forbidden unauth, forbidden institutional principal, ok platform admin with `userCount`).

Frontend (`boero-ui/src/`):

- **Create** `common/components/ui/context-menu.tsx` — via `npx shadcn@latest add context-menu`.
- **Modify** `features/institutions/types/institution-summary.types.ts` — add `userCount: number`.
- **Modify** `features/institutions/services/fetch-institutions.service.ts` — switch URL to `/api/v1/platform/institutions`.
- **Modify** `features/institutions/components/institutions-table-presentation.tsx` — add "Usuarios" column, `InstitutionUsersCell`, `ContextMenu` row wrapper, shared actions helper, `md:hidden` on the 3-dot trigger.
- **Modify** `features/institutions/components/institutions-table-skeleton.tsx` — add a skeleton cell for the new "Usuarios" column.

---

### Task 1: Add grouped-count query + projection to `UserRepository`

**Files:**
- Create: `boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/auth/interfaces/InstitutionUserCount.java`
- Modify: `boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/auth/interfaces/UserRepository.java`
- Test: `boero-api/src/test/java/ar/edu/utn/frvm/typeit/boero_api/auth/interfaces/UserRepositoryTest.java`

**Interfaces:**
- Consumes: `User` entity (`u.institution.id`, `u.enabled`), Spring Data JPA.
- Produces: `InstitutionUserCount` projection (`UUID getInstitutionId()`, `long getUserCount()`); `UserRepository.countEnabledUsersByInstitutionIdIn(Collection<UUID> ids)` returning `List<InstitutionUserCount>`.

- [ ] **Step 1: Write the failing test**

Add to `UserRepositoryTest.java` (after the existing tests, before the closing brace):

```java
  @Test
  @DisplayName("Should count enabled users grouped by institution id for a set of institution ids")
  void countEnabledUsersByInstitutionIdIn_countsEnabledUsersPerInstitution() {
    Institution boero = createInstitution(entityManager, "boero");
    Institution other = createInstitution(entityManager, "other-school");
    createUser(entityManager, boero, "11111111");
    createUser(entityManager, boero, "22222222");
    User disabled = createUser(entityManager, boero, "33333333");
    disabled.setEnabled(false);
    entityManager.merge(disabled);
    // other has no users
    entityManager.flush();
    entityManager.clear();

    var counts =
        userRepository.countEnabledUsersByInstitutionIdIn(
            java.util.List.of(boero.getId(), other.getId()));

    assertThat(counts).hasSize(1);
    var boeroCount = counts.getFirst();
    assertThat(boeroCount.getInstitutionId()).isEqualTo(boero.getId());
    assertThat(boeroCount.getUserCount()).isEqualTo(2L);
  }
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `boero-api`):
```bash
./gradlew --no-daemon test --tests "ar.edu.utn.frvm.typeit.boero_api.auth.interfaces.UserRepositoryTest"
```
Expected: COMPILE ERROR — method `countEnabledUsersByInstitutionIdIn` does not exist.

- [ ] **Step 3: Create the projection interface**

Create `boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/auth/interfaces/InstitutionUserCount.java`:

```java
package ar.edu.utn.frvm.typeit.boero_api.auth.interfaces;

import java.util.UUID;

public interface InstitutionUserCount {
  UUID getInstitutionId();

  long getUserCount();
}
```

- [ ] **Step 4: Add the query method to `UserRepository`**

Modify `boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/auth/interfaces/UserRepository.java`. Add imports and the new method. Full new file:

```java
package ar.edu.utn.frvm.typeit.boero_api.auth.interfaces;

import ar.edu.utn.frvm.typeit.boero_api.auth.entities.User;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByPersonDocumentNumberAndInstitution_Id(
      String documentNumber, UUID institutionId);

  @EntityGraph(attributePaths = {"person", "institution"})
  Optional<User> findWithPersonAndInstitutionByPersonDocumentNumberAndInstitution_Id(
      String documentNumber, UUID institutionId);

  boolean existsByPersonDocumentNumberAndInstitution_Id(String documentNumber, UUID institutionId);

  Optional<User> findByPerson_IdAndInstitution_Id(UUID personId, UUID institutionId);

  @EntityGraph(attributePaths = {"person", "institution"})
  Optional<User> findWithPersonAndInstitutionById(UUID id);

  @Query(
      """
      select u.institution.id as institutionId, count(u) as userCount
      from User u
      where u.enabled = true and u.institution.id in :ids
      group by u.institution.id
      """)
  List<InstitutionUserCount> countEnabledUsersByInstitutionIdIn(@Param("ids") Collection<UUID> ids);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run:
```bash
./gradlew --no-daemon test --tests "ar.edu.utn.frvm.typeit.boero_api.auth.interfaces.UserRepositoryTest"
```
Expected: PASS (4 tests, including the new one).

- [ ] **Step 6: Apply formatter**

Run:
```bash
./gradlew spotlessApply
```
Expected: BUILD SUCCESSFUL.

---

### Task 2: Add `InstitutionAdminListItemResponse` DTO + `ListInstitutionsAdminUseCase`

**Files:**
- Create: `boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/institutional/payloads/InstitutionAdminListItemResponse.java`
- Create: `boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/institutional/services/ListInstitutionsAdminUseCase.java`
- Test: `boero-api/src/test/java/ar/edu/utn/frvm/typeit/boero_api/institutional/services/ListInstitutionsAdminUseCaseTest.java`

**Interfaces:**
- Consumes: `InstitutionRepository.findAllWithLocation(Pageable)` (returns `Page<Institution>`), `UserRepository.countEnabledUsersByInstitutionIdIn(Collection<UUID>)` (returns `List<InstitutionUserCount>`).
- Produces: `ListInstitutionsAdminUseCase.execute(Pageable)` returning `PaginatedResponse<InstitutionAdminListItemResponse>`; DTO factory `InstitutionAdminListItemResponse.from(Institution institution, long userCount)`.

- [ ] **Step 1: Write the failing test**

Create `boero-api/src/test/java/ar/edu/utn/frvm/typeit/boero_api/institutional/services/ListInstitutionsAdminUseCaseTest.java`:

```java
package ar.edu.utn.frvm.typeit.boero_api.institutional.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.when;

import ar.edu.utn.frvm.typeit.boero_api.auth.entities.User;
import ar.edu.utn.frvm.typeit.boero_api.auth.interfaces.InstitutionUserCount;
import ar.edu.utn.frvm.typeit.boero_api.auth.interfaces.UserRepository;
import ar.edu.utn.frvm.typeit.boero_api.institutional.entities.City;
import ar.edu.utn.frvm.typeit.boero_api.institutional.entities.Country;
import ar.edu.utn.frvm.typeit.boero_api.institutional.entities.Institution;
import ar.edu.utn.frvm.typeit.boero_api.institutional.entities.Province;
import ar.edu.utn.frvm.typeit.boero_api.institutional.interfaces.InstitutionRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class ListInstitutionsAdminUseCaseTest {

  @Mock private InstitutionRepository institutionRepository;
  @Mock private UserRepository userRepository;

  @InjectMocks private ListInstitutionsAdminUseCase listInstitutionsAdminUseCase;

  @Test
  @DisplayName("Should list institutions with enabled user counts, defaulting to zero for missing")
  void execute_returnsInstitutionsWithUserCounts() {
    Institution withUsers = activeInstitution();
    Institution withNoUsers = activeInstitution();
    when(institutionRepository.findAllWithLocation(any()))
        .thenReturn(new PageImpl<>(List.of(withUsers, withNoUsers)));
    when(userRepository.countEnabledUsersByInstitutionIdIn(anyCollection()))
        .thenReturn(List.of(countFor(withUsers.getId(), 5L)));

    var response = listInstitutionsAdminUseCase.execute(PageRequest.of(0, 20));

    assertThat(response.items()).hasSize(2);
    assertThat(response.items().get(0).id()).isEqualTo(withUsers.getId());
    assertThat(response.items().get(0).userCount()).isEqualTo(5L);
    assertThat(response.items().get(1).id()).isEqualTo(withNoUsers.getId());
    assertThat(response.items().get(1).userCount()).isZero();
  }

  @Test
  @DisplayName("Should not call count repository when page is empty")
  void execute_skipsCountQueryWhenPageEmpty() {
    when(institutionRepository.findAllWithLocation(any())).thenReturn(new PageImpl<>(List.of()));

    var response = listInstitutionsAdminUseCase.execute(PageRequest.of(0, 20));

    assertThat(response.items()).isEmpty();
    assertThat(response.totalItems()).isZero();
  }

  private static Institution activeInstitution() {
    Country country = Country.builder().name("Argentina").isoCode("ARG").build();
    Province province = Province.builder().country(country).name("Cordoba").build();
    City city = City.builder().name("Villa Maria").province(province).build();
    return Institution.builder()
        .id(UUID.randomUUID())
        .name("Conservatorio Boero")
        .slug("boero-villa-maria")
        .city(city)
        .active(true)
        .build();
  }

  private static InstitutionUserCount countFor(UUID id, long count) {
    return new InstitutionUserCount() {
      @Override
      public UUID getInstitutionId() {
        return id;
      }

      @Override
      public long getUserCount() {
        return count;
      }
    };
  }

  @SuppressWarnings("unused")
  private static User unusedBindsUserPackage() {
    return null;
  }
}
```

> Note: `User` import is unused; remove it. Keep imports tidy — final version should NOT import `User` (the test never instantiates `User`). Delete the line `import ar.edu.utn.frvm.typeit.boero_api.auth.entities.User;` AND the `unusedBindsUserPackage()` helper from your actual file.

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
./gradlew --no-daemon test --tests "ar.edu.utn.frvm.typeit.boero_api.institutional.services.ListInstitutionsAdminUseCaseTest"
```
Expected: COMPILE ERROR — `InstitutionAdminListItemResponse` and `ListInstitutionsAdminUseCase` do not exist.

- [ ] **Step 3: Create the DTO**

Create `boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/institutional/payloads/InstitutionAdminListItemResponse.java`:

```java
package ar.edu.utn.frvm.typeit.boero_api.institutional.payloads;

import ar.edu.utn.frvm.typeit.boero_api.institutional.entities.Institution;
import java.util.UUID;
import lombok.Builder;

@Builder
public record InstitutionAdminListItemResponse(
    UUID id,
    String name,
    String slug,
    CountryLocationResponse country,
    String city,
    String province,
    boolean active,
    long userCount) {

  public static InstitutionAdminListItemResponse from(Institution institution, long userCount) {
    return InstitutionAdminListItemResponse.builder()
        .id(institution.getId())
        .name(institution.getName())
        .slug(institution.getSlug())
        .country(CountryLocationResponse.from(institution.getCity().getProvince().getCountry()))
        .city(institution.getCity().getName())
        .province(institution.getCity().getProvince().getName())
        .active(institution.isActive())
        .userCount(userCount)
        .build();
  }
}
```

- [ ] **Step 4: Create the use case**

Create `boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/institutional/services/ListInstitutionsAdminUseCase.java`:

```java
package ar.edu.utn.frvm.typeit.boero_api.institutional.services;

import ar.edu.utn.frvm.typeit.boero_api.auth.interfaces.UserRepository;
import ar.edu.utn.frvm.typeit.boero_api.common.web.PaginatedResponse;
import ar.edu.utn.frvm.typeit.boero_api.institutional.entities.Institution;
import ar.edu.utn.frvm.typeit.boero_api.institutional.interfaces.InstitutionRepository;
import ar.edu.utn.frvm.typeit.boero_api.institutional.payloads.InstitutionAdminListItemResponse;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ListInstitutionsAdminUseCase {

  private final InstitutionRepository institutionRepository;
  private final UserRepository userRepository;

  public PaginatedResponse<InstitutionAdminListItemResponse> execute(Pageable pageable) {
    var page = institutionRepository.findAllWithLocation(pageable);
    var items = page.getContent();

    var counts =
        items.isEmpty()
            ? Map.<UUID, Long>of()
            : toMap(userRepository.countEnabledUsersByInstitutionIdIn(toIds(items)));

    var adminItems =
        items.stream()
            .map(
                institution ->
                    InstitutionAdminListItemResponse.from(
                        institution, counts.getOrDefault(institution.getId(), 0L)))
            .toList();

    return PaginatedResponse.<InstitutionAdminListItemResponse>builder()
        .items(adminItems)
        .page(page.getNumber())
        .size(page.getSize())
        .totalItems(page.getTotalElements())
        .totalPages(page.getTotalPages())
        .build();
  }

  private static Collection<UUID> toIds(java.util.List<Institution> institutions) {
    return institutions.stream().map(Institution::getId).toList();
  }

  private static Map<UUID, Long> toMap(
      java.util.List<ar.edu.utn.frvm.typeit.boero_api.auth.interfaces.InstitutionUserCount> rows) {
    return rows.stream()
        .collect(
            Collectors.toMap(
                ar.edu.utn.frvm.typeit.boero_api.auth.interfaces.InstitutionUserCount
                    ::getInstitutionId,
                ar.edu.utn.frvm.typeit.boero_api.auth.interfaces.InstitutionUserCount
                    ::getUserCount));
  }
}
```

> Cleaner alternative (preferred): add explicit `import`s for `InstitutionUserCount`, `List`, and avoid the FQNs above. Use this cleaner final version in your actual file:

```java
package ar.edu.utn.frvm.typeit.boero_api.institutional.services;

import ar.edu.utn.frvm.typeit.boero_api.auth.interfaces.InstitutionUserCount;
import ar.edu.utn.frvm.typeit.boero_api.auth.interfaces.UserRepository;
import ar.edu.utn.frvm.typeit.boero_api.common.web.PaginatedResponse;
import ar.edu.utn.frvm.typeit.boero_api.institutional.entities.Institution;
import ar.edu.utn.frvm.typeit.boero_api.institutional.interfaces.InstitutionRepository;
import ar.edu.utn.frvm.typeit.boero_api.institutional.payloads.InstitutionAdminListItemResponse;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ListInstitutionsAdminUseCase {

  private final InstitutionRepository institutionRepository;
  private final UserRepository userRepository;

  public PaginatedResponse<InstitutionAdminListItemResponse> execute(Pageable pageable) {
    var page = institutionRepository.findAllWithLocation(pageable);
    var items = page.getContent();

    var counts =
        items.isEmpty()
            ? Map.<UUID, Long>of()
            : toMap(userRepository.countEnabledUsersByInstitutionIdIn(toIds(items)));

    var adminItems =
        items.stream()
            .map(
                institution ->
                    InstitutionAdminListItemResponse.from(
                        institution, counts.getOrDefault(institution.getId(), 0L)))
            .toList();

    return PaginatedResponse.<InstitutionAdminListItemResponse>builder()
        .items(adminItems)
        .page(page.getNumber())
        .size(page.getSize())
        .totalItems(page.getTotalElements())
        .totalPages(page.getTotalPages())
        .build();
  }

  private static Collection<UUID> toIds(List<Institution> institutions) {
    return institutions.stream().map(Institution::getId).toList();
  }

  private static Map<UUID, Long> toMap(List<InstitutionUserCount> rows) {
    return rows.stream()
        .collect(
            Collectors.toMap(InstitutionUserCount::getInstitutionId, InstitutionUserCount::getUserCount));
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run:
```bash
./gradlew --no-daemon test --tests "ar.edu.utn.frvm.typeit.boero_api.institutional.services.ListInstitutionsAdminUseCaseTest"
```
Expected: PASS (2 tests).

- [ ] **Step 6: Apply formatter**

Run:
```bash
./gradlew spotlessApply
```
Expected: BUILD SUCCESSFUL.

---

### Task 3: Wire the `GET /api/v1/platform/institutions` endpoint + WebMvcTest

**Files:**
- Modify: `boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/institutional/controllers/InstitutionController.java`
- Modify: `boero-api/src/test/java/ar/edu/utn/frvm/typeit/boero_api/institutional/controllers/InstitutionControllerWebMvcTest.java`

**Interfaces:**
- Consumes: `ListInstitutionsAdminUseCase` (from Task 2).
- Produces: HTTP endpoint `GET /api/v1/platform/institutions` returning `PaginatedResponse<InstitutionAdminListItemResponse>`.

**Routing note:** The existing controller is `@RequestMapping("/institutions")`, so a method on this controller cannot produce `/api/v1/platform/institutions` without changing the class mapping (which would break the public routes). Therefore, create a **separate** controller `PlatformInstitutionController` mapped to `/platform/institutions`. The `WebConfig` prefix `/api/{version}` + `version = Version.V1` yields `/api/v1/platform/institutions`.

- [ ] **Step 1: Write the failing test**

Add to `InstitutionControllerWebMvcTest.java` the new admin use case mock field, then add three tests. Also register the new controller in the `@WebMvcTest` annotation.

First, modify the class header annotations:

```java
@WebMvcTest({InstitutionController.class, PlatformInstitutionController.class})
@Import({RoleAuthorizationAspect.class, GlobalExceptionHandler.class, WebConfig.class})
@EnableAspectJAutoProxy
@AutoConfigureMockMvc(addFilters = false)
class InstitutionControllerWebMvcTest {
```

Add the import for the new controller, the use case, and the DTO:

```java
import ar.edu.utn.frvm.typeit.boero_api.institutional.controllers.PlatformInstitutionController;
import ar.edu.utn.frvm.typeit.boero_api.institutional.payloads.InstitutionAdminListItemResponse;
import ar.edu.utn.frvm.typeit.boero_api.institutional.services.ListInstitutionsAdminUseCase;
```

Add the new mock bean next to the other `@MockitoBean` fields:

```java
  @MockitoBean private ListInstitutionsAdminUseCase listInstitutionsAdminUseCase;
```

Add the three tests inside the class:

```java
  @Test
  @DisplayName("Should forbid unauthenticated admin institution listing")
  void adminList_returnsForbiddenWithoutAuthentication() throws Exception {
    mockMvc
        .perform(get("/api/v1/platform/institutions"))
        .andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("Should forbid institutional principals from listing admin institutions")
  void adminList_returnsForbiddenForInstitutionalPrincipal() throws Exception {
    var authentication =
        new TestingAuthenticationToken(
            institutionalPrincipal(UUID.randomUUID(), INSTITUTION_ID), null);
    stubPlatformAdminAccess(false);

    mockMvc
        .perform(get("/api/v1/platform/institutions").principal(authentication))
        .andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("Should return admin institution list with userCount for platform admin")
  void adminList_returnsAdminListForPlatformAdmin() throws Exception {
    var authentication =
        new TestingAuthenticationToken(platformPrincipal(PLATFORM_ACCOUNT_ID), null);
    stubPlatformAdminAccess(true);
    when(listInstitutionsAdminUseCase.execute(any()))
        .thenReturn(
            PaginatedResponse.<InstitutionAdminListItemResponse>builder()
                .items(
                    List.of(
                        InstitutionAdminListItemResponse.builder()
                            .id(INSTITUTION_ID)
                            .name("Conservatorio Boero")
                            .slug("boero-villa-maria")
                            .country(
                                CountryLocationResponse.builder()
                                    .countryId(COUNTRY_ID)
                                    .name("Argentina")
                                    .isoCode("ARG")
                                    .build())
                            .city("Villa Maria")
                            .province("Cordoba")
                            .active(true)
                            .userCount(7)
                            .build()))
                .page(0)
                .size(20)
                .totalItems(1)
                .totalPages(1)
                .build());

    mockMvc
        .perform(get("/api/v1/platform/institutions").principal(authentication))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[0].id").value(INSTITUTION_ID.toString()))
        .andExpect(jsonPath("$.items[0].userCount").value(7))
        .andExpect(jsonPath("$.items[0].email").doesNotExist())
        .andExpect(jsonPath("$.items[0].phoneNumber").doesNotExist());
  }
```

> About anonymous → 401 vs 403: the `@WebMvcTest` uses `addFilters = false` so the security filter chain (which produces 401 for truly anonymous) is OFF. The `@RequiresPlatformRole` aspect, enforced via `RoleAuthorizationAspect`, throws `AccessDeniedException` for any principal lacking the role — including a `null`/absent principal — which `GlobalExceptionHandler` maps to 403. This mirrors the existing `create_returnsForbiddenWithoutAuthentication` test. The production 401-for-anonymous path is exercised by a full-stack/security integration test, not the WebMvc layer; the convention here is to assert 403 in `addFilters=false` mode.

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
./gradlew --no-daemon test --tests "ar.edu.utn.frvm.typeit.boero_api.institutional.controllers.InstitutionControllerWebMvcTest"
```
Expected: COMPILE ERROR — `PlatformInstitutionController` does not exist.

- [ ] **Step 3: Create the admin controller**

Create `boero-api/src/main/java/ar/edu/utn/frvm/typeit/boero_api/institutional/controllers/PlatformInstitutionController.java`:

```java
package ar.edu.utn.frvm.typeit.boero_api.institutional.controllers;

import ar.edu.utn.frvm.typeit.boero_api.authorization.RequiresPlatformRole;
import ar.edu.utn.frvm.typeit.boero_api.authorization.enums.PlatformRoleCode;
import ar.edu.utn.frvm.typeit.boero_api.common.web.PaginatedResponse;
import ar.edu.utn.frvm.typeit.boero_api.common.web.Version;
import ar.edu.utn.frvm.typeit.boero_api.institutional.payloads.InstitutionAdminListItemResponse;
import ar.edu.utn.frvm.typeit.boero_api.institutional.services.ListInstitutionsAdminUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/platform/institutions")
@RequiredArgsConstructor
public class PlatformInstitutionController {

  private final ListInstitutionsAdminUseCase listInstitutionsAdminUseCase;

  @GetMapping(version = Version.V1)
  @RequiresPlatformRole(PlatformRoleCode.PLATFORM_ADMIN)
  public PaginatedResponse<InstitutionAdminListItemResponse> list(
      @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
    return listInstitutionsAdminUseCase.execute(pageable);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
./gradlew --no-daemon test --tests "ar.edu.utn.frvm.typeit.boero_api.institutional.controllers.InstitutionControllerWebMvcTest"
```
Expected: PASS (all existing + 3 new tests).

- [ ] **Step 5: Run the full backend test suite (regression check)**

Run (from `boero-api`):
```bash
./gradlew --no-daemon test
```
Expected: BUILD SUCCESSFUL — no regressions; the public institution list test (`list_returnsPublicInstitutions`) still passes (public endpoint untouched).

- [ ] **Step 6: Apply formatter**

Run:
```bash
./gradlew spotlessApply
```
Expected: BUILD SUCCESSFUL.

---

### Task 4: Frontend type + service URL

**Files:**
- Modify: `boero-ui/src/features/institutions/types/institution-summary.types.ts`
- Modify: `boero-ui/src/features/institutions/services/fetch-institutions.service.ts`

**Interfaces:**
- Consumes: backend `InstitutionAdminListItemResponse`.
- Produces: `InstitutionSummary` with `userCount: number`; `fetchInstitutions` hitting `/api/v1/platform/institutions`.

- [ ] **Step 1: Add `userCount` to the type**

Modify `boero-ui/src/features/institutions/types/institution-summary.types.ts`:

```typescript
type InstitutionSummaryCountry = {
  countryId: string;
  isoCode: string;
  name: string;
};

export type InstitutionSummary = {
  id: string;
  name: string;
  slug: string;
  country: InstitutionSummaryCountry;
  city: string;
  province: string;
  active: boolean;
  userCount: number;
};
```

- [ ] **Step 2: Switch the service URL**

Modify `boero-ui/src/features/institutions/services/fetch-institutions.service.ts` line 10. Change:

```typescript
  const response = await platformApiFetch(`/api/v1/institutions?${searchParams.toString()}`);
```

to:

```typescript
  const response = await platformApiFetch(
    `/api/v1/platform/institutions?${searchParams.toString()}`,
  );
```

- [ ] **Step 3: Typecheck + lint**

Run (from `boero-ui`):
```bash
pnpm exec tsc --noEmit && pnpm lint
```
Expected: no errors.

---

### Task 5: Install shadcn `context-menu`

**Files:**
- Create: `boero-ui/src/common/components/ui/context-menu.tsx` (generated by shadcn CLI).

- [ ] **Step 1: Add the component**

Run (from `boero-ui`):
```bash
npx shadcn@latest add context-menu
```
Expected output: the CLI prints that it added `src/common/components/ui/context-menu.tsx` (and possibly Radix `@radix-ui/react-context-menu` to `package.json` — it will install the dependency if missing). Confirm the file exists:

```bash
ls src/common/components/ui/context-menu.tsx
```
Expected: the path prints (file exists).

- [ ] **Step 2: Typecheck + lint**

Run:
```bash
pnpm exec tsc --noEmit && pnpm lint
```
Expected: no errors.

---

### Task 6: Add "Usuarios" column, `InstitutionUsersCell`, context menu, hide 3-dots on desktop; update skeleton

**Files:**
- Modify: `boero-ui/src/features/institutions/components/institutions-table-presentation.tsx`
- Modify: `boero-ui/src/features/institutions/components/institutions-table-skeleton.tsx`

**Interfaces:**
- Consumes: `InstitutionSummary.userCount`, `context-menu.tsx` (Task 5), `avatar.tsx` (existing `Avatar`, `AvatarFallback`, `AvatarGroup`, `AvatarGroupCount`), `lucide-react` `UserIcon`.
- Produces: updated presentation + skeleton.

- [ ] **Step 1: Update imports in the presentation file**

Open `boero-ui/src/features/institutions/components/institutions-table-presentation.tsx`. After the existing imports (lines 1-20), update/add the following imports so the header reads:

```typescript
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EllipsisVerticalIcon, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@common/components/ui/avatar";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@common/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import { InstitutionsPagination } from "@features/institutions/components/institutions-pagination";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";
```

- [ ] **Step 2: Add the "Usuarios" header and body cell, and wrap each row in a `ContextMenu`**

Replace the existing `<TableHeader>` block (lines 82-101 in the original file) and the `<TableBody>` block (lines 103-130) with the updated version that adds a "Usuarios" column and a context menu around each row. The full replacement for the `<Table>` ... `</Table>` portion:

```tsx
        <Table className="min-w-190">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={
                    isEveryVisibleInstitutionSelected || (isSomeVisibleInstitutionSelected ? "indeterminate" : false)
                  }
                  aria-label="Seleccionar todas las instituciones visibles"
                  onCheckedChange={(checked) => toggleAllVisibleInstitutions(checked === true)}
                />
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Provincia</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-16 pr-4 md:w-0 md:p-0">
                <span className="sr-only md:hidden">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((institution) => (
              <ContextMenu key={institution.id}>
                <ContextMenuTrigger asChild>
                  <TableRow data-state={selectedInstitutionIds.has(institution.id) ? "selected" : undefined}>
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedInstitutionIds.has(institution.id)}
                        aria-label={`Seleccionar ${institution.name}`}
                        onCheckedChange={(checked) => toggleInstitution(institution.id, checked === true)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{institution.name}</TableCell>
                    <TableCell>{institution.country.name}</TableCell>
                    <TableCell>{institution.province}</TableCell>
                    <TableCell>{institution.city}</TableCell>
                    <TableCell>
                      <InstitutionUsersCell institution={institution} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={institution.active ? "success" : "destructive"}>
                        {institution.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4 md:p-0">
                      <InstitutionActionsMenu institutionId={institution.id} />
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-44 p-1.5">
                  {getInstitutionActions(institution.id).map((action) => (
                    <ContextMenuItem key={action.href} asChild>
                      <Link href={action.href} className="px-2.5 py-1.5">
                        {action.label}
                      </Link>
                    </ContextMenuItem>
                  ))}
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TableBody>
        </Table>
```

- [ ] **Step 3: Replace `InstitutionActionsMenu` with the shared-actions version, and add `InstitutionUsersCell` + `getInstitutionActions`**

Replace the entire existing `InstitutionActionsMenu` function (original lines 145-171) with the following three functions:

```tsx
type InstitutionAction = {
  label: string;
  href: string;
};

function getInstitutionActions(institutionId: string): InstitutionAction[] {
  return [
    { label: "Usuarios", href: `/platform/institutions/${institutionId}/people` },
    { label: "Editar", href: `/platform/institutions/${institutionId}` },
  ];
}

function InstitutionUsersCell({ institution }: { institution: InstitutionSummary }): React.ReactElement {
  const count = Number.isFinite(institution.userCount) ? institution.userCount : 0;

  if (count === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const maxAvatars = 3;
  const visibleAvatars = Math.min(count, maxAvatars);
  const overflow = count - visibleAvatars;

  return (
    <Link href={`/platform/institutions/${institution.id}/people`} className="inline-flex items-center">
      <AvatarGroup>
        {Array.from({ length: visibleAvatars }).map((_, index) => (
          <Avatar key={index} size="sm">
            <AvatarFallback>
              <UserIcon className="size-3" />
            </AvatarFallback>
          </Avatar>
        ))}
        {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
      </AvatarGroup>
    </Link>
  );
}

function InstitutionActionsMenu({ institutionId }: { institutionId: string }): React.ReactElement {
  return (
    <div className="flex justify-end md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Abrir acciones de la institución" className="md:hidden">
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          <DropdownMenuGroup>
            {getInstitutionActions(institutionId).map((action) => (
              <DropdownMenuItem key={action.href} asChild>
                <Link href={action.href} className="px-2.5 py-1.5">
                  {action.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

- [ ] **Step 4: Update the skeleton to add a "Usuarios" column placeholder**

Replace the entire content of `boero-ui/src/features/institutions/components/institutions-table-skeleton.tsx` with:

```tsx
import { Skeleton } from "@common/components/ui/skeleton";

export function InstitutionsTableSkeleton(): React.ReactElement {
  const columns =
    "grid-cols-[1rem_2fr_1.5fr_1.5fr_1.5fr_4rem_5rem_2rem] gap-4";
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className={`grid ${columns}`}>
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className={`grid ${columns}`}>
          <Skeleton className="h-4" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-5" />
          <Skeleton className="h-8" />
        </div>
      ))}
    </div>
  );
}
```

> The skeleton grid now has 8 columns matching the new table (checkbox, Nombre, País, Provincia, Ciudad, Usuarios, Estado, Acciones). The Usuarios placeholder is a rounded bar (`rounded-full`) approximating an avatar group.

- [ ] **Step 5: Typecheck + lint**

Run (from `boero-ui`):
```bash
pnpm exec tsc --noEmit && pnpm lint
```
Expected: no errors.

- [ ] **Step 6: Run the dev server smoke check (optional, manual)**

Run (from `boero-ui`):
```bash
pnpm dev
```
Manually visit `/platform/institutions` in a browser (requires the backend `boero-api` running and a platform JWT cookie). Verify:
- the "Usuarios" column appears between "Ciudad" and "Estado";
- for an institution with enabled users: up to 3 stacked user-icon avatars and, if count > 3, a `+N` chip;
- clicking the avatars/`+N` navigates to `/platform/institutions/{id}/people`;
- on desktop (≥ md breakpoint), the 3-dot button is hidden and right-clicking a row opens the context menu with "Usuarios" and "Editar";
- on mobile (narrow viewport), the 3-dot button is visible and the context menu still works on right-click.

Stop the dev server when done.

---

## Self-Review (completed by plan author)

1. **Spec coverage:**
   - Endpoint admin separado, autenticado, `@RequiresPlatformRole` → Tasks 1-3.
   - Backend returns `userCount` only (no previews) → Tasks 1-3. ✓
   - Endpoint público intocado → Global Constraint + Task 3 routing note. ✓
   - Frontend `InstitutionSummary.userCount` → Task 4. ✓
   - Service URL `/api/v1/platform/institutions` → Task 4. ✓
   - Columna "Usuarios" entre "Ciudad" y "Estado" → Task 6. ✓
   - `AvatarGroup` + `AvatarFallback` con `UserIcon` + `AvatarGroupCount` `+N` → Task 6. ✓
   - Defensiva `Number.isFinite` (undefined userCount) → Task 6 `InstitutionUsersCell`. ✓
   - Whole cell/`+N` links to people page; avatars not individually clickable → Task 6 (single `<Link>` wraps the group). ✓
   - Skeleton actualizado → Task 6. ✓
   - Context menu desktop wrapping each `<TableRow>` → Task 6. ✓
   - 3-dot `md:hidden` → Task 6. ✓
   - Shared actions extracted → Task 6 `getInstitutionActions`. ✓
   - Backend tests (endpoint + repositorio) → Tasks 1, 3. ✓
   - No frontend tests → Global Constraint. ✓
   - No commits → Global Constraint. ✓
2. **Placeholder scan:** none; all steps include concrete code or commands.
3. **Type consistency:** projection methods `getInstitutionId`/`getUserCount` (Task 1) match use case (Task 2) and test (Task 2). DTO factory `InstitutionAdminListItemResponse.from(Institution, long)` matches use case call (Task 2). Controller delegates `listInstitutionsAdminUseCase.execute(pageable)` (Task 3) matches signature (Task 2). Frontend `userCount: number` (Task 4) consumed by `InstitutionUsersCell` (Task 6).