const fs = require('fs')
const R = require('ramda')

const content = fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'})

const findContent = R.curry((numberOfUnique, content) => R.compose(
  R.add(numberOfUnique),
  R.findIndex(R.compose(
    R.equals(numberOfUnique),
    R.length,
    R.uniq
  )),
  R.aperture(numberOfUnique)
)(content))

const findMarker = findContent(4)

const findMessage = findContent(14)

const part1 = findMarker(content)
const part2 = findMessage(content)

console.log(part1, part2)