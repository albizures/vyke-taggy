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

## Hello world

A simple example showing reactive text updates based on input:

```ts
import { createRenderer, Html } from '@vyke/taggy'
import { signal, syncValue } from '@vyke/taggy/signals'

const { div, h1, input, label } = Html

const renderer = createRenderer(document.body)

function HelloWorld() {
	const $name = signal('world')

	return div([
		h1(['Hello, ', $name, '!']),
		label(['Name: ',
			input({
				type: 'text',
				// a helper to sync the input value with the signal
				...syncValue($name),
			}),
		]),
	])
}

renderer.render(HelloWorld())
```

## API

### createRenderer

Create a renderer with given root element

```ts
const renderer = createRenderer(document.body)
renderer.render(App())
```

### $access

Creates an access signal helper to access nested signals

```ts
import { $access } from '@vyke/taggy/signals'

const $value = signal({
	nested: {
		count: 0,
	}
})
const $nested = $access($value)
// where $count is a computed signal
const $count = $nested.nested.count
```

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

### loadSignal

creates a loader signal that will render a loader based
on the status of the promise

```ts
import { loadSignal } from '@vyke/taggy'
import { signal } from '@vyke/taggy/signals'

const $user = signal({
	username: 'john_doe',
	age: 30,
})

const $profile = loadSignal(async () => {
	await getProfile($user().username)
})

const content = div([
	$profile.match({
		loading: () => 'Loading...',
		loaded: ($value) => $value().name,
		error: ($error) => `Error: ${$error()}`,
	})
])
```

### $t

Create a signal that updates the text content of a tag

```ts
import { signal } from '@vyke/taggy/signals'
import { $t } from '@vyke/taggy/text'

const $name = signal('John Doe')
const $text = $t(() => `Hello, ${$name()}!`)

const content = div([$text])
```

## Others vyke projects

- [Flowmodoro app by vyke](https://github.com/albizures/vyke-flowmodoro)
- [@vyke/tsdocs](https://github.com/albizures/vyke-tsdocs)
- [@vyke/val](https://github.com/albizures/vyke-val)
- [@vyke/dom](https://github.com/albizures/vyke-dom)
