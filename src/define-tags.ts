import { TagHandler } from './tag-handler'

type TagDescriptor = {
	props: Record<string, any>
	tag: any
}
type TagMap = Record<string, TagDescriptor>

type Props<TTagDescriptor extends TagDescriptor> = TTagDescriptor['props']
type Tag<TTagDescriptor extends TagDescriptor> = TTagDescriptor['tag']

type DefineTagOptions<TTagMap extends TagMap> = {
	creator: <TTag extends keyof TTagMap>(name: TTag) => TTagMap[TTag]['tag']
}

type TagCreator<TTag, TProps, TChildren> = {
	(props?: TProps, children?: Array<TChildren>): TagHandler<TTag>
	(children?: Array<TChildren>): TagHandler<TTag>
}

export type TagMapProxy<TTagMap extends TagMap, TChild> = {
	[K in keyof TTagMap]: TagCreator<Tag<TTagMap[K]>, Props<TTagMap[K]>, TChild>
}

export function defineTags<TTagMap extends TagMap, TChild>(options: DefineTagOptions<TTagMap>): TagMapProxy<TTagMap, TChild> {
	const { creator } = options

	const proxy = new Proxy({}, {
		get(_, name: string) {
			return (propsOrChildren?: Props<TTagMap[keyof TTagMap]> | Array<TChild>, maybeChildren?: Array<TChild>) => {
				const [props, children] = Array.isArray(propsOrChildren)
					? [undefined, propsOrChildren]
					: [propsOrChildren, maybeChildren]
				return new TagHandler(
					() => creator(name),
					props,
					children ?? ([] as Array<TChild>),
				)
			}
		},
	}) as TagMapProxy<TTagMap, TChild>

	return proxy
}
