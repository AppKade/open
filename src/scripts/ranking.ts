// Reorders the project board by community upvotes once every card has
// reported its count, then keeps it sorted as votes change. Ties fall back
// to GitHub stars and then the server-rendered order.
const list = document.querySelector<HTMLElement>("[data-ranking]");
const votes = new Map<HTMLElement, number>();
let scheduled = 0;

function rank() {
  if (!list) return;
  const items = [...list.children] as HTMLElement[];
  if (votes.size < items.length) return;
  const before = new Map(items.map((item) => [item, item.getBoundingClientRect().top]));
  const focused = document.activeElement as HTMLElement | null;
  const sorted = [...items].sort(
    (a, b) =>
      (votes.get(b) ?? 0) - (votes.get(a) ?? 0) ||
      Number(b.dataset.stars) - Number(a.dataset.stars) ||
      Number(a.dataset.order) - Number(b.dataset.order),
  );
  sorted.forEach((item, index) => {
    list.append(item);
    item.querySelector("[data-rank]")!.textContent = String(index + 1);
  });
  // Moving a node drops focus, so return it to the control the visitor used.
  if (focused && list.contains(focused)) focused.focus({ preventScroll: true });
  if (document.documentElement.dataset.motion === "off") return;
  for (const item of sorted) {
    const shift = before.get(item)! - item.getBoundingClientRect().top;
    if (shift)
      item.animate([{ transform: `translateY(${shift}px)` }, { transform: "none" }], {
        duration: 550,
        easing: "cubic-bezier(.22,1,.36,1)",
      });
  }
}

list?.addEventListener("vote:count", (event) => {
  const item = (event.target as HTMLElement).closest<HTMLElement>("[data-rank-item]");
  if (!item) return;
  votes.set(item, (event as CustomEvent<{ count: number }>).detail.count);
  cancelAnimationFrame(scheduled);
  scheduled = requestAnimationFrame(rank);
});

export {};
