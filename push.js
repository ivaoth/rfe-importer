const axios = require('axios');
const _ = require('lodash');
const fs = require('fs')
const dotenv = require('dotenv')

const Promise = require('bluebird')
const {TaskQueue} = require('cwait')

const MAX_SIMULTANEOUS_DOWNLOADS = 3

const config = {
  importAirline: false,
  importRoute: false,
  importFlight: true
}

dotenv.config()
const {API, SECRET, EVENT_ID} = process.env

const startAt = 0;

const flights = JSON.parse(fs.readFileSync('json/Flight.json', 'utf8'))
const routes = JSON.parse(fs.readFileSync('json/Route.json', 'utf8'))
const airlines= JSON.parse(fs.readFileSync('json/Airline.json', 'utf8'))

async function sendAirlineData(airline) {
  console.log('Processing airline: ' + airline.name)

  try {
    const payload = {
      secret: SECRET,
      airline: {
        code: airline.code,
        name: airline.name,
      },
    }

    const out = await axios.post(API + '/api/v1/airline/create', payload)
    return out.data
  } catch (err) {
    console.log('Failed to process airline: ' + airline.name)
    console.log(err.response.data)
    return err.response.data
  }
}

async function sendRouteData(route) {
  console.log('Processing route: ' + route.airport.departure + '>' + route.airport.arrival)

  try {
    const payload = {
      secret: SECRET,
      airport: {
        departure: route.airport.departure,
        arrival: route.airport.arrival,
      },
      route: route.route,
    }

    const out = await axios.post(API + '/api/v1/route/create', payload)
    return out.data
  } catch (err) {
    console.log('Failed to process route: ' + route.airport.departure + '>' + route.airport.arrival)
    console.log(err.response.data)
    return err.response.data
  }
}

async function sendFlightData(flight) {
  console.log('Processing flight: ' + flight.flight)

  try {
    const payload = {
      secret: SECRET,
      event: {
        id: EVENT_ID,
      },
      flight: {
        name: flight.flight,
        type: flight.type,
        distance: flight.distance,
        airline: {
          code: flight.airline.code,
        },
        airport: {
          departure: flight.airport.departure,
          arrival: flight.airport.arrival,
        },
        time: {
          departure: flight.time.departure,
          arrival: flight.time.arrival,
          total: flight.time.total,
        },
      },
    }
  
    const out = await axios.post(API + '/api/v1/flight/create', payload)
    return out.data
  } catch (err) {
    console.log('Failed to process flight: ' + flight.flight)
    console.log(err.response.data)
    return err.response.data
  }
}

const queue = new TaskQueue(Promise, MAX_SIMULTANEOUS_DOWNLOADS)

;(async () => {
  await Promise.all(
    [config.importFlight ? flights.map(queue.wrap(async flight => await sendFlightData(flight))) : null,
    config.importRoute ? routes.map(queue.wrap(async route => await sendRouteData(route))) : null,
    config.importAirline ? airlines.map(queue.wrap(async airline => await sendAirlineData(airline))) : null,]
  )
})()
