# minify-registry-metadata

this removes fields from registry metadata not required to install the module.


this is based on an internal npm rfc and im sure it will make its way to the docs soon.

```js
var minify = require('minify-registry-metadata')
var request = require('request')

request.get('https://registry.npmjs.org/lodash',function(err,res,body){
  var minifiedLodash = minify(JSON.parse(body))
  console.log(minifiedLodash)
})
```

