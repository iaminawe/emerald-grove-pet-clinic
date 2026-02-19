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

import org.springframework.samples.petclinic.owner.Visit;
import org.springframework.samples.petclinic.owner.VisitRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Controller for displaying upcoming visits.
 *
 * @author Spring PetClinic contributors
 */
@Controller
class UpcomingVisitsController {

	private final VisitRepository visitRepository;

	public UpcomingVisitsController(VisitRepository visitRepository) {
		this.visitRepository = visitRepository;
	}

	@GetMapping("/visits/upcoming")
	public String showUpcomingVisits(@RequestParam(defaultValue = "7") int days, Model model) {
		LocalDate today = LocalDate.now();
		LocalDate end = today.plusDays(days);
		List<Visit> visits = this.visitRepository.findByDateBetween(today, end);
		model.addAttribute("visits", visits);
		model.addAttribute("days", days);
		return "visits/upcomingVisits";
	}

}
