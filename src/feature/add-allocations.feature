Feature: Add allocations for business unit

  Scenario: Add allocation to compensate on business unit consumption
    Given I have an existing company "Carbonable"
    And company "Carbonable" has a project "01H5739RVDH5MFVTHD90TBR92J" called "Banegas Farm" described as "Banegas Farm project" with this absorption curve:
      | timestamp  | absorption |
      | 1667314458 |          0 |
      | 1730472858 |   12584000 |
      | 1793544858 |   40898000 |
      | 1856703258 |  100672000 |
      | 1919775258 |  202917000 |
      | 1982933658 |  333476000 |
      | 2109164058 |  629200000 |
      | 2235394458 |  915486000 |
      | 2330002458 | 1108965000 |
      | 2393160858 | 1223794000 |
      | 2456232858 | 1335477000 |
      | 2582463258 | 1528956000 |
      | 2614085658 | 1573000000 |
    And company "Carbonable" has a project "01H5739RVSRKHFVNM47AE4NHMK" called "Las Delicias" described as "Las Delicias project" with this absorption curve:
      | timestamp  | absorption |
      | 1667314458 |          0 |
      | 1730472858 |  126105000 |
      | 1793544858 |  317064000 |
      | 1856703258 |  587289000 |
      | 1919775258 |  907956000 |
      | 1982933658 | 1275462000 |
      | 2046005658 | 1686204000 |
      | 2109164058 | 2140182000 |
      | 2172236058 | 2630190000 |
      | 2235394458 | 3152625000 |
      | 2298466458 | 3603000000 |
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
      | 01H5739RVDH5MFVTHD90TBR92J | 01HA6TYCTWJPAP95DJ8AGEZ1TN |       100 |
      | 01H5739RVSRKHFVNM47AE4NHMK | 01HA6TYCTWJPAP95DJ8AGEZ1TN |       100 |
    And I submit the request
    Then the business unit should have 2 allocations attached
    And I should not have any errors
    And I should have 10 orders created
    And 1 event should have been dispatched with key "allocations.finished"
