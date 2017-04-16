var restbus = require('restbus')

restbus.listen('4545', function () {
  console.log('restbus is now listening on port 4545')
})