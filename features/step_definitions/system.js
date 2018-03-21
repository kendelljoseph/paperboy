/*eslint no-unused-vars: [0] no-console: ["error", { allow: ["info", "error"] }] */

// Dependencies
// ------------
const chai   = require(`chai`);
const should = chai.should();
const expect = chai.expect;
const {Given, When, Then} = require(`cucumber`);

// Environmental variables
// -----------------------
Given(/^a system has an environmental variable set called (.*)$/, function(environmentalVariable, done){
  if(process.env[environmentalVariable] === undefined){
    throw new Error(`Missing variable in process that is loaded from the .env file, ${environmentalVariable} - set this value to at least something blank like: ${environmentalVariable}=""`);
  }
  done();
});