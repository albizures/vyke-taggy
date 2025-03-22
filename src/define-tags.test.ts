import type { TagHandler } from './tag-handler'
import { describe, expect, it } from 'vitest'
import { defineTags } from './define-tags'
import { createRoot } from './tag-handler'

describe('defineTags', () => {
	it('should define tags', () => {
		class El {
			constructor(
				public type: string,
				public props: Record<string, unknown> = {},
				public children?: Array<ElChild>,
			) {}
		}

		class ElButton extends El {
			constructor(props?: {
				onclick?: (value: string) => void
			}, children?: Array<ElChild>) {
				super('button', props, children)
			}
		}

		class ElDiv extends El {
			constructor(props?: {
				id?: string
			}, children?: Array<ElChild>) {
				super('div', props, children)
			}
		}

		type Tags = {
			button: {
				props: {
					onclick: (value: string) => void
				}
				tag: ElButton
			}
			div: {
				props: {
					id: string
				}
				tag: ElDiv
			}
		}

		type ElChild = string | number | El

		type Child = string | number | TagHandler<El, Child, ElChild>

		const tags = defineTags<Tags, Child, ElChild>({
			creator: (name) => {
				if (name === 'button') {
					return new ElButton({}, [])
				}
				if (name === 'div') {
					return new ElDiv({}, [])
				}

				const tag = new El(name, {}, [])
				return tag
			},
			childHandlers: [
				(context) => {
					if (typeof context.child === 'string' || typeof context.child === 'number') {
						return [context.child as string | number]
					}
				},
			],
			propHandlers: [
				(context) => {
					const { element, prop } = context
					const [propName, handler] = prop
					element.props[propName] = handler
					return true
				},
			],
		})

		const root = createRoot<El, Child, ElChild>((element, child) => {
			if (!element.children) {
				element.children = []
			}
			element.children.push(child)
		})

		const { button, div } = tags

		const elements = div({
			id: 'test',
		}, [
			'Hello',
			button({
				onclick: (_value) => {},
			}, [
				'Click me',
			]),
			'World',
		])

		expect(root.build(elements)).toEqual(expect.objectContaining({
			type: 'div',
			props: {
				id: 'test',
			},
			children: [
				'Hello',
				expect.objectContaining({
					type: 'button',
					props: {
						onclick: expect.any(Function),
					},
				}),
				'World',
			],
		}))
	})
})
