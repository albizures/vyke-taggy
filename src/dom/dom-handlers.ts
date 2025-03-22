import type { Case } from '../conditional'
import type { TagFromMap } from '../define-tags'
import type { ReadSignal } from '../signals'
import type { ChildHandlerContext, PropHandlerContext } from '../tag-handler'
import type { CommonTag } from '../types'
import { Conditional, match } from '../conditional'
import { each, List } from '../list'
import { effect } from '../signals'
import { TagHandler } from '../tag-handler'

export type HtmlTags = {
	[TTag in keyof HTMLElementTagNameMap]: CommonTag<HTMLElementTagNameMap[TTag]>
}

export type SvgTags = {
	[K in keyof SVGElementTagNameMap]: CommonTag<SVGElementTagNameMap[K]>
}

export type DomTags = HtmlTags & SvgTags

type Child =
	| TagHandler<Element, DomChild, ChildNode>
	| string
	| number
	| undefined
	| boolean
	| Conditional<any, Array<Case<any, any, DomChild>>>
	| List<any, DomChild>

export type DomChild =
	| Child
	| ReadSignal<Child>

type DomChildHandlerContext<TTags> = {
	[key in keyof TTags]: ChildHandlerContext<DomChild, ChildNode>
}[keyof TTags]

type DomPropHandlerContext = PropHandlerContext<TagFromMap<DomTags>>

const setter = createPropSetter()

export function propHandler(context: DomPropHandlerContext): true | undefined {
	const { element, prop } = context
	const [propName, propValue] = prop

	const isEvent = propName.startsWith('on')

	if (propName === 'style' && propValue && typeof propValue === 'object') {
		for (const [key, value] of Object.entries(propValue)) {
			element.style.setProperty(key, value)
		}
	}
	else if (isSignal(propValue) && !isEvent) {
		effect(() => {
			setter(element, propName, propValue())
		})
	}
	else {
		setter(element, propName, propValue)
	}

	return true
}
export function childHandler(context: DomChildHandlerContext<DomTags>): Array<ChildNode> | undefined {
	const { child } = context
	if (child instanceof Conditional) {
		return buildConditionalChild(child, context)
	}

	if (child instanceof List) {
		return buildListChild(child, context)
	}

	if (isSignal(child)) {
		return handleSignal(child, context)
	}

	if (typeof child === 'string' || typeof child === 'number') {
		return [document.createTextNode(String(child))]
	}
}

const COMMENT_TYPES = {
	CONDITIONAL: 'cond',
	LIST: 'list',
	SIGNAL: 'signal',
	REF_PREFIX: 'ref:',
} as const

/**
 * Build a conditional child
 */
function buildConditionalChild(tag: Conditional<any, Array<Case<any, any, DomChild>>>, context: DomChildHandlerContext<DomTags>): Array<ChildNode> {
	const { buildChild } = context
	let startRef: ChildNode = createCommentRef(COMMENT_TYPES.CONDITIONAL)
	let endRef: ChildNode = createCommentRef(COMMENT_TYPES.CONDITIONAL)
	const $value = match(tag)
	const children: Array<ChildNode> = []

	effect(() => {
		const value = $value()
		const results = value && buildChild(value)

		removeNodesBetween(startRef, endRef)

		if (!results) {
			return
		}

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
function buildListChild(tag: List<unknown, DomChild>, context: DomChildHandlerContext<DomTags>): Array<ChildNode> {
	const { buildChild } = context
	const startRef = createCommentRef(COMMENT_TYPES.LIST)
	const endRef = createCommentRef(COMMENT_TYPES.LIST)
	const children: Array<ChildNode> = []
	const listResults = each(tag)

	effect(() => {
		removeNodesBetween(startRef, endRef)

		let ref: ChildNode = startRef
		for (const child of listResults()) {
			const results = buildChild(child)

			if (!results) {
				continue
			}

			for (const result of results) {
				ref.after(result)
				ref = result
				children.push(result)
			}
		}
	})

	return [startRef, ...children, endRef]
}

function isSignal(tag: unknown): tag is () => unknown {
	return typeof tag === 'function'
}

function handleSignal(tag: () => unknown, context: DomChildHandlerContext<DomTags>): Array<ChildNode> {
	const { buildChild } = context
	let ref: ChildNode = createCommentRef(COMMENT_TYPES.SIGNAL)

	effect(() => {
		const value = tag()
		let element = (value instanceof TagHandler
			? buildChild(value)
			: document.createTextNode(String(value)))
		?? createCommentRef(COMMENT_TYPES.SIGNAL)

		// We only support single elements
		const firstElement = Array.isArray(element) ? element[0]! : element

		ref.replaceWith(firstElement)
		ref = firstElement
	})

	return [ref]
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
