# junglet

junglet is a node template engine. The purpose of it is to allow viewing the file in the browser without parsing it and then replace parts with data. This is to allow frontend developers to develop templates with lorem ipsum text that is then replaced with real data.

This is done with a mixture of DOM attributes (`jt-content`, `jt-each`) and "junglet expressions" (`{j t}`). The value of these expressions are evaluated with [safe-eval](https://github.com/hacksparrow/safe-eval) and the resulting value is rendered.

You can import other files with `<!-- import filename -->`. These will be imported before all expressions are evaluated.

This is primarily used for Jungledrum. See [jungledrum](https://github.com/hesselbom/jungledrum) for more information.

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Install
```
npm install junglet
```

## Syntax
```html
<!-- import header.html -->
<h1 jt-content="header">Hello world</h1>
<p jt-content="content">Lorem ipsum</p>
<p jt-content="nested.value">Nested value</p>
<p>First element of list is <span jt-content="list[0]"></span></p>
<ul>
  <li jt-each="list" jt-content="self"></li>
</ul>
<ul>
  <li jt-each="list">junglet expression in content {j self t}</li>
</ul>
<p class="{j specialClass t}">junglet expression in attribute</p>
```

## API
```javascript
var junglet = require('junglet')

var locals = {
  header: 'Abc',
  content: 'Abc',
  nested: { value: 'Abc' },
  list: ['a', 'b'],
  specialClass: 'special-class'
}

// Render
var html = junglet.render('template string', locals)
var html = junglet.renderFile('filename.junglet.html', locals)
```
