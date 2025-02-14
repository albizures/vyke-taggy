<div align="center">
	<h1>
		@vyke/taggy
	</h1>
</div>

A simple and small library for creating and manipulating HTML elements in a declarative way.

## Installation

```sh
npm i @vyke/taggy
```

## API

### $list

Create a reactive list

### createRenderer

Create a renderer with given root element

```ts
const renderer = createRenderer(document.body)
renderer.render(App())
```

### $

Add children to a tag

### $when

Render the given element based on given cases

## Others vyke projects

- [Flowmodoro app by vyke](https://github.com/albizures/vyke-flowmodoro)
- [@vyke/tsdocs](https://github.com/albizures/vyke-tsdocs)
- [@vyke/val](https://github.com/albizures/vyke-val)
- [@vyke/dom](https://github.com/albizures/vyke-dom)
