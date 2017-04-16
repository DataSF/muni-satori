require('dotenv').config()
require('es6-promise').polyfill()
var fetch = require('isomorphic-fetch')
var restbus = require('restbus')
var RTM = require('satori-sdk-js')

var endpoint = 'wss://open-data.api.satori.com'
var appkey = process.env.APP_KEY
var role = process.env.ROLE
var roleSecretKey = process.env.ROLE_SECRET_KEY
var channel = 'sfmta-muni-realtime-transit'

var roleSecretProvider = RTM.roleSecretAuthProvider(role, roleSecretKey)

var rtm = new RTM(endpoint, appkey, {
  authProvider: roleSecretProvider
})

var fetchVehicles = function () {
  fetch('http://localhost:4545/agencies/sf-muni/vehicles')
  .then(function (response) {
    if (response.status >= 400) {
      throw new Error('Bad response from server')
    }
    return response.json()
  })
  .then(function (locations) {
    var message = {}
    for (var i in locations) {
      console.log(i)
      message = locations[i]
      delete message['_links']
      console.log('Publish: ' + JSON.stringify(message))
      rtm.publish(channel, message, function (pdu) {
        console.log('Replay action: ', pdu.action)
      })
    }
  })
}

// var subscription = rtm.subscribe(channel, RTM.SubscriptionMode.SIMPLE)

rtm.on('enter-connected', function () {
  restbus.listen('4545', function () {
    console.log('restbus is now listening on port 4545')
  })
  console.log('Connected to RTM.')
  setInterval(fetchVehicles, 2000)
})

rtm.on('error', function () {

})

/* publish a message after being subscribed to sync on subscription */

/*
subscription.on('enter-subscribed', function () {
  rtm.publish(channel, 'Subscribing...', function (pdu) {
    console.log('Publish ack:', pdu)
  })
  // rtm.stop()
})
*/

/* set callback for PDU with specific action */

/*
subscription.on('rtm/subscription/data', function (pdu) {
  pdu.body.messages.forEach(function (msg) {
    console.log('Got message:', msg)
  })
  // close client after receving one message
  // rtm.stop()
})
*/

rtm.start()
