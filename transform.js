const lineReader = require('line-reader')
const fs = require('fs')
const _ = require('lodash')

const airlines = []
const routes = []
const flights = []

const inDir = 'data/'
const outDir = 'json/'

const fileAirlines = 'Airline'
const fileRoutes = 'Route'
const fileFlights = ['VTBS-Arrival', 'VTBS-Departure']

let flightsImported = 0

// Process

if (!fs.existsSync('./json')) {
  fs.mkdirSync('./json', function(err) {
    if (err) {
      console.log(err)
      reject(err)
    }
  })
}

lineReader.eachLine(inDir + fileAirlines + '.csv', (line, last) => {
  const chunk = _.split(line, ',')
  
  airlines.push({
    code: chunk[0],
    name: chunk[1],
  })

  if (last) {
    console.log('Writing file ' + fileAirlines)

    fs.writeFile(outDir + fileAirlines + '.json', JSON.stringify(airlines), function(err) {
      if (err) {
        console.error(err)
        reject(err)
      }
    })
  }
})

lineReader.eachLine(inDir + fileRoutes + '.csv', (line, last) => {
  const chunk = _.split(line, ',')

  routes.push({
    airport: {
      departure: chunk[0],
      arrival: chunk[1],
    },
    route: chunk[2],
  })

  if (last) {
    console.log('Writing file ' + fileRoutes)

    fs.writeFile(outDir + fileRoutes + '.json', JSON.stringify(routes), function(err) {
      if (err) {
        console.error(err)
        reject(err)
      }
    })
  }
})

fileFlights.map((file, i) => {
  lineReader.eachLine(inDir + file + '.csv', (line, last) => {
    const chunk = _.split(line, ',')

    flights.push({
      flight: chunk[1],
      type: chunk[2],
      distance: chunk[7],
      airline: {
        code: chunk[0],
      },
      airport: {
        departure: chunk[3],
        arrival: chunk[4],
      },
      time: {
        departure: chunk[5],
        arrival: chunk[6],
        total: chunk[8],
      },
    })

    if (last) {
      flightsImported++;
    }

    if (flightsImported == fileFlights.length) {
      console.log('Writing file Flight')

      fs.writeFile(outDir + 'Flight.json', JSON.stringify(flights), function(err) {
        if (err) {
          console.error(err)
          reject(err)
        }
      })
    }
  })
})
