import type { TagMapProxy } from '../define-tags'
import type { DomChild, SvgTags } from './dom-handlers'
import { defineTags } from '../define-tags'
import { childHandler, propHandler } from './dom-handlers'

export const Svg: TagMapProxy<SvgTags, DomChild, ChildNode> = defineTags<SvgTags, DomChild, ChildNode>({
	creator(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name)
	},
	childHandlers: [
		childHandler,
	],
	propHandlers: [
		propHandler,
	],
})
