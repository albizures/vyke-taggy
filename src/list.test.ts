import { describe, expect, it, vi } from 'vitest'
import { Html } from './html'
import { List, list } from './list'
import { signal } from './signals'
import { $ } from './tag-handler'

const { li } = Html

describe('list', () => {
	it('should render a list of items', () => {
		const items = signal([1, 2, 3])
		const renderItem = vi.fn((item) => $(li(), [item]))

		const numbers = list(items, renderItem)

		expect(numbers).toBeInstanceOf(List)
	})
})
