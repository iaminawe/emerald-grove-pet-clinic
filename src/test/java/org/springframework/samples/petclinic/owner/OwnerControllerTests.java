/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.springframework.samples.petclinic.owner;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledInNativeImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for {@link OwnerController}
 *
 * @author Colin But
 * @author Wick Dynex
 */
@WebMvcTest(OwnerController.class)
@DisabledInNativeImage
@DisabledInAotMode
class OwnerControllerTests {

	private static final int TEST_OWNER_ID = 1;

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private OwnerRepository owners;

	private Owner george() {
		Owner george = new Owner();
		george.setId(TEST_OWNER_ID);
		george.setFirstName("George");
		george.setLastName("Franklin");
		george.setAddress("110 W. Liberty St.");
		george.setCity("Madison");
		george.setTelephone("6085551023");
		Pet max = new Pet();
		PetType dog = new PetType();
		dog.setName("dog");
		max.setType(dog);
		max.setName("Max");
		max.setBirthDate(LocalDate.now());
		george.addPet(max);
		max.setId(1);
		return george;
	}

	@BeforeEach
	void setup() {

		Owner george = george();
		given(this.owners.findByLastNameStartingWith(eq("Franklin"), any(Pageable.class)))
			.willReturn(new PageImpl<>(List.of(george)));

		given(this.owners.findById(TEST_OWNER_ID)).willReturn(Optional.of(george));
		Visit visit = new Visit();
		visit.setDate(LocalDate.now());
		george.getPet("Max").getVisits().add(visit);

	}

	@Test
	void testInitCreationForm() throws Exception {
		mockMvc.perform(get("/owners/new"))
			.andExpect(status().isOk())
			.andExpect(model().attributeExists("owner"))
			.andExpect(view().name("owners/createOrUpdateOwnerForm"));
	}

	@Test
	void testProcessCreationFormSuccess() throws Exception {
		mockMvc
			.perform(post("/owners/new").param("firstName", "Joe")
				.param("lastName", "Bloggs")
				.param("address", "123 Caramel Street")
				.param("city", "London")
				.param("telephone", "1316761638"))
			.andExpect(status().is3xxRedirection());
	}

	@Test
	void testProcessCreationFormHasErrors() throws Exception {
		mockMvc
			.perform(post("/owners/new").param("firstName", "Joe").param("lastName", "Bloggs").param("city", "London"))
			.andExpect(status().isOk())
			.andExpect(model().attributeHasErrors("owner"))
			.andExpect(model().attributeHasFieldErrors("owner", "address"))
			.andExpect(model().attributeHasFieldErrors("owner", "telephone"))
			.andExpect(view().name("owners/createOrUpdateOwnerForm"));
	}

	@Test
	void testInitFindForm() throws Exception {
		mockMvc.perform(get("/owners/find"))
			.andExpect(status().isOk())
			.andExpect(model().attributeExists("owner"))
			.andExpect(view().name("owners/findOwners"));
	}

	@Test
	void testProcessFindFormSuccess() throws Exception {
		Owner george = george();
		Owner other = new Owner();
		other.setId(2);
		other.setFirstName("Betty");
		other.setLastName("Davis");
		other.setAddress("638 Cardinal Ave.");
		other.setCity("Sun Prairie");
		other.setTelephone("6085551749");

		Page<Owner> tasks = new PageImpl<>(List.of(george, other));
		when(this.owners.findByLastNameStartingWith(anyString(), any(Pageable.class))).thenReturn(tasks);
		mockMvc.perform(get("/owners?page=1"))
			.andExpect(status().isOk())
			.andExpect(view().name("owners/ownersList"))
			.andExpect(model().attribute("lastName", ""))
			.andExpect(model().attribute("listOwners", hasSize(2)))
			.andExpect(model().attribute("currentPage", 1))
			.andExpect(model().attributeExists("totalPages", "totalItems"));
	}

	@Test
	void testProcessFindFormWithLastNameFilterReturnsMultipleOwners() throws Exception {
		Owner george = george();
		Owner george2 = new Owner();
		george2.setId(2);
		george2.setFirstName("George2");
		george2.setLastName("Franklin");
		george2.setAddress("111 W. Liberty St.");
		george2.setCity("Madison");
		george2.setTelephone("6085551024");

		Page<Owner> tasks = new PageImpl<>(List.of(george, george2));
		when(this.owners.findByLastNameStartingWith(eq("Franklin"), any(Pageable.class))).thenReturn(tasks);
		mockMvc.perform(get("/owners?page=1").param("lastName", "Franklin"))
			.andExpect(status().isOk())
			.andExpect(view().name("owners/ownersList"))
			.andExpect(model().attribute("lastName", "Franklin"))
			.andExpect(model().attribute("listOwners", hasSize(2)))
			.andExpect(model().attribute("listOwners",
					everyItem(hasProperty("lastName", startsWith("Franklin")))));

		// Verify the repository was called with the correct filter
		verify(this.owners).findByLastNameStartingWith(eq("Franklin"), any(Pageable.class));
	}

	@Test
	void testProcessFindFormFilteredPaginationPage2() throws Exception {
		Owner franklin3 = new Owner();
		franklin3.setId(3);
		franklin3.setFirstName("Alice");
		franklin3.setLastName("Franklin");
		franklin3.setAddress("112 W. Liberty St.");
		franklin3.setCity("Madison");
		franklin3.setTelephone("6085551025");

		// Simulate page 2 of filtered results (total 7 items across pages, page size 5, showing page 2 with 2 items)
		Page<Owner> page2Results = new PageImpl<>(List.of(franklin3),
				PageRequest.of(1, 5), 7);
		when(this.owners.findByLastNameStartingWith(eq("Franklin"),
				argThat(pageable -> pageable.getPageNumber() == 1)))
			.thenReturn(page2Results);

		mockMvc.perform(get("/owners?page=2").param("lastName", "Franklin"))
			.andExpect(status().isOk())
			.andExpect(view().name("owners/ownersList"))
			.andExpect(model().attribute("lastName", "Franklin"))
			.andExpect(model().attribute("currentPage", 2))
			.andExpect(model().attribute("totalPages", 2))
			.andExpect(model().attribute("totalItems", 7L))
			.andExpect(model().attribute("listOwners", hasSize(1)))
			.andExpect(model().attribute("listOwners",
					everyItem(hasProperty("lastName", is("Franklin")))));

		// Verify the repository was called with "Franklin" filter even on page 2
		verify(this.owners).findByLastNameStartingWith(eq("Franklin"),
				argThat(pageable -> pageable.getPageNumber() == 1));
	}

	@Test
	void testFilteredResultsAreCorrectAcrossPages() throws Exception {
		// Page 1: 5 Franklins out of 7 total matching
		Owner george = george();
		Owner f2 = new Owner();
		f2.setId(2);
		f2.setFirstName("Bob");
		f2.setLastName("Franklin");
		f2.setAddress("200 Main St.");
		f2.setCity("Madison");
		f2.setTelephone("6085552001");
		Owner f3 = new Owner();
		f3.setId(3);
		f3.setFirstName("Carol");
		f3.setLastName("Franklin");
		f3.setAddress("201 Main St.");
		f3.setCity("Madison");
		f3.setTelephone("6085552002");
		Owner f4 = new Owner();
		f4.setId(4);
		f4.setFirstName("Dave");
		f4.setLastName("Franklin");
		f4.setAddress("202 Main St.");
		f4.setCity("Madison");
		f4.setTelephone("6085552003");
		Owner f5 = new Owner();
		f5.setId(5);
		f5.setFirstName("Eve");
		f5.setLastName("Franklin");
		f5.setAddress("203 Main St.");
		f5.setCity("Madison");
		f5.setTelephone("6085552004");

		List<Owner> page1Content = List.of(george, f2, f3, f4, f5);
		Page<Owner> page1 = new PageImpl<>(page1Content, PageRequest.of(0, 5), 7);
		when(this.owners.findByLastNameStartingWith(eq("Franklin"),
				argThat(pageable -> pageable.getPageNumber() == 0)))
			.thenReturn(page1);

		// Assert page 1 returns filtered results with correct pagination metadata
		mockMvc.perform(get("/owners?page=1").param("lastName", "Franklin"))
			.andExpect(status().isOk())
			.andExpect(view().name("owners/ownersList"))
			.andExpect(model().attribute("lastName", "Franklin"))
			.andExpect(model().attribute("currentPage", 1))
			.andExpect(model().attribute("totalPages", 2))
			.andExpect(model().attribute("totalItems", 7L))
			.andExpect(model().attribute("listOwners", hasSize(5)))
			.andExpect(model().attribute("listOwners",
					everyItem(hasProperty("lastName", is("Franklin")))));

		// Page 2: remaining 2 Franklins
		Owner f6 = new Owner();
		f6.setId(6);
		f6.setFirstName("Frank");
		f6.setLastName("Franklin");
		f6.setAddress("204 Main St.");
		f6.setCity("Madison");
		f6.setTelephone("6085552005");
		Owner f7 = new Owner();
		f7.setId(7);
		f7.setFirstName("Grace");
		f7.setLastName("Franklin");
		f7.setAddress("205 Main St.");
		f7.setCity("Madison");
		f7.setTelephone("6085552006");

		List<Owner> page2Content = List.of(f6, f7);
		Page<Owner> page2 = new PageImpl<>(page2Content, PageRequest.of(1, 5), 7);
		when(this.owners.findByLastNameStartingWith(eq("Franklin"),
				argThat(pageable -> pageable.getPageNumber() == 1)))
			.thenReturn(page2);

		// Assert page 2 still uses the same filter and returns correct results
		mockMvc.perform(get("/owners?page=2").param("lastName", "Franklin"))
			.andExpect(status().isOk())
			.andExpect(view().name("owners/ownersList"))
			.andExpect(model().attribute("lastName", "Franklin"))
			.andExpect(model().attribute("currentPage", 2))
			.andExpect(model().attribute("totalPages", 2))
			.andExpect(model().attribute("totalItems", 7L))
			.andExpect(model().attribute("listOwners", hasSize(2)))
			.andExpect(model().attribute("listOwners",
					everyItem(hasProperty("lastName", is("Franklin")))));
	}

	@Test
	void testPaginationWithEmptyFilterReturnsAllOwners() throws Exception {
		// Simulate all owners (mixed last names) returned when no filter applied
		Owner george = george();
		Owner betty = new Owner();
		betty.setId(2);
		betty.setFirstName("Betty");
		betty.setLastName("Davis");
		betty.setAddress("638 Cardinal Ave.");
		betty.setCity("Sun Prairie");
		betty.setTelephone("6085551749");

		Page<Owner> allOwners = new PageImpl<>(List.of(george, betty), PageRequest.of(0, 5), 2);
		when(this.owners.findByLastNameStartingWith(eq(""), any(Pageable.class))).thenReturn(allOwners);

		// With explicitly empty lastName param
		mockMvc.perform(get("/owners?page=1").param("lastName", ""))
			.andExpect(status().isOk())
			.andExpect(view().name("owners/ownersList"))
			.andExpect(model().attribute("lastName", ""))
			.andExpect(model().attribute("currentPage", 1))
			.andExpect(model().attribute("listOwners", hasSize(2)));

		// Verify repository was called with empty string (not null)
		verify(this.owners).findByLastNameStartingWith(eq(""), any(Pageable.class));
	}

	@Test
	void testModelContainsAllFilterAndPaginationAttributes() throws Exception {
		Owner george = george();
		Owner george2 = new Owner();
		george2.setId(2);
		george2.setFirstName("George2");
		george2.setLastName("Franklin");
		george2.setAddress("111 W. Liberty St.");
		george2.setCity("Madison");
		george2.setTelephone("6085551024");

		Page<Owner> filteredPage = new PageImpl<>(List.of(george, george2), PageRequest.of(0, 5), 2);
		when(this.owners.findByLastNameStartingWith(eq("Fr"), any(Pageable.class))).thenReturn(filteredPage);

		mockMvc.perform(get("/owners?page=1").param("lastName", "Fr"))
			.andExpect(status().isOk())
			.andExpect(view().name("owners/ownersList"))
			// Verify all expected model attributes are present
			.andExpect(model().attributeExists("lastName", "currentPage", "totalPages", "totalItems", "listOwners"))
			// Verify filter value is the search term, available for template pagination links
			.andExpect(model().attribute("lastName", "Fr"))
			.andExpect(model().attribute("currentPage", 1))
			.andExpect(model().attribute("totalPages", 1))
			.andExpect(model().attribute("totalItems", 2L))
			.andExpect(model().attribute("listOwners", hasSize(2)));
	}

	@Test
	void testProcessFindFormByLastName() throws Exception {
		Page<Owner> tasks = new PageImpl<>(List.of(george()));
		when(this.owners.findByLastNameStartingWith(eq("Franklin"), any(Pageable.class))).thenReturn(tasks);
		mockMvc.perform(get("/owners?page=1").param("lastName", "Franklin"))
			.andExpect(status().is3xxRedirection())
			.andExpect(view().name("redirect:/owners/" + TEST_OWNER_ID));
	}

	@Test
	void testProcessFindFormNoOwnersFound() throws Exception {
		Page<Owner> tasks = new PageImpl<>(List.of());
		when(this.owners.findByLastNameStartingWith(eq("Unknown Surname"), any(Pageable.class))).thenReturn(tasks);
		mockMvc.perform(get("/owners?page=1").param("lastName", "Unknown Surname"))
			.andExpect(status().isOk())
			.andExpect(model().attributeHasFieldErrors("owner", "lastName"))
			.andExpect(model().attributeHasFieldErrorCode("owner", "lastName", "notFound"))
			.andExpect(view().name("owners/findOwners"));

	}

	@Test
	void testInitUpdateOwnerForm() throws Exception {
		mockMvc.perform(get("/owners/{ownerId}/edit", TEST_OWNER_ID))
			.andExpect(status().isOk())
			.andExpect(model().attributeExists("owner"))
			.andExpect(model().attribute("owner", hasProperty("lastName", is("Franklin"))))
			.andExpect(model().attribute("owner", hasProperty("firstName", is("George"))))
			.andExpect(model().attribute("owner", hasProperty("address", is("110 W. Liberty St."))))
			.andExpect(model().attribute("owner", hasProperty("city", is("Madison"))))
			.andExpect(model().attribute("owner", hasProperty("telephone", is("6085551023"))))
			.andExpect(view().name("owners/createOrUpdateOwnerForm"));
	}

	@Test
	void testProcessUpdateOwnerFormSuccess() throws Exception {
		mockMvc
			.perform(post("/owners/{ownerId}/edit", TEST_OWNER_ID).param("firstName", "Joe")
				.param("lastName", "Bloggs")
				.param("address", "123 Caramel Street")
				.param("city", "London")
				.param("telephone", "1616291589"))
			.andExpect(status().is3xxRedirection())
			.andExpect(view().name("redirect:/owners/{ownerId}"));
	}

	@Test
	void testProcessUpdateOwnerFormUnchangedSuccess() throws Exception {
		mockMvc.perform(post("/owners/{ownerId}/edit", TEST_OWNER_ID))
			.andExpect(status().is3xxRedirection())
			.andExpect(view().name("redirect:/owners/{ownerId}"));
	}

	@Test
	void testProcessUpdateOwnerFormHasErrors() throws Exception {
		mockMvc
			.perform(post("/owners/{ownerId}/edit", TEST_OWNER_ID).param("firstName", "Joe")
				.param("lastName", "Bloggs")
				.param("address", "")
				.param("telephone", ""))
			.andExpect(status().isOk())
			.andExpect(model().attributeHasErrors("owner"))
			.andExpect(model().attributeHasFieldErrors("owner", "address"))
			.andExpect(model().attributeHasFieldErrors("owner", "telephone"))
			.andExpect(view().name("owners/createOrUpdateOwnerForm"));
	}

	@Test
	void testShowOwner() throws Exception {
		mockMvc.perform(get("/owners/{ownerId}", TEST_OWNER_ID))
			.andExpect(status().isOk())
			.andExpect(model().attribute("owner", hasProperty("lastName", is("Franklin"))))
			.andExpect(model().attribute("owner", hasProperty("firstName", is("George"))))
			.andExpect(model().attribute("owner", hasProperty("address", is("110 W. Liberty St."))))
			.andExpect(model().attribute("owner", hasProperty("city", is("Madison"))))
			.andExpect(model().attribute("owner", hasProperty("telephone", is("6085551023"))))
			.andExpect(model().attribute("owner", hasProperty("pets", not(empty()))))
			.andExpect(model().attribute("owner",
					hasProperty("pets", hasItem(hasProperty("visits", hasSize(greaterThan(0)))))))
			.andExpect(view().name("owners/ownerDetails"));
	}

	@Test
	public void testProcessUpdateOwnerFormWithIdMismatch() throws Exception {
		int pathOwnerId = 1;

		Owner owner = new Owner();
		owner.setId(2);
		owner.setFirstName("John");
		owner.setLastName("Doe");
		owner.setAddress("Center Street");
		owner.setCity("New York");
		owner.setTelephone("0123456789");

		when(owners.findById(pathOwnerId)).thenReturn(Optional.of(owner));

		mockMvc.perform(MockMvcRequestBuilders.post("/owners/{ownerId}/edit", pathOwnerId).flashAttr("owner", owner))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/owners/" + pathOwnerId + "/edit"))
			.andExpect(flash().attributeExists("error"));
	}

}
