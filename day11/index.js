const fs = require('fs')
const R = require('ramda')

const content = R.split('\n', fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'}))

const checkHead = value => R.compose(R.equals(value), R.head)
const createFromKey = R.curry((key, value) => R.assoc(key, value, {}))

const isItems = checkHead('Starting')
const parseItems = R.compose(createFromKey('items'), R.filter(R.compose(R.not, isNaN)), R.map(Number))

const takeFirstAndLast = R.converge(Array.of, [R.head, R.last])

const isOperation = checkHead('Operation')
const parseOperation = withDivide => R.compose(
  createFromKey('operation'),
  fn => value => {
    return withDivide ? Math.floor(R.divide(fn(value, value), 3)) : fn(value, value)
  },
  R.converge(R.apply, [
    R.ifElse(
      R.compose(R.equals('*'), R.nth(1)),
      R.always(R.multiply),
      R.always(R.add),
    ),
    R.compose(
      R.map(R.when(isNaN, () => R.__)),
      R.map(Number),
      takeFirstAndLast
    )
  ]), 
  R.drop(1), 
  R.dropWhile(R.complement(R.equals('=')))
)

const isTest = checkHead('Test')
const parseTest = R.compose(
  createFromKey('test'),
  R.curry((n, value) => R.compose(R.equals(0), R.modulo(R.__,n))(value)),
  R.find(R.complement(isNaN)),
  R.map(Number)
)

const isBranch = checkHead('If')
const parseBranch = R.converge(createFromKey, [R.nth(1), R.compose(R.find(R.complement(isNaN)), R.map(Number))])

const parseMonkey = withDivide => R.compose(R.reduce((acc, value) => R.compose(
  R.assoc('inspects', 0),
  R.mergeRight(acc),
  R.cond([
    [isItems, parseItems],
    [isOperation, parseOperation(withDivide)],
    [isTest, parseTest],
    [isBranch, parseBranch]
  ]),
  R.split(' '),
  R.replace(/:|,/g , '')
)(value), {}), R.map(R.trim), R.drop(1))



const runMonkey = R.curry((gcf, monkeys, index) => {
  const worries = R.map(R.compose(R.modulo(R.__, gcf), monkeys[index].operation), monkeys[index].items)
  const targetMonkeys = R.map(worry => monkeys[index][monkeys[index].test(worry)], worries)
  const currentMonkey = R.lensIndex(index)
  return R.compose(
    R.reduce((acc, [item, target]) => R.over(
      R.compose(R.lensIndex(target), R.lensProp('items')), 
      R.append(item)
    )(acc), R.__, R.zip(worries, targetMonkeys)),
    R.over(currentMonkey, R.assoc('items', [])),
    R.over(R.compose(currentMonkey, R.lensProp('inspects')), R.add(R.length(worries)))
  )(monkeys)
})

const runRound = R.curry((gcf, monkeys) => R.reduce(
    runMonkey(gcf),
    monkeys,
    R.range(0,R.length(monkeys))
  ))

const monkeys1 = R.compose(
  R.map(parseMonkey(true)),
  R.splitWhenever(R.isEmpty)
)(content)

const monkeys2 = R.compose(
  R.map(parseMonkey(false)),
  R.splitWhenever(R.isEmpty)
)(content)

const gcf = R.compose(
  R.reduce(R.multiply, 1),
  R.map(R.compose(Number, R.last, R.split(' '))),
  R.filter(R.startsWith('Test')),
  R.map(R.trim)) 
(content)

const part1 = R.compose(
  R.apply(R.multiply),
  R.takeLast(2),
  R.sort(R.subtract),
  R.pluck('inspects'),
  R.reduce(runRound(Infinity), R.__, Array(20))
)(monkeys1)

const part2 = R.compose(
  R.apply(R.multiply),
  R.takeLast(2),
  R.sort(R.subtract),
  R.pluck('inspects'),
  R.reduce(runRound(gcf), R.__, Array(10000))
)(monkeys2)

// 120384 32059801242
console.log(part1, part2)
