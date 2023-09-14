Feature: Create a new business unit

  Scenario: Create a new business unit
    Given I have an existing company "Carbonable"
    And I have a new business unit input:
      | id                         | name      | description           | forecastEmission | target | debt | metadata                                |
      | 01HA6TYCTWJPAP95DJ8AGEZ1TN | Factory 1 | Factory 1 description |            10000 |    100 |      | type-factory,location-france,color-blue |
    When I submit the request
    Then I should have 1 business unit in the company
