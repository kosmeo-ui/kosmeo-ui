// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseDataKey = (dataKey: string, data: any) => {
  let value = data;
  let more = false;
  do {
    const dotIndex = dataKey.indexOf(".");
    const bracketIndex = dataKey.indexOf("[");
    if (bracketIndex === -1 && dotIndex === -1) {
      value = value[dataKey];
      more = false;
    } else if (bracketIndex === -1) {
      const key = dataKey.substring(0, dotIndex);
      value = value[key];
      dataKey = dataKey.substring(dotIndex + 1);
      more = true;
    } else if (dotIndex === -1) {
      const key = dataKey.substring(0, bracketIndex);
      const index = dataKey.substring(bracketIndex + 1, dataKey.indexOf("]"));
      value = value[key][parseInt(index)];
      dataKey = dataKey.substring(dataKey.indexOf("]") + 1);
      more = true;
    } else if (bracketIndex < dotIndex) {
      const key = dataKey.substring(0, bracketIndex);
      const index = dataKey.substring(bracketIndex + 1, dataKey.indexOf("]"));
      value = value[key][parseInt(index)];
      dataKey = dataKey.substring(dataKey.indexOf("]") + 1);
      more = true;
    } else {
      const key = dataKey.substring(0, dotIndex);
      value = value[key];
      dataKey = dataKey.substring(dotIndex + 1);
      more = true;
    }
  } while (more);
  if (value === undefined) throw new Error(`Invalid dataKey: ${dataKey}`);
  return value;
};

export default parseDataKey;
