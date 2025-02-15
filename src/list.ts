import type { Signal } from './signals'
import type { TagChild } from './tag-handler'
import { computed } from 'alien-signals'

export class List<TItem> {
	constructor(
		readonly items: Signal<Array<TItem>>,
		readonly renderItem: (item: TItem) => TagChild,
	) {}
}

/**
 * Create a reactive list using signal values
 * @example
 * ```ts
 * import { $list, li, ul } from '@vyke/taggy'
 * import { signal } from '@vyke/taggy/signals'
 *
 * const $items = signal([1, 2, 3])
 * const elements = ul([
 * 	$list($items, (item) => li([item])),
 * ])
 * ```
 */
export function $list<TItem>(values: Signal<Array<TItem>>, renderItem: (item: TItem) => TagChild): List<TItem> {
	return new List(values, renderItem)
}

export function each<TItem>(list: List<TItem>) {
	const values = new Map<TItem, TagChild>()

	return computed(() => {
		const items = list.items()
		const stored = new Set(values.keys())
		const results: Array<TagChild> = []

		for (const item of items) {
			if (!values.has(item)) {
				const child = list.renderItem(item)
				values.set(item, child)
				results.push(child)
			}
			else {
				results.push(values.get(item)!)
			}

			stored.delete(item)
		}

		// remove old items
		for (const item of stored) {
			values.delete(item)
		}

		return results
	})
}
