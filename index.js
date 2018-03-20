// # Paperboy
// ### An intersystem communicator
// ![gif](https://media.giphy.com/media/eoUwc3wSwDOvK/giphy.gif)
// 
// **Example:** Paperboy can be used for data storage
// ```
// const Paperboy = require(`./library/paperboy`);
// const paperboy = new Paperboy({connectionName: `data-example`});
// paperboy.push(`example`, `Hello World!`);
// paperboy.pull(`example`)
//  .then((result) => {
//    console.log(result); // "Hello World!" is logged to the console
//  });
// ```

// **Example:** Paperboy can be used as a publish/subscribe service
// ```
// const Paperboy = require(`./library/paperboy`);
// const paperboy = new Paperboy({connectionName: `pubsub-example`});
// paperboy.on(`my-event`, (data) => {
//   console.log(data); // "Hello World!" is logged to the console
// });
//
// paperboy.trigger(`my-event`, `Hello World!`);
// ```
// ---

// Paperboy loads modules it depends on to operate
const { ioredis:Redis, 'generic-pool': genericPool, dotenv } = require(`./dependencies`);

// Paperboy adds the `.env file` variables to the process
dotenv.config();

// Paperboy loads the native event emitter module
const EventEmitter = require(`events`);

// Paperboy creates an event metter using the native event emitter module
class PaperboyEventEmitter extends EventEmitter {}
const paperboyEvent = new PaperboyEventEmitter();

// #### Paperboy can create a Redis connection pool
const createRedisConnectionPool = ({connectionName = `unnamed-connection`} = {}, poolType = `generic`) => {
  // **Scenario:** The system requests a Redis connection
  return genericPool.createPool({
    // **Given** the connection pool needs to create a new Redis connection
    create: function() {
      // **When** the connection pool sets the name of the connection
      const name = `@${connectionName}-${poolType}`;
      
      // **And** the connection pool creates a connection to _Redis_ using the _URL_ from the `.env` file
      const connection = new Redis(process.env.PAPERBOY_REDIS_URL, {connectionName: name});

      // **Then** the connection will listen to _messages_ and emit an event _by channel_
      connection.on(`message`, (channel, message) => {
        paperboyEvent.emit(channel, message);
      });
      
      // **And** the creation method will return the new connection
      return Promise.resolve(connection);
    },
    
    // **Given** the connection pool needs to destroy a connection
    destroy: function(connection) {
      // **Then** the connection pool will returns the connection _(it does not destroy it yet)_
      return Promise.resolve(connection);
    },
    // The connection pool has settings
  }, {
    // - The connection pool has a minimum number of connections set to `0`
    min: 0,
    
    // - The connection pool has a maximum number of connections set to `1`
    max: 1,
    
    // - The connection pool automatically creates one connection
    autostart: true
  });
};

// #### The Paperboy module is a class
module.exports = class Paperboy {
  
  // Paperboy creates pools of connections for `data` operations and `triggering`, and `subscribing` to events
  constructor(options = {}) {

    // Paperboy has `3` Redis connection pools
    // > Redis connections in subscriber mode can _not_ trigger events or modify data!
    // > [source](https://github.com/luin/ioredis)
    this.pool = {
      // - Paperboy has a connection pool for data operations
      data     : createRedisConnectionPool(options, `data`),
      
      // - Paperboy has a connection pool for triggering events
      trigger  : createRedisConnectionPool(options, `trigger`),
      
      // - Paperboy has a connection pool for subscribing to events
      subscribe: createRedisConnectionPool(options, `subscribe`)
    };

    return this;
  }

  // #### Paperboy can store data
  push(key, value, args, details) {
    return new Promise((resolve, reject) => {
      // - Data without a key is rejected
      if(!key) return reject(new Error(`no key`));

      // - Data without a value is rejected
      if(!value) return reject(new Error(`no value`));

      // Paperboy creates a copy of the data to send as a reply
      let reply = {};
      reply[key] = value;

      // Paperboy can release the `data` connection back into the [connection pool](#section-8)
      const releaseConnection = (connection) => this.pool.data.release(connection);

      // **Given** there are no special requirements to store the data
      if(!args && !details){
        // **When** a connection is acquired from the `data` connection pool
        return this.pool.data.acquire()
          .then((connection) => {
            // **Then** Paperboy will store the data
            connection.set(key, value)
              .then(() => {
                // **And** Paperboy will release the Redis data connection
                releaseConnection(connection);
                
                // **And** Paperboy will return a copy of the data that was stored
                resolve(reply);
              })
              .catch((error) => {
                // **But** Paperboy will release the connection when there are errors
                releaseConnection(connection);
                
                // **And** Paperboy will return the error that was caught
                reject(error);
              });
          })
          
          // Paperboy will reject pushed data if there is a problem acquiring a connection
          .catch(reject);
      }

      // **Given** there are special requirements to store the data
      this.pool.data.acquire()
        .then((connection) => {
          // **Then** Paperboy will store the data using the special requirements
          // > Special requirements in this case is an expiration time!
          // > [source](https://redis.io/commands/set)
          connection.set(key, value, args, details)
            .then(() => {
              releaseConnection(connection);
              resolve(reply);
            })
            .catch((error) => {
              releaseConnection(connection);
              reject(error);
            });
        })
        .catch(reject);
    });
  }

  // #### Paperboy can retrieve data
  // - The data can be retrieved by the name of the `key`
  pull(key) {
    // **Given** a connection is acquired from the `data` connection pool
    return this.pool.data.acquire()
      .then((connection) => {
        // **When** Paperboy retrieves the data by the name of the `key`
        return connection.get(key)
          .then((data) => {
            // **Then** Paperboy will release the connection into the pool
            this.pool.data.release(connection);
            // **And** Paperboy will return the data that was retrieved
            return data;
          })
          .catch((error) => {
            // **But** Paperboy will release the connection if there was an error
            this.pool.data.release(connection);
            // **And** Paperboy will return the error that was caught
            return error;
          });
      });
  }

  // #### Paperboy can remove data
  // - Data can be removed by the name of the `key`
  remove(key) {
    return new Promise((resolve, reject) => {
      // - Removal requests without a key are rejected
      if(!key) return reject(new Error(`no key`));
      
      // **Given** a connection is acquired from the `data` connection pool
      this.pool.data.acquire()
        .then((connection) => {
          // **When** Paperboy removes the data using the key
          return connection.del(key)
            .then((data) => {
              // **Then** Paperboy will release the connection into the pool
              this.pool.data.release(connection);
              
              // **And** Paperboy will return the data that was removed
              return data;
            })
            .then(resolve)
            .catch((error) => {
              // **But** Paperboy will release the connection if there was an error
              this.pool.data.release(connection);
              
              // **And** Paperboy will return the error that was caught
              reject(error);
            });
        })
        
        // Paperboy will reject deleted data if there is a problem acquiring a connection
        .catch(reject);
    });
  }

  // #### Paperboy can subscribe to an event once
  once(event, callback) {
    return new Promise((resolve, reject) => {
      // Paperboy can release `subscribe` connections
      const releaseConnection = (connection) => this.pool.subscribe.release(connection);
      
      // **Given** a connection is acquired from the `subscribe` connection pool
      this.pool.subscribe.acquire()
        .then((connection) => {

          // **And** Paperboy listens to the event once
          paperboyEvent.once(event, callback);

          // **Then** the connection subscribes to the event
          connection.subscribe(event, (error) => {
            // **But** Paperboy will reject the subscription request if there are errors
            if(error) return reject(error);
            
            // **And** Paperboy will resolve without errors if the subscription was made successfully
            resolve();
          });
          
          // Paperboy will always release the connection into the pool
          releaseConnection(connection);
        })
        
        // Paperboy will reject the subscription if there is a problem acquiring a connection
        .catch(reject);
    });
  }

  // #### Paperboy can subscribe to an event
  on(event, callback) {
    return new Promise((resolve, reject) => {
      // Paperboy can release `subscribe` connections
      const releaseConnection = (connection) => this.pool.subscribe.release(connection);
      
      // **Given** a connection is acquired from the `subscribe` connection pool
      this.pool.subscribe.acquire()
        .then((connection) => {

          // **And** Paperboy listens to the event
          paperboyEvent.on(event, callback);

          // **Then** the connection subscribes to the event
          connection.subscribe(event, (error) => {
            // **But** Paperboy will reject the subscription request if there are errors
            if(error) return reject(error);
            
            // **And** Paperboy will resolve without errors if the subscription was made successfully
            resolve();
          });
          
          // Paperboy will always release the connection into the pool
          releaseConnection(connection);
        })
        
        // Paperboy will reject the subscription if there is a problem acquiring a connection
        .catch(reject);
    });
  }

  // #### Paperboy can trigger an event
  trigger(event, data) {
    return new Promise((resolve, reject) => {
      // - Reject trigger calls that do not have an event 
      if(!event) return reject(new Error(`no event`));
      
      // **Given** a connection is acquired from the `trigger` connection pool
      this.pool.trigger.acquire()
        .then((connection) => {
          // **When** Paperboy publishes data for the event
          connection.publish(event, data)
            .then(() => {
              // **Then** Paperboy will release the connection into the pool
              this.pool.trigger.release(connection);
              
              // **And** Paperboy will return the data that was triggered
              resolve(data);
            })
            .catch((error) => {
              // **But** Paperboy will release the connection intot he pool if there was an error
              this.pool.trigger.release(connection);
              
              // **And** Paperboy will return the error that was caught
              reject(error);
            });
        })
        
        // Paperboy will reject the trigger request if there is a problem acquiring a connection
        .catch(reject);
    });
  }

  // #### Paperboy can remove an event listener
  removeListener(event, listener) {
    paperboyEvent.removeListener(event, listener);
  }

  // #### Paperboy can retrieve the number of listeners for an event
  listenerCount(event) {
    return paperboyEvent.listenerCount(event);
  }
};