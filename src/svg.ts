export type SvgTags = SVGElementTagNameMap
export type SvgTag = keyof SvgTags

export function createSvgTag<TTag extends SvgTag>(name: TTag) {
	return document.createElementNS('http://www.w3.org/2000/svg', name)
}

export const Svg = new Proxy({}, {
	get(_, name: SvgTag) {
		return () => createSvgTag(name)
	},
}) as {
	[K in SvgTag]: () => SvgTags[K]
}
