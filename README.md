# EnergyNetwork

Climate change is causing everybody to have a bad time. As the change is driven by increasing greenhouse gases and 45% of CO<sub>2</sub> emission over the past decade have come from energy production, it is clear that we need to change how we produce energy. The technology to generate renewable energy is now cost effective and how best best we go about integrating it into our existing infrastructure is an open question. This is a project that explores the idea of creating a decentralised peer-to-peer network to trade locally-produced green energy.

The goals of the project are:

- decreased reliance on fossil fuels
- increased network resilance and trust
- optimised integration between public and private infrastructure
- lower energy costs
- the ability for users to be rewarded for their participation
- zero-cost, high speed transactions at both low and high network activity

The project explores using a cryptocurrency based on a directed acyclic graph, rather than a traditional blockchain and tethers this currency to the local fiat. Participants without means to generate energy are able to purchase this currency to benefit from their peers excess energy production. The network will always favour locally produced renewable energy, but will default to traditional energy sources if need be to ensure reliability and allow gradual adoptation.

## Getting started

Add the following to your /etc/hosts file

```
127.0.1.1   tokenregulator.localhost energygrid.localhost bank.localhost energymarket.localhost
```

Install dependencies, build and start each application as follows:

```
[EnergyLib] pnpm i
[Bank] pnpm i && pnpm dev
[EnergyMarket] pnpm i && pnpm dev
[EnergyPeer/client] pnpm i && pnpm build
[EnergyPeer/server] pnpm i && pnpm dev12
[TokenRegulator] pnpm i && pnpm dev
```

This will create a peer network available at `energypeer.localhost` on ports 8001 to 8011
