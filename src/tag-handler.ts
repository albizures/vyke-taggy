export class TagRoot<TTag, TChild, TOutputChild> {
	constructor(
		readonly append: (element: TTag, child: TOutputChild) => void,
	) {}

	build(handler: TagHandler<TTag, TChild, TOutputChild>): TTag {
		return buildTag(handler, this)
	}
}

/**
 * Create a renderer with given root element
 * @index 10
 * @example
 * ```ts
 * const renderer = createRenderer()
 * renderer.render(App())
 * ```
 */
export function createRoot<TTag, TChild, TOutputChild>(append: (element: TTag, child: TOutputChild) => void): TagRoot<TTag, TChild, TOutputChild> {
	return new TagRoot<TTag, TChild, TOutputChild>(append)
}

export type Prop = [name: string, value: unknown]

export type ChildHandlerContext<TChild, TOutputChild> = {
	child: unknown
	buildChild: (childTag: TChild) => Array<TOutputChild> | undefined
}

export type ChildHandler<TChild, TOutputChild> = (context: ChildHandlerContext<TChild, TOutputChild>) => Array<TOutputChild> | undefined

export type PropHandlerContext<TTag> = {
	prop: Prop
	element: TTag
}

export type PropHandler<TTag> = (context: PropHandlerContext<TTag>) => true | undefined

export type TagOptions<TTag, TChild, TOutputChild> = {
	creator: () => TTag
	childHandlers: Array<ChildHandler<TChild, TOutputChild>>
	propHandlers: Array<PropHandler<unknown>>
}

export class TagHandler<TTag, TChild, TOutputChild> {
	constructor(
		readonly options: TagOptions<TTag, TChild, TOutputChild>,
		readonly props: Record<string, unknown> = {},
		readonly children: Array<TChild> = [],
	) {}
}

export function buildTag<TTag, TChild, TOutputChild>(tag: TagHandler<TTag, TChild, TOutputChild>, root: TagRoot<TTag, TChild, TOutputChild>): TTag {
	const { options } = tag
	const { creator } = options
	const { append } = root
	const element = creator()

	handleProps(element, tag)
	const children = handleChildren(tag, element, root)

	for (const child of children) {
		append(element, child)
	}

	return element
}

function handleChildren<TTag, TChild, TOutputChild>(
	handler: TagHandler<TTag, TChild, TOutputChild>,
	element: TTag,
	root: TagRoot<TTag, TChild, TOutputChild>,
): Array<TOutputChild> {
	const { children } = handler
	const allChildren: Array<TOutputChild> = []

	for (const child of children) {
		const results = handleChild(child, handler, root)

		if (results) {
			allChildren.push(...results)
		}
	}

	return allChildren
}

function handleChild<
	TTag,
	TChild,
	TOutputChild,
	TTagRoot extends TagRoot<any, any, any>,
>(
	child: TChild,
	tagHandler: TagHandler<TTag, TChild, TOutputChild>,
	root: TTagRoot,
): Array<TOutputChild> | undefined {
	const { options } = tagHandler
	const { childHandlers } = options
	if (child instanceof TagHandler) {
		return [buildTag(child, root)]
	}

	for (const handler of childHandlers) {
		const results = handler({
			child,
			buildChild: (childTag) => handleChild(childTag, tagHandler, root),
		})

		if (results) {
			return results
		}
	}
}

function handleProps<TTag, TChild, TOutputChild>(tag: TTag, tagHandler: TagHandler<TTag, TChild, TOutputChild>) {
	const { props, options } = tagHandler
	const { propHandlers } = options

	for (const prop of Object.entries(props)) {
		for (const handler of propHandlers) {
			const result = handler({
				prop,
				element: tag,
			})

			if (result) {
				// Stop processing this prop
				break
			}
		}
	}
}
