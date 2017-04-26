/* eslint-env mocha */

const assert = require('assert')
const junglet = require('../index.js')

const data = {
  header: 'abc',
  subheader: 'def',
  content: 'ghi',
  nested: { value: 'Abc' },
  list: [ 'a', 'b' ],
  specialClass: 'special-class'
}

const trim = text => text.replace(/>\s*(.*)\s*</g, '>$1<').trim()

describe('junglet', function () {
  describe('#render()', function () {
    it('should render correct data', function () {
      let html = junglet.render(`
        <h1 jt-content="header">Hello world</h1>
        <p jt-content="content">Lorem ipsum</p>
        <p jt-content="content" />
        <p jt-content="nested.value">Nested value</p>
        <span jt-each="list">A <span>{j self t}</span> B</span>
        <p>First element of list is <span jt-content="list[0]"></span></p>
        <br />
        <br>
        <ul>
          <li jt-each="list"><span jt-content="self">Test</span></li>
          <li jt-remove>Should be removed</li>
        </ul>
        <ul>
          <li jt-each="list" jt-content="self" class="{j self t}"></li>
        </ul>
        <ul>
          <li jt-each="list">junglet expression in content {j self t}</li>
        </ul>
        <p class="{j specialClass t}">junglet expression in attribute</p>
      `, data)

      assert.equal(trim(html), trim(`
        <h1>abc</h1>
        <p>ghi</p>
        <p>ghi</p>
        <p>Abc</p>
        <span>A <span>a</span> B</span>
        <span>A <span>b</span> B</span>
        <p>First element of list is <span>a</span></p>
        <br />
        <br />
        <ul>
          <li><span>a</span></li><li><span>b</span></li>
        </ul>
        <ul>
          <li class="a">a</li><li class="b">b</li>
        </ul>
        <ul>
          <li>junglet expression in content a</li><li>junglet expression in content b</li>
        </ul>
        <p class="special-class">junglet expression in attribute</p>
      `))
    })
    it('should remove <jungledrum> tag', function () {
      let html = junglet.render(`
        <!--
        <jungledrum>
        {
          "fields": [
            { "id": "header", "type": "text" },
            { "id": "subheader", "type": "text" },
            { "id": "content", "type": "textarea" }
          ]
        }
        </jungledrum>
        -->
        <h1 jt-content="header">Hello world</h1>
      `, data)
      assert.equal(html.trim(), `
        <h1>abc</h1>
      `.trim())
    })
    it('should keep comments intact', function () {
      let html = junglet.render(`
        <!-- This is a comment -->
        <h1 jt-content="header">Hello world</h1>
      `, data)
      assert.equal(html.trim(), `
        <!-- This is a comment -->
        <h1>abc</h1>
      `.trim())
    })
    it('should not remove any other html', function () {
      let html = junglet.render(`
          <!doctype html>
          <title>abc</title>
          <style type="text/css">
          html, body { height: 100%; padding: 0; margin: 0 }
          </style>
          <script type="text/javascript">
          var foo = 'bar'
          </script>
      `, data)
      assert.equal(trim(html), trim(`
        <!doctype html>
        <title>abc</title>
        <style type="text/css">
        html, body { height: 100%; padding: 0; margin: 0 }
        </style>
        <script type="text/javascript">
        var foo = 'bar'
        </script>
      `))
    })
  })

  describe('#renderFile()', function () {
    it('should render file with correct data', function () {
      let html = junglet.renderFile('./test/testfile.junglet.html', data)
      assert.equal(html.trim(), '<h1>abc</h1>')
    })
  })

  describe('#renderFile()', function () {
    it('should load imported files before render', function () {
      let html = junglet.renderFile('./test/testfile-import.junglet.html', data)
      assert.equal(html.trim(), '<h1>abc</h1>\n\n<h2>def</h2>')
    })
  })
})
