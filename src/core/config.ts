export interface Config {
  // user
  optionMergeStrategies: { [key: string]: Function };
}

export default {
  optionMergeStrategies: Object.create(null),
};
