Feature: The system has environmental variables set it depends on to do things

  In order to insure that the systems services will run
  The system should check if environmental variables are set

  Scenario: The system needs local environmental variables in order to run
    Given a system has an environmental variable set called PAPERBOY_REDIS_URL