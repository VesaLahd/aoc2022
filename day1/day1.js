const fs = require('fs')
const R = require('ramda')

const content = fs.readFileSync('./input.txt', {encoding: 'utf-8'})

const sums = R.compose(
  R.map(R.sum),
  R.map(R.map(i => parseInt(i, 10))),
  R.splitWhenever(R.equals('')),
  R.split('\n'),
)

const part1 = R.compose(
  R.reduce(R.max, 0),
  sums
)(content)

const part2 = R.compose(
  R.sum,
  R.take(3),
  R.sort((a,b) => a - b),
  sums
)(content)

console.log(part1, part2)