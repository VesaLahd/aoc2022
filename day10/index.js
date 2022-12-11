const fs = require('fs')
const R = require('ramda')

const content = R.split('\n', fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'}))

const parseInstruction = R.compose(
  R.drop(1),
  R.ifElse(R.compose(R.equals(2), R.length), R.over(R.lensIndex(1), R.compose(R.append(R.__, [R.identity]), R.add, Number)), R.append([R.identity])),
  R.split(' ')
)

const indices = R.map(R.compose(R.nth, R.dec), [20, 60, 100, 140, 180, 220])

const registerValues = R.compose(
  R.scan((acc, value) => value(acc), 1),
  R.flatten,
  R.map(parseInstruction)
)(content)

const part1 = R.compose(
  R.sum,
  R.converge(Array.of, indices),
  R.addIndex(R.map)((value, index) => R.multiply(value, R.inc(index))),
)(registerValues)

const screen = R.addIndex(R.map)((_, i) => R.inc(i), Array(40*6))

const checkIfInRange = R.curry((spritePosition, value) => value >= spritePosition && value < spritePosition + 3)

const part2 = R.compose(
  R.join('\n'),
  R.splitEvery(40),
  R.join(''),
  R.map(R.compose(R.ifElse(R.identity, R.always('#'), R.always('.')),R.apply(checkIfInRange))),
  R.zip(registerValues),
  R.map(R.modulo(R.__, 40))
)(screen)

// 11960 
console.log(part1)
console.log(part2)
