import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { ReactNode, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { NavArrowRight, Page, Folder } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * An accessible hierarchical tree view (WAI-ARIA Tree View pattern,
 * single-select). Radix has no tree primitive, so this is a
 * hand-built ARIA tree: roving tabindex (exactly one treeitem is
 * tabbable), full keyboard navigation, and type-ahead.
 *
 * Simplified vs the reference: no separate "open folder" glyph exists
 * in iconoir-react, so an expanded and collapsed folder share the
 * same Folder icon (the chevron rotation still conveys state).
 *
 *   <Tree aria-label="Project files"
 *     items={[{ id: "src", label: "src", children: [{ id: "index", label: "index.ts" }] }, { id: "readme", label: "readme.md" }]}
 *     defaultExpandedIds={["src"]} onSelect={(id) => console.log(id)} />
 *
 * Keyboard: Up/Down move between visible items; Right expands/steps
 * in; Left collapses/steps out; Home/End jump to first/last visible;
 * Enter/Space select (and toggle a parent); typing jumps by match.
 */
export interface TreeNode {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  /** Plain-text used for type-ahead. Falls back to `label` when it's a string. */
  textValue?: string;
}

export interface TreeProps extends Omit<React.ComponentProps<'ul'>, 'onSelect'> {
  items: TreeNode[];
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  defaultSelectedId?: string;
  selectedId?: string;
  onSelect?: (id: string, node: TreeNode) => void;
}

interface FlatNode {
  node: TreeNode;
  depth: number;
  parentId: string | null;
  posInSet: number;
  setSize: number;
  hasChildren: boolean;
}

function nodeText(node: TreeNode): string | null {
  if (typeof node.textValue === 'string') return node.textValue;
  if (typeof node.label === 'string') return node.label;
  return null;
}

function flattenVisible(items: TreeNode[], expanded: Set<string>, depth: number, parentId: string | null, out: FlatNode[]) {
  const setSize = items.length;
  items.forEach((node, i) => {
    const hasChildren = !!node.children && node.children.length > 0;
    out.push({ node, depth, parentId, posInSet: i + 1, setSize, hasChildren });
    if (hasChildren && expanded.has(node.id)) flattenVisible(node.children!, expanded, depth + 1, node.id, out);
  });
  return out;
}

export function Tree({ className, items, defaultExpandedIds, expandedIds, onExpandedChange, defaultSelectedId, selectedId, onSelect, ...props }: TreeProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<Set<string>>(() => new Set(defaultExpandedIds ?? []));
  const isExpandedControlled = expandedIds != null;
  const expandedSet = useMemo(() => (isExpandedControlled ? new Set(expandedIds) : uncontrolledExpanded), [isExpandedControlled, expandedIds, uncontrolledExpanded]);

  const setExpanded = useCallback(
    (next: Set<string>) => {
      if (!isExpandedControlled) setUncontrolledExpanded(next);
      onExpandedChange?.([...next]);
    },
    [isExpandedControlled, onExpandedChange],
  );

  const toggleExpanded = useCallback(
    (id: string, open?: boolean) => {
      const next = new Set(expandedSet);
      const willOpen = open ?? !next.has(id);
      if (willOpen) next.add(id);
      else next.delete(id);
      setExpanded(next);
    },
    [expandedSet, setExpanded],
  );

  const [uncontrolledSelected, setUncontrolledSelected] = useState<string | undefined>(defaultSelectedId);
  const isSelectControlled = selectedId !== undefined;
  const selected = isSelectControlled ? selectedId : uncontrolledSelected;

  const selectNode = useCallback(
    (entry: FlatNode) => {
      if (entry.node.disabled) return;
      if (!isSelectControlled) setUncontrolledSelected(entry.node.id);
      onSelect?.(entry.node.id, entry.node);
    },
    [isSelectControlled, onSelect],
  );

  const visible = useMemo(() => flattenVisible(items, expandedSet, 1, null, []), [items, expandedSet]);

  const ariaLabel = props['aria-label'];
  const ariaLabelledby = props['aria-labelledby'];
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (ariaLabel == null && ariaLabelledby == null) {
      console.warn('Tree: provide an `aria-label` or `aria-labelledby` so the tree has an accessible name (WCAG 4.1.2).');
    }
  }, [ariaLabel, ariaLabelledby]);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const seen = new Set<string>();
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (seen.has(n.id)) console.warn(`Tree: duplicate node id "${n.id}". Ids must be unique across the whole tree.`);
        seen.add(n.id);
        if (n.children) walk(n.children);
      }
    };
    walk(items);
  }, [items]);

  const [tabbableId, setTabbableId] = useState<string | null>(null);

  const activeId = useMemo(() => {
    if (tabbableId && visible.some((v) => v.node.id === tabbableId)) return tabbableId;
    if (selected && visible.some((v) => v.node.id === selected)) return selected;
    const firstEnabled = visible.find((v) => !v.node.disabled);
    return firstEnabled?.node.id ?? null;
  }, [tabbableId, visible, selected]);

  const rootRef = useRef<HTMLUListElement>(null);
  const pendingFocusId = useRef<string | null>(null);
  useEffect(() => {
    const id = pendingFocusId.current;
    if (!id) return;
    pendingFocusId.current = null;
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-tree-id="${cssEscape(id)}"]`);
    el?.focus();
  });

  const focusId = useCallback((id: string) => {
    pendingFocusId.current = id;
    setTabbableId(id);
  }, []);

  const typeahead = useRef<{ buffer: string; at: number }>({ buffer: '', at: 0 });

  const onTypeahead = useCallback(
    (char: string, fromIndex: number) => {
      const now = Date.now();
      const t = typeahead.current;
      if (now - t.at > 600) t.buffer = '';
      t.at = now;
      t.buffer += char.toLowerCase();

      const search = t.buffer;
      const n = visible.length;
      for (let step = 1; step <= n; step++) {
        const entry = visible[(fromIndex + step) % n];
        if (entry.node.disabled) continue;
        const text = nodeText(entry.node);
        if (text && text.toLowerCase().startsWith(search)) {
          focusId(entry.node.id);
          return;
        }
      }
    },
    [visible, focusId],
  );

  const onKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    const index = visible.findIndex((v) => v.node.id === activeId);
    if (index === -1) return;
    const current = visible[index];

    const moveTo = (predicate: (start: number) => number) => {
      const target = predicate(index);
      if (target >= 0 && target < visible.length) focusId(visible[target].node.id);
    };
    const nextEnabled = (start: number) => {
      for (let i = start + 1; i < visible.length; i++) if (!visible[i].node.disabled) return i;
      return -1;
    };
    const prevEnabled = (start: number) => {
      for (let i = start - 1; i >= 0; i--) if (!visible[i].node.disabled) return i;
      return -1;
    };

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveTo(nextEnabled);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveTo(prevEnabled);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (current.hasChildren) {
          if (!expandedSet.has(current.node.id)) {
            toggleExpanded(current.node.id, true);
          } else {
            for (let i = index + 1; i < visible.length; i++) {
              if (visible[i].depth <= current.depth) break;
              if (!visible[i].node.disabled) {
                focusId(visible[i].node.id);
                break;
              }
            }
          }
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (current.hasChildren && expandedSet.has(current.node.id)) {
          toggleExpanded(current.node.id, false);
        } else if (current.parentId) {
          let parentId: string | null = current.parentId;
          while (parentId) {
            const parent = visible.find((v) => v.node.id === parentId);
            if (!parent) break;
            if (!parent.node.disabled) {
              focusId(parentId);
              break;
            }
            parentId = parent.parentId;
          }
        }
        break;
      case 'Home': {
        event.preventDefault();
        const first = visible.findIndex((v) => !v.node.disabled);
        if (first !== -1) focusId(visible[first].node.id);
        break;
      }
      case 'End':
        event.preventDefault();
        for (let i = visible.length - 1; i >= 0; i--) {
          if (!visible[i].node.disabled) {
            focusId(visible[i].node.id);
            break;
          }
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (current.node.disabled) break;
        selectNode(current);
        if (current.hasChildren) toggleExpanded(current.node.id);
        break;
      default:
        if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey && /\S/.test(event.key)) {
          event.preventDefault();
          onTypeahead(event.key, index);
        }
    }
  };

  return (
    <ul ref={rootRef} role="tree" data-slot="tree" onKeyDown={onKeyDown} className={cn('min-w-0 font-body text-body-m', className)} {...props}>
      {items.map((node, i) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={1}
          parentId={null}
          posInSet={i + 1}
          setSize={items.length}
          expandedSet={expandedSet}
          selected={selected}
          activeId={activeId}
          onToggle={toggleExpanded}
          onSelectEntry={selectNode}
          onFocusId={focusId}
        />
      ))}
    </ul>
  );
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  parentId: string | null;
  posInSet: number;
  setSize: number;
  expandedSet: Set<string>;
  selected: string | undefined;
  activeId: string | null;
  onToggle: (id: string, open?: boolean) => void;
  onSelectEntry: (entry: FlatNode) => void;
  onFocusId: (id: string) => void;
}

function TreeItem({ node, depth, parentId, posInSet, setSize, expandedSet, selected, activeId, onToggle, onSelectEntry, onFocusId }: TreeItemProps) {
  const hasChildren = !!node.children && node.children.length > 0;
  const isExpanded = hasChildren && expandedSet.has(node.id);
  const isSelected = selected === node.id;
  const isTabbable = activeId === node.id;
  const disabled = !!node.disabled;

  const entry: FlatNode = { node, depth, parentId, posInSet, setSize, hasChildren };
  const indent = `${(depth - 1) * 1}rem`;
  const DefaultIcon = hasChildren ? Folder : Page;

  const handleRowClick = () => {
    if (disabled) return;
    onSelectEntry(entry);
    if (hasChildren) onToggle(node.id);
    onFocusId(node.id);
  };

  return (
    <li
      role="treeitem"
      data-slot="tree-item"
      data-tree-id={node.id}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-level={depth}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      aria-disabled={disabled || undefined}
      tabIndex={isTabbable ? 0 : -1}
      onClick={(e) => {
        e.stopPropagation();
        handleRowClick();
      }}
      className="group/treeitem rounded-[var(--size-border-radius-border-radius-md)] outline-none focus-visible:outline-none"
    >
      <div
        data-slot="tree-row"
        style={{ paddingLeft: indent }}
        className={cn(
          'flex h-8 items-center gap-1.5 rounded-[var(--size-border-radius-border-radius-md)] px-2',
          'group-focus-visible/treeitem:shadow-[inset_0_0_0_3px_var(--color-focus-focus-ring)]',
          disabled ? 'cursor-not-allowed text-[var(--color-text-text-subtler)] opacity-60' : 'cursor-pointer',
          isSelected ? 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-on-tonal)]' : !disabled && 'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        )}
      >
        {hasChildren ? (
          <NavArrowRight
            aria-hidden="true"
            className={cn('size-4 shrink-0 text-[var(--color-icon-icon-subtle)] motion-safe:transition-transform', isExpanded && 'rotate-90', isSelected && 'text-[var(--color-text-text-link-on-tonal)]')}
          />
        ) : (
          <span aria-hidden="true" className="size-4 shrink-0" />
        )}

        <span data-slot="tree-icon" aria-hidden="true" className="flex shrink-0 items-center [&_svg]:size-4 [&_svg]:shrink-0">
          {node.icon ?? <DefaultIcon className="size-4" />}
        </span>

        <span data-slot="tree-label" className="min-w-0 flex-1 truncate">{node.label}</span>
      </div>

      {hasChildren && isExpanded && (
        <ul role="group" data-slot="tree-group" className="min-w-0">
          {node.children!.map((child, i) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              parentId={node.id}
              posInSet={i + 1}
              setSize={node.children!.length}
              expandedSet={expandedSet}
              selected={selected}
              activeId={activeId}
              onToggle={onToggle}
              onSelectEntry={onSelectEntry}
              onFocusId={onFocusId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value);
  return value.replace(/["\\]/g, '\\$&');
}
