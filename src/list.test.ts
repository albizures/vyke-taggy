import { describe, expect, it, vi } from 'vitest'
import { Html } from './dom/html'
import { $list, each, List } from './list'
import { signal } from './signals'

const { li } = Html

describe('list', () => {
	it('should render a list of items', () => {
		const $items = signal([1, 2, 3])
		const renderItem = vi.fn((item) => li([item]))

		const numbers = $list($items, renderItem)

		expect(numbers).toBeInstanceOf(List)
	})

	describe('each', () => {
		it('should return a computed signal of rendered items', () => {
			const $items = signal([1, 2, 3])
			const renderItem = vi.fn((item) => li([item]))
			const list = $list($items, renderItem)

			const result = each(list)
			const renderedItems = result()

			expect(renderedItems).toHaveLength(3)
			expect(renderItem).toHaveBeenCalledTimes(3)
			expect(renderItem).toHaveBeenCalledWith(1)
			expect(renderItem).toHaveBeenCalledWith(2)
			expect(renderItem).toHaveBeenCalledWith(3)
		})

		it('should cache rendered items and reuse them', () => {
			const $items = signal([1, 2])
			const renderItem = vi.fn((item) => li([item]))
			const list = $list($items, renderItem)

			const result = each(list)
			const firstRender = result()

			// Update items but keep one existing item
			$items([2, 3])
			const secondRender = result()

			// Should only call renderItem once for the new item (3)
			// since 2 was already rendered
			expect(renderItem).toHaveBeenCalledTimes(3)

			// The rendered item for '2' should be the same instance
			expect(secondRender[0]).toBe(firstRender[1])
		})

		it('should cleanup removed items from cache', () => {
			const $items = signal([1, 2, 3])
			const renderItem = vi.fn((item) => li([item]))
			const list = $list($items, renderItem)

			const result = each(list)
			result() // Initial render

			// Remove item 2
			$items([1, 3])
			const updatedRender = result()

			expect(updatedRender).toHaveLength(2)

			// If we add 2 back, it should be re-rendered
			$items([1, 2, 3])
			result()
			// Should be called 4 times total:
			// 3 (initial) + 0 (remove) + 1 (re-add item 2)
			expect(renderItem).toHaveBeenCalledTimes(4)
		})
	})
})
