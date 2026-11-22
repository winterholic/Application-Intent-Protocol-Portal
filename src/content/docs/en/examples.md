---
title: Examples
description: Example applications you can read and run with AIP 1.0, starting with the Quick Start definition.
status: sourced
source:
  - product/examples/README.md
  - product/GETTING-STARTED.md
  - spec/definition-syntax.md
  - product/tests/fixtures/expr-apps/orders/orders.target.aip
  - product/tests/fixtures/expr-apps/orders/orders.target-b.aip
  - product/tests/fixtures/expr-apps/orders/extensions/shopb.mjs
  - product/LIMITS.md
checked: 2026-11-22
---

## Quick Start application {#current-state}

The smallest complete example is the one on the [Quick Start](/docs/getting-started/): one actor, one resource with a row policy, one transition and one read. The same definition is printed on [Definition syntax](/docs/definition-syntax/#example), next to an aggregate example. Both definitions are checked with `aip service check`.

## Orders and stock, declarations only {#orders}

This definition is Core's orders fixture and needs no server code. A caller creates an order and its lines in one bundle and decrements stock in the same request. The server forces each line's unit price with the `unitPrice = product.price` rule in `create allow`. The order total is sent by the client, because a sum of quantity times price cannot be declared.

```aip
actor Member
resource Member { fields { id: Id; name: Text(1..50) } rows read when id = actor }

resource Product {
  fields { id: Id; sku: Text(1..40); stock: Int(0..1000000); price: Int(0..1000000) }
  rows read when actor != null
  transition take {
    input { qty: Int(1..1000) }
    allow actor != null
    from stock >= input.qty
    to stock = stock - input.qty
  }
  expose read { select id, sku, stock, price; filter id.eq, sku.eq; sort id; budget { rows 50; depth 1; deadline 1s; cost 100 } }
  expose apply take { target id; bulk maxRows 1 }
}

resource Order {
  fields { id: Id; owner: Member; total: Int(0..1000000000); placed: Bool }
  rows read when owner = actor
  expose read { select id, total, placed; filter id.eq, placed.eq; sort id; budget { rows 50; depth 1; deadline 1s; cost 100 } }
  expose create { allow owner = actor and placed = true; fields owner, total, placed }
}

resource OrderLine {
  fields { id: Id; order: Order; product: Product; qty: Int(1..1000); unitPrice: Int(0..1000000) }
  rows read when order.owner = actor
  expose read { select id, qty, unitPrice, product; filter order.eq; sort id; budget { rows 50; depth 1; deadline 1s; cost 100 } }
  expose create { allow order.owner = actor and unitPrice = product.price; fields order, product, qty, unitPrice }
}
```

The caller places the order with one atomic request. The later `create` takes the ID of the earlier one, and `Product.take` decrements stock with a limited-arithmetic transition:

```ts
await client.bundle((b) => {
  const order = b.create("Order", { owner: memberId, total: 700, placed: true });
  b.create("OrderLine", { product: productId, qty: 3, unitPrice: 200 }, { order });
  b.apply({ apply: "Product.take", target: { ids: [productId] }, input: { qty: 3 } });
}, { key: "order-1" });
```

If a line or the stock decrement fails, the order rolls back with it. See [Use a row created earlier](/docs/sdk/#bundle-refs).

## Extension that creates rows {#extension-create}

Core's second orders fixture lets the server compute the total and close the price-forgery route. The caller sends no price or total. `Product.take` and `Order.settle` are `internal`, so only the extension can call them, and `ctx.data.create` makes the order and its line inside one transaction.

```aip
actor Member
resource Member { fields { id: Id; name: Text(1..50) } rows read when id = actor }

resource Product {
  fields { id: Id; sku: Text(1..40); stock: Int(0..1000000); price: Int(0..1000000) }
  rows read when actor != null
  transition take {
    input { qty: Int(1..1000) }
    allow actor != null
    from stock >= input.qty
    to stock = stock - input.qty
  }
  expose read { select id, sku, stock, price; filter id.eq, sku.eq; sort id; budget { rows 50; depth 1; deadline 1s; cost 100 } }
  expose apply take { target id; bulk maxRows 1; internal }
}

resource Order {
  fields { id: Id; owner: Member; total: Int(0..1000000000); placed: Bool }
  rows read when owner = actor
  transition settle { allow owner = actor; from placed = false; patch total; to placed = true }
  expose read { select id, total, placed; filter id.eq, placed.eq; sort id; budget { rows 50; depth 1; deadline 1s; cost 100 } }
  expose create { allow owner = actor and placed = false and total = 0; fields owner, total, placed }
  expose apply settle { target id; bulk maxRows 1; internal }
  extension write placeAtomic {
    input { owner: Member.Id; product: Product.Id; qty: Int(1..1000) }
    output { id: Order.Id; total: Int }
    access read.Product, create.Order, create.OrderLine, Product.take, Order.settle
    effect db
    deadline 3s
    implementation "shopb.placeAtomic"
  }
}

resource OrderLine {
  fields { id: Id; order: Order; product: Product; qty: Int(1..1000); unitPrice: Int(0..1000000) }
  rows read when order.owner = actor
  expose read { select id, qty, unitPrice, product; filter order.eq; sort id; budget { rows 50; depth 1; deadline 1s; cost 100 } }
  expose create { allow order.owner = actor and order.placed = false and unitPrice = product.price; fields order, product, qty, unitPrice }
}
```

```js
export async function placeAtomic(input, ctx) {
  const page = await ctx.data.read({ read: "Product", select: ["id", "price", "stock"], filter: [{ field: "id", op: "eq", value: input.product }] });
  if (page.rows.length === 0) throw ctx.reject("NO_SUCH_PRODUCT", "no such product");
  const { price, stock } = page.rows[0];
  if (stock < input.qty) throw ctx.reject("INSUFFICIENT_STOCK", "not enough stock");
  const total = input.qty * price;
  await ctx.data.apply("Product", "take", [input.product], undefined, undefined, undefined, { qty: input.qty });
  const order = await ctx.data.create("Order", { owner: input.owner, total: 0, placed: false });
  await ctx.data.create("OrderLine", { order, product: input.product, qty: input.qty, unitPrice: price });
  await ctx.data.apply("Order", "settle", [order], undefined, { total });
  return { id: order, total };
}
```

The extension reads the price, refuses with `ctx.reject` when stock is short, and calls `take` before creating the line, which avoids two concurrent calls waiting on each other's locks. The extension interface is not final. See [Extensions and workers](/docs/workers/#create).

## Packaged applications {#packaged}

AIP Core contains two independent applications, ready to build as application packages:

| Example | What it shows |
|---|---|
| `product/examples/event-checkin` | Numeric ids and a transition that checks in the caller's own event |
| `product/examples/folder-notes` | UUID ids and a partial update (patch) that renames and reorders the caller's own folders |

Neither uses external workers or extra dependencies. They have no login screen and no API for creating users: the operator prepares the actor rows and principals. Build a package, then follow [Deploy and migrate](/docs/deployment/#app-package):

```sh
npm ci --prefix spikes/spike-0-ts --ignore-scripts --no-audit --no-fund
node product/tools/package.mjs --manifest product/examples/event-checkin --out /absolute/new-event-bundle
```

Run the commands from a checkout of AIP Core. The output path must not exist yet.

## Extension example {#extension}

The release archive contains `example.aip` and `extensions/event.mjs` and `event.py`. They declare a read operation, a durable job and a write extension. See [Extensions and workers](/docs/workers/).

## Larger ports {#ports}

AIP Core also carries ports of existing applications (FaceReview, FlaskBB, Infisical) used as test material. They are not 1.0 requirements and their parity is partial, so they serve as regression material. See [Known limitations](/docs/known-limitations/#not-included).
