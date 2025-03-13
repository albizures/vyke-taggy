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
	| Conditional<any, any>
	| List<any>

export type TagChild =
	| Child
	| ReadSignal<Child>

export type Props<TTag extends Element> = {
	[K in keyof TTag]?: TTag[K] | ReadSignal<TTag[K]>
} & Record<`data-${string}`, string | ReadSignal<string>>

export class Renderer {
	constructor(
		readonly root: HTMLElement,
		readonly setter: PropSetter = createPropSetter(),
	) {}

	render(handler: TagHandler<Element>) {
		const element = buildHandler(handler, this.setter)
		this.root.append(element)
	}
}

/**
 * Create a renderer with given root element
 * @index 10
 * @example
 * ```ts
 * const renderer = createRenderer(document.body)
 * renderer.render(App())
 * ```
 */
export function createRenderer(root: HTMLElement): Renderer {
	return new Renderer(root)
}

export class TagHandler<TTag extends Element> {
	constructor(
		readonly creator: () => TTag,
		readonly props: Props<TTag> = {},
		readonly children: Array<TagChild> = [],
	) {}
}

export type TagCreator<TTag extends Element> = {
	(props?: Props<TTag>, children?: Array<TagChild>): TagHandler<TTag>
	(children?: Array<TagChild>): TagHandler<TTag>
}

const COMMENT_TYPES = {
	CONDITIONAL: 'cond',
	LIST: 'list',
	SIGNAL: 'signal',
	REF_PREFIX: 'ref:',
} as const

function createCommentRef(label: string) {
	return document.createComment(`${COMMENT_TYPES.REF_PREFIX}${label}`)
}

/**
 * Remove nodes between two comments
 */
function removeNodesBetween(startRef: ChildNode, endRef: ChildNode) {
	let ref = startRef.nextSibling
	while (ref !== endRef && ref) {
		const next = ref.nextSibling
		ref.remove()
		ref = next
	}
}

/**
 * Build a conditional child
 */
function buildConditionalChild(tag: Conditional<unknown, any>, propSetter: PropSetter): Array<ChildNode> {
	let startRef: ChildNode = createCommentRef(COMMENT_TYPES.CONDITIONAL)
	let endRef: ChildNode = createCommentRef(COMMENT_TYPES.CONDITIONAL)
	const $value = match(tag)
	const children: Array<ChildNode> = []

	effect(() => {
		const results = buildChild($value(), propSetter)

		removeNodesBetween(startRef, endRef)

		let ref = startRef
		for (const result of results) {
			ref.after(result)
			ref = result
			children.push(result)
		}
	})

	return [startRef, ...children, endRef]
}

/**
 * Build a list of children
 */
function buildListChild(tag: List<unknown>, propSetter: PropSetter): Array<ChildNode> {
	const startRef = createCommentRef(COMMENT_TYPES.LIST)
	const endRef = createCommentRef(COMMENT_TYPES.LIST)
	const children: Array<ChildNode> = []
	const listResults = each(tag)

	effect(() => {
		removeNodesBetween(startRef, endRef)

		let ref: ChildNode = startRef
		for (const child of listResults()) {
			const results = buildChild(child, propSetter)

			for (const result of results) {
				ref.after(result)
				ref = result
				children.push(result)
			}
		}
	})

	return [startRef, ...children, endRef]
}

function handleSignal(tag: ReadSignal<unknown>, propSetter: PropSetter): Array<ChildNode> {
	let ref: ChildNode = createCommentRef(COMMENT_TYPES.SIGNAL)

	effect(() => {
		const value = tag()
		let element = value instanceof TagHandler
			? buildHandler(value, propSetter)
			: document.createTextNode(String(value))
		ref.replaceWith(element)
		ref = element
	})

	return [ref]
}

function buildChild(tag: TagChild, propSetter: PropSetter): Array<ChildNode> {
	if (tag instanceof TagHandler) {
		return [buildHandler(tag, propSetter)]
	}
	if (tag instanceof Conditional) {
		return buildConditionalChild(tag, propSetter)
	}
	if (tag instanceof List) {
		return buildListChild(tag, propSetter)
	}
	if (typeof tag === 'function') {
		return handleSignal(tag, propSetter)
	}

	return [document.createTextNode(String(tag))]
}

export function buildHandler(tag: TagHandler<Element>, setter: PropSetter) {
	const { children, props, creator } = tag
	const element = creator()

	applyAttributes({ element, props, setter })

	for (const child of children) {
		if (typeof child === 'undefined' || typeof child === 'boolean') {
			continue
		}

		const builded = buildChild(child, setter)

		for (const item of builded) {
			element.append(item)
			item.dispatchEvent(new Event('taggy:mounted'))
		}
	}

	return element
}

type Setter = (value: any) => void
type PropSetter = (element: Element, propName: string, value: unknown) => void

/**
 * Prop setter cache
 */
function createPropSetter(): PropSetter {
	const cache = new WeakMap<Element, Record<string, Setter | undefined>>()

	function getSetter(element: Element, propName: string): Setter {
		const cacheKey = `${element.tagName},${propName}`
		const elementCache = cache.get(element) || {}
		let propSetter: Setter | undefined = elementCache[cacheKey]

		if (propSetter) {
			return propSetter
		}

		propSetter = getPropDescriptor(element, propName)?.set

		propSetter = propSetter
			? propSetter.bind(element)
			: element.setAttribute.bind(element, propName)

		elementCache[cacheKey] = propSetter
		cache.set(element, elementCache)

		return propSetter
	}

	return (element: Element, propName: string, value: unknown): void => {
		const set = getSetter(element, propName)
		set(value)
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

type AttributesArgs<TElement extends Element> = {
	element: TElement
	props: Props<TElement>
	setter: PropSetter
}

function applyAttributes<TElement extends Element>(args: AttributesArgs<TElement>) {
	const { element, props, setter } = args

	for (const [propName, value] of Object.entries(props)) {
		const isEvent = propName.startsWith('on')

		if (isSignal(value) && !isEvent) {
			effect(() => {
				setter(element, propName, value())
			})
		}
		else {
			setter(element, propName, value)
		}
	}
}

function isSignal<T>(value: T | unknown): value is ReadSignal<T> {
	return typeof value === 'function'
}
