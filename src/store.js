import { reactive } from 'vue'
import { useCookies } from "vue3-cookies";
import {AxiosHeaders as Buffer} from "axios";

export const progressStore = reactive(new Map());

const { cookies } = useCookies();

export const getToken = () => {
    return cookies.get("token");
};

export const getRoles = () => {
    let roles = cookies.get("roles");
    if (!roles){
        const token = getToken();
        console.log(token);
        let base64Payload = token.split(".")[1];
        let payload = JSON.parse(Buffer.from(base64Payload, 'base64'));
        cookies.set("roles", payload.roles, 60 * 60);
        roles = payload.roles;
    }
    return roles.split(",");
}