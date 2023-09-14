Feature: Create forecasted emissions

  Scenario: Create forecasted emissions for a given business unit
    Given I have an existing company "Carbonable"
    And the following business unit:
      | id                         | name      | description           | forecastEmission | target | debt | metadata                                |
      | 01HA6TYCTWJPAP95DJ8AGEZ1TN | Factory 1 | Factory 1 description |            10000 |    100 |      | type-factory,location-france,color-blue |
    When I have a new forecasted emission request:
      | year | quantity |
      | 2025 |    11000 |
      | 2026 |    12000 |
      | 2027 |    13000 |
    And I submit the request
    Then I business unit should have forecasted emissions configured:
      | year | quantity |
      | 2025 |    11000 |
      | 2026 |    12000 |
      | 2027 |    13000 |
