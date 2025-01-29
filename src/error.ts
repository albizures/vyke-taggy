export function assert(condition: boolean, message: string, ...args: Array<unknown>): asserts condition {
	if (!condition) {
		console.error(message, ...args)
		throw new Error(message)
	}
}
