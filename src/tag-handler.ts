import type { ReadSignal } from './signals'
import { effect } from 'alien-signals'
import { Conditional, match } from './conditional'
import { each, List } from './list'

type Child =
	| TagHandler<Element>
	| string
	| number
	| undefined
	| boolean
	| Conditional<any>
	| List<any>

export type TagChild =
	| Child
	| ReadSignal<Child>

export type Props<TTag extends Element> = {
	[K in keyof TTag]?: TTag[K] | ReadSignal<TTag[K]>
}

export class TagHandler<TTag extends Element> {
	children: Array<TagChild> = []
	constructor(
		readonly creator: () => TTag,
		readonly props: Props<TTag> = {},
	) {}
}

function createCommentRef(label: string) {
	return document.createComment(`ref:${label}`)
}

export function buildChild(tag: TagChild): Array<ChildNode> {
	if (tag instanceof TagHandler) {
		return [buildHandler(tag)]
	}
	else if (tag instanceof Conditional) {
		let startRef: ChildNode = createCommentRef('cond')
		let endRef: ChildNode = createCommentRef('cond')
		const value = match(tag)
		const children: Array<ChildNode> = []

		effect(() => {
			const results = buildChild(value())

			// remove old children until the endRef
			let ref = startRef.nextSibling
			while (ref !== endRef && ref) {
				const next = ref.nextSibling
				ref.remove()
				ref = next
			}

			ref = startRef
			for (const result of results) {
				ref.after(result)
				ref = result
				children.push(result)
			}
		})

		return [startRef, ...children, endRef]
	}
	else if (tag instanceof List) {
		const startRef = createCommentRef('list')
		const endRef = createCommentRef('list')
		const children: Array<ChildNode> = []
		const listResults = each(tag)

		effect(() => {
			// remove old children until the endRef
			let ref = startRef.nextSibling
			while (ref !== endRef && ref) {
				const next = ref.nextSibling
				ref.remove()
				ref = next
			}

			ref = startRef
			for (const child of listResults()) {
				const results = buildChild(child)

				for (const result of results) {
					ref.after(result)
					ref = result
					children.push(result)
				}
			}
		})

		return [startRef, ...children, endRef]
	}
	else if (typeof tag === 'function') {
		let ref: ChildNode = createCommentRef('signal')

		effect(() => {
			const value = tag()
			let element = value instanceof TagHandler ? buildHandler(value) : document.createTextNode(String(value))
			ref.replaceWith(element)
			ref = element
		})

		return [ref]
	}

	else {
		return [document.createTextNode(String(tag))]
	}
}

export function buildHandler(tag: TagHandler<Element>) {
	const { children, props, creator } = tag
	const element = creator()

	applyAttributes(element, props)

	for (const child of children) {
		if (typeof child === 'undefined' || typeof child === 'boolean') {
			continue
		}

		const builded = buildChild(child)

		for (const item of builded) {
			element.append(item)
			item.dispatchEvent(new Event('taggy:mounted'))
		}
	}

	return element
}

type Setter = (value: any) => void
const propSetterCache: Record<string, Setter | undefined> = {}

function applyAttribute(element: Element, propName: string, value: unknown | ReadSignal<unknown>) {
	const cacheKey = `${element.tagName},${propName}`

	if (!propSetterCache[cacheKey]) {
		propSetterCache[cacheKey] = getPropDescriptor(element, propName)?.set
	}

	const propSetter = propSetterCache[cacheKey]

	const setter: (value: any) => void = propSetter
		? propSetter.bind(element)
		: element.setAttribute.bind(element, propName)

	if (typeof value === 'function' && !propName.startsWith('on')) {
		effect(() => {
			setter(value())
		})
	}
	else {
		setter(value)
	}
}

function getPropDescriptor(
	object: unknown,
	key: string,
): PropertyDescriptor | undefined {
	let current = object
	while (current) {
		const descriptor = Object.getOwnPropertyDescriptor(current, key)

		if (descriptor) {
			return descriptor
		}

		current = Object.getPrototypeOf(current)
	}
}

function applyAttributes<TElement extends Element>(element: TElement, props: Props<TElement>) {
	for (const [key, value] of Object.entries(props)) {
		applyAttribute(element, key, value)
	}
}

export function $<TElement extends Element>(
	tag: TagHandler<TElement>,
	children: Array<TagChild>,
): TagHandler<TElement> {
	tag.children = children

	return tag
}

export function render(root: HTMLElement, handler: TagHandler<Element>) {
	const element = buildHandler(handler)
	root.append(element)
}
