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

export function aggregate(data = []) {
  const aggregated = Object.entries(
    data.reduce(
      grouper((x) => x.donner),
      {},
    ),
  ).map(([, lst]) => ({
    donner: lst[0].donner,
    transactionDates: lst.map((x) => x.date),
    value: lst.reduce((a, c) => a + +c.value.replaceAll(",", ""), 0),
  }));

  return aggregated;
}
