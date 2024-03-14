export function grouper(getKey) {
  return (acc, cur) => {
    const key = getKey(cur);

    if (!key) return acc;

    if (key in acc) {
      acc[key].push(cur);
      return acc;
    }

    acc[key] = [cur];
    return acc;
  };
}

function extractMoney(str) {
  return +str.replaceAll(",", "");
}

export function donner_aggregate(data = []) {
  const aggregated = Object.entries(
    data.reduce(
      grouper((x) => x.donner),
      {},
    ),
  ).map(([, lst]) => ({
    donner: lst[0].donner,
    totalTransactions: lst.length,
    totalAmount: lst.reduce((a, c) => a + extractMoney(c.value), 0),
    transactions: lst.map((x) => ({
      date: x.date,
      amount: extractMoney(x.value),
    })),
  }));

  return aggregated;
}

export function party_aggregate(data = []) {
  const aggregated = Object.entries(
    data.reduce(
      grouper((x) => x.party),
      {},
    ),
  ).map(([, lst]) => ({
    party: lst[0].party,
    totalTransactions: lst.length,
    totalAmount: lst.reduce((a, c) => a + extractMoney(c.value), 0),
    transactions: lst.map((x) => ({
      date: x.date,
      amount: extractMoney(x.value),
    })),
  }));

  return aggregated;
}
