const fs = require('fs')
const R = require('ramda')

const content = R.split('\n', fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'}))

const field = R.compose(
  R.converge(R.splitEvery, [
    R.compose(R.length, R.head), 
    R.compose(
      R.map(
        R.cond([
          [R.equals('S'), R.always(0)], 
          [R.equals('E'), R.always('z'.charCodeAt(0) - 95)],
          [R.T, val => val.charCodeAt(0) - 96]
        ])
      ), 
      R.join('')
    )
  ]),
)(content)



const findCoordinates = R.curry((field, value) => {
  const y = R.findIndex(R.includes(value), field)
  const x = R.compose(R.findIndex(R.equals(value)), R.nth(y))(field)
  return [x,y]
})

const start = findCoordinates(field, 0)
const end = findCoordinates(field, 'z'.charCodeAt(0) - 95)

const getValueFromCoordinates = R.curry((field, [x,y]) => R.compose(R.nth(x), R.nth(y))(field))

const height = R.length(field) - 1
const width = R.length(R.head(field))
const clampHeight = R.clamp(0, height)
const clampWidth = R.clamp(0, width)

const adjacentCoordinates = coordinates => R.compose(
  R.reject(R.equals(coordinates)),
  R.converge(Array.of, [
    R.over(R.lensIndex(1), R.compose(clampHeight, R.inc)), 
    R.over(R.lensIndex(1), R.compose(clampHeight, R.dec)), 
    R.over(R.lensIndex(0), R.compose(clampWidth, R.inc)), 
    R.over(R.lensIndex(0), R.compose(clampWidth, R.dec))
  ])
)(coordinates)

const canMove = R.curry((field, start, coordinates) =>  getValueFromCoordinates(field, coordinates) <= getValueFromCoordinates(field, start) + 1)

const shortestPath = R.curry((field, start, end) => {
  let pathLengths = R.map(R.map(R.always(Infinity)), field)
  pathLengths[start[1]][start[0]] = 0

  let toVisit = [start]
  while (toVisit.length > 0) {
    const visiting = toVisit[0]
    const pathLength = pathLengths[visiting[1]][visiting[0]]
    const possibleNeighbors =  R.filter(c => pathLengths[c[1]][c[0]] > pathLength + 1, R.filter(canMove(field, visiting), adjacentCoordinates(visiting)))
    possibleNeighbors.forEach(c => {
      pathLengths[c[1]][c[0]] = pathLength + 1
    })

    toVisit = toVisit.concat(possibleNeighbors).slice(1, Infinity)
  }
  return pathLengths[end[1]][end[0]];
})

const part1 = shortestPath(field, start, end)

const lowestPoints = R.filter(([x,y]) => field[y][x] === 1, R.chain(x => R.times(y => [x, y], height), R.range(0, width)))

const paths = R.map(shortestPath(field, R.__, end), lowestPoints)
const part2 = R.reduce(Math.min, Infinity, paths)

console.log(part1, part2)