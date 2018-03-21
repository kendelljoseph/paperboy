/*eslint no-unused-vars: [0]*/

// Dependencies
// ------------
const chai         = require(`chai`);
const should       = chai.should();
const expect       = chai.expect;
const {Given, When, Then, setDefaultTimeout, AfterAll} = require(`cucumber`);

// Paperboy
// --------
Given(/^paperboy is ready$/, function(done){
  expect(this.Paperboy).to.exist;
  expect(this.Paperboy).to.be.a(`function`);
  expect(this.paperboy).to.exist;
  expect(this.paperboy.push).to.be.a(`function`);
  expect(this.paperboy.pull).to.be.a(`function`);
  expect(this.paperboy.remove).to.be.a(`function`);
  expect(this.paperboy.once).to.be.a(`function`);
  expect(this.paperboy.on).to.be.a(`function`);
  expect(this.paperboy.trigger).to.be.a(`function`);
  expect(this.paperboy.removeListener).to.be.a(`function`);
  expect(this.paperboy.listenerCount).to.be.a(`function`);
  done();
});

When(/^paperboy pushes a key (.*) with the value (.*) without an expiration time$/, function(key, value){
  expect(this.sampleData).should.be.an(`object`);
  expect(this.sampleData.paperboy).should.be.an(`object`);
  expect(this.sampleData.paperboy.keys).should.be.an(`object`);
  expect(this.sampleData.paperboy.values).should.be.an(`object`);
  expect(this.sampleData.paperboy.keys[key]).should.exist;
  expect(this.sampleData.paperboy.values[value]).should.exist;

  const testKey   = this.sampleData.paperboy.keys[key];
  const testValue = this.sampleData.paperboy.values[value];

  return this.paperboy.push(testKey, testValue)
    .then((result) => {
      expect(result).to.exist;
      expect(result[testKey]).should.exist;
      result[testKey].should.equal(testValue);
      return result;
    });
});

When(/^paperboy pushes a key (.*) with the value (.*) set to expire in (.*) seconds$/, function(key, value, expirationTime, done){
  expect(this.sampleData).should.be.an(`object`);
  expect(this.sampleData.paperboy).should.be.an(`object`);
  expect(this.sampleData.paperboy.keys).should.be.an(`object`);
  expect(this.sampleData.paperboy.values).should.be.an(`object`);
  expect(this.sampleData.paperboy.keys[key]).should.exist;
  expect(this.sampleData.paperboy.values[value]).should.exist;

  const testKey   = this.sampleData.paperboy.keys[key];
  const testValue = this.sampleData.paperboy.values[value];

  this.paperboy.push(testKey, testValue, `EX`, parseInt(expirationTime, 10))
    .then((result) => {
      expect(result).to.exist;
      expect(result[testKey]).should.exist;
      result[testKey].should.equal(testValue);
      return result;
    })
    .then(() => {
      setTimeout(done, 100 + (parseInt(expirationTime, 10) * 1000));
    });
});

When(/^paperboy pulls a key set to (.*)$/, function(key){
  expect(this.sampleData).should.be.an(`object`);
  expect(this.sampleData.paperboy).should.be.an(`object`);
  expect(this.sampleData.paperboy.keys).should.be.an(`object`);
  expect(this.sampleData.paperboy.keys[key]).should.exist;

  const testKey   = this.sampleData.paperboy.keys[key];

  return this.paperboy.pull(testKey)
    .then((result) => {
      expect(result).to.exist;

      this.response = this.response || {};
      this.response[testKey] = result;
      return result;
    });
});

When(/^paperboy removes a key set to (.*)$/, function(key){
  expect(this.sampleData).should.be.an(`object`);
  expect(this.sampleData.paperboy).should.be.an(`object`);
  expect(this.sampleData.paperboy.keys).should.be.an(`object`);
  expect(this.sampleData.paperboy.keys[key]).should.exist;

  const testKey   = this.sampleData.paperboy.keys[key];

  return this.paperboy.remove(testKey)
    .then((result) => {
      expect(result).to.equal(1);
    });
});

When(/^paperboy should pull nothing for a key set to (.*)$/, function(key){
  expect(this.sampleData).should.be.an(`object`);
  expect(this.sampleData.paperboy).should.be.an(`object`);
  expect(this.sampleData.paperboy.keys).should.be.an(`object`);
  expect(this.sampleData.paperboy.keys[key]).should.exist;

  const testKey   = this.sampleData.paperboy.keys[key];

  return this.paperboy.pull(testKey)
    .then((result) => {
      expect(result).to.be.null;
      return result;
    });
});

When(/^paperboy subscribes to an event named (.*)$/, function(event){
  expect(this.sampleData).should.be.an(`object`);
  expect(this.sampleData.paperboy).should.be.an(`object`);
  expect(this.sampleData.paperboy.events).should.be.an(`object`);
  expect(this.sampleData.paperboy.events[event]).should.exist;

  const testEvent   = this.sampleData.paperboy.events[event];

  return this.paperboy.once(testEvent, (message) => {
    this.response = this.response || {};
    this.response[testEvent] = message;
  });
});

When(/^paperboy triggers (.*) to an event named (.*)$/, function(data, event){
  expect(this.sampleData).should.be.an(`object`);
  expect(this.sampleData.paperboy).should.be.an(`object`);
  expect(this.sampleData.paperboy.events).should.be.an(`object`);
  expect(this.sampleData.paperboy.data).should.be.an(`object`);
  expect(this.sampleData.paperboy.events[event]).should.exist;
  expect(this.sampleData.paperboy.data[data]).should.exist;

  const testEvent = this.sampleData.paperboy.events[event];
  const testData  = this.sampleData.paperboy.data[data];

  return this.paperboy.trigger(testEvent, testData);
});

When(/^paperboy listens to an event (.*) then triggers (.*)$/, function(event, data, done){
  expect(this.sampleData).should.be.an(`object`);
  expect(this.sampleData.paperboy).should.be.an(`object`);
  expect(this.sampleData.paperboy.events).should.be.an(`object`);
  expect(this.sampleData.paperboy.data).should.be.an(`object`);
  expect(this.sampleData.paperboy.events[event]).should.exist;
  expect(this.sampleData.paperboy.data[data]).should.exist;

  const testEvent = this.sampleData.paperboy.events[event];
  const testData  = this.sampleData.paperboy.data[data];

  this.paperboy.once(testEvent, (message) => {
    this.response = this.response || {};
    this.response[testEvent] = message;
    done();
  })
    .then(() => {
      this.paperboy.trigger(testEvent, testData);
    });
});

When(/^the paperboy response should have a (.*) property/, function(data, done){
  expect(this.sampleData).should.be.an(`object`);
  expect(this.sampleData.paperboy).should.be.an(`object`);
  expect(this.sampleData.paperboy.events).should.be.an(`object`);
  expect(this.sampleData.paperboy.events[data]).should.exist;
  expect(this.response).to.exist;

  const testEvent  = this.sampleData.paperboy.events[data];
  expect(this.response[testEvent]).to.exist;
  done();
});

// Cucucmber must be exited manually
AfterAll(function(){
  setTimeout(function(){
    process.exit(0);
  }, 2000);
});