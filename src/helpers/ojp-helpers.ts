import { SDK_VERSION } from "../constants";

export class OJP_Helpers {
  public static buildRequestorRef(): string {
    return "OJP_JS_SDK_v" + SDK_VERSION;
  }
}
