import type { ChildHandler, PropHandler, TagOptions } from './tag-handler'
import { TagHandler } from './tag-handler'

type TagDescriptor = {
	props: Record<string, any>
	tag: any
}
type TagMap = Record<string, TagDescriptor>

type Props<TTagDescriptor extends TagDescriptor> = TTagDescriptor['props']
type Tag<TTagDescriptor extends TagDescriptor> = TTagDescriptor['tag']

type DefineTagOptions<TTagMap extends TagMap, TChild, TOutputChild> = {
	creator: <TTag extends keyof TTagMap>(name: TTag) => TagFromMap<TTagMap, TTag>
	childHandlers: Array<ChildHandler<TChild, TOutputChild>>
	propHandlers: Array<PropHandler<TagFromMap<TTagMap>>>
}

type TagCreator<TTag, TProps, TChild, TOutputChild> = {
	(props?: TProps): TagHandler<TTag, TChild, TOutputChild>
	(props?: TProps, children?: Array<TChild>): TagHandler<TTag, TChild, TOutputChild>
	(children?: Array<TChild>): TagHandler<TTag, TChild, TOutputChild>
}

export type TagFromMap<TTagMap extends TagMap, TKey extends keyof TTagMap = keyof TTagMap> = TTagMap[TKey]['tag']

export type TagMapProxy<TTagMap extends TagMap, TChild, TOutputChild> = {
	[K in keyof TTagMap]: TagCreator<Tag<
		TTagMap[K]>,
		Props<TTagMap[K]>,
		TChild,
		TOutputChild
	>
}

export function defineTags<TTagMap extends TagMap, TChild, TOutputChild>(
	options: DefineTagOptions<TTagMap, TChild, TOutputChild>,
): TagMapProxy<TTagMap, TChild, TOutputChild> {
	const { creator, childHandlers, propHandlers } = options

	const proxyHandler = {
		get(_: unknown, name: string) {
			return (propsOrChildren?: Props<TTagMap[keyof TTagMap]> | Array<TChild>, maybeChildren?: Array<TChild>) => {
				const [props, children] = Array.isArray(propsOrChildren)
					? [undefined, propsOrChildren]
					: [propsOrChildren, maybeChildren]

				const tagOptions: TagOptions<TagFromMap<TTagMap>, TChild, TOutputChild> = {
					childHandlers,
					propHandlers,
					creator: () => creator(name) as TagFromMap<TTagMap>,
				}

				return new TagHandler(
					tagOptions,
					props,
					children ?? ([] as Array<TChild>),
				)
			}
		},
	}

	const proxy = new Proxy({}, proxyHandler) as TagMapProxy<TTagMap, TChild, TOutputChild>

	return proxy
}
