# Gnommy WYSIWYG editor

**Gnommy** uses your *textarea* to generate HTML in it

## Easy to use

Include CSS and JS files in the *<head>* section...

```html
<link rel="stylesheet" href="path-to-your-gnommy-source/gnommy.min.css">
<script src="path-to-your-gnommy-source/gnommy.min.js"></script>
```

... and initialize the editor by specifying your *textarea* selector

```html
<textarea name="text" id="text"></textarea>
<script>
    new Gnommy('#text')
</script>
```

You can use multiple editors on the same page

```html
<textarea name="text_one" id="text_one"></textarea>
<textarea name="text_two" id="text_two"></textarea>
<script>
    new Gnommy('#text_one')
    new Gnommy('#text_two')
</script>
```

## Easy to customize

You can pass an object with parameters when initializing

```js
new Gnommy('#text', {'showHtml': true})
```
### Parameters

   Name   |                              Description                             |   Type   |  Possible values  |  Default value
----------|----------------------------------------------------------------------|----------|-------------------|------------------
 showHtml |Show/hide HTML-code window (textarea) after initialization            | boolean  |    true, false    |     false
 noResize |Hide/show the resizing bar of the edit window                         | boolean  |    true, false    |     false
 pEnter   |Use the Enter key to create a paragraph and Ctrl+Enter to break a line| boolean  |    true, false    |     false