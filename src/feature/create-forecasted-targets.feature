Feature: Create forecasted targets

  Scenario: Create forecasted targets for a given business unit
    Given I have an existing company "Carbonable"
    And the following business unit:
      | id                         | name      | description           | forecastEmission | target | debt | metadata                                |
      | 01HA6TYCTWJPAP95DJ8AGEZ1TN | Factory 1 | Factory 1 description |            10000 |    100 |      | type-factory,location-france,color-blue |
    When I have a new forecasted target request:
      | year | quantity |
      | 2025 |       80 |
      | 2026 |       85 |
      | 2027 |       90 |
    And I submit the request
    Then I business unit should have forecasted targets configured:
      | year | quantity |
      | 2025 |       80 |
      | 2026 |       85 |
      | 2027 |       90 |
    And I should have 3 orders in my order book
