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
const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

function extractMoney(str) {
  return +str.replaceAll(",", "");
}

export function donner_aggregate(data = []) {
  const aggregated = Object.entries(
    data.reduce(
      grouper((x) => x.donner),
      {},
    ),
  ).map(([, lst]) => {
    const totalAmount = lst.reduce((a, c) => a + extractMoney(c.value), 0);
    return {
      donner: lst[0].donner,
      totalTransactions: lst.length,
      totalAmount,
      totalAmountString: formatter.format(totalAmount),
      transactions: lst.map((x) => ({
        date: x.date,
        amount: extractMoney(x.value),
      })),
    };
  });

  return aggregated;
}

export function party_aggregate(data = []) {
  const aggregated = Object.entries(
    data.reduce(
      grouper((x) => x.party),
      {},
    ),
  ).map(([, lst]) => {
    const totalAmount = lst.reduce((a, c) => a + extractMoney(c.value), 0);
    return {
      party: lst[0].party,
      totalTransactions: lst.length,
      totalAmount,
      totalAmountString: formatter.format(totalAmount),
      transactions: lst.map((x) => ({
        date: x.date,
        amount: extractMoney(x.value),
      })),
    };
  });

  return aggregated;
}
