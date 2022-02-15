import fs from 'fs'
import path from 'path'
import { docRoot, projRoot } from '../utils/paths'
import { branch, docsDir, repo } from '../vitepress/constant'
import type { Plugin } from 'vite'

type Append = Record<'headers' | 'footers' | 'scriptSetups', string[]>

export function MarkdownTransform(): Plugin {
  return {
    name: 'element-plus-md-transform',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('.md')) return

      const componentId = path.basename(id, '.md')
      const append: Append = {
        headers: [],
        footers: [],
        scriptSetups: [
          `const demos = import.meta.globEager('../../examples/${componentId}/*.vue')`,
        ],
      }

      code = extractVpScriptSetup(code, append)

      const compPath = path.resolve(docRoot, 'en-US/component')
      if (id.startsWith(compPath)) {
        code = getComponentMarkdown(componentId, code, append)
      }

      return combineMarkdown(
        code,
        [combineScriptSetup(append.scriptSetups), ...append.headers],
        append.footers
      )
    },
  }
}

const combineScriptSetup = (codes: string[]) =>
  `\n<script setup>
${codes.join('\n')}
</script>
`

const combineMarkdown = (
  code: string,
  headers: string[],
  footers: string[]
) => {
  const frontmatterEnds = code.indexOf('---\n\n') + 4
  const firstSubheader = code.search(/\n## \w/)
  const sliceIndex = firstSubheader < 0 ? frontmatterEnds : firstSubheader

  if (headers.length > 0)
    code =
      code.slice(0, sliceIndex) + headers.join('\n') + code.slice(sliceIndex)
  code += footers.join('\n')

  return `${code}\n`
}

const vpScriptSetupRE = /<vp-script\s(.*\s)?setup(\s.*)?>([\s\S]*)<\/vp-script>/

const extractVpScriptSetup = (code: string, append: Append) => {
  const matches = code.match(vpScriptSetupRE)
  if (matches) code = code.replace(matches[0], '')
  const scriptSetup = matches?.[3] ?? ''
  if (scriptSetup) append.scriptSetups.push(scriptSetup)
  return code
}

const GITHUB_BLOB_URL = `https://github.com/${repo}/blob/${branch}`
const GITHUB_TREE_URL = `https://github.com/${repo}/tree/${branch}`
const getComponentMarkdown = (id: string, code: string, append: Append) => {
  const docUrl = `${GITHUB_BLOB_URL}/${docsDir}/en-US/component/${id}.md`
  const componentUrl = `${GITHUB_TREE_URL}/packages/components/${id}`
  const componentPath = path.resolve(projRoot, `packages/components/${id}`)
  const isComponent = fs.existsSync(componentPath)

  append.scriptSetups.push(`
import { useLocale } from '../../.vitepress/vitepress/composables/locale'
import footerLocale from '../../.vitepress/i18n/component/footer.json'
const footer = useLocale(footerLocale)
`)

  const links = [['{{ footer.docs }}', docUrl]]
  if (isComponent) links.unshift(['{{ footer.component }}', componentUrl])
  const linksText = links
    .filter((i) => i)
    .map(([text, link]) => `[${text}](${link})`)
    .join(' • ')

  const sourceSection = `## {{ footer.source }}

${linksText}
`

  const contributorsSection = `
## {{ footer.contributors }}

<Contributors id="${id}" />
`

  append.footers.push(sourceSection, isComponent ? contributorsSection : '')

  return code
}
