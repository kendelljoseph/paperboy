Feature: The system has modules/libraries it depends on to do things

  In order to insure that the systems services will run
  The system should check if dependencies are installed

  Scenario: The system needs to use a resource installed with NPM
    Given the system has dependencies
    Then the system has the dependency dotenv installed
      And the system has the dependency ioredis installed
      And the system has the dependency generic-pool installed
      And the system has the development dependency chai included in the package
      And the system has the development dependency cucumber included in the package
      And the system has the development dependency mocha included in the package