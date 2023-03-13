import { reactive } from 'vue'
import { useCookies } from "vue3-cookies";
import {AxiosHeaders as Buffer} from "axios";

export const progressStore = reactive(new Map());

const { cookies } = useCookies();

export const getToken = () => {
    return cookies.get("token");
};

export const setToken = (token) => {
    cookies.set("token", token, 60 * 60);
    let base64Payload = token.split(".")[1];
    let payload = JSON.parse(Buffer.from(base64Payload, 'base64'));
    cookies.set("roles", payload.roles, 60 * 60);
}

export const getRoles = () => {
    let roles = cookies.get("roles");
    return roles.split(",");
}