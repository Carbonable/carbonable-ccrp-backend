Feature: Add allocations for business unit

  Scenario: Allocate 50% of the stock
    Given I have an existing company "Carbonable"
    And company "Carbonable" has a project "01H5739RVDH5MFVTHD90TBR92J" called "Banegas Farm" described as "Banegas Farm project" with this absorption curve:
      | timestamp  | absorption | issuedPrice |
      | 1667314458 |          0 | 11 |
      | 1730472858 |   12584000 | 11 |
      | 1793544858 |   40898000 | 11 |
      | 1856703258 |  100672000 | 11 |
      | 1919775258 |  202917000 | 11 |
      | 1982933658 |  333476000 | 11 |
      | 2109164058 |  629200000 | 11 |
      | 2235394458 |  915486000 | 11 |
      | 2330002458 | 1108965000 | 11 |
      | 2393160858 | 1223794000 | 11 |
      | 2456232858 | 1335477000 | 11 |
      | 2582463258 | 1528956000 | 11 |
      | 2614085658 | 1573000000 | 11 |
    And company "Carbonable" has a project "01H5739RVSRKHFVNM47AE4NHMK" called "Las Delicias" described as "Las Delicias project" with this absorption curve:
      | timestamp  | absorption | issuedPrice |
      | 1667314458 |          0 | 11 |
      | 1730472858 |  126105000 | 11 |
      | 1793544858 |  317064000 | 11 |
      | 1856703258 |  587289000 | 11 |
      | 1919775258 |  907956000 | 11 |
      | 1982933658 | 1275462000 | 11 |
      | 2046005658 | 1686204000 | 11 |
      | 2109164058 | 2140182000 | 11 |
      | 2172236058 | 2630190000 | 11 |
      | 2235394458 | 3152625000 | 11 |
      | 2298466458 | 3603000000 | 11 |
    And the following business unit:
      | id                         | name      | description           | forecastEmission | target | debt | metadata                                |
      | 01HA6TYCTWJPAP95DJ8AGEZ1TN | Factory 1 | Factory 1 description |            10000 |    100 |      | type-factory,location-france,color-blue |
    And the business unit with id "01HA6TYCTWJPAP95DJ8AGEZ1TN" have the following emissions:
      | year | quantity   |
      | 2023 | 1000000000 |
      | 2024 | 1000000000 |
      | 2025 | 1000000000 |
      | 2026 | 1000000000 |
      | 2027 | 1000000000 |
      | 2028 | 1000000000 |
      | 2029 | 1000000000 |
      | 2030 | 1000000000 |
      | 2031 | 1000000000 |
      | 2032 | 1000000000 |
    And the business unit with id "01HA6TYCTWJPAP95DJ8AGEZ1TN" have the following targets:
      | year | quantity |
      | 2023 |       10 |
      | 2024 |       20 |
      | 2025 |       30 |
      | 2026 |       40 |
      | 2027 |       50 |
      | 2028 |       60 |
      | 2029 |       70 |
      | 2030 |       80 |
      | 2031 |       90 |
      | 2032 |      100 |
    When I have an add allocation request:
      | projectId                  | business_unit_id           | cc_amount |
      | 01H5739RVDH5MFVTHD90TBR92J | 01HA6TYCTWJPAP95DJ8AGEZ1TN |       50  |
    And I submit the request
    Then the business unit should have 1 allocations attached
    And stocks should properly assigned
    And I should not have any errors
    And I should have 10 orders created
    And 1 event should have been dispatched with key "allocations.finished"
