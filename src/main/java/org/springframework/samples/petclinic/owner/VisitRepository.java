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

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

/**
 * Repository class for <code>Visit</code> domain objects. All method names are compliant
 * with Spring Data naming conventions so this interface can easily be extended for Spring
 * Data. See:
 * https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories.query-methods.query-creation
 *
 * @author Spring PetClinic contributors
 */
public interface VisitRepository extends JpaRepository<Visit, Integer> {

	/**
	 * Retrieve all {@link Visit}s occurring between the given start and end dates
	 * (inclusive), fetching the associated {@link Pet} and {@link Owner} eagerly to avoid
	 * lazy loading issues.
	 * @param start the start date (inclusive)
	 * @param end the end date (inclusive)
	 * @return a List of matching {@link Visit}s ordered by date ascending
	 */
	@Query("SELECT v FROM Visit v JOIN FETCH v.pet p JOIN FETCH p.owner o WHERE v.date BETWEEN :start AND :end ORDER BY v.date ASC")
	@Transactional(readOnly = true)
	List<Visit> findByDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

}
