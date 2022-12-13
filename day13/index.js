const fs = require('fs')
const R = require('ramda')

const content = R.compose(
  R.map(JSON.parse), 
  R.reject(R.isEmpty), 
  R.split('\n')
)(fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'}))

const compareValues = (a,b) => {
  if (R.type(a) === 'Number' && R.type(b) === 'Number') return a - b
  if (R.type(a) === 'Number' && R.type(b) === 'Array') return compareValues(a, R.head(b))
  if (R.type(a) === 'Array' && R.type(b) === 'Number') return compareValues(R.head(a), b)
  if (R.type(a) === 'Undefined') return -1
  if (R.type(b) === 'Undefined') return 1

  const maxLength = Math.max(R.length(a), R.length(b))
  const fill = Array(maxLength)
  
  const pairs = R.zip(
    R.slice(0, maxLength, R.concat(a, fill)), 
    R.slice(0, maxLength, R.concat(b, fill))
  )

  return R.map(R.apply(compareValues), pairs)
}

const isInOrder = R.compose(
  R.gt(0),
  R.find(R.complement(R.equals)(0)),
  R.flatten,
  R.apply(compareValues)
)

const part1 = R.compose(
  R.sum,
  R.map(R.compose(R.inc, Number, R.head)),
  R.filter(R.last),
  R.toPairs,
  R.map(isInOrder),
  R.splitEvery(2)
)(content)

const part2 = R.compose(
  R.reduce(R.multiply, 1),
  R.map(R.compose(R.inc, Number, R.head)),
  R.filter(R.compose(R.either(R.equals([[2]]), R.equals([[6]])), R.last)),
  R.toPairs,
  R.sort(R.compose(R.find(R.complement(R.equals)(0)), R.flatten, compareValues)),
  R.concat([[[2]], [[6]]])
)(content)

// 5350 19570
console.log(part1, part2)
