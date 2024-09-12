/**
 * 目前僅用來調用生命週期鉤子
 * @param handler hook
 * @param context vm
 * @param args
 * @param vm
 * @param info
 */
export function invokeWithErrorHandling(
  handler: Function,
  context: any,
  args: null | any[],
  vm: any,
  info: string
) {
  let res;
  try {
    //呼叫生命週期方法並將this指向Vue實體
    res = args ? handler.apply(context, args) : handler.call(context);
  } catch (e: any) {}
}
