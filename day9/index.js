const fs = require('fs')
const R = require('ramda')

const content = R.split('\n', fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'}))

const lastLens = R.lens(a => a[R.dec(R.length(a))],
  R.curry((v, a) => R.set(R.lensIndex(R.dec(R.length(a))), v, a)));

const directionToVector = R.cond([
  [R.equals('U'), R.always([0, 1])],
  [R.equals('D'), R.always([0, -1])],
  [R.equals('L'), R.always([-1, 0])],
  [R.equals('R'), R.always([1, 0])],
  [R.T, R.always([0, 0])]
])

const move = R.curry((direction, point) => R.compose(
  R.map(R.sum),
  R.zip(point),
)(direction))

const vectorBetween = R.curry(([x1, y1], [x2, y2]) => [x2 - x1, y2 - y1])

const length = R.curry(([x, y]) => Math.sqrt(x**2 + y**2))

const distanceBetweenPoints = R.curry((end, start) => R.compose(
  length,
  vectorBetween
)(end, start))

const vectorComponentCap = ([x, y]) => [x !== 0 ? x / Math.abs(x) : 0, y !== 0 ? y / Math.abs(y) : 0]

const instructions = R.compose(
  R.map(directionToVector),
  R.chain(R.converge(R.times, [R.compose(R.always, R.head), R.last])),
  R.map(R.compose(R.over(lastLens, Number), R.split(' ')))
)(content)

const moveRopeKnots = R.curry((rope, direction) => R.converge(
  R.scan((acc, knot) => {
    return R.when(
      R.compose(R.lt(Math.sqrt(2)), distanceBetweenPoints(acc)), 
      R.converge(move, [R.compose(vectorComponentCap, R.flip(vectorBetween)(acc)), R.identity])
    )(knot)
  }
  ), [R.compose(move(direction), R.head), R.tail])(rope)
)

const tailPosition = R.curry((knots, instructions) => R.compose(
  R.length,
  R.flatten,
  R.values,
  R.map(R.compose(R.uniq, R.map(R.last))),
  R.groupBy(R.head),
  R.map(R.last),
  R.scan(moveRopeKnots, Array(knots).fill([0,0]))
)(instructions))

const part1 = tailPosition(2, instructions)
const part2 = tailPosition(10, instructions)

// 5960 2327
console.log(part1, part2)
