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

### access

Creates a proxy that allows direct property access on signals containing objects

const $value = signal({ foo: 1, nested: { bar: 2 } })
const $access = access($value)

effect(() => console.log($access.foo)) // logs 1
effect(() => console.log($access.nested.bar)) // logs 2

### $list

Create a reactive list using signal values

```ts
import { $list, li, ul } from '@vyke/taggy'
import { signal } from '@vyke/taggy/signals'

const $items = signal([1, 2, 3])
const elements = ul([
	$list($items, (item) => li([item])),
])
```

### createRenderer

Create a renderer with given root element

```ts
const renderer = createRenderer(document.body)
renderer.render(App())
```

### $when

Render the given element based on given cases

```ts
import { $when } from '@vyke/taggy'
import { signal } from '@vyke/taggy/signals'

const $value = signal(1)

const content = div([
	$when($value, [
		1, () => 'One',
		2, () => 'Two',
	])
])
```

### $load

Render a loader based on the status of a loader signal

```ts
import { $load, $when } from '@vyke/taggy'
import { signal } from '@vyke/taggy/signals'

const $user = signal({
	username: 'john_doe',
	age: 30,
})

const $profile = loadSignal(async () => {
	await getProfile($user().username)
})

const content = div([
	$load($profile, {
		loading: () => 'Loading...',
		loaded: ($value) => $value().name,
		error: ($error) => `Error: ${$error()}`,
	})
])
```

## Others vyke projects

- [Flowmodoro app by vyke](https://github.com/albizures/vyke-flowmodoro)
- [@vyke/tsdocs](https://github.com/albizures/vyke-tsdocs)
- [@vyke/val](https://github.com/albizures/vyke-val)
- [@vyke/dom](https://github.com/albizures/vyke-dom)
