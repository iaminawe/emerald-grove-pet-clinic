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
package org.springframework.samples.petclinic.vet;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author Juergen Hoeller
 * @author Mark Fisher
 * @author Ken Krebs
 * @author Arjen Poutsma
 */
@Controller
class VetController {

	private final VetRepository vetRepository;

	public VetController(VetRepository vetRepository) {
		this.vetRepository = vetRepository;
	}

	@GetMapping("/vets.html")
	public String showVetList(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "") String lastName,
			@RequestParam(required = false) String specialty, Model model) {

		// Fetch vets filtered by last name (empty string matches all)
		Page<Vet> lastNamePage = findPaginatedForVetsLastName(1, lastName, Integer.MAX_VALUE);
		Collection<Vet> lastNameVets = lastNamePage.getContent();

		// Extract unique specialty names for the filter dropdown
		List<String> specialtyNames = lastNameVets.stream()
			.flatMap(vet -> vet.getSpecialties().stream())
			.map(Specialty::getName)
			.distinct()
			.sorted()
			.collect(Collectors.toList());
		model.addAttribute("specialties", specialtyNames);

		// Normalize selected specialty (null means "all")
		String selected = (specialty != null && !specialty.isEmpty()) ? specialty : null;
		model.addAttribute("selectedSpecialty", selected);
		model.addAttribute("lastName", lastName);

		// Apply specialty filter on top of last-name results
		List<Vet> filteredVets = filterVetsBySpecialty(lastNameVets, selected);
		Page<Vet> paginated = paginateResults(filteredVets, page);

		return addPaginationModel(page, paginated, model);
	}

	private List<Vet> filterVetsBySpecialty(Collection<Vet> vets, String specialty) {
		if (specialty == null) {
			return new ArrayList<>(vets);
		}
		if ("none".equalsIgnoreCase(specialty)) {
			return vets.stream().filter(vet -> vet.getNrOfSpecialties() == 0).collect(Collectors.toList());
		}
		return vets.stream()
			.filter(vet -> vet.getSpecialties().stream().anyMatch(s -> s.getName().equalsIgnoreCase(specialty)))
			.collect(Collectors.toList());
	}

	private Page<Vet> paginateResults(List<Vet> vets, int page) {
		int pageSize = 5;
		Pageable pageable = PageRequest.of(page - 1, pageSize);
		int start = (int) pageable.getOffset();
		int end = Math.min(start + pageSize, vets.size());
		List<Vet> pageContent = (start < vets.size()) ? vets.subList(start, end) : Collections.emptyList();
		return new PageImpl<>(pageContent, pageable, vets.size());
	}

	private String addPaginationModel(int page, Page<Vet> paginated, Model model) {
		List<Vet> listVets = paginated.getContent();
		model.addAttribute("currentPage", page);
		model.addAttribute("totalPages", paginated.getTotalPages());
		model.addAttribute("totalItems", paginated.getTotalElements());
		model.addAttribute("listVets", listVets);
		return "vets/vetList";
	}

	private Page<Vet> findPaginatedForVetsLastName(int page, String lastName, int pageSize) {
		Pageable pageable = PageRequest.of(page - 1, pageSize);
		return vetRepository.findByLastNameStartingWith(lastName, pageable);
	}

	@GetMapping({ "/vets" })
	public @ResponseBody Vets showResourcesVetList() {
		// Here we are returning an object of type 'Vets' rather than a collection of Vet
		// objects so it is simpler for JSon/Object mapping
		Vets vets = new Vets();
		vets.getVetList().addAll(this.vetRepository.findAll());
		return vets;
	}

}
