export function isName(str) {
  return !str.split("").some((x) => "0123456789,.".includes(x));
}

export function percent(a, b) {
  if (!b) return 0;
  return `${parseFloat(((a * 100) / b).toFixed(7))}%`;
}

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
export const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

function extractMoney(str) {
  return +str.replaceAll(",", "");
}

function getDonnerKey(item) {
  return item.donner
    .replaceAll(" ", "")
    .replaceAll("PVT", "")
    .replaceAll("LTD", "")
    .replaceAll("PRIVATE", "")
    .replaceAll("LIMITED", "")
    .replaceAll("&", "")
    .replaceAll("AND", "")
    .replaceAll("PR", "")
    .replaceAll(",", "")
    .replaceAll(".", "")
    .trim();
}

export function donner_aggregate(data = []) {
  const aggregated = Object.entries(data.reduce(grouper(getDonnerKey), {}))
    .map(([, lst]) => {
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
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return aggregated;
}

export function party_aggregate(data = []) {
  const aggregated = Object.entries(
    data.reduce(
      grouper((x) => x.party),
      {},
    ),
  )
    .map(([, lst]) => {
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
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return aggregated;
}
export function date_party_aggregate(data = []) {
  return Object.entries(
    data.reduce(
      grouper((x) => x.date.slice(3)),
      {},
    ),
  ).map(([, monthItems]) =>
    Object.entries(
      monthItems.reduce(
        grouper((x) => x.party),
        {},
      ),
    )
      .map(([, lst]) => {
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
      })
      .sort((a, b) => b.totalAmount - a.totalAmount),
  );
}
