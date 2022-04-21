import type { Options, Patches, ProxyDraft, Result } from './interface';
import { createDraft, finalizeDraft } from './draft';
import { isDraftable } from './utils';

export function draftify<T extends object, O extends boolean = false>(
  baseState: T,
  options?: Options<O>
): [T, () => Result<T, O>] {
  const mutableFilter = options?.mutable;
  const enablePatches = options?.enablePatches ?? false;
  if (!isDraftable(baseState)) {
    throw new Error(
      'create() only supports plain object, array, set, and map.'
    );
  }
  const proxiesMap = new WeakMap<object, ProxyDraft>();
  const assignedSet = new WeakSet<any>();
  const finalities: (() => void)[] = [];
  let patches: Patches | undefined;
  let inversePatches: Patches | undefined;
  if (enablePatches) {
    patches = [];
    inversePatches = [];
  }
  const draft = createDraft({
    original: baseState,
    proxiesMap,
    parentDraft: null,
    patches,
    inversePatches,
    finalities,
    enableFreeze: options?.enableFreeze,
    mutableFilter,
    assignedSet,
  });
  return [
    draft,
    () => {
      const finalizedState = finalizeDraft(draft) as T;
      return (
        enablePatches ? [finalizedState, patches, inversePatches] : finalizedState
      ) as Result<T, O>;
    },
  ];
}