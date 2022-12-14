const fs = require('fs')
const R = require('ramda')

const content = R.split('\n', fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'}))

const parseLine = R.compose(
  R.map(R.compose(R.map(Number), R.split(','))),
  R.split('->')
)

const lines = R.map(parseLine, content)
const maxDimensions = R.compose(
  R.reduce((([x0, y0], [x,y]) => [Math.max(x0, x), Math.max(y0, y)]), [0,-Infinity]),
  R.unnest
)(lines)

const minDimensions = R.compose(
  R.reduce((([x0, y0], [x,y]) => [Math.min(x0, x), Math.min(y0, y)]), [Infinity,0]),
  R.unnest
)(lines)

const normalizeCoordinates = ([x,y]) => [x - minDimensions[0], y - minDimensions[1]]

const normalizedMax = normalizeCoordinates(maxDimensions)

const coordinatesToIndex = ([x,y]) => y * (normalizedMax[0] + 1) + x

const column = (cave, c) => R.compose(
  R.map(R.nth(R.__, cave)),
  R.map(coordinatesToIndex),
  R.apply(R.xprod),
  R.append(R.__, [[c]])
)(R.range(0, normalizedMax[1] + 1))
const row = (cave, r) => R.slice(r * (normalizedMax[0] + 1), (r+1) * (normalizedMax[0] + 1), cave)

const cave = Array(R.apply(R.multiply)(R.map(R.inc, normalizeCoordinates(maxDimensions)))).fill('.')

const lineComponents = R.compose(
  R.apply(R.range), 
  R.over(R.lensIndex(1), R.inc), 
  R.sort(R.subtract), 
)

const createWall = R.compose(
  R.chain(R.converge(R.xprod, [
    R.compose(
      lineComponents,
      R.map(R.head)
    ),
    R.compose(
      lineComponents,
      R.map(R.last)
    )
  ])),
  R.aperture(2)
)

const walledCave = R.compose(
  R.reduce((acc, index) => R.set(R.lensIndex(index), '#', acc), cave),
  R.uniq,
  R.map(coordinatesToIndex),
  R.map(normalizeCoordinates),
  R.chain(createWall),
)(lines)

const dropPoint = normalizeCoordinates([500, 0])

const isBlocked = R.complement(R.equals)('.')

const dropSand = (cave, startPoint) => {
  const c = column(cave, startPoint[0])
  const indexedC = R.filter(R.compose(R.lt(startPoint[1]), R.head), R.zip(R.range(0, R.length(c)), c))
  const blocked = R.find(R.compose(R.complement(R.equals('.')), R.last), indexedC)
  if (!blocked) return -1


  const r = row(cave, R.head(blocked))

  const nextDropX = R.compose(
    R.head,
    R.reject(R.compose(isBlocked, R.last)),
    R.converge(R.zip, [R.identity, R.map(R.nth(R.__, r))]),
    R.converge(Array.of, [R.dec, R.inc]),
  )(startPoint[0])

  if (!nextDropX) return coordinatesToIndex([startPoint[0], R.dec(R.head(blocked))])
  
  return dropSand(cave, [R.head(nextDropX), R.dec(R.head(blocked))])
}

const solve = (cave) => {
  let currentCave = R.clone(cave)
  while(true) {
    const dropTarget = dropSand(currentCave, dropPoint)

    if (dropTarget === -1) return R.filter(R.equals('o'), currentCave).length;
    if (dropTarget === coordinatesToIndex(dropPoint)) return R.filter(R.equals('o'), currentCave).length + 1;
    currentCave[dropTarget] = 'o'
  }
}


const solution = solve(walledCave)

// 1003 25771
console.log(solution)