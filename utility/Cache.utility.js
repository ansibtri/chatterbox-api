const NodeCache=require('node-cache')

class Cache{
      // constructor is invoked with time to live before cache is deleted 
      constructor(ttlSeconds){
            this.cache = new NodeCache({stdTTL:ttlSeconds, checkperiod:0.2 * ttlSeconds, useClones:false})
      }

      // get
}