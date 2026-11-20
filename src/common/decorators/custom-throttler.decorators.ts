import { Throttle } from '@nestjs/throttler';

//StrictThrottle for orders
export const StrictThrottle = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 3,
    },
  });

//Moderate rate for orders
export const ModerateThrottle = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 5,
    },
  });

// Relaxe rate for read operations
export const RelaxedrateThrottle = () =>
  Throttle({
    default: {
      ttl: 1000,
      limit: 20,
    },
  });
