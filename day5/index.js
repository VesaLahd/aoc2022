const fs = require('fs')
const R = require('ramda')

const content = fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'})

const [crane, instructions] = R.compose(
  R.converge(Array.of, [R.take(8), R.drop(10)]),
  R.split('\n')
)(content)

const parseCraneState = R.compose(
  R.converge(R.reduce(R.mergeWith(R.concat)), [R.head, R.tail]),
  R.map(R.compose(R.fromPairs, R.map(R.over(R.lensIndex(0), R.compose(R.inc, Number))), R.toPairs)),
  R.reverse,
  R.map(R.compose(R.map(R.compose(R.replace(/\W/g, ''), R.trim)), R.splitEvery(4)))
)

const parseInstruction = R.compose(
  R.reject(isNaN),
  R.map(Number),
  R.split(' ')
)

const moveCrates = R.curry((orderFn, number, from, to, state) => R.compose(
  R.mergeRight(state),
  R.converge(
    R.mergeRight, [
      R.compose(R.pick([from]), R.over(R.lensProp(from), R.dropLast(number))), 
      R.compose(R.pick([to]), R.over(R.lensProp(to), R.__, state), R.flip(R.concat), orderFn, R.takeLast(number), R.prop(from))
    ])
)(state))

const moveCratesIndividual = moveCrates(R.reverse)
const moveCratesBulk = moveCrates(R.identity)

const topCrates = R.compose(
  R.join(''),
  R.map(R.last),
  R.values
)

const part1 = R.compose(
  topCrates,
  R.reduce((craneState, instruction) => R.apply(moveCratesIndividual, instruction)(craneState), parseCraneState(crane)),
  R.map(parseInstruction)
)(instructions)

const part2 = R.compose(
  topCrates,
  R.reduce((craneState, instruction) => R.apply(moveCratesBulk, instruction)(craneState), parseCraneState(crane)),
  R.map(parseInstruction)
)(instructions)

console.log(part1, part2)