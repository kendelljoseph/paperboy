Feature: Paperboy

  Scenario: A system wants to use paperboy to communicate
    Given paperboy is ready
      And paperboy pushes a key test key with the value test value without an expiration time
    Then paperboy pulls a key set to test key
      And paperboy removes a key set to test key
    Then paperboy pushes a key test key with the value test value set to expire in 1 seconds
      And paperboy should pull nothing for a key set to test key
    Then paperboy subscribes to an event named test event
      And paperboy triggers test data to an event named test event
    Then the paperboy response should have a test event property
      And paperboy listens to an event test event then triggers test data