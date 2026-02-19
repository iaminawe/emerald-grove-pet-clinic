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

package org.springframework.samples.petclinic.visit;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledInNativeImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.samples.petclinic.owner.Owner;
import org.springframework.samples.petclinic.owner.Pet;
import org.springframework.samples.petclinic.owner.PetType;
import org.springframework.samples.petclinic.owner.Visit;
import org.springframework.samples.petclinic.owner.VisitRepository;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasProperty;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

/**
 * Test class for {@link UpcomingVisitsController}
 *
 * @author Spring PetClinic contributors
 */
@WebMvcTest(UpcomingVisitsController.class)
@DisabledInNativeImage
@DisabledInAotMode
class UpcomingVisitsControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private VisitRepository visitRepository;

	private Visit createVisit(int id, String description, LocalDate date, String petName, String ownerFirst,
			String ownerLast) {
		Owner owner = new Owner();
		owner.setId(id);
		owner.setFirstName(ownerFirst);
		owner.setLastName(ownerLast);
		owner.setAddress("123 Test St.");
		owner.setCity("TestCity");
		owner.setTelephone("1234567890");

		PetType type = new PetType();
		type.setName("dog");

		Pet pet = new Pet();
		pet.setId(id);
		pet.setName(petName);
		pet.setType(type);
		pet.setBirthDate(LocalDate.of(2020, 1, 1));
		owner.addPet(pet);
		pet.setOwner(owner);

		Visit visit = new Visit();
		visit.setId(id);
		visit.setDate(date);
		visit.setDescription(description);
		visit.setPet(pet);
		pet.addVisit(visit);

		return visit;
	}

	@BeforeEach
	void setup() {
		LocalDate today = LocalDate.now();
		Visit visit1 = createVisit(1, "annual checkup", today.plusDays(1), "Leo", "George", "Franklin");
		Visit visit2 = createVisit(2, "vaccination booster", today.plusDays(3), "Rosy", "Eduardo", "Rodriquez");
		Visit visit3 = createVisit(3, "dental cleaning", today.plusDays(5), "Iggy", "Harold", "Davis");
		Visit visit4 = createVisit(4, "skin allergy follow-up", today.plusDays(10), "Lucky", "Carlos", "Estaban");

		List<Visit> weekVisits = List.of(visit1, visit2, visit3);
		List<Visit> twoWeekVisits = List.of(visit1, visit2, visit3, visit4);

		given(this.visitRepository.findByDateBetween(eq(today), eq(today.plusDays(7)))).willReturn(weekVisits);
		given(this.visitRepository.findByDateBetween(eq(today), eq(today.plusDays(14)))).willReturn(twoWeekVisits);
	}

	@Test
	void testDefaultDays() throws Exception {
		mockMvc.perform(get("/visits/upcoming"))
			.andExpect(status().isOk())
			.andExpect(view().name("visits/upcomingVisits"))
			.andExpect(model().attributeExists("visits"))
			.andExpect(model().attributeExists("days"));
	}

	@Test
	void testCustomDaysParam() throws Exception {
		mockMvc.perform(get("/visits/upcoming").param("days", "14"))
			.andExpect(status().isOk())
			.andExpect(view().name("visits/upcomingVisits"))
			.andExpect(model().attributeExists("visits"))
			.andExpect(model().attribute("days", 14));
	}

	@Test
	void testDaysParamDefaultsTo7() throws Exception {
		mockMvc.perform(get("/visits/upcoming"))
			.andExpect(status().isOk())
			.andExpect(model().attribute("days", 7))
			.andExpect(model().attribute("visits", hasSize(3)));
	}

	@Test
	void testCustomDaysReturnsMoreVisits() throws Exception {
		mockMvc.perform(get("/visits/upcoming").param("days", "14"))
			.andExpect(status().isOk())
			.andExpect(model().attribute("visits", hasSize(4)));
	}

	@Test
	void testModelContainsExpectedAttributes() throws Exception {
		mockMvc.perform(get("/visits/upcoming"))
			.andExpect(status().isOk())
			.andExpect(model().attribute("visits", hasSize(3)))
			.andExpect(model().attribute("visits",
					org.hamcrest.Matchers.hasItem(hasProperty("description", is("annual checkup")))))
			.andExpect(model().attribute("visits",
					org.hamcrest.Matchers.hasItem(hasProperty("description", is("vaccination booster")))))
			.andExpect(model().attribute("visits",
					org.hamcrest.Matchers.hasItem(hasProperty("description", is("dental cleaning")))));
	}

}
