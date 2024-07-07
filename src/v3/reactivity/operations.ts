// using literal strings instead of numbers so that it's easier to inspect
// debugger events

//追蹤類型
export const enum TrackOpTypes {
  GET = "get",
  TOUCH = "touch",
}

//觸發類型
export const enum TriggerOpTypes {
  SET = "set",
  ADD = "add",
  DELETE = "delete",
  ARRAY_MUTATION = "array mutation",
}
