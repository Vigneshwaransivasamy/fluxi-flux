module.exports =  function arange(N){
  if(Array.from && Array.prototype.keys){
      arange = function(N){
          return Array.from(Array(N).keys());
      }
  } else {
      arange = function(N){
           return Array.apply(
              null, 
              {length: N}
          ).map((x,y)=>y);
      }
  }
  return arange(N);
}