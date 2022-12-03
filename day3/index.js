const fs = require('fs')
const R = require('ramda')

const content = fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'})

const priorities = R.compose(
  R.fromPairs,
  R.zip(R.__, R.range(1,53)),
  R.split(''),
  R.converge(R.concat, [R.identity, R.toUpper])
  )('abcdefghijklmnopqrstuvwxyz')


const rucksacks = R.compose(
  R.map(R.converge(R.splitAt, [R.compose(R.divide(R.__, 2), R.length), R.identity])),
  R.split('\n')
)(content)

const sharedItems = R.compose(
  R.unnest,
  R.map(R.apply(R.intersection))
)(rucksacks)

const itemPriorities = R.compose(
  R.sum,
  R.map(R.prop(R.__, priorities))
)

const part1 = itemPriorities(sharedItems)

const groups = R.compose(
  R.splitEvery(3),
  R.split('\n')
)(content)

const groupBadges = R.compose(
  R.unnest,
  R.map(R.converge(R.reduce(R.intersection), [R.head, R.tail]))
)(groups)

const part2 = itemPriorities(groupBadges)

console.log(part1, part2)