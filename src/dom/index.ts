import type { TagRoot } from '../tag-handler'
import type { DomChild } from './dom-handlers'
import { createRoot } from '../tag-handler'

export * from './dom-handlers'
export * from './html'
export * from './svg'

export function createDomRoot(): TagRoot<ParentNode, DomChild, ChildNode> {
	const root = createRoot<ParentNode, DomChild, ChildNode>((element: ParentNode, child: ChildNode) => {
		element.append(child)
	})

	return root
}
