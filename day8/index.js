const fs = require('fs')
const R = require('ramda')

const content = R.split('\n', fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'}))


const row = R.curry((matrix, index) => R.nth(index, matrix))
const column = R.curry((matrix, index) => R.map(R.nth(index), matrix))

const forest = R.map(R.map(Number), content)
const width = R.compose(R.length, R.head)(forest)
const height = R.length(forest)

const flatForest = R.converge(R.reduce(R.concat), [R.head, R.tail])(forest)
const indexToCoordinates = R.converge(Array.of, [R.modulo(R.__, width), R.compose(Math.floor, R.divide(R.__, height))])

const splits = R.curry((index, row) => R.compose(R.converge(Array.of, [R.head, R.compose(R.drop(1), R.last)]), R.splitAt(index))(row))
const isVisibleFromEitherDirection = R.curry((splits, value) => R.any(R.all(R.gt(value)), splits))

const isVisible = R.curry((tree, index) => {
  const [x,y] = indexToCoordinates(index)
  const horizontalSplits = splits(x, row(forest, y))
  const verticalSplits = splits(y, column(forest, x))
  return R.either(
      isVisibleFromEitherDirection(horizontalSplits), 
      isVisibleFromEitherDirection(verticalSplits)
    )(tree)  
})

const takeTrees = R.curry((takeFn, split) => R.compose(
    R.length, 
    R.when(R.compose(R.not, R.equals(R.length(split)), R.length), R.append(1)),
    takeFn
  )(split)
)

const rowScores = R.curry((tree, splits) => { 
  const [before, after] = splits
  const treesBefore = takeTrees(R.takeLastWhile(R.gt(tree)), before)
  const treesAfter = takeTrees(R.takeWhile(R.gt(tree)), after)
  return R.multiply(treesBefore, treesAfter)
})

const scenicScore = R.curry((tree, index) => {
  const [x,y] = indexToCoordinates(index)
  const horizontalSplits = splits(x, row(forest, y))
  const verticalSplits = splits(y, column(forest, x))

  const horizontalScores = rowScores(tree, horizontalSplits)
  const verticalScores = rowScores(tree, verticalSplits)

  return R.multiply(horizontalScores, verticalScores)
})

const part1 = R.compose(
  R.length,
  R.filter(R.identity),
  R.addIndex(R.map)(isVisible),
)(flatForest)

const part2 = R.compose(
  R.apply(Math.max),
  R.addIndex(R.map)(scenicScore)
)(flatForest)

console.log(part1, part2)
