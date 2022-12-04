const fs = require('fs')
const R = require('ramda')

const content = fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'})

const createRange = (start, end) => R.range(start, R.inc(end))

const parseRanges = R.compose(
  R.map(R.map(R.apply(createRange))),
  R.map(R.splitAt(2)),
  R.splitEvery(4),
  R.map(Number),
  R.flatten,
  R.map(R.split(/,|-/g)),
  R.split('\n')
)

const isNested = R.compose(
  R.any(R.isEmpty),
  R.converge(
    Array.of,
    [R.apply(R.difference), R.apply(R.flip(R.difference))]
  )
)

const isOverlapping = R.compose(
  R.complement(R.isEmpty),
  R.apply(R.intersection)
)

const countByTrue = fn => R.compose(
  R.length,
  R.filter(R.identity),
  R.map(fn)
)

const part1 = R.compose(
  countByTrue(isNested),
  parseRanges
)(content)

const part2 = R.compose(
  countByTrue(isOverlapping),
  parseRanges
)(content)

console.log(part1, part2)