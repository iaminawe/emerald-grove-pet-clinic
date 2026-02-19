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

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * Integration tests for {@link OwnerRepository} multi-criteria search query.
 * <p>
 * Uses the default H2 database populated by {@code data.sql}.
 *
 * Test data owners (from data.sql):
 * <ul>
 * <li>1 - George Franklin, Madison, 6085551023</li>
 * <li>2 - Betty Davis, Sun Prairie, 6085551749</li>
 * <li>3 - Eduardo Rodriquez, McFarland, 6085558763</li>
 * <li>4 - Harold Davis, Windsor, 6085553198</li>
 * <li>5 - Peter McTavish, Madison, 6085552765</li>
 * <li>6 - Jean Coleman, Monona, 6085552654</li>
 * <li>7 - Jeff Black, Monona, 6085555387</li>
 * <li>8 - Maria Escobito, Madison, 6085557683</li>
 * <li>9 - David Schroeder, Madison, 6085559435</li>
 * <li>10 - Carlos Estaban, Waunakee, 6085555487</li>
 * </ul>
 */
@DataJpaTest
class OwnerRepositoryTests {

	@Autowired
	private OwnerRepository owners;

	private final Pageable pageable = PageRequest.of(0, 20);

	@Test
	void shouldFindAllOwnersWhenAllFieldsEmpty() {
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("", "", "", pageable);
		assertThat(result.getTotalElements()).isEqualTo(10);
	}

	@Test
	void shouldFindOwnersByLastNameOnly() {
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("Davis", "", "", pageable);
		assertThat(result.getTotalElements()).isEqualTo(2);
		assertThat(result.getContent()).extracting(Owner::getLastName).containsOnly("Davis");
	}

	@Test
	void shouldFindOwnersByLastNamePrefix() {
		// "D" should match Davis (2) + Davis (4) = 2 owners with last name starting with
		// "D"
		// Note: there's also David Schroeder but his last name is Schroeder
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("D", "", "", pageable);
		assertThat(result.getTotalElements()).isEqualTo(2);
	}

	@Test
	void shouldFindOwnerByTelephoneOnly() {
		// George Franklin's telephone
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("", "6085551023", "", pageable);
		assertThat(result.getTotalElements()).isEqualTo(1);
		assertThat(result.getContent().get(0).getFirstName()).isEqualTo("George");
		assertThat(result.getContent().get(0).getLastName()).isEqualTo("Franklin");
	}

	@Test
	void shouldFindOwnersByCityOnly() {
		// Madison has: George Franklin, Peter McTavish, Maria Escobito, David Schroeder
		// = 4 owners
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("", "", "Madison", pageable);
		assertThat(result.getTotalElements()).isEqualTo(4);
		assertThat(result.getContent()).extracting(Owner::getCity).containsOnly("Madison");
	}

	@Test
	void shouldFindOwnersByCityCaseInsensitive() {
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("", "", "madison", pageable);
		assertThat(result.getTotalElements()).isEqualTo(4);
	}

	@Test
	void shouldFindOwnersByCitySubstring() {
		// "Mon" should match "Monona" (Jean Coleman, Jeff Black)
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("", "", "Mon", pageable);
		assertThat(result.getTotalElements()).isEqualTo(2);
		assertThat(result.getContent()).extracting(Owner::getCity).containsOnly("Monona");
	}

	@Test
	void shouldFindOwnersByLastNameAndTelephone() {
		// Davis + 6085551749 = only Betty Davis (not Harold Davis)
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("Davis", "6085551749", "", pageable);
		assertThat(result.getTotalElements()).isEqualTo(1);
		assertThat(result.getContent().get(0).getFirstName()).isEqualTo("Betty");
	}

	@Test
	void shouldFindOwnersByLastNameAndCity() {
		// Empty lastName prefix + Madison city = all Madison owners
		// But if we filter by "Franklin" + Madison = only George
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("Franklin", "", "Madison", pageable);
		assertThat(result.getTotalElements()).isEqualTo(1);
		assertThat(result.getContent().get(0).getFirstName()).isEqualTo("George");
	}

	@Test
	void shouldFindOwnersByAllThreeCriteria() {
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("Franklin", "6085551023", "Madison", pageable);
		assertThat(result.getTotalElements()).isEqualTo(1);
		assertThat(result.getContent().get(0).getFirstName()).isEqualTo("George");
	}

	@Test
	void shouldReturnEmptyWhenNoMatch() {
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("NonExistent", "", "", pageable);
		assertThat(result.getTotalElements()).isEqualTo(0);
	}

	@Test
	void shouldReturnEmptyWhenCriteriaDontMatchSameOwner() {
		// Franklin lastName + Davis telephone = no match (different owners)
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("Franklin", "6085551749", "", pageable);
		assertThat(result.getTotalElements()).isEqualTo(0);
	}

	@Test
	void shouldFindOwnersByTelephoneAndCity() {
		// Telephone for George Franklin + Madison city
		Page<Owner> result = owners.findByLastNameAndTelephoneAndCity("", "6085551023", "Madison", pageable);
		assertThat(result.getTotalElements()).isEqualTo(1);
		assertThat(result.getContent().get(0).getFirstName()).isEqualTo("George");
	}

}
