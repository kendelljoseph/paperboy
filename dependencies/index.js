// # Paperboy | Dependencies

// Paperboy loads these dependencies when it starts
module.exports = {
  
  // Paperboy uses [dotenv](https://github.com/motdotla/dotenv)
  dotenv                 : require(`dotenv`),
  
  // Paperboy uses [ioredis](https://github.com/luin/ioredis)
  ioredis                : require(`ioredis`),
  
  // Paperboy uses [generic-pool](https://github.com/coopernurse/node-pool)
  'generic-pool'         : require(`generic-pool`)
};