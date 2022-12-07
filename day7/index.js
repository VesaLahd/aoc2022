const fs = require('fs')
const R = require('ramda')

const content = R.split('\n', fs.readFileSync(`${__dirname}/input.txt`, {encoding: 'utf-8'}))

const lastLens = R.lens(a => a[R.dec(R.length(a))],
  R.curry((v, a) => R.set(R.lensIndex(R.dec(R.length(a))), v, a)));

const parseOutput = R.compose(
  R.reduce((acc, output) => R.ifElse(
      R.startsWith('$'),
      R.compose(R.append(R.__, acc), Array.of),
      R.compose(R.over(lastLens, R.__, acc), R.append, R.identity)
    )(output),
    []
  )
)

const upsertFileEntity = R.curry((state, lens, metadata, name) => R.unless(
  R.compose(R.has(name), R.view(lens)),
  R.over(lens, R.mergeLeft({[name]: metadata === 'dir' ? {} : Number(metadata)}))
)(state))


const parseLs = R.curry((state, entity) => {
    const fileEntities = R.compose(R.map(R.split(' ')), R.drop(1))(entity)
    return R.reduce((acc, entity) => {
      const [metadata, name] = entity
      return {...acc, files: upsertFileEntity(acc.files, R.lensPath(acc.pwd), metadata, name)}
    }, state, fileEntities)
  })

const parseCd = R.curry((state, entity) => {
  const [pwd] = R.compose(R.drop(2), R.split(' '), R.head)(entity);
  return R.cond([
    [R.equals('/'), R.always(state)],
    [R.equals('..'), R.always({...state, pwd: R.dropLast(1, state.pwd)})],
    [R.T, R.always({...state, pwd: R.append(pwd, state.pwd)})]
  ])(pwd)
})

const parseCommand = R.curry((state, entity) => R.ifElse(
  R.compose(R.startsWith('$ cd'), R.head),
  parseCd(state),
  parseLs(state)
)(entity))

const fileSystem = R.compose(
  R.prop('files'),
  R.reduce(parseCommand, {pwd: [], files: {}}),
  parseOutput,
)(content)

const directorySize = R.curry((files, path) => {
  const fileSum = R.compose(
    R.sum,
    R.converge(
      R.compose(R.filter(R.identity), R.flatten, Array.of), 
      [
        R.compose(R.sum, R.values, R.reject(R.is(Object))), 
        R.compose(R.map(directorySize(files)), R.map(R.append(R.__, path)), R.keys, R.filter(R.is(Object)))
      ]
    ),
    R.path(path)
    )(files)

  return fileSum
})

const flattenDirectoryPaths = R.curry((fileSystem, path) => R.compose(
    R.converge(
      R.compose(R.unnest, Array.of),
      [
        R.identity,
        R.chain(flattenDirectoryPaths(fileSystem))
      ]
    ),
    R.map(R.append(R.__, path)),
    R.keys,
    R.filter(R.is(Object)),
    R.path(path)
  )(fileSystem)
)

const allPaths = flattenDirectoryPaths(fileSystem, [])
const allSizes = R.map(directorySize(fileSystem), allPaths)

const part1 = R.compose(
  R.sum,
  R.filter(R.gte(100000)),
)(allSizes)

const currentSize = directorySize(fileSystem, [])
const totalSize = 70000000
const neededSize = 30000000
const unusedSize = totalSize - currentSize
const spaceNeeded = neededSize - unusedSize

const part2 = R.compose(
  R.apply(Math.min),
  R.filter(R.lte(spaceNeeded))
)(allSizes)

console.log(part1, part2);
