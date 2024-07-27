import { ASSET_TYPES } from "./../shared/constants.js";
import { GlobalAPI } from "../../types/global-api.js";
import config from "../config.js";
import keepAlive from "../components/keep-alive.js";

export function initGlobalAPI(Vue: GlobalAPI) {
    // config
    const configDef:Record<string,any> = {}
    configDef.get = () => config;
    configDef.set = () =>{
        console.warn('不要取代 Vue.config 對象，而是設定單獨的欄位')
    }

    Object.defineProperty(Vue, 'config', configDef);

    Vue.options = Object.create(null);
    ASSET_TYPES.forEach(type => {
        Vue.options[type + 's'] = Object.create(null)
    })
}
