const fs = require('fs')
const htmlparser = require('htmlparser2')
const safeEval = require('safe-eval')
const path = require('path')

const jtProps = [ 'jt-content', 'jt-each' ]
const noJt = key => jtProps.indexOf(key) < 0

const domToHtml = locals => ({type, name, data, children = [], attribs}) => {
  switch (type) {
    case 'text': return data
    case 'comment': return `<!--${data}-->`
    case 'script':
    case 'style':
    case 'tag': {
      let attrKeys = Object.keys(attribs).filter(noJt)
      let attributes = attrKeys.length === 0
        ? ''
        : ' ' + attrKeys.map(a => `${a}="${attribs[a]}"`).join(' ')

      if (attribs['jt-remove'] != null) {
        return ''
      }

      if (attribs['jt-each']) {
        let expr = attribs['jt-each']
        let each = safeEval(expr, Object.assign({ 'self': data }, locals))
        let strippedAttribs = Object.assign({}, attribs)
        delete strippedAttribs['jt-each']

        return each
          .map(value =>
            domToHtml(Object.assign({}, locals, { 'self': value }))({ type, name, data, children, attribs: strippedAttribs }))
          .join('')
      }

      if (attribs['jt-content']) {
        let expr = attribs['jt-content']
        data = safeEval(expr, Object.assign({ 'self': data }, locals))
      }

      if (children.length === 0 && !data) return `<${name}${attributes} />`

      let html = `<${name}${attributes}>${data || children.map(domToHtml(locals)).join('')}</${name}>`
      return insertExpressions(html, locals)
    }
    case 'directive': return `<${data}>`
    default: return `<${type} />`
  }
}

const insertExpressions = (html, locals) =>
  html.replace(/\{j\s([\s\S]+)\st\}/gm, (_, expr) => safeEval(expr, Object.assign({ 'self': null }, locals)))

const stripJungledrumTag = html => html
  .replace(/<!--\s+<jungledrum>([\s\S]+)<\/jungledrum>\s+-->/, '')
  .replace(/<jungledrum>([\s\S]+)<\/jungledrum>/, '')

const importFiles = (html, dir) => html
  .replace(/<!--\s*import\s+(\S+)\s*-->/, (_, file) => fs.readFileSync(path.join(dir, file), 'utf8'))

const render = (template, locals, dir = '.') => {
  let handler = new htmlparser.DomHandler()
  let parser = new htmlparser.Parser(handler, { decodeEntities: true })
  let html = importFiles(template, dir)

  parser.parseComplete(html)

  html = handler.dom.map(domToHtml(locals)).join('')
  html = stripJungledrumTag(html)

  return html
}

const renderFile = (filename, locals) => render(fs.readFileSync(filename, 'utf8'), locals, path.dirname(filename))

module.exports = {
  render,
  renderFile
}
