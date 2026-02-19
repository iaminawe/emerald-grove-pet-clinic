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

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository class for <code>Owner</code> domain objects. All method names are compliant
 * with Spring Data naming conventions so this interface can easily be extended for Spring
 * Data. See:
 * https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.query-methods.query-creation
 *
 * @author Ken Krebs
 * @author Juergen Hoeller
 * @author Sam Brannen
 * @author Michael Isvy
 * @author Wick Dynex
 */
public interface OwnerRepository extends JpaRepository<Owner, Integer> {

	/**
	 * Retrieve {@link Owner}s from the data store by last name, returning all owners
	 * whose last name <i>starts</i> with the given name.
	 * @param lastName Value to search for
	 * @return a Collection of matching {@link Owner}s (or an empty Collection if none
	 * found)
	 */
	Page<Owner> findByLastNameStartingWith(String lastName, Pageable pageable);

	/**
	 * Retrieve {@link Owner}s from the data store by any combination of last name,
	 * telephone, and city. Each filter is only applied when its parameter is non-empty.
	 * When all parameters are empty, all owners are returned (same as a parameterless
	 * search).
	 * @param lastName Value to search for (prefix match, case-insensitive)
	 * @param telephone Exact telephone number to match (only applied when non-empty)
	 * @param city City substring to match (case-insensitive, only applied when non-empty)
	 * @return a {@link Page} of matching {@link Owner}s (or an empty Page if none found)
	 */
	@Query("SELECT DISTINCT owner FROM Owner owner LEFT JOIN FETCH owner.pets "
			+ "WHERE (:lastName IS NULL OR LOWER(owner.lastName) LIKE LOWER(CONCAT(:lastName, '%'))) "
			+ "AND (:telephone = '' OR owner.telephone = :telephone) "
			+ "AND (:city = '' OR LOWER(owner.city) LIKE LOWER(CONCAT('%', :city, '%')))")
	Page<Owner> findByLastNameAndTelephoneAndCity(@Param("lastName") String lastName,
			@Param("telephone") String telephone, @Param("city") String city, Pageable pageable);

	/**
	 * Retrieve an {@link Owner} from the data store by id.
	 * <p>
	 * This method returns an {@link Optional} containing the {@link Owner} if found. If
	 * no {@link Owner} is found with the provided id, it will return an empty
	 * {@link Optional}.
	 * </p>
	 * @param id the id to search for
	 * @return an {@link Optional} containing the {@link Owner} if found, or an empty
	 * {@link Optional} if not found.
	 * @throws IllegalArgumentException if the id is null (assuming null is not a valid
	 * input for id)
	 */
	Optional<Owner> findById(Integer id);

	/**
	 * Retrieve {@link Owner}s from the data store that match the given first name, last
	 * name, and telephone number. Used to detect duplicate owners before creation.
	 * @param firstName the owner's first name
	 * @param lastName the owner's last name
	 * @param telephone the owner's telephone number
	 * @return a list of matching {@link Owner}s (or an empty list if none found)
	 */
	List<Owner> findByFirstNameAndLastNameAndTelephone(String firstName, String lastName, String telephone);

}
