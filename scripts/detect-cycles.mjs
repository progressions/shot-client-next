#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'fs'
import { join, dirname, resolve, extname } from 'path'

const SRC_ROOT = resolve(process.cwd(), 'src')
const exts = new Set(['.ts', '.tsx'])

function walk(dir) {
  const entries = readdirSync(dir)
  let files = []
  for (const e of entries) {
    const p = join(dir, e)
    const st = statSync(p)
    if (st.isDirectory()) {
      if (e === 'node_modules' || e === '.next' || e === 'coverage') continue
      files = files.concat(walk(p))
    } else if (exts.has(extname(p))) {
      files.push(p)
    }
  }
  return files
}

function normalizeImport(spec, fromFile) {
  if (!spec) return null
  if (spec.startsWith('@/')) {
    spec = spec.replace(/^@\//, '')
    return resolve(SRC_ROOT, spec)
  }
  if (spec.startsWith('.')) {
    return resolve(dirname(fromFile), spec)
  }
  return null // external
}

function resolveFile(pathBase) {
  const candidates = [
    pathBase,
    pathBase + '.ts',
    pathBase + '.tsx',
    join(pathBase, 'index.ts'),
    join(pathBase, 'index.tsx'),
  ]
  for (const c of candidates) {
    try {
      const st = statSync(c)
      if (st.isFile()) return c
    } catch {}
  }
  return null
}

const importRe = /(import|export)\s+(type\s+)?(?:[^'";]*?from\s*)?['\"]([^'\"]+)['\"]/g

const files = walk(SRC_ROOT)
const graph = new Map()

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  const deps = new Set()
  let m
  while ((m = importRe.exec(src))) {
    const [, , isType, specRaw] = m
    const target = normalizeImport(specRaw, f)
    if (!target) continue
    // type-only imports do not create runtime edges; skip them
    if (m[2]) continue
    const resolved = resolveFile(target)
    if (resolved) deps.add(resolved)
  }
  graph.set(f, Array.from(deps))
}

// Detect cycles with DFS
const visited = new Set()
const stack = new Set()
const cycles = []

function dfs(node, path) {
  if (stack.has(node)) {
    const idx = path.indexOf(node)
    cycles.push(path.slice(idx).concat(node))
    return
  }
  if (visited.has(node)) return
  visited.add(node)
  stack.add(node)
  const deps = graph.get(node) || []
  for (const d of deps) dfs(d, path.concat(d))
  stack.delete(node)
}

for (const f of graph.keys()) dfs(f, [f])

if (cycles.length === 0) {
  console.log('No runtime circular dependencies detected.')
} else {
  console.log(`Found ${cycles.length} cycle(s):`)
  for (const c of cycles) {
    console.log('\n- ' + c.map(p => p.replace(SRC_ROOT + '/', '')).join(' -> '))
  }
}

