import { reactive } from 'vue'
import { useCookies } from "vue3-cookies";

export const progressStore = reactive(new Map());

const { cookies } = useCookies();

export const getToken = () => {
    return cookies.get("token");
};

export const getRoles = () => {
    let roles = cookies.get("roles");
    if (!roles){
        const token = getToken();
        let base64Payload = token.split(".")[1];
        let decodePayload = atob(base64Payload);
        let payload = JSON.parse(decodePayload);
        cookies.set("roles", payload.roles, 60 * 60);
        roles = payload.roles;
    }
    return roles.split(",");
}