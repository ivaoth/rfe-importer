const lineReader = require('line-reader')
const fs = require('fs')
const _ = require('lodash')

const airlines = []
const routes = []
const flightsDep = []
const flightsArr = []

const inDir = 'data/'
const outDir = 'json/'

const fileAirlines = 'Airline'
const fileRoutes = 'Route'
const fileFlightsDep = ['VTBS-Departure']
const fileFlightsArr = ['VTBS-Arrival']

let flightsDepImported = 0
let flightsArrImported = 0

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

fileFlightsDep.map((file, i) => {
  lineReader.eachLine(inDir + file + '.csv', (line, last) => {
    const chunk = _.split(line, ',')

    flightsDep.push({
      flight: chunk[1],
      aircraft: chunk[2],
      distance: chunk[7],
      airline: {
        code: !chunk[0] ? null : chunk[0],
      },
      airport: {
        departure: chunk[3],
        arrival: chunk[4],
      },
      bay: {
        departure: !chunk[9] ? null : chunk[9],
        arrival: !chunk[10] ? null : chunk[10],
      },
      time: {
        departure: chunk[5],
        arrival: chunk[6],
        total: chunk[8],
      },
    })

    if (last) {
      flightsDepImported++;
    }

    if (flightsDepImported == fileFlightsDep.length) {
      console.log('Writing file Flight DEP')

      fs.writeFile(outDir + 'Flight-Dep.json', JSON.stringify(flightsDep), function(err) {
        if (err) {
          console.error(err)
          reject(err)
        }
      })
    }
  })
})

fileFlightsArr.map((file, i) => {
  lineReader.eachLine(inDir + file + '.csv', (line, last) => {
    const chunk = _.split(line, ',')

    flightsArr.push({
      flight: chunk[1],
      aircraft: chunk[2],
      distance: chunk[7],
      airline: {
        code: !chunk[0] ? null : chunk[0],
      },
      airport: {
        departure: chunk[3],
        arrival: chunk[4],
      },
      bay: {
        departure: !chunk[9] ? null : chunk[9],
        arrival: !chunk[10] ? null : chunk[10],
      },
      time: {
        departure: chunk[5],
        arrival: chunk[6],
        total: chunk[8],
      },
    })

    if (last) {
      flightsArrImported++;
    }

    if (flightsArrImported == fileFlightsArr.length) {
      console.log('Writing file Flight ARR')

      fs.writeFile(outDir + 'Flight-Arr.json', JSON.stringify(flightsArr), function(err) {
        if (err) {
          console.error(err)
          reject(err)
        }
      })
    }
  })
})
