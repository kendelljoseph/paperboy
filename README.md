# Paperboy
[![Build Status](https://travis-ci.org/altereagle/paperboy.svg?branch=master)](https://travis-ci.org/altereagle/paperboy)
[![Maintainability](https://api.codeclimate.com/v1/badges/900b1cc8d6ba2062a8de/maintainability)](https://codeclimate.com/github/altereagle/paperboy/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/900b1cc8d6ba2062a8de/test_coverage)](https://codeclimate.com/github/altereagle/paperboy/test_coverage)

### An intersystem communicator
![gif](https://media.giphy.com/media/eoUwc3wSwDOvK/giphy.gif)

### Install Module
`npm install paperboy-communicator`

### Install Prerequisites

### <span style="color: maroon;">&#11041; Redis</span> - [redis.io](https://redis.io/)
<span style="color: maroon;">Redis stores, retrieves, and communicates between Node proceseses. It performs these tasks very reliably and quicky!
You can [try Redis here!](http://try.redis.io/)</span>

> Set the `PAPERBOY_REDIS_URL` in your `.env` file

### Start <span style="color: maroon;">&#11041; Redis</span>
  * _Quick_
    ```bash
    redis-server
    ```  
  * _Service Mode (Recommended)_
    ```bash
    sudo service redis-server start
    ```
---

### Use
**Example:** Paperboy can be used for data storage
```javascript
const Paperboy = require(`paperboy-communicator`);
const paperboy = new Paperboy({connectionName: `data-example`});
paperboy.push(`example`, `Hello World!`);
paperboy.pull(`example`)
 .then((result) => {
    console.log(result); // "Hello World!" is logged to the console
 });
```

**Example:** Paperboy can be used as a publish/subscribe service
```javascript
const Paperboy = require(`paperboy-communicator`);
const paperboy = new Paperboy({connectionName: `pubsub-example`});
paperboy.on(`my-event`, (data) => {
  console.log(data); // "Hello World!" is logged to the console
});

paperboy.trigger(`my-event`, `Hello World!`);
```
---

