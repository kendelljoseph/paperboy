/*eslint no-unused-vars: [0]*/

// Local dependency step definitions
// ---------------------------------

// Dependencies
// ------------
const chai     = require(`chai`);
const should   = chai.should();
const expect   = chai.expect;
const { Given } = require(`cucumber`);

Given(/^the system has dependencies$/, function(done){
  this.dependencies.should.exist;
  this.package.should.exist;
  this.dependencies.should.be.an(`object`);
  this.package.should.be.an(`object`);
  done();
});

Given(/^the system has the dependency (.*) installed$/, function(name, done){
  this.dependencies[name].should.exist;
  this.package.dependencies[name].should.exist;
  done();
});

Given(/^the system has the development dependency (.*) included in the package$/, function(name, done){
  this.package.devDependencies[name].should.exist;
  done();
});