const fs = require('fs')
const R = require('ramda')

const content = fs.readFileSync('./input.txt', {encoding: 'utf-8'})

// A for Rock, B for Paper, and C for Scissors
// X for Rock, Y for Paper, and Z for Scissors.
// shape you selected (1 for Rock, 2 for Paper, and 3 for Scissors) 
// score for the outcome of the round (0 if you lost, 3 if the round was a draw, and 6 if you won)
const pointMap1 = {
  'AA': 1 + 3,
  'AB': 2 + 6,
  'AC': 3 + 0,
  'BA': 1 + 0,
  'BB': 2 + 3,
  'BC': 3 + 6,
  'CA': 1 + 6,
  'CB': 2 + 0,
  'CC': 3 + 3, 
}

// A for Rock, B for Paper, and C for Scissors
// A lose, B draw, C win. 
const pointMap2 = {
  'AA': 3 + 0,
  'AB': 1 + 3,
  'AC': 2 + 6,
  'BA': 1 + 0,
  'BB': 2 + 3,
  'BC': 3 + 6,
  'CA': 2 + 0,
  'CB': 3 + 3,
  'CC': 1 + 6, 
}

const keys = R.compose(
  R.map(R.replace(' ', '')),
  R.split('\n'),
  R.replace(/Z/g, 'C'),
  R.replace(/Y/g, 'B'),
  R.replace(/X/g, 'A')
)

const points = R.curry((p, content) => R.compose(
  R.sum,
  R.map(R.prop(R.__, p)),
  keys
)(content))

const part1 = points(pointMap1, content)
  
const part2 = points(pointMap2, content)

console.log(part1, part2)